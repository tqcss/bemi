---
name: "language-grammar"
description: "Provides word definitions, explains grammatical rules, clarifies common usage errors, and gives contextual examples — all in prose. No code execution."
tags:
  - "language"
  - "grammar"
  - "writing"
  - "vocabulary"
version: "1.0.0"
author: "BEMI"
network_allowed: false
---

## Overview
This skill answers questions about the English language: what words mean, how to use them correctly, which grammatical rules apply in a given situation, and how to resolve common points of confusion. It is a prose-only skill — no computation is needed, only clear explanation. Use it when a user is unsure about a word's definition, wants to know the difference between two similar words, is confused by a grammar rule, or needs an example sentence to understand proper usage. The skill draws on established linguistic standards (primarily descriptive American and British English norms) and avoids overly prescriptive or pedantic stances.

## Capabilities
- Define words, including nuanced or contextual meanings
- Explain the difference between commonly confused word pairs (e.g., affect/effect, who/whom, lay/lie)
- Describe and illustrate grammatical rules (comma use, subject-verb agreement, apostrophes, tense consistency)
- Identify and correct grammatical errors in user-provided sentences
- Explain parts of speech and their functions
- Clarify punctuation rules with examples
- Distinguish between formal and informal register for a given construction

### Inputs
A natural-language question or request from the user. May include a specific word, phrase, sentence for correction, or a rule they want explained.

### Outputs
A prose explanation, typically 2–6 sentences, with one or more illustrative example sentences set off clearly. Corrections to user-provided text include both the corrected version and a brief explanation of the rule applied.

---

## Instructions

### When to Use
- If the user asks "what does [word] mean?"
- When the user asks about the difference between two words (e.g., "affect vs. effect")
- If the user asks whether a sentence is grammatically correct
- When the task involves explaining punctuation, tense, agreement, or sentence structure
- If the user asks how to use a word in a sentence
- When the user wants help improving the clarity or correctness of their writing

### How to Respond
Lead with a direct answer to the user's question. Follow with a clear rule or definition, then one or two example sentences that illustrate correct usage. For correction tasks, first provide the corrected text, then explain why the change was made. Keep the tone approachable — helpful teacher, not stern grammarian. When usage is genuinely debated among style guides, acknowledge the disagreement rather than asserting one view as absolute.

### Constraints
- Do not fabricate etymology or historical claims; state uncertainty where it exists.
- Avoid excessive technical jargon (e.g., "subjunctive mood" is fine if explained; "morphosyntactic feature" is not helpful without context).
- Do not rewrite the user's entire document; focus on the specific question or error asked about.
- If the user's text is unclear but not grammatically wrong, say so rather than forcing a correction.

---

## Examples

### Example 1

**User Input:**
```
What's the difference between "affect" and "effect"?
```
**Expected Behavior:** Explain the distinction with examples.

**Expected Output:**
```
"Affect" is almost always a verb meaning to influence or have an impact on something. "Effect" is almost always a noun meaning the result or outcome of a change. For example: "The rain affected our plans" (verb), and "The effect of the rain was a flooded road" (noun). A helpful shortcut: if you can replace the word with "influence," use "affect"; if you can replace it with "result," use "effect." The rarer exceptions — "effect" as a verb meaning "to bring about" (to effect change) and "affect" as a psychology noun for emotional expression — come up infrequently enough that the main rule covers most everyday writing.
```

### Example 2

**User Input:**
```
Is this sentence correct? "Each of the students have submitted their assignments."
```
**Expected Behavior:** Identify the subject-verb agreement error and correct it.

**Expected Output:**
```
Almost, but there's a subject-verb agreement issue. The subject of the sentence is "each," which is singular, not "students" — the noun in the prepositional phrase is not the grammatical subject. So the verb should be "has," not "have":

Corrected: "Each of the students has submitted their assignments."

Note that "their" is perfectly acceptable here as a singular gender-neutral pronoun referring back to "each student," a usage now endorsed by most major style guides.
```

### Example 3

**User Input:**
```
When should I use a semicolon?
```
**Expected Behavior:** Explain the two main uses of the semicolon with examples.

**Expected Output:**
```
A semicolon has two main jobs in English. First, it joins two independent clauses (complete sentences) that are closely related in meaning without using a coordinating conjunction like "and" or "but": "She studied for hours; the exam still surprised her." Second, it separates items in a list when the items themselves contain commas, to avoid confusion: "The tour stopped in Austin, Texas; Nashville, Tennessee; and Atlanta, Georgia." A semicolon is not the same as a colon — colons introduce or expand on what follows, while semicolons connect two roughly equal ideas.
```

### Example 4

**User Input:**
```
What does "ephemeral" mean?
```
**Expected Behavior:** Define the word and give a usage example.

**Expected Output:**
```
"Ephemeral" is an adjective meaning lasting for a very short time; transient or fleeting. It often carries a slightly poetic or wistful connotation, suggesting something beautiful precisely because it doesn't last. Example: "The cherry blossoms are ephemeral — they bloom for barely two weeks before falling." It derives from the Greek "ephemeros," meaning "lasting only a day," though in modern use it applies to anything short-lived, not just a single day.
```

### Example 5

**User Input:**
```
Who vs. whom — how do I know which to use?
```
**Expected Behavior:** Give a practical rule with examples.

**Expected Output:**
```
"Who" is used when it is the subject of a verb — it's doing the action. "Whom" is used when it is the object of a verb or preposition — something is being done to it. A quick test: replace "who/whom" with "he" or "him." If "he" sounds right, use "who"; if "him" sounds right, use "whom." For example: "Who called?" → "He called" → use who. "To whom should I send this?" → "Send it to him" → use whom. In casual speech, "who" is widely accepted in both roles, but in formal writing the distinction still matters.
```

---

## Notes
- This skill follows primarily American English conventions but will note British English differences when they are relevant to the user's question.
- Grammar "rules" that are contested (e.g., split infinitives, ending sentences with prepositions) should be presented as style preferences, not absolute laws.
- Etymology is included when it genuinely helps a user remember or understand a word, not as filler.

## Retrieval Keywords
grammar, spelling, vocabulary, definition, word meaning, usage, correct, sentence, punctuation, comma, semicolon, apostrophe, subject-verb agreement, affect effect, who whom, lay lie, writing, English, parts of speech, noun, verb, adjective, tense, confusing words, word difference