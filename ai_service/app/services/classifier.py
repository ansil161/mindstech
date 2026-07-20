import json
import logging
from typing import Optional, Dict, Any
from app.services.llm import llm_service
from app.models.llm import ChatMessage, MessageRole
from app.core.config import settings

logger = logging.getLogger(__name__)

# Dynamically construct the alias prompt
ALIAS_RULES = "\n".join([f"- '{k}' means '{v}'" for k, v in settings.QUERY_ALIAS_MAPPING.items()])

CLASSIFIER_PROMPT = f"""You are an intelligent Query Router for the Mindstec Distribution India AI chatbot.
Your job is to:
1. Determine if the user's question is IN SCOPE or OUT OF SCOPE.
2. Rewrite the query to correct typos, expand abbreviations, and optimize it for vector search retrieval.
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

You must reply with a strictly formatted JSON object containing exactly these three keys:
- "in_scope": boolean
- "rewritten_query": string (The optimized query. Expand acronyms using the rules above, fix typos like "minstech" to "Mindstec".)
- "extracted_entities": array of strings

Example IN SCOPE:
Question: "what about minstech AV?"
Output: {{"in_scope": true, "rewritten_query": "What Audio Visual products does Mindstec distribute?", "extracted_entities": ["Mindstec", "Audio Visual"]}}

Example OUT OF SCOPE:
Question: "Who won the super bowl?"
Output: {{"in_scope": false, "rewritten_query": "Who won the super bowl?", "extracted_entities": []}}
"""

class ScopeClassifier:
    def analyze_query(self, question: str) -> Optional[Dict[str, Any]]:
        """
        Evaluates whether a user's question is relevant to the RAG knowledge base
        and rewrites it for optimized vector search.
        Returns a dict with 'in_scope', 'rewritten_query', 'extracted_entities' or None if it fails.
        """
        for attempt in range(2):
            try:
                messages = [
                    ChatMessage(role=MessageRole.SYSTEM, content=CLASSIFIER_PROMPT),
                    ChatMessage(role=MessageRole.USER, content=f"Question: \"{question}\"\nOutput:")
                ]

                logger.info("Routing query: %s (Attempt %d)", question, attempt + 1)
                
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
                
                logger.info("Query Router Result - In Scope: %s, Rewritten: %s", in_scope, rewritten)
                
                return {
                    "in_scope": in_scope,
                    "rewritten_query": rewritten,
                    "extracted_entities": entities
                }
                
            except Exception as e:
                logger.warning("Query routing attempt %d failed: %s", attempt + 1, str(e))
                
        logger.error("Query routing failed after 2 attempts.")
        return None

classifier = ScopeClassifier()
