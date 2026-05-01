---
name: "date-utilities"
description: "Answers date and calendar questions: day of the week for any date, days remaining until a target date, and general date arithmetic (add/subtract days, weeks, or months)."
tags:
  - "calendar"
  - "dates"
  - "time"
version: "1.0.0"
author: "BEMI"
network_allowed: false
---

## Overview
This skill handles all date-related reasoning that doesn't require live calendar data. It can determine what day of the week a date falls on, count the number of days between two dates, and perform date arithmetic (adding or subtracting a number of days, weeks, or months from a given date). Use this skill when a user asks about scheduling, countdowns, or any question where the answer is derivable from a date alone — no internet access needed.

## Capabilities
- Return the day of the week for any valid calendar date (past or future)
- Calculate the number of days from today (or any start date) until a target date
- Add or subtract days, weeks, or months from a base date
- Determine if a year is a leap year
- Find the date of a specific weekday occurrence in a month (e.g., "third Thursday of November")

### Inputs
- `operation` (string): one of `day_of_week`, `days_until`, `date_add`, `date_subtract`, `is_leap_year`, `nth_weekday`
- `date` (string): base date in `YYYY-MM-DD` format
- `target_date` (string, optional): second date for `days_until`
- `delta` (dict, optional): `{"days": int, "weeks": int, "months": int}` for arithmetic operations
- `year` (int, optional): for `is_leap_year`
- `n`, `weekday`, `month` (optional): for `nth_weekday`

### Outputs
- A computed date string (`YYYY-MM-DD`) or integer count, plus a natural-language description

---

## Instructions

### When to Use
- If the user asks "what day of the week is [date]?"
- When the user wants to know how many days until a holiday, birthday, or deadline
- If the user asks "what date is 90 days from now?" or similar arithmetic
- When the task involves scheduling logic based purely on the calendar

### How to Respond
1. Identify the operation from the user's question.
2. Parse any dates mentioned; if "today" is referenced, use the system's current date.
3. Execute the appropriate function below.
4. Deliver the answer in one sentence, with the full date spelled out for clarity (e.g., "Wednesday, March 12, 2025").

### Constraints
- All date inputs must be valid Gregorian calendar dates; reject invalid dates with a clear message.
- "Days until" results should be negative if the target date is in the past, with a note that the date has already passed.
- Month arithmetic should clamp to the last valid day (e.g., Jan 31 + 1 month = Feb 28/29).

---

## Execution

### Inline Function

```python
def execute(input_data):
    """
    input_data: dict with 'operation' and relevant date/delta fields.
    Uses only Python standard library (datetime, calendar).
    """
    from datetime import date, timedelta
    import calendar

    op = input_data.get("operation", "")

    def parse(d):
        return date.fromisoformat(d) if d else date.today()

    if op == "day_of_week":
        d = parse(input_data.get("date"))
        name = d.strftime("%A")
        return {"result": name,
                "description": f"{d.strftime('%B %-d, %Y')} is a {name}."}

    elif op == "days_until":
        start = parse(input_data.get("date"))
        end = parse(input_data.get("target_date"))
        delta = (end - start).days
        direction = "away" if delta >= 0 else "ago"
        return {"result": abs(delta),
                "description": f"There are {abs(delta)} days {direction} ({end.strftime('%B %-d, %Y')})."}

    elif op in ("date_add", "date_subtract"):
        base = parse(input_data.get("date"))
        delta_cfg = input_data.get("delta", {})
        days = delta_cfg.get("days", 0) + delta_cfg.get("weeks", 0) * 7
        # Month arithmetic
        months = delta_cfg.get("months", 0)
        sign = 1 if op == "date_add" else -1
        # Apply months
        m = base.month + sign * months
        y = base.year + (m - 1) // 12
        m = (m - 1) % 12 + 1
        max_day = calendar.monthrange(y, m)[1]
        result = base.replace(year=y, month=m, day=min(base.day, max_day))
        # Apply days
        result += timedelta(days=sign * days)
        op_label = "added to" if op == "date_add" else "subtracted from"
        return {"result": result.isoformat(),
                "description": f"Result: {result.strftime('%A, %B %-d, %Y')}."}

    elif op == "is_leap_year":
        y = input_data.get("year", date.today().year)
        leap = calendar.isleap(y)
        return {"result": leap,
                "description": f"{y} {'is' if leap else 'is not'} a leap year."}

    elif op == "nth_weekday":
        # e.g., 3rd Thursday of November 2025
        n = input_data.get("n", 1)
        weekday = input_data.get("weekday", 0)  # Monday=0 … Sunday=6
        month = input_data.get("month", date.today().month)
        year = input_data.get("year", date.today().year)
        count = 0
        for day in range(1, calendar.monthrange(year, month)[1] + 1):
            if date(year, month, day).weekday() == weekday:
                count += 1
                if count == n:
                    result = date(year, month, day)
                    return {"result": result.isoformat(),
                            "description": f"The {n} occurrence falls on {result.strftime('%A, %B %-d, %Y')}."}
        return {"result": None, "description": "That occurrence does not exist in the given month."}

    else:
        return {"result": None, "description": f"Unknown operation '{op}'."}
```

---

## Examples

### Example 1

**User Input:**
```
What day of the week is July 4, 2026?
```
**Expected Behavior:** operation=`day_of_week`, date=`2026-07-04`.

**Expected Output:**
```
July 4, 2026 is a Saturday.
```

### Example 2

**User Input:**
```
How many days until Christmas?
```
**Expected Behavior:** operation=`days_until`, start=today, target=`2025-12-25`.

**Expected Output:**
```
There are 116 days away (December 25, 2025).
```

### Example 3

**User Input:**
```
What date is 90 days from today?
```
**Expected Behavior:** operation=`date_add`, base=today, delta=`{"days": 90}`.

**Expected Output:**
```
Result: Sunday, November 30, 2025.
```

### Example 4

**User Input:**
```
Is 2024 a leap year?
```
**Expected Behavior:** operation=`is_leap_year`, year=2024.

**Expected Output:**
```
2024 is a leap year.
```

### Example 5

**User Input:**
```
When is the third Thursday of November 2025?
```
**Expected Behavior:** operation=`nth_weekday`, n=3, weekday=3, month=11, year=2025.

**Expected Output:**
```
The 3rd occurrence falls on Thursday, November 20, 2025.
```

---

## Notes
- When the user says "today" or "now", resolve to the system date at query time.
- Weekday indexing: Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5, Sunday=6.
- For `date_subtract` with months, the result clamps to the last valid day of the resulting month to avoid invalid dates.

## Retrieval Keywords
day of week, days until, date arithmetic, calendar, countdown, how many days, what day is, date calculation, add days, subtract days, leap year, schedule, deadline, months from now, weeks until