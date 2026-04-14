---
name: "<REQUIRED: Unique skill name>"
description: "<REQUIRED: Clear, concise description of what the skill does>"
tags:
  - "<REQUIRED: primary category>"
  - "<REQUIRED: secondary category>"
  - "<OPTIONAL: additional tags>"
version: "1.0.0"
author: "<OPTIONAL: author name>"
network_allowed: false
---

## Overview
\<Prose: High-level explanation of the skill. This section is used for retrieval and semantic matching. Clearly explain what the skill does, when it should be used, and what problems it solves.>

## Capabilities
\<Prose: Describe what the skill can do in bullet or paragraph form. Focus on user-facing outcomes.>

### Inputs
\<Prose or structured list describing expected inputs, parameters, or user-provided data.>

### Outputs
\<Prose or structured list describing what the skill returns or produces.>

---

## Instructions

### When to Use
\<Instructional prose. MUST begin with a trigger phrase such as:>
- If the user asks about...
- When the user requests...
- If the task involves...

### How to Respond
\<Instructional prose describing how BEMI should behave, respond, or structure outputs.>

### Constraints
\<Optional: Rules, limitations, or boundaries the skill must follow.>

---

## Execution

### Inline Function
```python
def execute(input_data):
    """
    REQUIRED: First function in the block is the callable entry point.
    Must be self-contained (no external imports beyond standard library).
    """
    # Implementation here
    return result
```

### External Script Reference
\<Optional: alternative to inline code. Use this format strictly:> scripts/<filename>.py → <function_name>

---

## Examples

### Example 1

**User Input:**

```
<Example user query>
```

**Expected Behavior:** \<Describe what the skill should do>

**Expected Output:**

```
<Example output>
```

### Example 2

\<Repeat structure as needed>

---

## Notes

\<Optional: Additional implementation notes, edge cases, or clarifications for developers.>

## Retrieval Keywords

\<Optional: Extra keywords or phrases to improve embedding-based retrieval.>
