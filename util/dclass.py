from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field


@dataclass
class PreprocessedText:
	cleaned: str = ''
	original: str = ''
	tokens: List[str] = field(default_factory=list)

	
@dataclass
class ParsedSkill:
	metadata: Dict[str, str]
	overview: str
	prose: str
	file_path: str
	examples: List[Dict[str, str]]
	params: Optional[List[Dict[str, str]]] = None
	code_blocks: Optional[List[Dict[str, str]]] = None


@dataclass
class RetrievedSkill:
	metadata: Dict[str, Any]
	distance: float
	prose: str = ''
	chunks: List[str] = field(default_factory=list)


@dataclass
class RetrievalResults:
	skills: List[RetrievedSkill] = field(default_factory=list)
	fallback: bool = True
