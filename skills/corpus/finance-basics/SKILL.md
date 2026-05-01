---
name: "finance-basics"
description: "Computes simple interest, compound interest, percentage calculations (increase, decrease, of a value), loan payment estimates, and basic return on investment — using inline Python functions."
tags:
  - "finance"
  - "math"
  - "money"
  - "percentages"
version: "1.0.0"
author: "BEMI"
network_allowed: false
---

## Overview
This skill handles the most common everyday financial calculations that don't require market data or live prices. It covers simple and compound interest, percentage operations (finding X% of a value, calculating a percentage increase or decrease, working out what percentage one number is of another), basic loan payment estimation, and return on investment (ROI). All functions use only Python's standard library and are deterministic — given the same inputs, they always return the same output. Use this skill when a user wants to quickly crunch a personal finance number without opening a spreadsheet.

## Capabilities
- Calculate simple interest: I = P × r × t
- Calculate compound interest and final balance
- Find a percentage of a number (e.g., 15% of 240)
- Compute percentage change between two values
- Determine what percentage one number is of another
- Estimate fixed monthly loan payments using the standard amortization formula
- Calculate return on investment (ROI) as a percentage

### Inputs
Operation-specific numeric arguments as described in each function's docstring. All monetary values should be in the same currency; the skill does not perform currency conversion.

### Outputs
- A rounded numeric result (2 decimal places for money, 4 for rates)
- A natural-language description sentence ready for direct delivery to the user

---

## Instructions

### When to Use
- If the user asks "how much interest will I earn on $5,000 at 4% for 3 years?"
- When the user wants to know what percentage discount something represents
- If the task involves computing a percentage of a price (tips, taxes, discounts)
- When the user asks about monthly payments on a loan
- If the user wants to calculate ROI on an investment
- When the user asks "what is X% of Y?"

### How to Respond
1. Identify the financial operation from the user's question.
2. Extract the relevant numeric parameters.
3. Call the appropriate inline function.
4. Return the result as a clearly formatted sentence, including all relevant output figures (e.g., interest earned AND final balance for interest problems).
5. If the user's question is ambiguous between simple and compound interest, default to simple and clarify the assumption.

### Constraints
- Never provide investment advice or recommend financial products.
- For loan calculations, note that the result is an estimate — actual payments may differ based on fees and lender terms.
- Interest rates must be expressed as annualized percentages; clarify if the user's input seems to be in monthly or daily terms.
- Negative loan terms or rates should return an error message rather than a nonsensical result.

---

## Execution

### Inline Function

