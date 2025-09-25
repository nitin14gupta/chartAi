from flask import Blueprint, request, jsonify
from PIL import Image
import base64
import io

from utils.yolo_service import get_chart_analyzer
from utils.ai_insights import ai_insights_service
from utils.auth_utils import auth_utils
from db.config import db_config
from utils.ai_insights import chat_service
from flask import Response, stream_with_context


analysis_bp = Blueprint('analysis', __name__, url_prefix='/api/analysis')


def image_to_base64(img_pil: Image.Image) -> str:
    buffered = io.BytesIO()
    img_pil.save(buffered, format="PNG")
    img_bytes = buffered.getvalue()
    return base64.b64encode(img_bytes).decode('utf-8')


@analysis_bp.route('/analyze-chart', methods=['POST'])
def analyze_chart():
    try:
        if 'chart' not in request.files:
            return jsonify({'error': 'No chart file uploaded (field name: chart)'}), 400

        file = request.files['chart']
        image = Image.open(file.stream).convert('RGB')

        analyzer = get_chart_analyzer()
        patterns, annotated = analyzer.analyze_pil(image)

        # AI-generated insights
        insights = ai_insights_service.generate_insights(patterns)

        img_b64 = image_to_base64(annotated)

        result_payload = {
            'patterns_detected': patterns,
            'summary': f"{len(patterns)} pattern(s) detected.",
            'annotated_image': f"data:image/png;base64,{img_b64}",
            'insights': insights,
        }

        # If authenticated, persist to analysis_history
        user_id = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            payload = auth_utils.verify_jwt_token(token)
            if payload:
                user_id = payload.get('user_id')

        if user_id:
            try:
                db_config.supabase.table('analysis_history').insert({
                    'user_id': user_id,
                    'summary': result_payload['summary'],
                    'patterns_detected': result_payload['patterns_detected'],
                    'insights': result_payload.get('insights'),
                    'annotated_image': result_payload['annotated_image'],
                }).execute()
            except Exception:
                # Non-fatal: continue even if saving fails
                pass

        return jsonify(result_payload)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analysis_bp.route('/ask-bot', methods=['POST'])
def ask_bot():
    """Simple pass-through endpoint to Gemini for chart/trading chat.

    Body JSON: { message: string, context?: object }
    Auth optional; if present, will save Q/A to chat_messages for history.
    """
    try:
        data = request.get_json(silent=True) or {}
        message = (data.get('message') or '').strip()
        context = data.get('context') or None

        if not message:
            return jsonify({ 'error': 'Missing required field: message' }), 400

        # Identify user if token provided
        user_id = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            payload = auth_utils.verify_jwt_token(token)
            if payload:
                user_id = payload.get('user_id')

        # Build recent history for memory if session provided and user is known
        body_json = (request.get_json(silent=True) or {})
        session_id = body_json.get('session_id')
        history_mode = body_json.get('history_mode') or 'recent'  # 'recent' | 'full'
        history_limit = body_json.get('history_limit')
        history_scope = (body_json.get('history_scope') or 'session')  # 'session' | 'user'
        # Safe caps
        try:
            history_limit = int(history_limit) if history_limit is not None else None
        except Exception:
            history_limit = None
        if history_limit is None:
            history_limit = 12 if history_mode == 'recent' else 50
        history_limit = max(1, min(200, history_limit))
        history = None
        if user_id and (session_id or history_scope == 'user'):
            try:
                base = db_config.supabase.table('chat_messages').select('role,message,created_at').eq('user_id', user_id)
                if history_scope == 'session' and session_id:
                    base = base.eq('session_id', session_id)
                res_hist = base.order('created_at', desc=False).range(0, history_limit - 1).execute()
                history = res_hist.data or None
            except Exception:
                history = None

        # Call Gemini with bounded history and optional web search
        result = chat_service.ask(message=message, context=context, history=history, web_search=bool(body_json.get('web_search')))
        if 'error' in result:
            return jsonify({ 'error': result['error'] }), 502

        answer_text = result.get('text', '')
        answer_title = result.get('title')

        # Save conversation if authenticated (best-effort)
        if user_id:
            try:
                # Ensure a session exists or create one if session_id provided is absent
                session_id = data.get('session_id')
                if not session_id:
                    # Create a new session using title (fallback to first 40 chars of message)
                    title = answer_title or (message[:40] + ('...' if len(message) > 40 else ''))
                    sess = db_config.supabase.table('chat_sessions').insert({
                        'user_id': user_id,
                        'title': title,
                    }).execute()
                    if sess.data and len(sess.data) > 0:
                        session_id = sess.data[0].get('id')

                db_config.supabase.table('chat_messages').insert({
                    'user_id': user_id,
                    'session_id': session_id,
                    'role': 'user',
                    'message': message,
                    'context': context,
                    'model': chat_service.model,
                }).execute()
                db_config.supabase.table('chat_messages').insert({
                    'user_id': user_id,
                    'session_id': session_id,
                    'role': 'assistant',
                    'message': answer_text,
                    'context': None,
                    'model': chat_service.model,
                }).execute()
                # Touch session updated_at
                if session_id:
                    try:
                        db_config.supabase.table('chat_sessions').update({ 'updated_at': 'now()' }).eq('id', session_id).execute()
                    except Exception:
                        pass
            except Exception:
                pass

        return jsonify({ 'text': answer_text, 'title': answer_title, 'session_id': session_id if user_id else None })
    except Exception as e:
        return jsonify({ 'error': str(e) }), 500


