import os
import hashlib
import json
from django.core.cache import cache
from deep_translator import GoogleTranslator
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class TranslationService:
    def __init__(self):
        # We assume GOOGLE_APPLICATION_CREDENTIALS is set in the environment or
        # an API key is available. For V2, API key can be passed directly, or 
        # it auto-detects credentials from the environment.
        self.api_key = os.getenv("GOOGLE_TRANSLATE_API_KEY")
        pass

    def _generate_cache_key(self, text, target_lang):
        """Generate a unique Redis cache key for the text and language."""
        text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
        return f"translation:{target_lang}:{text_hash}"

    def translate_text(self, text, target_lang):
        """Translate a single string, with caching and fallback."""
        if not text or target_lang == 'en':
            return text
            
        cache_key = self._generate_cache_key(text, target_lang)
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
            
        try:
            translator = GoogleTranslator(source='en', target=target_lang)
            translated_text = translator.translate(text)
            
            # Cache the result for 30 days
            cache.set(cache_key, translated_text, timeout=60 * 60 * 24 * 30)
            return translated_text
        except Exception as e:
            logger.error(f"Translation failed for '{text[:20]}...': {str(e)}")
            return text # Graceful fallback

    def translate_object(self, obj, fields, target_lang):
        """Translate specific fields of a dictionary."""
        if target_lang == 'en':
            return obj
            
        translated_obj = obj.copy()
        for field in fields:
            if field in translated_obj and isinstance(translated_obj[field], str):
                translated_obj[field] = self.translate_text(translated_obj[field], target_lang)
        return translated_obj

    def translate_list(self, data_list, fields, target_lang):
        """Translate a list of dictionaries."""
        if target_lang == 'en':
            return data_list
            
        return [self.translate_object(obj, fields, target_lang) for obj in data_list]

translation_service = TranslationService()
