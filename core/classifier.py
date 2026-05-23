import os
import joblib
from util.logger import get_logger
from config import intent_classifier as config

logger = get_logger(__name__)

_clf = None
_vec = None
_initialized = False

def _load_model():
    global _clf, _vec, _initialized
    if not _initialized:
        if os.path.exists(config.MODEL_PATH) and os.path.exists(config.VEC_PATH):
            try:
                _clf = joblib.load(config.MODEL_PATH)
                _vec = joblib.load(config.VEC_PATH)
                logger.info("Intent classifier loaded.")
            except Exception as e:
                logger.error(f"Failed to load classifier: {e}")
        else:
            logger.debug("Intent classifier model/vectorizer not found; using fallback.")
        _initialized = True

def classify_intent(query: str, skill_meta: dict) -> str:
    _load_model()

    if _clf is not None and _vec is not None:
        try:
            X = _vec.transform([query])
            pred = _clf.predict(X)[0]
            return 'execute' if pred == 1 else 'text_only'
        except Exception as e:
            logger.error(f"Classification error: {e}")
            
    # Default fallback logic
    requires_exec = skill_meta.get('requires_execution', False)
    # Handle boolean or string representation
    if isinstance(requires_exec, str):
        requires_exec = requires_exec.lower() == 'true'
        
    logger.debug(f'AAAAAAAAAAAAAAAAAAA')
    return 'execute' if requires_exec else 'text_only'
