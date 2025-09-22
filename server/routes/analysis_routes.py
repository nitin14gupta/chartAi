from flask import Blueprint, request, jsonify
from PIL import Image
import base64
import io

from utils.yolo_service import get_chart_analyzer
from utils.ai_insights import ai_insights_service


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

        return jsonify({
            'patterns_detected': patterns,
            'summary': f"{len(patterns)} pattern(s) detected.",
            'annotated_image': f"data:image/png;base64,{img_b64}",
            'insights': insights,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


