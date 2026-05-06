---
name: unit-conversion
version: 1.0.0
description: >
  Converts measurements between different units of temperature, distance, and weight. 
  Triggered when users ask how many miles are in a kilometer, what 20 degrees Celsius is in Fahrenheit, or to switch between kilograms and pounds.
triggers:
  - convert
  - celsius
  - fahrenheit
  - kelvin
  - miles
  - kilometers
  - kilograms
  - pounds
  - grams
  - inches
  - feet
tags:
  - math
  - conversion
  - tools
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
  output_label: "Conversion Result"
author: bemi-core
created: 2026-05-06
updated: 2026-05-06
enabled: true
---

## Purpose

Provides accurate conversions for common physical quantities. It handles temperature scales (Celsius, Fahrenheit, Kelvin), distances (metric and imperial), and mass/weight (kg, lbs, grams, ounces) using standard conversion factors.

## Parameters

The LLM should extract the following from the user's query before running:

- `value` (float, required) — The numerical value to convert.
- `from_unit` (string, required) — The starting unit (e.g., "celsius", "km", "kg").
- `to_unit` (string, required) — The target unit (e.g., "fahrenheit", "miles", "lbs").

## Code
```python
def run(value: float, from_unit: str, to_unit: str) -> dict:
    u1, u2 = from_unit.lower().strip(), to_unit.lower().strip()
    
    # Temperature
    if u1 == "celsius":
        c = value
    elif u1 == "fahrenheit":
        c = (value - 32) * 5/9
    elif u1 == "kelvin":
        c = value - 273.15
    else:
        c = None

    if c is not None:
        if u2 == "celsius": res = c
        elif u2 == "fahrenheit": res = (c * 9/5) + 32
        elif u2 == "kelvin": res = c + 273.15
        return {"result": round(res, 2), "unit": u2}

    # Distance (Base unit: meters)
    dist_factors = {"m": 1, "km": 1000, "miles": 1609.34, "mi": 1609.34, "feet": 0.3048, "ft": 0.3048, "inches": 0.0254, "in": 0.0254}
    if u1 in dist_factors and u2 in dist_factors:
        meters = value * dist_factors[u1]
        res = meters / dist_factors[u2]
        return {"result": round(res, 4), "unit": u2}

    # Weight (Base unit: grams)
    weight_factors = {"g": 1, "kg": 1000, "lbs": 453.592, "pounds": 453.592, "ounces": 28.3495, "oz": 28.3495}
    if u1 in weight_factors and u2 in weight_factors:
        grams = value * weight_factors[u1]
        res = grams / weight_factors[u2]
        return {"result": round(res, 4), "unit": u2}

    return {"error": "Unsupported conversion type or unit."}
```

# Response guidance
**For Math:** Always lead with the converted number.  
**For Precision:** Be precise but helpful (e.g., "32°F is exactly 0°C").  
**For Scaling:** If the user asks for a large conversion, provide the result clearly; for very large numbers, use scientific notation for clarity.  
**For Temperature:** Always include the unit symbol (e.g., °C, °F, K) in the final prose.

## Examples
**User:** Convert 100 degrees Celsius to Fahrenheit.
**BEMI:** [runs code] 212.0°F is the equivalent of 100°C. This is the boiling point of water at sea level.

**User:** How many miles are in 5 kilometers?
**BEMI:** [runs code] 3.1069 miles is equivalent to 5 kilometers.

**User:** Transform 150 lbs into kilograms.
**BEMI:** [runs code] 68.0389 kilograms is the weight of 150 pounds.

**User:** What is 32 Fahrenheit in Kelvin?
**BEMI:** [runs code] 273.15 K is equal to 32°F.

**User:** How many inches are in 6 feet?
**BEMI:** [runs code] 72.0 inches is the length of 6 feet.

**User:** Convert 500 grams to ounces.
**BEMI:** [runs code] 17.637 ounces is approximately 500 grams.

**User:** How many meters are in 1 mile?
**BEMI:** [runs code] 1609.34 meters is the length of exactly 1 mile.

**User:** Convert 0 Celsius to Kelvin.
**BEMI:** [runs code] 273.15 K is the equivalent of 0°C.

**User:** How many kilometers is 26.2 miles?
**BEMI:** [runs code] 42.1648 kilometers is the distance of a standard marathon.

**User:** Convert 10 kg to pounds.
**BEMI:** [runs code] 22.0462 pounds is the weight of 10 kilograms.

**User:** What is 98.6 Fahrenheit in Celsius?
**BEMI:** [runs code] 37.0°C is 98.6°F, which is typical human body temperature.

**User:** How many feet are in 100 meters?
**BEMI:** [runs code] 328.084 feet is equivalent to 100 meters.

