---
name: "math-utilities"
description: "Performs basic math operations including add, subtract, multiply, divide, mean, and factorial"
tags:
  - "math"
  - "utility"
  - "calculation"
version: "1.0.0"
author: "BEMI Core"
network_allowed: false
---

## Overview
This skill handles common arithmetic operations and simple statistical calculations. It is useful for quick computations without needing advanced math tools.

## Capabilities
This skill can perform basic arithmetic operations and simple statistical calculations. It can evaluate numeric expressions, calculate the mean of a list of numbers, and compute the factorial of a number.

### Inputs
- Numbers or numeric expressions
- Lists of numbers (for mean)

### Outputs
- Numeric result

## Instructions

### When to Use
- If the user asks to calculate a value
- When the input involves arithmetic operations
- If the task involves factorial or averages

### How to Respond
Return only the final result unless explanation is requested.

### Constraints
- Handle invalid input gracefully

## Execution

### Inline Function
```python
def execute(data):
    try:
        if isinstance(data, str):
            return eval(data)
        if isinstance(data, dict):
            if data["op"] == "mean":
                return sum(data["values"]) / len(data["values"])
            if data["op"] == "factorial":
                n = data["value"]
                result = 1
                for i in range(1, n+1):
                    result *= i
                return result
    except Exception:
        return "Invalid input"
```

## Examples

### Example 1

**User Input:**

```
2 + 3 * 4
```
**Expected Output:**

```
14
```

### Example 2

**User Input:**

```
{"op":"mean","value":[1,2,3,4,5]}
```

**Expected Output:**

```
3.0
```

### Example 3

**User Input:**

```
{"op":"factorial","value":5}
```

**Expected Output:**

```
120
```

## Retrieval Keywords
convert, units, temperature, distance, weight
