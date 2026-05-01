---
name: "math-utilities"
description: "Performs common mathematical operations including addition, subtraction, multiplication, division, mean calculation, and factorial computation."
tags:
  - "math"
  - "arithmetic"
  - "utilities"
version: "1.0.0"
author: "BEMI"
network_allowed: false
---

## Overview
This skill handles everyday mathematical computations. It covers the six foundational operations most frequently requested by users: addition, subtraction, multiplication, division, arithmetic mean, and factorial. Each operation is self-contained and returns a clearly formatted numeric result. Use this skill whenever a user provides numbers and asks for a calculation — whether phrased casually ("what's 18 times 4?") or formally ("compute the factorial of 7").

## Capabilities
- Add two or more numbers together
- Subtract one number from another
- Multiply two or more numbers
- Divide a numerator by a denominator (with zero-division protection)
- Compute the arithmetic mean of a list of numbers
- Compute the factorial of a non-negative integer

### Inputs
- One or more numeric values (integers or floats)
- The name of the desired operation (add, subtract, multiply, divide, mean, factorial)

### Outputs
- A single numeric result
- A brief natural-language sentence describing the computation performed

---

## Instructions

### When to Use
- If the user asks to add, sum, subtract, multiply, divide, or average numbers
- If the user requests a factorial of any whole number
- When the user provides a list of numbers and wants a computed result
- If the task involves a simple arithmetic expression that does not require a full calculator interface

### How to Respond
1. Identify the operation from the user's phrasing.
2. Extract all numeric operands.
3. Execute the appropriate inline function.
4. Return the result in a single sentence, e.g. "The sum of 12 and 7 is **19**."

### Constraints
- Division by zero must return a clear error message, not an exception traceback.
- Factorial is only defined for non-negative integers; reject floats and negatives with an explanation.
- Do not use external math libraries; rely on Python's standard library only.

---

## Execution

### Inline Function

```python
def execute(input_data):
    """
    input_data: dict with keys 'operation' (str) and 'operands' (list of numbers)
    Supported operations: add, subtract, multiply, divide, mean, factorial
    """
    import math

    op = input_data.get("operation", "").lower().strip()
    operands = input_data.get("operands", [])

    if op == "add":
        result = sum(operands)
        return {"result": result, "description": f"The sum is {result}."}

    elif op == "subtract":
        result = operands[0] - sum(operands[1:])
        return {"result": result, "description": f"The difference is {result}."}

    elif op == "multiply":
        result = 1
        for n in operands:
            result *= n
        return {"result": result, "description": f"The product is {result}."}

    elif op == "divide":
        if operands[1] == 0:
            return {"result": None, "description": "Error: division by zero is undefined."}
        result = operands[0] / operands[1]
        return {"result": result, "description": f"The quotient is {result:.4f}."}

    elif op == "mean":
        result = sum(operands) / len(operands)
        return {"result": result, "description": f"The mean is {result:.4f}."}

    elif op == "factorial":
        n = operands[0]
        if not isinstance(n, int) or n < 0:
            return {"result": None, "description": "Error: factorial requires a non-negative integer."}
        result = math.factorial(n)
        return {"result": result, "description": f"The factorial of {n} is {result}."}

    else:
        return {"result": None, "description": f"Unknown operation '{op}'."}
```

---

## Examples

### Example 1

**User Input:**
```
What is 15 plus 27 plus 8?
```
**Expected Behavior:** Identify operation as "add", operands as [15, 27, 8], call execute.

**Expected Output:**
```
The sum is 50.
```

### Example 2

**User Input:**
```
Divide 144 by 12
```
**Expected Behavior:** Identify operation as "divide", operands as [144, 12].

**Expected Output:**
```
The quotient is 12.0000.
```

### Example 3

**User Input:**
```
What is the factorial of 7?
```
**Expected Behavior:** Identify operation as "factorial", operands as [7].

**Expected Output:**
```
The factorial of 7 is 5040.
```

### Example 4

**User Input:**
```
Find the mean of 4, 8, 15, 16, 23, 42
```
**Expected Behavior:** Identify operation as "mean", operands as [4, 8, 15, 16, 23, 42].

**Expected Output:**
```
The mean is 18.0000.
```

---

## Notes
- For "subtract", the first operand is the minuend; all subsequent operands are subtracted from it.
- Float division is always used for divide; use integer-check separately if exact integer division is needed.
- Factorial values grow very quickly; warn the user if n > 1000 as output may be extremely large.

## Retrieval Keywords
arithmetic, calculate, sum, difference, product, quotient, average, mean, factorial, multiply, divide, add, subtract, compute, numbers, math operations