import time
import logging
from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.core.config import settings
from app.models.llm import ChatMessage, LLMGenerationResponse

logger = logging.getLogger(__name__)

class LLMService:
    """
    Unified LLM Service utilizing LangChain's fallback system for rate limit
    and token limit failovers across Groq, OpenAI, and Gemini.
    """
    def __init__(self):
        pass

    def _get_model_instance(self, provider: str, model_name: Optional[str] = None, temperature: float = 0.2, max_tokens: Optional[int] = None):
        """Helper to create LangChain model instances."""
        provider = provider.lower()
        
        if provider == "groq":
            actual_model = model_name or "llama-3.3-70b-versatile"
            if not settings.GROQ_API_KEY:
                raise ValueError("Groq API key is not configured.")
            return ChatGroq(
                model=actual_model,
                groq_api_key=settings.GROQ_API_KEY,
                temperature=temperature,
                max_tokens=max_tokens
            )
        elif provider == "openai":
            actual_model = model_name or "gpt-4o-mini"
            if not settings.OPENAI_API_KEY:
                raise ValueError("OpenAI API key is not configured.")
            return ChatOpenAI(
                model=actual_model,
                api_key=settings.OPENAI_API_KEY,
                temperature=temperature,
                max_tokens=max_tokens
            )
        elif provider == "gemini":
            actual_model = model_name or "gemini-1.5-flash"
            if not settings.GEMINI_API_KEY:
                raise ValueError("Gemini API key is not configured.")
            return ChatGoogleGenerativeAI(
                model=actual_model,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=temperature,
                max_tokens=max_tokens
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")

    def generate_response(
        self,
        messages: List[ChatMessage],
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> LLMGenerationResponse:
        """
        Executes chat generation with LangChain's failover mechanism.
        """
        selected_temp = temperature if temperature is not None else 0.2
        
        # 1. Determine priority sequence
        primary_provider = (provider or settings.LLM_PROVIDER or "openai").lower()
        
        logger.info("Building LLM Fallback Chain - Primary Provider: %s", primary_provider)

        # Fallback list ordering
        providers_order = [primary_provider]
        for p in ["openai", "groq", "gemini"]:
            if p not in providers_order:
                providers_order.append(p)

        # 2. Build LangChain model instances
        model_instances = []
        for p in providers_order:
            try:
                m_name = model if p == primary_provider else None
                instance = self._get_model_instance(p, model_name=m_name, temperature=selected_temp, max_tokens=max_tokens)
                model_instances.append((p, instance))
            except Exception as e:
                logger.warning("Could not initialize provider %s for fallback: %s", p, str(e))

        if not model_instances:
            raise RuntimeError("No LLM providers could be initialized. Please check API keys in settings.")

        # 3. Create the LangChain Runnable with Fallbacks
        primary_info, primary_runnable = model_instances[0]
        backups_runnables = [inst for info, inst in model_instances[1:]]

        if backups_runnables:
            llm_chain = primary_runnable.with_fallbacks(backups_runnables)
        else:
            llm_chain = primary_runnable

        # 4. Format messages for LangChain
        lc_messages = []
        for m in messages:
            role_str = m.role.value if hasattr(m.role, "value") else str(m.role)
            if role_str == "system":
                lc_messages.append(SystemMessage(content=m.content))
            elif role_str == "user":
                lc_messages.append(HumanMessage(content=m.content))
            elif role_str == "assistant":
                lc_messages.append(AIMessage(content=m.content))

        # 5. Invoke request
        start_time = time.time()
        try:
            response = llm_chain.invoke(lc_messages)
            duration = time.time() - start_time
            
            meta = response.response_metadata or {}
            input_tokens = meta.get("token_usage", {}).get("prompt_tokens", 0)
            output_tokens = meta.get("token_usage", {}).get("completion_tokens", 0)
            
            logger.info("Successfully received LLM response in %0.2fs", duration)
            return LLMGenerationResponse(
                provider=primary_info,
                model=model or "auto-fallback",
                content=response.content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                duration_seconds=duration
            )
        except Exception as e:
            logger.error("LangChain fallback chain failed completely: %s", str(e))
            raise e

# Singleton instance
llm_service = LLMService()
