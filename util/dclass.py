from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime


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

@dataclass
class Parameter:
    name: str
    ptype: str
    description: str
    required: bool = False
    default: Any = None

@dataclass
class ExecutionResult:
    status: str
    output: str
    executed_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

@dataclass
class PlanStep:
    step: int
    skill_id: str
    params: Dict[str, Any]
    output_key: str

@dataclass
class Plan:
    steps: List[PlanStep] = field(default_factory=list)



