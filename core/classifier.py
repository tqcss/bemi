import os
import re
import joblib

from warnings import warn
from sklearn.metrics import classification_report
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer

from config import intent_classifier as config


_clf = None
_vec = None


def _load_model():
	global _clf, _vec

	if _clf is None and os.path.exists(config.MODEL_PATH):
		_clf = joblib.load(config.MODEL_PATH)
		_vec = joblib.load(config.VEC_PATH)
	else:
		warn('Intent classifier model or vectorizer not found at specified paths.')


def classify_intent(query: str, skill_meta: dict) -> str:
	_load_model()

	if _clf is None or _vec is None:
		X = _vec.transform([query])
		pred = _clf.predict(X)[0]
		return 'execute' if pred == 1 else 'text_only'
	
	# default: if requires execution is True, and no rule fired, then execute
	return 'execute' if skill_meta.get('requires_execution', 'False') == 'True' else 'text_only'
