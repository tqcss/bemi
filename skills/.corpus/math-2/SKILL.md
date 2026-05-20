---
name: "basic-calculator"
description: "Performs simple arithmetic calculations"
tags:
  - "math"
  - "utility"
  - "calculation"
version: "1.0.0"
author: "BEMI Team"
network_allowed: false
---

## Overview
This skill evaluates basic arithmetic expressions such as addition, subtraction, multiplication, and division.

## Capabilities
This skill can evaluate basic arithmetic expressions and return the numeric result.

### Inputs
- Mathematical expressions (e.g., 2 + 2, 10 / 5)

### Outputs
- Numeric result

## Instructions

### When to Use
- If the user asks to calculate something
- When the input is a simple math expression
- If the task involves arithmetic operations

### How to Respond
Return only the final numeric result.

### Constraints
- Do not include explanation unless asked
- Handle invalid input gracefully

## Execution

### Inline Function
```python
def execute(expression):
    try:
        return eval(expression)
    except Exception:
        return "Invalid expression"
```

## Examples

### Example 1

**User Input:**

```
5 * 3
```

**Expected Output:**

```
15
```

## Retrieval Keywords

calculate, math, arithmetic, compute