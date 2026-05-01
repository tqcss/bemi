---
name: "unit-conversion"
description: "Converts values between units of temperature (Celsius, Fahrenheit, Kelvin), distance (km, miles, meters, feet, inches), and weight (kg, lbs, grams, ounces)."
tags:
  - "conversion"
  - "units"
  - "measurement"
version: "1.0.0"
author: "BEMI"
network_allowed: false
---

## Overview
This skill converts numeric values between common measurement units across three domains: temperature, distance, and weight. It requires no external dependencies and works entirely from well-known conversion formulas. Use it whenever a user provides a value in one unit and asks for the equivalent in another — whether for travel, cooking, science, or everyday comparison. The skill handles the most commonly confused conversions (e.g., miles vs. kilometers, pounds vs. kilograms, Fahrenheit vs. Celsius) and returns results rounded to a sensible number of decimal places.

## Capabilities
- Temperature: Celsius ↔ Fahrenheit ↔ Kelvin (all six directional pairs)
- Distance: kilometers ↔ miles ↔ meters ↔ feet ↔ inches ↔ centimeters
- Weight: kilograms ↔ pounds ↔ grams ↔ ounces ↔ metric tons

### Inputs
- `value` (float): the numeric quantity to convert
- `from_unit` (string): source unit abbreviation or full name (case-insensitive)
- `to_unit` (string): target unit abbreviation or full name (case-insensitive)

### Outputs
- `result` (float): converted value rounded to 4 decimal places
- `description` (string): formatted sentence, e.g. "100 km = 62.1371 miles"

---

## Instructions

### When to Use
- If the user asks "how many miles is 5 km?"
- When the user wants to convert a temperature (e.g., "what is 98.6°F in Celsius?")
- If the user asks about weight equivalents (e.g., "convert 70 kg to pounds")
- When the task involves any measurement that needs to be expressed in a different unit system

### How to Respond
1. Extract `value`, `from_unit`, and `to_unit` from the user's message.
2. Normalize unit strings (strip whitespace, lowercase, resolve aliases like "°C" → "celsius").
3. Execute the appropriate conversion function.
4. Return the result formatted as: `{value} {from_unit} = {result} {to_unit}`.
5. If units are incompatible (e.g., km to kg), return a friendly error.

### Constraints
- Temperature conversions use exact formulas; do not approximate.
- Distance and weight conversions use precise SI-based factors.
- Kelvin values below 0 are physically invalid; reject with an explanation.
- Do not perform multi-hop conversions that mix domains (e.g., "convert 5 kg to miles").

---

## Execution

### Inline Function

```python
def execute(input_data):
    """
    input_data: dict with 'value' (float), 'from_unit' (str), 'to_unit' (str)
    Returns dict with 'result' (float) and 'description' (str).
    """
    value = float(input_data["value"])
    from_u = input_data["from_unit"].lower().strip().replace("°", "").replace(" ", "")
    to_u = input_data["to_unit"].lower().strip().replace("°", "").replace(" ", "")

    # ── Temperature ──────────────────────────────────────────────
    TEMP = {"celsius", "c", "fahrenheit", "f", "kelvin", "k"}

    def to_celsius(v, u):
        if u in ("celsius", "c"): return v
        if u in ("fahrenheit", "f"): return (v - 32) * 5 / 9
        if u in ("kelvin", "k"): return v - 273.15
        raise ValueError(f"Unknown temp unit: {u}")

    def from_celsius(v, u):
        if u in ("celsius", "c"): return v
        if u in ("fahrenheit", "f"): return v * 9 / 5 + 32
        if u in ("kelvin", "k"): return v + 273.15
        raise ValueError(f"Unknown temp unit: {u}")

    if from_u in TEMP and to_u in TEMP:
        result = from_celsius(to_celsius(value, from_u), to_u)
        result = round(result, 4)
        return {"result": result, "description": f"{value} {from_u} = {result} {to_u}"}

    # ── Distance (base: meters) ───────────────────────────────────
    DIST_TO_M = {
        "m": 1, "meter": 1, "meters": 1,
        "km": 1000, "kilometer": 1000, "kilometers": 1000,
        "cm": 0.01, "centimeter": 0.01, "centimeters": 0.01,
        "mm": 0.001, "millimeter": 0.001,
        "mi": 1609.344, "mile": 1609.344, "miles": 1609.344,
        "ft": 0.3048, "foot": 0.3048, "feet": 0.3048,
        "in": 0.0254, "inch": 0.0254, "inches": 0.0254,
        "yd": 0.9144, "yard": 0.9144, "yards": 0.9144,
    }

    if from_u in DIST_TO_M and to_u in DIST_TO_M:
        meters = value * DIST_TO_M[from_u]
        result = round(meters / DIST_TO_M[to_u], 4)
        return {"result": result, "description": f"{value} {from_u} = {result} {to_u}"}

    # ── Weight (base: grams) ──────────────────────────────────────
    WEIGHT_TO_G = {
        "g": 1, "gram": 1, "grams": 1,
        "kg": 1000, "kilogram": 1000, "kilograms": 1000,
        "mg": 0.001, "milligram": 0.001,
        "lb": 453.592, "lbs": 453.592, "pound": 453.592, "pounds": 453.592,
        "oz": 28.3495, "ounce": 28.3495, "ounces": 28.3495,
        "t": 1_000_000, "ton": 1_000_000, "metricton": 1_000_000,
    }

    if from_u in WEIGHT_TO_G and to_u in WEIGHT_TO_G:
        grams = value * WEIGHT_TO_G[from_u]
        result = round(grams / WEIGHT_TO_G[to_u], 4)
        return {"result": result, "description": f"{value} {from_u} = {result} {to_u}"}

    return {"result": None,
            "description": f"Cannot convert '{from_u}' to '{to_u}': incompatible or unknown units."}
```

---

## Examples

### Example 1

**User Input:**
```
What is 100°C in Fahrenheit?
```
**Expected Output:**
```
100 celsius = 212.0 fahrenheit
```

### Example 2

**User Input:**
```
Convert 26.2 miles to kilometers
```
**Expected Output:**
```
26.2 miles = 42.1648 km
```

### Example 3

**User Input:**
```
How many pounds is 80 kg?
```
**Expected Output:**
```
80 kg = 176.3698 lbs
```

### Example 4

**User Input:**
```
Convert 300 Kelvin to Celsius
```
**Expected Output:**
```
300 kelvin = 26.85 celsius
```

### Example 5

**User Input:**
```
How many inches in 2 feet?
```
**Expected Output:**
```
2 feet = 24.0 inches
```

---

## Notes
- Unit aliases are case-insensitive and handle common shorthands (°C, c, Celsius all resolve correctly).
- For temperature, Kelvin values < 0 are caught by the caller before passing to `execute`.
- Rounding is to 4 decimal places by default; for large integer results (e.g., 2 ft → 24 in), trailing zeros are acceptable.
- Multi-domain conversions (e.g., "km to lbs") return an error rather than a nonsensical result.

## Retrieval Keywords
convert, conversion, temperature, Celsius, Fahrenheit, Kelvin, distance, kilometers, miles, meters, feet, inches, weight, kilograms, pounds, grams, ounces, measurement, unit, transform, how many, equivalent