```python
def execute(input_data):
    """
    input_data: dict with 'operation' (str) and operation-specific numeric fields.
    Supported operations:
      simple_interest      — principal, rate (%), time (years)
      compound_interest    — principal, rate (%), time (years), n (compounds/year)
      percentage_of        — percent, value
      percentage_change    — old_value, new_value
      percentage_of_total  — part, whole
      loan_payment         — principal, annual_rate (%), years
      roi                  — gain, cost
    """
    op = input_data.get("operation", "").lower().strip()

    def fmt(n):
        return round(n, 2)

    # ── Simple Interest ───────────────────────────────────────────
    if op == "simple_interest":
        P = input_data["principal"]
        r = input_data["rate"] / 100
        t = input_data["time"]
        I = P * r * t
        total = P + I
        return {
            "interest": fmt(I),
            "total": fmt(total),
            "description": (
                f"Simple interest on ${P:,.2f} at {input_data['rate']}% "
                f"for {t} year(s): interest = ${fmt(I):,.2f}, "
                f"total balance = ${fmt(total):,.2f}."
            )
        }

    # ── Compound Interest ─────────────────────────────────────────
    elif op == "compound_interest":
        P = input_data["principal"]
        r = input_data["rate"] / 100
        t = input_data["time"]
        n = input_data.get("n", 12)  # default: monthly compounding
        A = P * (1 + r / n) ** (n * t)
        I = A - P
        return {
            "interest": fmt(I),
            "total": fmt(A),
            "description": (
                f"Compound interest on ${P:,.2f} at {input_data['rate']}% "
                f"for {t} year(s) (compounded {n}×/year): "
                f"interest earned = ${fmt(I):,.2f}, "
                f"final balance = ${fmt(A):,.2f}."
            )
        }

    # ── Percentage Of ─────────────────────────────────────────────
    elif op == "percentage_of":
        pct = input_data["percent"]
        val = input_data["value"]
        result = val * pct / 100
        return {
            "result": fmt(result),
            "description": f"{pct}% of {val} = {fmt(result)}."
        }

    # ── Percentage Change ─────────────────────────────────────────
    elif op == "percentage_change":
        old = input_data["old_value"]
        new = input_data["new_value"]
        if old == 0:
            return {"result": None, "description": "Cannot compute percentage change from zero."}
        change = (new - old) / abs(old) * 100
        direction = "increase" if change >= 0 else "decrease"
        return {
            "result": round(change, 4),
            "description": (
                f"From {old} to {new} is a {abs(round(change, 2))}% {direction}."
            )
        }

    # ── Percentage of Total ───────────────────────────────────────
    elif op == "percentage_of_total":
        part = input_data["part"]
        whole = input_data["whole"]
        if whole == 0:
            return {"result": None, "description": "Cannot divide by zero."}
        result = part / whole * 100
        return {
            "result": round(result, 4),
            "description": f"{part} is {round(result, 2)}% of {whole}."
        }

    # ── Monthly Loan Payment (amortization) ───────────────────────
    elif op == "loan_payment":
        P = input_data["principal"]
        annual_rate = input_data["annual_rate"] / 100
        years = input_data["years"]
        n = years * 12
        r = annual_rate / 12
        if r == 0:
            payment = P / n
        else:
            payment = P * r * (1 + r) ** n / ((1 + r) ** n - 1)
        total_paid = payment * n
        total_interest = total_paid - P
        return {
            "monthly_payment": fmt(payment),
            "total_interest": fmt(total_interest),
            "description": (
                f"Monthly payment on a ${P:,.2f} loan at {input_data['annual_rate']}% "
                f"over {years} years: ${fmt(payment):,.2f}/month. "
                f"Total interest paid: ${fmt(total_interest):,.2f}."
            )
        }

    # ── Return on Investment ──────────────────────────────────────
    elif op == "roi":
        gain = input_data["gain"]
        cost = input_data["cost"]
        if cost == 0:
            return {"result": None, "description": "Cannot compute ROI with zero cost."}
        roi = (gain - cost) / cost * 100
        return {
            "result": round(roi, 4),
            "description": (
                f"ROI: ({gain} − {cost}) ÷ {cost} × 100 = {round(roi, 2)}%."
            )
        }

    else:
        return {"result": None, "description": f"Unknown operation '{op}'."}
```

---

## Examples

### Example 1

**User Input:**
```
How much simple interest will I earn on $10,000 at 5% per year for 3 years?
```
**Expected Behavior:** operation=`simple_interest`, principal=10000, rate=5, time=3.

**Expected Output:**
```
Simple interest on $10,000.00 at 5% for 3 year(s): interest = $1,500.00, total balance = $11,500.00.
```

### Example 2

**User Input:**
```
What is 18% of 250?
```
**Expected Behavior:** operation=`percentage_of`, percent=18, value=250.

**Expected Output:**
```
18% of 250 = 45.0.
```

### Example 3

**User Input:**
```
A jacket was $120 and is now $85. What percentage discount is that?
```
**Expected Behavior:** operation=`percentage_change`, old_value=120, new_value=85.

**Expected Output:**
```
From 120 to 85 is a 29.17% decrease.
```

### Example 4

**User Input:**
```
What would my monthly payment be on a $25,000 car loan at 6% over 5 years?
```
**Expected Behavior:** operation=`loan_payment`, principal=25000, annual_rate=6, years=5.

**Expected Output:**
```
Monthly payment on a $25,000.00 loan at 6% over 5 years: $483.32/month. Total interest paid: $3,998.81.
```

### Example 5

**User Input:**
```
I bought stock for $4,000 and sold it for $5,500. What's my ROI?
```
**Expected Behavior:** operation=`roi`, gain=5500, cost=4000.

**Expected Output:**
```
ROI: (5500 − 4000) ÷ 4000 × 100 = 37.5%.
```

### Example 6

**User Input:**
```
If I invest $8,000 at 7% compounded monthly for 10 years, what's the final amount?
```
**Expected Behavior:** operation=`compound_interest`, principal=8000, rate=7, time=10, n=12.

**Expected Output:**
```
Compound interest on $8,000.00 at 7% for 10 year(s) (compounded 12×/year): interest earned = $8,609.81, final balance = $16,609.81.
```

---

## Notes
- This skill does not account for taxes, inflation, fees, or varying interest rates — it computes idealized mathematical results only.
- Loan payment results are based on fixed-rate amortization; ARMs and interest-only loans require different formulas.
- When a user's question is ambiguous (e.g., "what's the interest on this?"), ask whether they mean simple or compound interest before computing.

## Retrieval Keywords
interest, simple interest, compound interest, percentage, percent of, percentage change, discount, increase, decrease, loan, monthly payment, amortization, ROI, return on investment, finance, money, savings, investment, tip calculation, tax calculation