@analysis_bp.route('/chat-history', methods=['GET'])
def chat_history():
    """Return recent chat messages for the authenticated user.

    Query: limit (default 30), offset (default 0)
    """
    try:
        # Require auth
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        token = auth_header.split(' ')[1]
        payload = auth_utils.verify_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Unauthorized'}), 401
        user_id = payload.get('user_id')

        # Pagination
        try:
            limit = int(request.args.get('limit', '30'))
        except Exception:
            limit = 30
        try:
            offset = int(request.args.get('offset', '0'))
        except Exception:
            offset = 0

        page_size = max(1, min(100, limit))
        session_id = request.args.get('session_id')
        if session_id:
            q = (
                db_config.supabase
                .table('chat_messages')
                .select('*')
                .eq('user_id', user_id)
                .eq('session_id', session_id)
                .order('created_at', desc=True)
                .range(offset, offset + page_size - 1)
            )
            res = q.execute()
            items = res.data or []
        else:
            # Return sessions list if no session_id
            res = (
                db_config.supabase
                .table('chat_sessions')
                .select('*')
                .eq('user_id', user_id)
                .order('updated_at', desc=True)
                .range(offset, offset + page_size - 1)
                .execute()
            )
            items = res.data or []

        # If we fetched exactly page_size, signal there may be more
        has_more = len(items) == page_size

        return jsonify({
            'items': items,
            'has_more': has_more,
            'offset': offset,
            'limit': page_size,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analysis_bp.route('/ask-bot-stream', methods=['POST'])
def ask_bot_stream():
    """Stream a bot response in chunks. First line contains META json, followed by DATA chunks.

    Body JSON: { message: string, context?: object, session_id?: string }
    """
    try:
        data = request.get_json(silent=True) or {}
        message = (data.get('message') or '').strip()
        context = data.get('context') or None
        if not message:
            return jsonify({ 'error': 'Missing required field: message' }), 400

        user_id = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            payload = auth_utils.verify_jwt_token(token)
            if payload:
                user_id = payload.get('user_id')

        # Prepare recent history if available for better context
        body_json = (request.get_json(silent=True) or {})
        session_id = body_json.get('session_id')
        history_mode = body_json.get('history_mode') or 'recent'
        history_limit = body_json.get('history_limit')
        history_scope = (body_json.get('history_scope') or 'session')
        try:
            history_limit = int(history_limit) if history_limit is not None else None
        except Exception:
            history_limit = None
        if history_limit is None:
            history_limit = 12 if history_mode == 'recent' else 50
        history_limit = max(1, min(200, history_limit))
        history = None
        if user_id and (session_id or history_scope == 'user'):
            try:
                base = db_config.supabase.table('chat_messages').select('role,message,created_at').eq('user_id', user_id)
                if history_scope == 'session' and session_id:
                    base = base.eq('session_id', session_id)
                res_hist = base.order('created_at', desc=False).range(0, history_limit - 1).execute()
                history = res_hist.data or None
            except Exception:
                history = None

        # Call Gemini (non-stream), then stream the text progressively to the client
        result = chat_service.ask(message=message, context=context, history=history, web_search=bool(body_json.get('web_search')))
        if 'error' in result:
            return jsonify({ 'error': result['error'] }), 502

        answer_text = (result.get('text') or '')
        answer_title = result.get('title')
        answer_links = result.get('links')

        # Persist and make sure we have a session
        session_id = data.get('session_id')
        if user_id:
            try:
                if not session_id:
                    title = answer_title or (message[:40] + ('...' if len(message) > 40 else ''))
                    sess = db_config.supabase.table('chat_sessions').insert({
                        'user_id': user_id,
                        'title': title,
                    }).execute()
                    if sess.data and len(sess.data) > 0:
                        session_id = sess.data[0].get('id')
                db_config.supabase.table('chat_messages').insert({
                    'user_id': user_id,
                    'session_id': session_id,
                    'role': 'user',
                    'message': message,
                    'context': context,
                    'model': chat_service.model,
                }).execute()
                db_config.supabase.table('chat_messages').insert({
                    'user_id': user_id,
                    'session_id': session_id,
                    'role': 'assistant',
                    'message': answer_text,
                    'context': None,
                    'model': chat_service.model,
                }).execute()
                if session_id:
                    try:
                        db_config.supabase.table('chat_sessions').update({ 'updated_at': 'now()' }).eq('id', session_id).execute()
                    except Exception:
                        pass
            except Exception:
                pass

        def generate():
            import json
            meta = { 'session_id': session_id, 'title': answer_title, 'links': answer_links }
            yield f"META:{json.dumps(meta)}\n"
            # Stream in chunks by sentences or fixed sizes
            text = answer_text
            chunk_size = 128
            for i in range(0, len(text), chunk_size):
                yield f"DATA:{text[i:i+chunk_size]}\n"

        return Response(stream_with_context(generate()), mimetype='text/plain')
    except Exception as e:
        return jsonify({ 'error': str(e) }), 500

@analysis_bp.route('/history', methods=['GET'])
def get_history():
    try:
        # Require auth
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        token = auth_header.split(' ')[1]
        payload = auth_utils.verify_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Unauthorized'}), 401
        user_id = payload.get('user_id')

        # Pagination
        try:
            limit = int(request.args.get('limit', '20'))
        except Exception:
            limit = 20
        try:
            offset = int(request.args.get('offset', '0'))
        except Exception:
            offset = 0

        # Fetch limit+1 to determine has_more
        page_size = max(1, min(100, limit))
        query = (
            db_config.supabase
            .table('analysis_history')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', desc=True)
            .range(offset, offset + page_size)
        )
        res = query.execute()
        items = res.data or []

        # If more than requested, trim and set has_more
        has_more = False
        if len(items) > page_size:
            items = items[:page_size]
            has_more = True
        else:
            # Check if there might be more by probing next item if exactly page_size
            has_more = len(items) == page_size

        return jsonify({
            'items': items,
            'has_more': has_more,
            'offset': offset,
            'limit': page_size,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


