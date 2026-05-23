"""
main.py
-------
Top-level pipeline orchestrator. Wires all /core modules together into a
single query → response function.

Pipeline execution order for every query:

  1. Context envelope   — prepend current date/time to query
  2. Retrieval          — find relevant skills from ChromaDB
  3. Confidence check   — if no skill passes threshold, go to step 8 directly
  4. Skill parser       — load full skill from disk using metadata filepath
  5. Intent classify    — execute code or answer from text only?
  6. Multi-step check   — does the query chain multiple skills?
  7a. Multi-step path   — build plan → execute each step → collect outputs
  7b. Single-step path  — extract params → run code → get execution result
  8. Generate response  — LLM formats skill context + exec result into answer

Startup:
  On first import, index_all_skills() is called unless ChromaDB already
  contains indexed skills. This means adding a new SKILL.md and restarting
  BEMI is sufficient to make it available — no retraining required.

Entry point:
  Call run(query) from a CLI loop, Gradio interface, or REST endpoint.
  The function is stateful via generator._memory across calls in the same
  process — call generator.reset_memory() between user sessions.
"""

import os
from datetime import date, datetime, timedelta
from logging import getLogger

from core.indexer    import index_all_skills, skill_col
from config          import dir_path
from core.retriever  import retrieve, get_skill_context
from core.classifier import classify_intent
from core.extractor  import extract_entities
from core.executor   import execute, format_execution_result
from core.planner    import needs_planning, build_plan, execute_plan
from core.generator  import generate, reset_memory
from util.skill_parser import parse_skill, get_skill_run_code

logger = getLogger(__name__)

# --- Startup: index skills if ChromaDB is empty ---
def _ensure_indexed():
    try:
        count = skill_col.count()
    except Exception:
        count = 0
    if count == 0:
        logger.info("[main] ChromaDB is empty — indexing all skills now...")
        index_all_skills(dir_path.SKILLS_DIR)


_ensure_indexed()


# --- Context envelope ---

def _build_context_envelope() -> str:
    """
    Return a context string prepended to every query before retrieval.

    Resolves temporal references ("tomorrow", "next week", "this month")
    by injecting the current date and near-future dates. spaCy's DATE
    entity recognizer and the LLM extractor can then resolve these
    correctly during parameter extraction.
    """
    today    = date.today()
    tomorrow = today + timedelta(days=1)
    now      = datetime.now().strftime("%H:%M")
    return (
        f"[Context: today is {today.strftime('%A %B %d %Y')}, "
        f"tomorrow is {tomorrow.strftime('%A %B %d %Y')}, "
        f"current time is {now}] "
    )


# --- Skill map cache (loaded lazily per query) ---

_skill_cache: dict = {}   # {filepath: parsed_skill_dict}


def _load_skill(filepath: str) -> dict:
    if filepath not in _skill_cache:
        _skill_cache[filepath] = parse_skill(filepath)
    return _skill_cache[filepath]


def _build_skill_map(retrieved_skills: list) -> dict:
    """Build a {skill_id: parsed_skill} dict from retrieval results."""
    skill_map = {}
    for entry in retrieved_skills:
        meta = entry.metadata
        sid  = meta["skill_id"]
        # Match indexer's metadata key 'file_path'
        fp   = meta.get("file_path", "")
        logger.info(f"Building skill map: {sid} at {fp}")
        if fp and os.path.exists(fp):
            skill_map[sid] = _load_skill(fp)
        else:
            logger.warning(f"Skill file not found at: {fp}")
    return skill_map


# --- Main pipeline ---

def run(query: str, stream: bool = False) -> any:
    logger.info(f"User sent query: {query}")

    # Step 1: Context envelope
    envelope      = _build_context_envelope()
    enriched_query = envelope + query
    logger.info("Context envelope applied.")

    # Step 2 & 3: Retrieve + confidence filter
    retrieval = retrieve(enriched_query)
    logger.info(f"Retriever finished. Fallback: {retrieval.fallback}, Found skills: {[s.metadata['skill_id'] for s in retrieval.skills] if not retrieval.fallback else 'None'}")
    
    if retrieval.fallback:
        if stream: return generate(query, skill_context="", exec_result="")
        return "".join(list(generate(query, skill_context="", exec_result="")))

    retrieved_skills = retrieval.skills
    top_entry        = retrieved_skills[0]
    top_meta         = top_entry.metadata
    skill_map        = _build_skill_map(retrieved_skills)

    # Step 4: Load full parsed skill for the top match
    top_skill = skill_map.get(top_meta["skill_id"])
    if not top_skill:
        logger.info("Top skill load failed.")
        if stream: return generate(query, skill_context="", exec_result="")
        return "".join(list(generate(query, skill_context="", exec_result="")))
    logger.info(f"Loaded top skill: {top_meta['skill_id']}")

    # Step 5: Intent classification
    intent = classify_intent(query, top_meta)
    logger.info(f"Intent classified as: {intent}")
    skill_context = get_skill_context(top_entry)

    # Step 6: Multi-step check
    if needs_planning(query):
        logger.info("Multi-step query detected. Building plan...")
        plan = build_plan(query, [e.metadata for e in retrieved_skills])
        if plan.steps:
            logger.info(f"Plan built with {len(plan.steps)} steps. Executing...")
            registry = execute_plan(
                plan=plan,
                skill_map=skill_map,
                executor_fn=execute,
                extractor_fn=lambda q, p: extract_entities(enriched_query, p),
                enriched_query=enriched_query,
            )
            # Use the last step's output as the primary execution result
            last_key = list(registry.keys())[-1] if registry else ""
            exec_result = registry.get(last_key, "")
            logger.info("Plan execution finished.")
            if stream: return generate(query, skill_context=skill_context, exec_result=exec_result)
            return "".join(list(generate(query, skill_context=skill_context, exec_result=exec_result)))
        else:
            logger.info("Plan failed, falling back to single-skill path.")

    # Step 7b: Single-skill execution path
    exec_result = ""
    if intent == "execute":
        logger.info("Extracting parameters...")
        params = extract_entities(enriched_query, top_skill.get("params", []))
        logger.info(f"Parameters extracted: {params}")
        code   = get_skill_run_code(top_skill)
        logger.info("Executing skill code...")
        result = execute(code, params)
        exec_result = format_execution_result(result)
        logger.info(f"Execution result: {exec_result}")

    # Step 8: Generate response
    logger.info("Generating final response.")
    if stream:
        return generate(query, skill_context=skill_context, exec_result=exec_result)
    
    # For non-streaming, collect the full text from the generator
    gen = generate(query, skill_context=skill_context, exec_result=exec_result)
    return "".join(list(gen))


# --- CLI entry point ---

if __name__ == "__main__":
    print("BEMI — type 'exit' to quit, 'reset' to clear memory.\n")
    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not user_input:
            continue
        if user_input.lower() == "exit":
            break
        if user_input.lower() == "reset":
            reset_memory()
            print("BEMI: Memory cleared.\n")
            continue
        response = run(user_input)
        print("\n")
        