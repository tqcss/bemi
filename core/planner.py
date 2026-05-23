import re
from typing import List, Dict, Any, Callable

from config import planner_config
from util.dclass import Plan, PlanStep
import re
from typing import List, Dict, Any, Callable
from config import planner_config
from util.dclass import Plan, PlanStep
from util.logger import get_logger

logger = get_logger(__name__)
_CHAIN_RE = re.compile("|".join(planner_config.CHAIN_KEYWORDS), re.IGNORECASE)


def needs_planning(query: str) -> bool:
    return bool(_CHAIN_RE.search(query))


def build_plan(query: str, available_skills: List[Dict[str, Any]]) -> Plan:
    try:
        segments = _CHAIN_RE.split(query)
        plan_steps = []

        for i, segment in enumerate(segments):
            segment = segment.strip()
            if not segment:
                continue

            skill_id = "unknown"
            for skill in available_skills:
                if skill["skill_id"].lower() in segment.lower():
                    skill_id = skill["skill_id"]
                    break

            if skill_id == "unknown":
                logger.warning(f"Could not find skill for segment: '{segment}'")
                return Plan() # Fallback

            step_idx = i + 1
            plan_steps.append(
                PlanStep(
                    step=step_idx,
                    skill_id=skill_id,
                    params={},
                    output_key=f"step_{step_idx}_output"
                )
            )

        if not plan_steps:
            return Plan()

        logger.info(f"Generated plan with {len(plan_steps)} steps")
        return Plan(steps=plan_steps)
    except Exception as e:
        logger.error(f"Error building plan: {e}")
        return Plan() # Fallback
def resolve_refs(params: Dict[str, Any], registry: Dict[str, Any]) -> Dict[str, Any]:
    pattern = re.compile(r"\{\{(step_\d+_output)\}\}")
    resolved = {}
    for k, v in params.items():
        if isinstance(v, str):
            m = pattern.fullmatch(v.strip())
            resolved[k] = registry.get(m.group(1), v) if m else v
        else:
            resolved[k] = v
    return resolved


def execute_plan(
    plan: Plan,
    skill_map: Dict[str, Any],
    executor_fn: Callable,
    extractor_fn: Callable,
    enriched_query: str
) -> Dict[str, str]:
    registry = {}

    for step in plan.steps:
        params = resolve_refs(step.params, registry)
        skill = skill_map.get(step.skill_id)

        if not skill:
            registry[step.output_key] = f"Error: skill '{step.skill_id}' not found."
            continue

        if not params:
            params = extractor_fn(enriched_query, skill.get("params", []))

        result = executor_fn(get_skill_run_code(skill), params)
        registry[step.output_key] = format_execution_result(result)

    return registry