**User:** Convert 16 ounces to pounds.
**BEMI:** [runs code] 1.0 pounds is exactly 16 ounces.

**User:** What is 300 Kelvin in Celsius?
**BEMI:** [runs code] 26.85°C is equal to 300 K.

**User:** How many inches are in 1 meter?
**BEMI:** [runs code] 39.3701 inches is the length of 1 meter.

**User:** Convert 2.2 pounds to grams.
**BEMI:** [runs code] 997.9024 grams is approximately 2.2 pounds.

**User:** How many miles are in 1000 kilometers?
**BEMI:** [runs code] 621.3712 miles is 1000 kilometers.

**User:** Convert -40 Celsius to Fahrenheit.
**BEMI:** [runs code] -40.0°F is exactly -40.0°C. This is the only point where both scales are equal.

**User:** How many meters are in 100 feet?
**BEMI:** [runs code] 30.48 meters is exactly 100 feet.

**User:** Convert 75 kilograms to pounds.
**BEMI:** [runs code] 165.3467 pounds is 75 kilograms.

**User:** What is 450 Fahrenheit in Celsius?
**BEMI:** [runs code] 232.22°C is 450°F.

**User:** How many feet are in a mile?
**BEMI:** [runs code] 5280.0 feet is exactly 1 mile.

**User:** Convert 100 grams to kilograms.
**BEMI:** [runs code] 0.1 kilograms is 100 grams.

**User:** How many meters are in 50 feet?
**BEMI:** [runs code] 15.24 meters is 50 feet.

**User:** Convert 212 Fahrenheit to Kelvin.
**BEMI:** [runs code] 373.15 K is 212°F.

**User:** How many miles are in 10 kilometers?
**BEMI:** [runs code] 6.2137 miles is 10 kilometers.

**User:** Convert 5 pounds to ounces.
**BEMI:** [runs code] 80.0 ounces is 5 pounds.

**User:** How many inches in 2 meters?
**BEMI:** [runs code] 78.7402 inches is 2 meters.

**User:** What is 20 Celsius in Fahrenheit?
**BEMI:** [runs code] 68.0°F is 20°C.

**User:** How many kilograms is 200 lbs?
**BEMI:** [runs code] 90.7185 kilograms is 200 pounds.

**User:** Convert 1000 feet to miles.
**BEMI:** [runs code] 0.1894 miles is 1000 feet.

**User:** How many grams in an ounce?
**BEMI:** [runs code] 28.3495 grams is 1 ounce.

**User:** Convert 37 Celsius to Fahrenheit.
**BEMI:** [runs code] 98.6°F is 37°C.

**User:** How many meters in 3 feet?
**BEMI:** [runs code] 0.9144 meters is 3 feet (1 yard).

**User:** Convert 50 kg to grams.
**BEMI:** [runs code] 50000.0 grams is 50 kilograms.

**User:** What is 72 Fahrenheit in Celsius?
**BEMI:** [runs code] 22.22°C is 72°F.

**User:** How many miles is 1500 meters?
**BEMI:** [runs code] 0.9321 miles is 1500 meters.

**User:** Convert 1 gram to ounces.
**BEMI:** [runs code] 0.0353 ounces is 1 gram.

**User:** How many feet in 2 kilometers?
**BEMI:** [runs code] 6561.6798 feet is 2 kilometers.

**User:** Convert 100 Kelvin to Celsius.
**BEMI:** [runs code] -173.15°C is 100 K.

**User:** How many inches in 10 feet?
**BEMI:** [runs code] 120.0 inches is 10 feet.

**User:** Convert 250 pounds to kilograms.
**BEMI:** [runs code] 113.3981 kilograms is 250 pounds.

**User:** How many kilometers in 50 miles?
**BEMI:** [runs code] 80.467 kilometers is 50 miles.

**User:** Convert 400 Celsius to Kelvin.
**BEMI:** [runs code] 673.15 K is 400°C.

**User:** How many feet in 5 meters?
**BEMI:** [runs code] 16.4042 feet is 5 meters.

**User:** Convert 1 pound to grams.
**BEMI:** [runs code] 453.592 grams is 1 pound.

**User:** How many meters in 10 inches?
**BEMI:** [runs code] 0.254 meters is 10 inches.

**User:** What is 0 Kelvin in Fahrenheit?
**BEMI:** [runs code] -459.67°F is 0 K (Absolute Zero).

**User:** How many miles in 8 kilometers?
**BEMI:** [runs code] 4.971 miles is 8 kilometers.

**User:** Convert 32 ounces to kilograms.
**BEMI:** [runs code] 0.9072 kilograms is 32 ounces.