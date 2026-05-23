"""
Extracts parameters from user queries using a fine-tuned spaCy NER model.
"""

import re
import spacy
import os
from typing import List, Dict, Any
from util.dclass import Parameter

from util.logger import get_logger

logger = get_logger(__name__)

# Load the custom NER model; fallback to default spaCy model if unavailable
_model_path = os.path.join(os.path.dirname(__file__), "..", "models", "bemi-ner-best")

if os.path.exists(_model_path):
    try:
        _nlp = spacy.load(_model_path)
    except Exception as e:
        logger.error(f"Failed to load custom NER model at {_model_path}: {e}")
        _nlp = spacy.load("en_core_web_sm")
else:
    logger.debug(f"Custom NER model not found at {_model_path}; using default en_core_web_sm.")
    try:
        _nlp = spacy.load("en_core_web_sm")
    except OSError:
        logger.error("Default spaCy model 'en_core_web_sm' is not installed. Please run: python -m spacy download en_core_web_sm")
        raise RuntimeError("NER model initialization failed.")


def extract_entities(query: str, params: List[Parameter]) -> Dict[str, Any]:
    """
    Extracts entities and numbers using the fine-tuned spaCy model.
    """
    doc = _nlp(query)
    extracted = {}

    for p in params:
        name = p.name
        ptype = p.ptype.lower()
        desc = p.description

        if "string:city" in ptype or "string:location" in ptype:
            gpe = [e.text for e in doc.ents if e.label_ == "GPE"]
            extracted[name] = gpe[0] if gpe else None

        elif "string:date" in ptype:
            dates = [e.text for e in doc.ents if e.label_ == "DATE"]
            extracted[name] = dates[0] if dates else None

        elif "string:person" in ptype:
            persons = [e.text for e in doc.ents if e.label_ == "PERSON"]
            extracted[name] = persons[0] if persons else None

        elif ptype in ("float", "int", "number"):
            nums = re.findall(r"-?\d+(?:\.\d+)?", query)
            if nums:
                extracted[name] = float(nums[0]) if ptype == "float" else int(float(nums[0]))
            else:
                extracted[name] = None

        elif "string:enum" in ptype:
            examples = re.findall(r'"([^"]+)"', desc)
            match = None
            for ex in examples:
                if ex.lower() in query.lower():
                    match = ex
                    break
            extracted[name] = match

        else:
            extracted[name] = None

    # Fill defaults for missing values
    for p in params:
        if extracted.get(p.name) is None and p.default is not None:
            extracted[p.name] = p.default

    return extracted
