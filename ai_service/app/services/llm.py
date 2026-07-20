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
        self._key_cooldowns = {}
        
    def _is_on_cooldown(self, key: str) -> bool:
        if not key:
            return False
        if key in self._key_cooldowns:
            if time.time() < self._key_cooldowns[key]:
                return True
            else:
                del self._key_cooldowns[key]
        return False
        
    def _set_cooldown(self, key: str):
        if key:
            self._key_cooldowns[key] = time.time() + settings.API_KEY_COOLDOWN_SECONDS

    def _get_model_instances(self, provider: str, model_name: Optional[str] = None, temperature: float = 0.2, max_tokens: Optional[int] = None, require_json: bool = False):
        """Helper to create LangChain model instances for all configured API keys of a provider."""
        provider = provider.lower()
        instances = []
        
        if provider == "groq":
            actual_model = model_name or "llama-3.3-70b-versatile"
            keys = settings.GROQ_API_KEYS
            if not keys:
                return instances
            for key in keys:
                model = ChatGroq(
                    model=actual_model,
                    groq_api_key=key,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                if require_json:
                    model = model.bind(response_format={"type": "json_object"})
                instances.append((model, key))
                
        elif provider == "openai":
            actual_model = model_name or "gpt-4o-mini"
            keys = settings.OPENAI_API_KEYS
            if not keys:
                return instances
            for key in keys:
                model = ChatOpenAI(
                    model=actual_model,
                    api_key=key,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                if require_json:
                    model = model.bind(response_format={"type": "json_object"})
                instances.append((model, key))
                
        elif provider == "gemini":
            actual_model = model_name or "gemini-1.5-flash"
            keys = settings.GEMINI_API_KEYS
            if not keys:
                return instances
            for key in keys:
                model = ChatGoogleGenerativeAI(
                    model=actual_model,
                    google_api_key=key,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                instances.append((model, key))
                
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
            
        return instances

    def generate_response(
        self,
        messages: List[ChatMessage],
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        require_json: bool = False
    ) -> LLMGenerationResponse:
        """
        Executes chat generation with LangChain's failover mechanism across all providers and keys.
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

        # 2. Build LangChain model instances for ALL keys
        model_instances = []
        for p in providers_order:
            try:
                m_name = model if p == primary_provider else None
                provider_instances = self._get_model_instances(p, model_name=m_name, temperature=selected_temp, max_tokens=max_tokens, require_json=require_json)
                for inst in provider_instances:
                    model_instances.append((p, inst))
            except Exception as e:
                logger.warning("Could not initialize provider %s for fallback: %s", p, str(e))

        if not model_instances:
            raise RuntimeError("No LLM providers could be initialized. Please check API keys in settings.")

        # 3. Format messages for LangChain
        lc_messages = []
        for m in messages:
            role_str = m.role.value if hasattr(m.role, "value") else str(m.role)
            if role_str == "system":
                lc_messages.append(SystemMessage(content=m.content))
            elif role_str == "user":
                lc_messages.append(HumanMessage(content=m.content))
            elif role_str == "assistant":
                lc_messages.append(AIMessage(content=m.content))

        # 4. Invoke request with manual failover and cooldown handling
        start_time = time.time()
        last_error = None
        
        for p_name, (m_instance, key) in model_instances:
            key_preview = key[-4:] if key else "None"
            
            if self._is_on_cooldown(key):
                logger.info("Skipping key ending in %s for provider %s due to active cooldown.", key_preview, p_name)
                continue
                
            try:
                response = m_instance.invoke(lc_messages)
                duration = time.time() - start_time
                
                meta = response.response_metadata or {}
                input_tokens = meta.get("token_usage", {}).get("prompt_tokens", 0)
                output_tokens = meta.get("token_usage", {}).get("completion_tokens", 0)
                
                logger.info("Successfully received LLM response from %s in %0.2fs", p_name, duration)
                return LLMGenerationResponse(
                    provider=p_name,
                    model=model or "auto-fallback",
                    content=response.content,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    duration_seconds=duration
                )
            except Exception as e:
                error_str = str(e).lower()
                if "429" in error_str or "rate limit" in error_str or "quota" in error_str or "401" in error_str or "insufficient" in error_str:
                    logger.warning("Provider %s API Key ending in %s hit limit/error. Applying cooldown. Error: %s", p_name, key_preview, e)
                    self._set_cooldown(key)
                else:
                    logger.warning("Provider %s API Key ending in %s failed with non-quota error: %s", p_name, key_preview, e)
                last_error = e

        logger.error("All LLM providers and keys failed or are on cooldown.")
        raise last_error or RuntimeError("All LLM providers failed and no keys were available.")

# Singleton instance
llm_service = LLMService()
