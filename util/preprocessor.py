import re
import nltk
import spacy

from typing import Dict
from nltk.corpus import stopwords
from .dclass import PreprocessedText, ParsedSkill

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

_nlp = spacy.load('en_core_web_sm')
_STOPWORDS = set(stopwords.words('english'))


def preprocess_markdown(text: str) -> str:
	# strip markdown syntax
	text = re.sub(r'#{1,6}\s', ' ', text) # headers
	text = re.sub(r'`{1,3}[^`]*`{1,3}', ' ', text) # inline & block code
	text = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', text) # bold & italic
	text = re.sub(r'!\[.*?\]\(.*?\)', ' ', text) # images
	text = re.sub(r'\[.*?\]\(.*?\)', ' ', text) # links

	# strip frontmatter
	text = re.sub(r'^(\-\-\-|\+\+\+)[\s\S]*?(\-\-\-|\+\+\+)\n', '', text, flags=re.DOTALL)

	return text


def preprocess_text(text: str, *, is_markdown: bool=False) -> PreprocessedText:
	if not text or not text.strip():
		return PreprocessedText()

	# strip markdown specific syntax
	if is_markdown:
		text = preprocess_markdown(text)

	# lowercase
	text = text.lower()

	# remove non alphanumeric except spaces
	text = re.sub(r'[^a-z0-9\s]', ' ', text)

	# collapse whitespace
	original = re.sub(r'\s+', ' ', text).strip()

	# spacy tokenize lemmatize & filter
	tokens = [
		token.lemma_ for token in _nlp(original)
		if token.is_alpha
		and not token.is_stop
		and token.lemma_ not in _STOPWORDS
		and len(token.text) > 2
	]

	return PreprocessedText(
		cleaned=' '.join(tokens),
		original=original,
		tokens=tokens
	)


def preprocess_skill_text(skill: ParsedSkill) -> str:
	metadata = skill.metadata
	overview = skill.overview[:500] if skill.overview else ''
	description = metadata.get('description', '')
	prose = skill.prose
	raw = f'{description} {overview} {prose}'.strip()
	
	return preprocess_text(raw, is_markdown=False).cleaned
	

# markdown test
if __name__ == '__main__':
	sample_md ="""
	---
	title: Test Skill
	description: Lorem ipsum dolor sit amet.
	---
	## Overview
	This is a **test skill**. It demonstrates _markdown_ preprocessing.

	## Header
	Some content here.

	## Parameters
	- city (string:city) [required]: The city to get weather for. Example: "New York".

	## Code
	```python
	def get_weather(city):
	    return "The weather in {} is sunny.".format(city)
	```

	## Examples
	User: What's the weather in New York?
	Context: None
	Response: The weather in New York is sunny.
	"""

	preprocessed = preprocess_text(sample_md, is_markdown=True)
	print("Cleaned:", preprocessed.cleaned)
	print("Original:", preprocessed.original)
	print("Tokens:", preprocessed.tokens)
