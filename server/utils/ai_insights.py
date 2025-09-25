import os
from typing import Any, Dict, List
import json
import requests

class AIInsightsService:
    def __init__(self) -> None:
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')
        self.enabled = bool(self.api_key)

    def generate_insights(self, patterns: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not self.enabled:
            # Fallback basic structure
            return {
                'summary': 'AI insights unavailable. Set OPENAI_API_KEY to enable.',
                'explanations': [
                    'Connect an AI provider to generate detailed, pattern-aware insights.'
                ],
                'risk_management': [],
                'entry_signals': [],
                'exit_signals': [],
                'confidence_notes': [],
            }

        # Build prompt for Gemini
        prompt = (
            "You are an expert trading assistant. Given detected chart patterns with confidences, "
            "produce a concise professional analysis. Include: \n"
            "1) Overall market context assumptions;\n"
            "2) Pattern explanations and implications;\n"
            "3) Probable entry signals and invalidation levels;\n"
            "4) Exit/target strategies and risk management;\n"
            "5) Confidence considerations based on signal overlap.\n"
            "Return STRICT JSON with keys: summary (string), explanations (array), entry_signals (array), "
            "exit_signals (array), risk_management (array), confidence_notes (array). Do not include any prose outside JSON.\n"
            f"Patterns: {patterns}"
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        headers = {
            'Content-Type': 'application/json',
            'X-goog-api-key': self.api_key,
        }
        payload = {
            "contents": [
                {
                    "parts": [
                        { "text": prompt }
                    ]
                }
            ]
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=20)
            resp.raise_for_status()
            data_json = resp.json()
            # Extract text
            content_text = (
                data_json.get('candidates', [{}])[0]
                .get('content', {})
                .get('parts', [{}])[0]
                .get('text', '{}')
            )
            # Try parse as-is, otherwise extract JSON substring
            try:
                data = json.loads(content_text)
            except Exception:
                # Best-effort JSON extraction
                start = content_text.find('{')
                end = content_text.rfind('}')
                if start != -1 and end != -1 and end > start:
                    snippet = content_text[start:end+1]
                    data = json.loads(snippet)
                else:
                    raise ValueError('No JSON payload in model response')
            # Ensure keys exist
            for key in ['summary','explanations','entry_signals','exit_signals','risk_management','confidence_notes']:
                data.setdefault(key, [] if key != 'summary' else '')
            return data
        except Exception:
            return {
                'summary': 'AI insights unavailable or parsing failed. Check GEMINI_API_KEY/GEMINI_MODEL.',
                'explanations': [],
                'entry_signals': [],
                'exit_signals': [],
                'risk_management': [],
                'confidence_notes': [],
            }


ai_insights_service = AIInsightsService()


class ChatService:
    """Simple Gemini-backed chat helper for trading assistant conversations."""
    def __init__(self) -> None:
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')
        self.enabled = bool(self.api_key)

    def _format_history_as_text(self, history: list[dict] | None, max_messages: int = 12) -> str:
        """Format prior messages into a compact transcript.

        history should be chronological [{'role': 'user'|'assistant', 'message': str}].
        Only last max_messages are kept.
        """
        if not history:
            return ""
        trimmed = history[-max_messages:]
        lines: list[str] = []
        for m in trimmed:
            role = m.get('role', 'user')
            text = str(m.get('message', '')).strip()
            if not text:
                continue
            prefix = 'User' if role == 'user' else 'Assistant'
            lines.append(f"{prefix}: {text}")
        return "\n".join(lines)

    def ask(self, message: str, context: dict | None = None, history: list[dict] | None = None) -> dict:
        """Send a chat-style prompt to Gemini and return text or error.

        Returns: { text: str } on success, or { error: str } on failure.
        """
        if not self.enabled:
            return { 'error': 'GEMINI_API_KEY not configured' }

        # Build a system-style instruction and user/content parts
        system_prompt = (
            "You are a professional trading assistant focused on stocks, Indian markets, and technical analysis. "
            "Provide concise, actionable, and cautious guidance. Mention uncertainties. "
            "If the question is off-topic (personal issues, relationships, unrelated life advice), politely refuse. "
            "Never provide financial, legal, or tax advice. Include risk disclaimers where relevant."
        )

        # Include compact conversation memory
        history_text_block = self._format_history_as_text(history, max_messages=12)
        history_text = ("\nRecent conversation (most recent last):\n" + history_text_block) if history_text_block else ""

        # Merge context into the prompt as structured text if provided
        context_text = ""
        if context:
            try:
                context_text = "\nContext (JSON): " + json.dumps(context, ensure_ascii=False)
            except Exception:
                context_text = f"\nContext: {context}"

        user_prompt = f"User message: {message}{context_text}{history_text}"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        headers = {
            'Content-Type': 'application/json',
            'X-goog-api-key': self.api_key,
        }
        payload = {
            "contents": [
                {
                    "parts": [
                        { "text": system_prompt },
                        { "text": user_prompt },
                    ]
                }
            ]
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=20)
            resp.raise_for_status()
            data_json = resp.json()
            text = (
                data_json.get('candidates', [{}])[0]
                .get('content', {})
                .get('parts', [{}])[0]
                .get('text', '')
            )
            full_text = text.strip()
            title: str | None = None
            if '**' in full_text:
                try:
                    segs = full_text.split('**')
                    if len(segs) >= 3 and segs[1].strip():
                        title = segs[1].strip()
                except Exception:
                    title = None
            if not title:
                first_line = full_text.splitlines()[0] if full_text else ''
                title = first_line[:80] if first_line else None
            return { 'text': full_text, 'title': title }
        except requests.HTTPError as http_err:
            try:
                err_body = resp.json()
            except Exception:
                err_body = { 'message': str(http_err) }
            return { 'error': f"Gemini HTTP error: {err_body}" }
        except Exception as e:
            return { 'error': f"Gemini request failed: {e}" }


chat_service = ChatService()

