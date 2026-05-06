---
name: math-utilities
version: 1.0.0
description: >
  Solves arithmetic problems, calculates averages, and computes factorials.
  Triggered when users need to add, subtract, multiply, or divide numbers, find a mean, or solve a math equation.
triggers:
  - math
  - calculate
  - add
  - subtract
  - divide
  - multiply
  - mean
  - average
  - factorial
tags:
  - math
  - logic
  - calculator
execution:
  enabled: true
  runtime: python
  timeout_seconds: 5
  allow_network: false
  allow_filesystem: false
  memory_limit_mb: 64
  entrypoint: run
context:
  inject_before_llm: true
  output_label: "Calculation result"
author: bemi-core
created: 2026-05-06
updated: 2026-05-06
enabled: true
---

## Purpose

Performs fundamental mathematical operations with high precision. This skill handles arithmetic for single pairs or lists of numbers, computes the statistical mean (average), and solves factorials for non-negative integers.

## Parameters

The LLM should extract the following:

- `operation` (string, required) — "add", "subtract", "multiply", "divide", "mean", or "factorial"
- `values` (list of floats, required) — The numbers to be used in the calculation
- `n` (int, optional) — Used specifically for factorial operations

## Code
```python
import math

def run(operation: str, values: list = None, n: int = None) -> dict:
    if operation == "factorial":
        if n is None or n < 0:
            return {"error": "Factorial requires a non-negative integer 'n'."}
        return {"result": math.factorial(n)}
    
    if not values:
        return {"error": "No values provided for calculation."}

    if operation == "add":
        return {"result": sum(values)}
    elif operation == "subtract":
        res = values[0]
        for v in values[1:]:
            res -= v
        return {"result": res}
    elif operation == "multiply":
        res = 1
        for v in values:
            res *= v
        return {"result": res}
    elif operation == "divide":
        try:
            res = values[0]
            for v in values[1:]:
                res /= v
            return {"result": res}
        except ZeroDivisionError:
            return {"error": "Cannot divide by zero."}
    elif operation == "mean":
        return {"result": sum(values) / len(values)}
    
    return {"error": "Unsupported operation."}
```
## Response guidance
**For Math:** Always lead with the calculated number. Be precise but helpful (e.g., "The answer is 42"). If the result has many decimal places, round to two unless more are necessary for accuracy. For factorials, if the number is extremely large, use scientific notation.

## Examples
**User:** What is 15 plus 27?
**BEMI:** [runs code] 42 is the result of adding 15 and 27.

**User:** Subtract 50 from 125.
**BEMI:** [runs code] 75 is the result of 125 minus 50.

**User:** Multiply 12 by 8.
**BEMI:** [runs code] 96 is the result.

**User:** Divide 100 by 4.
**BEMI:** [runs code] 25 is the result of the division.

**User:** What is the average of 10, 20, 30, and 40?
**BEMI:** [runs code] 25 is the mean of those four values.

**User:** What is 5 factorial?
**BEMI:** [runs code] 120 is the factorial of 5 (5!).

**User:** Add up 1.5, 2.5, and 3.
**BEMI:** [runs code] 7.0 is the total.

**User:** What do I get if I multiply 0.5 by 10?
**BEMI:** [runs code] 5.0 is the result.

**User:** Calculate the mean of 5, 5, 10, 20.
**BEMI:** [runs code] 10.0 is the average.

**User:** What is 10 factorial?
**BEMI:** [runs code] 3,628,800 is the result of 10!.

**User:** Divide 1 by 3.
**BEMI:** [runs code] 0.33 is the result (rounded to two decimal places).

**User:** Subtract 10, 5, and 2 from 100.
**BEMI:** [runs code] 83 is the remaining value.

**User:** What is 9 times 9?
**BEMI:** [runs code] 81 is the result.

**User:** Solve 45 + 55.
**BEMI:** [runs code] 100 is the answer.

**User:** What is the average height if the kids are 120cm, 130cm, and 140cm?
**BEMI:** [runs code] 130.0 cm is the mean height.

**User:** What is 0 factorial?
**BEMI:** [runs code] 1 is the result of 0!.

**User:** Multiply 7, 3, and 2.
**BEMI:** [runs code] 42 is the product of these numbers.

**User:** What is 500 divided by 10?
**BEMI:** [runs code] 50 is the result.

**User:** Add 1234 and 5678.
**BEMI:** [runs code] 6,912 is the total.

**User:** What is the mean of 1 and 2?
**BEMI:** [runs code] 1.5 is the average.

**User:** Calculate 6 factorial.
**BEMI:** [runs code] 720 is the result.

**User:** Subtract 0.25 from 1.
**BEMI:** [runs code] 0.75 is the result.

**User:** Multiply 100 by 0.01.
**BEMI:** [runs code] 1.0 is the result.

**User:** Divide 250 by 5.
**BEMI:** [runs code] 50 is the result.

**User:** What is the sum of 10, 20, 30?
**BEMI:** [runs code] 60 is the total.

**User:** Find the average of 88, 92, and 95.
**BEMI:** [runs code] 91.67 is the mean.

**User:** What is 3 factorial?
**BEMI:** [runs code] 6 is the result of 3 x 2 x 1.

**User:** What is 15 multiplied by 15?
**BEMI:** [runs code] 225 is the result.

**User:** Subtract 1000 from 5000.
**BEMI:** [runs code] 4,000 is the result.

**User:** Add 0.1 and 0.2.
**BEMI:** [runs code] 0.3 is the total.

**User:** Divide 99 by 9.
**BEMI:** [runs code] 11 is the result.

**User:** What is the mean of 100 and 200?
**BEMI:** [runs code] 150.0 is the average.

**User:** What is 7 factorial?
**BEMI:** [runs code] 5,040 is the answer.

**User:** Multiply 1.1 by 10.
**BEMI:** [runs code] 11.0 is the result.

**User:** Subtract 5 from 5.
**BEMI:** [runs code] 0 is the result.

**User:** What is 8 divided by 2?
**BEMI:** [runs code] 4 is the result.

**User:** Sum these numbers: 10, 10, 10, 10, 10.
**BEMI:** [runs code] 50 is the total.

**User:** What is the average of 0 and 100?
**BEMI:** [runs code] 50.0 is the mean.

**User:** What is 4 factorial?
**BEMI:** [runs code] 24 is the result.

**User:** Multiply 25 by 4.
**BEMI:** [runs code] 100 is the result.

**User:** Subtract 15 from 10.
**BEMI:** [runs code] -5 is the result.

**User:** Divide 10 by 3.
**BEMI:** [runs code] 3.33 is the result.

**User:** What is the mean of 7, 8, 9?
**BEMI:** [runs code] 8.0 is the average.

**User:** Calculate 8 factorial.
**BEMI:** [runs code] 40,320 is the result.

**User:** Add 999 and 1.
**BEMI:** [runs code] 1,000 is the total.

**User:** Multiply 50 by 2.
**BEMI:** [runs code] 100 is the result.

**User:** Subtract 20 from 100.
**BEMI:** [runs code] 80 is the result.

**User:** Divide 144 by 12.
**BEMI:** [runs code] 12 is the result.

**User:** What is the mean of 12, 14, 16?
**BEMI:** [runs code] 14.0 is the average.

**User:** What is 1 factorial?
**BEMI:** [runs code] 1 is the result.