import time
import logging
from typing import List, Optional, Tuple
from app.core.config import settings
from app.services.embedder import embedder
from app.storage.vector_db import vector_db_manager
from app.services.llm import llm_service
from app.models.llm import ChatMessage, MessageRole
from app.models.rag import RAGCitation, RAGQueryResponse, RAGContextResponse

logger = logging.getLogger(__name__)

# System prompt construction
SYSTEM_PROMPT_TEMPLATE = """You are "Mindstec AI", a professional corporate virtual assistant.
Your goal is to answer user queries accurately based ONLY on the retrieved context below.

Rules:
1. Strict Grounding: Base your answer strictly on the provided Context. If the context does not contain the answer, and it is NOT a simple greeting, greeting pleasantry, or salutation, state: "I am sorry, but I do not have information about that in my knowledge base." If the user greets you (like "hi", "hello", "good morning", "how are you"), respond in a warm, polite, and helpful manner directly, indicating you are the Mindstec AI assistant.
2. No Hallucinations: Do not assume, invent, or extrapolate details that are not explicitly stated in the context.
3. No Citations: Do NOT include any source citations, document titles, file names, or bracketed source tags (like [Mindstec_Company_Profile] or similar) in your answer. Respond with plain, natural text answers only.
4. Professional Tone: Remain polite, professional, concise, and helpful.

Context:
---
{context_block}
---
"""

class RAGOrchestrator:
    """
    Orchestration service combining Embeddings, Similarity Search, Prompt Formatting,
    and LLM Generation into an end-to-end grounded RAG execution loop.
    """
    def retrieve_context(
        self,
        query: str,
        category: Optional[str] = None,
        tenant_id: Optional[str] = None,
        top_k: Optional[int] = None,
        min_score: Optional[float] = None
    ) -> RAGContextResponse:
        """
        Retrieves matching chunks and compiles the context block.
        """
        limit = top_k or settings.RETRIEVAL_TOP_K
        score_threshold = min_score if min_score is not None else settings.RETRIEVAL_MIN_SCORE
        
        # Generate query vector
        query_vector = embedder.get_embedding(query)
        
        # Build search filters
        filters = {}
        if category:
            filters["category"] = category
        if tenant_id:
            filters["tenant_id"] = tenant_id

        # Query Qdrant
        hits = vector_db_manager.search_similar(
            query_vector=query_vector,
            limit=limit,
            min_score=score_threshold,
            filters=filters
        )

        context_parts = []
        citations = []
        seen_citations = set()

        for hit in hits:
            payload = hit["payload"]
            title = payload.get("title", "Untitled Document")
            content = payload.get("content", "")
            doc_id = payload.get("document_id", hit["id"])
            source = payload.get("source", "")
            
            # Format context entry
            context_parts.append(f"Document [{title}]:\n{content}\n")
            
            # Extract unique citations
            citation_key = (doc_id, title)
            if citation_key not in seen_citations:
                seen_citations.add(citation_key)
                citations.append(
                    RAGCitation(
                        document_id=str(doc_id),
                        document_name=title,
                        source=source
                    )
                )

        compiled_context = "\n".join(context_parts)
        token_count = len(compiled_context) // 4

        return RAGContextResponse(
            context=compiled_context,
            citations=citations,
            token_count=token_count
        )

    def query(
        self,
        question: str,
        history: List[ChatMessage],
        category: Optional[str] = None,
        tenant_id: Optional[str] = "default",
        top_k: Optional[int] = None,
        min_score: Optional[float] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None
    ) -> RAGQueryResponse:
        """
        Executes end-to-end query retrieval and generation.
        """
        start_time = time.time()
        logger.info("Executing RAG Pipeline for query: %s", question)

        # 1. Retrieve relevant contexts
        context_response = self.retrieve_context(
            query=question,
            category=category,
            tenant_id=tenant_id,
            top_k=top_k,
            min_score=min_score
        )

        # 2. Construct dynamic system prompt
        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            context_block=context_response.context or "No matching documentation found."
        )

        # 3. Assemble chat messages (System + History + User query)
        messages = [
            ChatMessage(role=MessageRole.SYSTEM, content=system_prompt)
        ]
        
        # Append session context history
        messages.extend(history)
        
        # Append current user query
        messages.append(ChatMessage(role=MessageRole.USER, content=question))

        # 4. Generate LLM response
        llm_response = llm_service.generate_response(
            messages=messages,
            provider=provider,
            model=model
        )

        duration = time.time() - start_time
        confidence = 0.85 if context_response.citations else 0.50

        return RAGQueryResponse(
            answer=llm_response.content,
            citations=context_response.citations,
            confidence_score=confidence,
            duration_seconds=duration
        )

# Singleton instance
rag_orchestrator = RAGOrchestrator()
