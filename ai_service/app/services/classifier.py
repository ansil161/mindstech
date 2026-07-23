import json
import logging
from typing import List, Optional, Dict, Any
from app.services.llm import llm_service
from app.models.llm import ChatMessage, MessageRole
from app.core.config import settings

logger = logging.getLogger(__name__)

# Dynamically construct the alias prompt
ALIAS_RULES = "\n".join([f"- '{k}' means '{v}'" for k, v in settings.QUERY_ALIAS_MAPPING.items()])

CLASSIFIER_PROMPT = f"""You are an intelligent Query Router for the Mindstec Distribution India AI chatbot.
Your job is to:
1. Determine if the user's question is IN SCOPE or OUT OF SCOPE.
2. Rewrite the query into a standalone, optimized search query for vector retrieval — correcting typos,
   expanding abbreviations, and resolving any reference to the conversation history below.
3. Extract any key named entities (brands, products, locations).

IN SCOPE topics include:
- Mindstec products, brands, solutions, and services.
- Company information, contact details, office locations.
- Documentation, blogs, events, careers, support, policies.
- Audio Visual (AV) technology, IT, control rooms, conferencing, etc., as related to a distributor.

OUT OF SCOPE topics include:
- General knowledge unrelated to our industry (e.g., history, geography).
- Politics, sports, movies, entertainment.
- Programming or coding tutorials (unless asking about our API).
- Mathematics, weather, personal advice.
- Any topic clearly unrelated to Mindstec Distribution or our business.

ABBREVIATIONS & ALIASES TO EXPAND:
{ALIAS_RULES}

HANDLING FOLLOW-UP QUESTIONS:
The user's question may be a follow-up that only makes sense given the recent conversation below
(e.g. "what about that?", "how much does it cost?", "what are its specifications?"). When it is, use
the conversation to figure out what "it"/"that"/"the other one" refers to, and write the
rewritten_query as a fully standalone question that would make sense with NO other context — mention
the actual product/topic by name instead of a pronoun. If the question is already standalone, leave its
meaning unchanged.

You must reply with a strictly formatted JSON object containing exactly these three keys:
- "in_scope": boolean
- "rewritten_query": string (standalone, optimized query — see rules above)
- "extracted_entities": array of strings

Example IN SCOPE:
Question: "what about minstech AV?"
Output: {{"in_scope": true, "rewritten_query": "What Audio Visual products does Mindstec distribute?", "extracted_entities": ["Mindstec", "Audio Visual"]}}

Example FOLLOW-UP (conversation history included "Assistant: We distribute Crestron control systems."):
Question: "how much does it cost?"
Output: {{"in_scope": true, "rewritten_query": "How much do Crestron control systems cost?", "extracted_entities": ["Crestron", "control systems"]}}

Example OUT OF SCOPE:
Question: "Who won the super bowl?"
Output: {{"in_scope": false, "rewritten_query": "Who won the super bowl?", "extracted_entities": []}}
"""


def _format_history(history: Optional[List[ChatMessage]]) -> str:
    if not history:
        return "(no prior conversation)"
    lines = []
    for m in history:
        role = m.role.value if hasattr(m.role, "value") else str(m.role)
        lines.append(f"{role.capitalize()}: {m.content}")
    return "\n".join(lines)


class ScopeClassifier:
    def analyze_query(
        self,
        question: str,
        history: Optional[List[ChatMessage]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluates whether a user's question is relevant to the RAG knowledge base
        and rewrites it — using recent conversation history to resolve follow-up
        references — into a single optimized, standalone query for vector search.
        Only the recent-history *text* is used to inform this one rewritten
        query; the transcript itself is never sent to the vector store.
        Returns a dict with 'in_scope', 'rewritten_query', 'extracted_entities' or
        None if classification failed after all configured attempts (callers
        should fall back to the raw question rather than aborting).
        """
        history_block = _format_history(history)
        max_attempts = max(1, settings.CLASSIFIER_MAX_RETRIES)

        for attempt in range(max_attempts):
            try:
                messages = [
                    ChatMessage(role=MessageRole.SYSTEM, content=CLASSIFIER_PROMPT),
                    ChatMessage(
                        role=MessageRole.USER,
                        content=f"Recent conversation:\n{history_block}\n\nQuestion: \"{question}\"\nOutput:",
                    ),
                ]

                logger.info("Routing query (len=%d chars, history_turns=%d, attempt=%d/%d)",
                            len(question), len(history or []), attempt + 1, max_attempts)

                response = llm_service.generate_response(
                    messages=messages,
                    temperature=0.0,
                    require_json=True
                )

                content = response.content.strip()

                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]

                result = json.loads(content.strip())

                # Validate expected keys
                in_scope = bool(result.get("in_scope", True))
                rewritten = str(result.get("rewritten_query", question))
                entities = list(result.get("extracted_entities", []))

                logger.info("Query Router Result - In Scope: %s, Rewritten length: %d chars", in_scope, len(rewritten))

                return {
                    "in_scope": in_scope,
                    "rewritten_query": rewritten,
                    "extracted_entities": entities
                }

            except Exception as e:
                logger.warning("Query routing attempt %d/%d failed: %s", attempt + 1, max_attempts, str(e))

        logger.error("Query routing failed after %d attempt(s); caller will fall back to the raw question.", max_attempts)
        return None

classifier = ScopeClassifier()
