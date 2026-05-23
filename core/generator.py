"""
generator.py
------------
Generates the final user-facing response using the fine-tuned LLM.

This module owns two critical responsibilities:

  1. Prompt assembly — combining skill context, execution result, and
     conversation history into a structured prompt using Gemma 4's
     standard chat format (system / user / assistant roles via
     apply_chat_template). The format here MUST match the format used
     in training/build_dataset.py — any mismatch degrades post-fine-tuning
     performance immediately and silently.

  2. Memory management — maintaining a rolling conversation buffer via
     LangChain's ConversationSummaryBufferMemory. When the buffer exceeds
     max_token_limit, the oldest turns are summarized into a single
     paragraph by the LLM and dropped from the raw message list. This keeps
     the context window bounded regardless of conversation length.

Two model backends are supported:

  Ollama backend (default, inference only) — used for initial development
    before fine-tuning is complete. Calls the base Gemma 4 model via Ollama.
    Prompt is formatted with apply_chat_template using the tokenizer from
    the Unsloth-compatible checkpoint.

  Fine-tuned backend (post Phase 8) — loads the LoRA-merged checkpoint
    from ./models/bemi-gemma-lora and uses it for all generation.

Called by: main.py (every query, after retrieval and optional execution)
Depends on: Ollama running with gemma4
"""

import logging

from langchain_ollama import OllamaLLM
from langchain_classic.memory import ConversationSummaryBufferMemory
from config import LLM_MODEL_NAME

_llm = OllamaLLM(model=LLM_MODEL_NAME)

# Conversation memory: summarizes oldest turns when buffer > max_token_limit
# Using a simple character count as an estimator to avoid external tokenizer dependencies
def _get_token_count(text: str) -> int:
    return len(text)

_memory = ConversationSummaryBufferMemory(
    llm=_llm,
    max_token_limit=3000,
    token_counter=_get_token_count,
    return_messages=True,
    human_prefix="User",
    ai_prefix="BEMI",
)

# System prompt — must match the system role used in build_dataset.py exactly
_SYSTEM_PROMPT = (
    "You are BEMI, a behavior-extensible assistant. "
    "Answer the user's question using the provided skill context and execution result. "
    "Be accurate, concise, and natural. DO NOT produce any internal reasoning, chain-of-thought, or 'thinking' blocks. "
    "Provide only the final answer. "
    "If the execution result contains an error, explain it clearly and offer alternatives."
)


def _build_messages(skill_context: str, exec_result: str,
                    query: str, history_str: str) -> list:
    """
    Build the messages list in standard chat format.

    The user message combines skill context, execution result, and the
    raw query into one coherent block. Conversation history is prepended
    to the user message as a summary rather than injected as additional
    message turns — this avoids role-ordering issues when history contains
    multiple alternating turns.

    Returns a list of {role, content} dicts ready for apply_chat_template.
    """
    context_block = f"Context:\n{skill_context}\n\n" if skill_context.strip() else ""
    result_block  = f"Execution result:\n{exec_result}\n\n" if exec_result.strip() else ""
    history_block = f"Conversation so far:\n{history_str}\n\n" if history_str.strip() else ""

    user_content = (
        f"{history_block}"
        f"{context_block}"
        f"{result_block}"
        f"{query}"
    )

    return [
        {"role": "system",    "content": _SYSTEM_PROMPT},
        {"role": "user",      "content": user_content},
    ]


def generate(query: str, skill_context: str = "",
             exec_result: str = "") -> tuple[str, list]:
    """
    Generate a response for the current query turn, returning a generator
    for the stream and the full text once complete.
    """
    history_vars = _memory.load_memory_variables({})
    history_msgs = history_vars.get("history", [])
    history_str  = "\n".join(
        f"{m.type.capitalize()}: {m.content}"
        for m in history_msgs
        if hasattr(m, "content")
    )

    messages = _build_messages(skill_context, exec_result, query, history_str)
    formatted_prompt = _format_for_ollama(messages)
    
    def token_generator():
        full_response = ""
        for chunk in _llm.invoke(formatted_prompt):
            full_response += chunk
            yield chunk
        _memory.save_context({"input": query}, {"output": full_response})
    
    return token_generator()


def _format_for_ollama(messages: list) -> str:
    """
    Format messages into Gemma 4 chat template string for OllamaLLM.

    OllamaLLM's invoke() accepts a plain string. Gemma 4 uses the standard
    ChatML-derived format with <start_of_turn> / <end_of_turn> tokens.
    This function produces that format manually for the LangChain Ollama
    wrapper, which does not natively call apply_chat_template.

    When using the fine-tuned model directly (post Phase 8), replace this
    with tokenizer.apply_chat_template(messages, add_generation_prompt=True).
    """
    parts = []
    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        parts.append(f"<start_of_turn>{role}\n{content}<end_of_turn>")
    parts.append("<start_of_turn>model\n")   # generation prompt
    return "\n".join(parts)


def reset_memory() -> None:
    """Clear the conversation buffer. Call between sessions."""
    logging.info("Resetting conversation memory.")
    _memory.clear()
    logging.info("Memory reset complete.")


def get_history_string() -> str:
    """Return the current conversation history as a plain string."""
    vars_ = _memory.load_memory_variables({})
    msgs  = vars_.get("history", [])
    return "\n".join(
        f"{m.type.capitalize()}: {m.content}"
        for m in msgs if hasattr(m, "content")
    )