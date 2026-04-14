---
name: "text-summarizer"
description: "Summarizes long text into concise bullet points"
tags:
  - "nlp"
  - "summarization"
  - "text-processing"
version: "1.0.0"
author: "BEMI Team"
network_allowed: false
---

## Overview
This skill condenses long pieces of text into short, easy-to-read summaries. It is useful for articles, reports, and notes where only the key ideas are needed.

## Capabilities
This skill can summarize long pieces of text into concise bullet points, making it easy for users to quickly grasp the main ideas.

### Inputs
- Long-form text (articles, paragraphs, reports)

### Outputs
- Bullet-point summary
- Key ideas extracted from the text

## Instructions

### When to Use
- If the user asks to summarize a document
- When the user provides long text and wants a shorter version
- If the task involves extracting key points

### How to Respond
Provide a concise summary using bullet points. Limit to 3–7 key points and avoid unnecessary details.

### Constraints
- Do not add new information
- Preserve original meaning

## Examples

### Example 1
**User Input:**
```
Summarize this article about climate change...
```

**Expected Behavior:**
Extract key ideas and condense the content.

**Expected Output:**
```
* Climate change is driven by human activity
* Global temperatures are rising
* Ecosystems are being affected
* Immediate action is needed
```

## Retrieval Keywords
summary, summarize, condense text, key points
