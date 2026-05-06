---
name: date-utilities
version: 1.0.0
description: >
  Find out what day of the week a date falls on, count days between dates, or calculate a future/past date. 
  Triggered when users ask things like "What day is October 12th?", "How many days until Christmas?", or "What is 45 days from today?".

triggers:
  - day of the week
  - days until
  - countdown
  - date arithmetic
  - add days
  - subtract weeks
  - how many days between
tags:
  - calendar
  - time
  - math

execution:
  enabled: true
  runtime: python
  timeout_seconds: 5
  allow_network: false
  allow_filesystem: false
  memory_limit_mb: 32
  entrypoint: run

context:
  inject_before_llm: true
  output_label: "Calculated Date Information"

author: bemi-dev
created: 2026-05-06
updated: 2026-05-06
enabled: true
---

## Purpose

Handles logic-based date calculations to ensure BEMI provides mathematically accurate calendar information. This skill prevents LLM "hallucinations" regarding day-of-the-week alignment and month-length discrepancies (like leap years).

## Parameters

The LLM must parse the date(s) and the requested operation from the user's query:

- `operation` (string) — "weekday", "diff", or "arithmetic"
- `start_date` (string) — ISO format (YYYY-MM-DD)
- `end_date` (string, optional) — ISO format for "diff" operations
- `amount` (int, optional) — number of units to add/subtract
- `unit` (string, optional) — "days", "weeks", or "months"

## Code
```python
from datetime import datetime, timedelta

def run(operation: str, start_date: str, end_date: str = None, amount: int = 0, unit: str = "days") -> dict:
    try:
        dt1 = datetime.strptime(start_date, "%Y-%m-%d")
        
        if operation == "weekday":
            return {
                "date": start_date,
                "day_of_week": dt1.strftime("%A")
            }
            
        if operation == "diff" and end_date:
            dt2 = datetime.strptime(end_date, "%Y-%m-%d")
            delta = abs((dt2 - dt1).days)
            return {"days_difference": delta}
            
        if operation == "arithmetic":
            if unit == "days":
                res = dt1 + timedelta(days=amount)
            elif unit == "weeks":
                res = dt1 + timedelta(weeks=amount)
            elif unit == "months":
                # Rough approximation: 30 days per month for logic
                res = dt1 + timedelta(days=amount * 30)
                
            return {
                "original_date": start_date,
                "new_date": res.strftime("%Y-%m-%d"),
                "new_day_of_week": res.strftime("%A")
            }
            
    except Exception as e:
        return {"error": str(e)}
```

## Response guidance

1. **Be Specific:** Always state the full date and the day of the week in the final answer.
2. **Contextualize:** For "days until" questions, mention if the event is coming up soon (e.g., "That's only 3 days away!").
3. **Handle Leap Years:** The code uses Python's `datetime`, so it handles February 29th correctly. If a user asks about a leap year, confirm that the system has accounted for it.

## Examples

**User:** What day of the week was July 4th, 1776?
**BEMI:** [runs code] July 4th, 1776, was a Thursday.

**User:** How many days until New Year's Day?
**BEMI:** [runs code] There are 239 days remaining until January 1st, 2027.

**User:** What will the date be 12 weeks from today?
**BEMI:** [runs code] 12 weeks from today (Wednesday, May 6, 2026) will be Wednesday, July 29, 2026.