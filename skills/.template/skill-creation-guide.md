# BEMI Skill Writing Guide
-A simple guide for creating your own SKILL.md file (no coding required)-

## What is a Skill?

A -skill- is a small, focused capability that BEMI can use to help answer user requests.

Think of it like:
- A mini-expert on a specific topic
- A reusable instruction set
- A tool with optional built-in logic

Examples:
- Summarizing documents
- Formatting data into tables
- Explaining concepts step-by-step
- Running a small calculation

## Structure of a Skill File

Every skill follows the same structure:

1. -Metadata (top section)- → basic information about the skill  
2. -Content sections- → explanation + capabilities  
3. -Instructions- → when and how the skill should be used  
4. -Execution (optional)- → code or script reference  
5. -Examples- → sample inputs and outputs  

You don’t need to memorize everything—just follow the template.

## 1. Metadata (Required)

This is the top section of your file. It must be written in this exact format:

```yaml
---
name: "your-skill-name"
description: "What this skill does in one sentence"
tags:
  - "category"
  - "use-case"
version: "1.0.0"
author: "Your Name"
network_allowed: false
---
```

### Tips:

- -Name- → short and unique (e.g., `text-summarizer`)
- -Description- → clear and specific
- -Tags- → think of keywords people might search

## 2. Overview (Explain the Skill)

Write a short explanation of:

- What the skill does
- When it should be used
- What problem it solves

Example:

> This skill summarizes long pieces of text into shorter, easy-to-read summaries. It is useful when users provide articles, reports, or notes.

## 3. Capabilities (What It Can Do)

Describe what the skill can handle.

### Inputs

What does the user provide?

- Text
- Numbers
- Questions
- Files (describe them)

### Outputs

What will the user get?

- Summary
- Table
- Explanation
- Recommendation

## 4. Instructions (MOST IMPORTANT)

This is where you tell BEMI -when to use the skill and how to behave-.

### When to Use

Start with phrases like:

- “If the user asks about…”
- “When the user requests…”
- “If the task involves…”

Example:

- If the user asks to summarize a document
- When the user provides a long paragraph and wants a shorter version

### How to Respond

Explain how the answer should look:

- Short or detailed?
- Bullet points or paragraph?
- Formal or casual?

Example:

> Provide a concise summary using bullet points. Keep it under 5 sentences.

### Constraints (Optional)

Add rules if needed:

- Do not include opinions
- Keep answers under 100 words
- Only use provided data

## 5. Examples (VERY HELPFUL)

Examples make your skill easier to understand and test.

### Example Format

-User Input:-

```
Summarize this article about climate change...
```

-Expected Behavior:-

> The skill identifies key points and removes unnecessary details.

-Expected Output:-

```
- Climate change is accelerating due to human activity
- Rising temperatures affect ecosystems
- Immediate action is required
```

Tip: Add at least 1–2 examples.

## 6. Execution (Optional)

You only need this if your skill performs a calculation or logic.

### Option A: Simple Function (inline)

```python
def execute(input_data):
    return "result"
```

### Option B: External Script

```
scripts/my_script.py → run_function
```

If you’re not a developer, you can skip this section.

## 7. Notes (Optional)

Use this for:

- Edge cases
- Special reminders
- Extra explanation

## 8. Retrieval Keywords (Optional)

Add extra keywords that help BEMI find your skill.

Example:

```
summary, summarize text, condense, shorten text
```

## Checklist Before You Finish

Make sure your skill:

- Has a name, description, and tags
- Clearly explains what it does
- Includes “When to Use” instructions
- Has at least one example
- Is easy to read and understand

## Tips for Writing Great Skills

### Keep It Focused

One skill = one job
- Too broad: “Handles all text processing”
- Better: “Summarizes long text”

### Be Clear, Not Technical

Write like you're explaining to a teammate, not a computer.

### Use Real Examples

Examples make your skill much easier to use and debug.

### Think Like a User

Ask yourself:

> “What would someone type to trigger this skill?”

## Final Note

You don’t need to be a programmer to write a skill.

If you can:

- Clearly explain something
- Give examples
- Describe when it should be used

You can create a useful BEMI skill.
