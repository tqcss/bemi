---
name: "general-facts"
description: "Provides accurate, encyclopedic answers to factual questions about geography, science, history, and the natural world. No code execution required."
tags:
  - "facts"
  - "geography"
  - "science"
  - "knowledge"
version: "1.0.0"
author: "BEMI"
network_allowed: false
---

## Overview
This skill answers general knowledge questions across a broad range of non-computational domains, with an emphasis on geography and science. Unlike skills that perform calculations or fetch live data, this one draws on well-established factual knowledge to give clear, accurate, and concise answers. It is the right skill to use when a user asks a "did you know" style question, wants a definition or explanation of a natural phenomenon, or needs a quick factual lookup that does not require arithmetic or real-time information.

## Capabilities
- Answer geography questions (capitals, countries, continents, major landmarks, rivers, mountains, oceans)
- Explain scientific concepts and phenomena (physics, chemistry, biology, astronomy, earth science)
- Provide facts about the natural world (ecosystems, animals, plants, weather patterns)
- Clarify common misconceptions with accurate information
- Give brief historical context when relevant to a fact

### Inputs
A natural-language question or prompt from the user. No structured input is required — the skill interprets intent from the phrasing.

### Outputs
A prose answer, typically 1–4 sentences, that directly addresses the question. Longer answers include a brief introductory sentence followed by key supporting facts. No bullet lists unless the user explicitly requests one.

---

## Instructions

### When to Use
- If the user asks "what is the capital of [country]?"
- When the user wants to know the largest, longest, tallest, deepest, or most [adjective] of a geographic feature
- If the task involves explaining a scientific concept (e.g., "how does photosynthesis work?")
- When the user asks a factual question about an animal, planet, element, or natural phenomenon
- If the user wants to know a well-established historical or scientific fact that does not require live data

### How to Respond
Give a direct, confident answer in plain prose. Lead with the core fact, then add one or two sentences of useful context or elaboration. Avoid hedging unnecessarily on well-established facts. If the question is ambiguous, briefly state the most common interpretation before answering it.

For multi-part questions, address each part in order within the same paragraph or in clearly separated short paragraphs. Keep responses proportional — simple lookups deserve a sentence; explanations of complex phenomena may warrant a short paragraph.

### Constraints
- Do not fabricate or estimate facts; if a fact is genuinely uncertain or contested, say so.
- Do not provide real-time data (current population figures, today's records, recent events) — direct the user to a live-data skill or search for those.
- Keep responses factual and neutral; do not editorialize.
- If a question falls outside geography or science, answer from general knowledge rather than refusing.

---

## Examples

### Example 1

**User Input:**
```
What is the capital of Australia?
```
**Expected Behavior:** Retrieve the correct capital and note the common misconception.

**Expected Output:**
```
The capital of Australia is Canberra. It is often mistaken for Sydney, which is the largest city, but Canberra was purpose-built as a compromise capital between Sydney and Melbourne and became the seat of government in 1913.
```

### Example 2

**User Input:**
```
How does photosynthesis work?
```
**Expected Behavior:** Explain the core mechanism in plain language.

**Expected Output:**
```
Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy stored as glucose. In the chloroplasts of plant cells, chlorophyll absorbs sunlight and uses that energy to combine carbon dioxide (absorbed from the air) with water (drawn up from the roots), producing glucose and releasing oxygen as a byproduct. The overall reaction can be summarized as: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂.
```

### Example 3

**User Input:**
```
What is the longest river in the world?
```
**Expected Behavior:** State the answer and acknowledge the ongoing debate.

**Expected Output:**
```
The Nile River in northeastern Africa is traditionally cited as the world's longest river, stretching approximately 6,650 kilometers (4,130 miles). However, some measurements of the Amazon River in South America place it at a comparable or slightly greater length depending on where its source is defined, making this a subject of ongoing geographic debate.
```

### Example 4

**User Input:**
```
Why is the sky blue?
```
**Expected Behavior:** Explain Rayleigh scattering in accessible terms.

**Expected Output:**
```
The sky appears blue because of a phenomenon called Rayleigh scattering. Sunlight is composed of all colors of the visible spectrum, each with a different wavelength. When sunlight enters Earth's atmosphere, gas molecules scatter shorter wavelengths (blue and violet light) far more than longer wavelengths (red and orange). Although violet light is scattered even more than blue, our eyes are more sensitive to blue and the upper atmosphere absorbs some violet, so we perceive the sky as blue.
```

### Example 5

**User Input:**
```
What are the seven continents?
```
**Expected Behavior:** List them in a natural prose sentence, noting the geographic model used.

**Expected Output:**
```
The seven continents, as recognized in the most widely taught model, are Africa, Antarctica, Asia, Australia (sometimes called Oceania), Europe, North America, and South America. Some geographic traditions — particularly in parts of Europe and Latin America — combine Europe and Asia into Eurasia, or North and South America into a single "America," resulting in six- or five-continent models.
```

---

## Notes
- This skill does not execute code. Answers are derived from training knowledge, not real-time lookup.
- For questions with answers that change frequently (e.g., "who is the current president of…"), acknowledge that the answer may have changed and suggest a live-data skill.
- Scientific explanations should prioritize accuracy and accessibility; avoid unnecessary jargon but do not sacrifice correctness.

## Retrieval Keywords
geography, science, capital city, country, continent, ocean, mountain, river, biology, chemistry, physics, astronomy, natural world, facts, knowledge, explain, how does, what is, largest, longest, deepest, fastest, animal, planet, element, ecosystem, phenomenon, history