---
name: cooking-reference
version: 1.0.0
description: >
  Convert kitchen measurements, find ingredient substitutions, and scale recipe servings. 
  Triggered when users ask how many tablespoons are in a cup, what to use instead of eggs, or how to double a recipe.

triggers:
  - convert
  - measurement
  - substitution
  - substitute
  - recipe scaling
  - tablespoons to cups
  - grams to ounces
tags:
  - cooking
  - reference
  - math

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
  output_label: "Conversion and Scaling Results"

author: bemi-dev
created: 2026-05-06
updated: 2026-05-06
enabled: true
---

## Purpose

BEMI uses this skill to provide precise culinary math and reliable kitchen workarounds. It solves the "fuzzy math" problem of cooking by using a logic block for conversions while relying on prose for qualitative substitutions.

## Parameters

The LLM should identify the user's intent (convert, scale, or substitute) and extract:

- `action` (string) — "convert", "scale", or "substitute"
- `value` (float, optional) — the numeric amount to convert or scale
- `from_unit` (string, optional) — the starting unit (e.g., "cups", "grams")
- `to_unit` (string, optional) — the target unit (e.g., "ml", "oz")
- `factor` (float, optional) — the multiplier for scaling (e.g., 2.0 to double)

## Code
```python
def run(action: str, value: float = 1.0, from_unit: str = None, to_unit: str = None, factor: float = 1.0) -> dict:
    # Volume conversion map (to ml)
    vol = {"tsp": 4.92, "tbsp": 14.78, "cup": 240, "fl_oz": 29.57, "ml": 1.0, "liter": 1000}
    # Weight conversion map (to grams)
    weight = {"gram": 1.0, "kg": 1000, "oz": 28.35, "lb": 453.59}
    
    if action == "scale":
        return {"result": value * factor, "unit": from_unit, "note": f"Scaled by factor of {factor}"}
    
    if action == "convert":
        # Check volume
        if from_unit in vol and to_unit in vol:
            res = (value * vol[from_unit]) / vol[to_unit]
            return {"result": round(res, 2), "from": from_unit, "to": to_unit}
        # Check weight
        if from_unit in weight and to_unit in weight:
            res = (value * weight[from_unit]) / weight[to_unit]
            return {"result": round(res, 2), "from": from_unit, "to": to_unit}
            
    return {"error": "Conversion unit not supported or missing parameters."}
```

## Knowledge Base: Substitutions

If the user asks for a substitution, refer to this list. If the item isn't here, advise checking for acidity/moisture balance:

*   **Baking Powder (1 tsp):** 1/4 tsp baking soda + 1/2 tsp cream of tartar.
*   **Buttermilk (1 cup):** 1 cup milk + 1 tbsp lemon juice or white vinegar (let sit 5 mins).
*   **Egg (for binding):** 1/2 mashed banana OR 1 tbsp flax meal + 3 tbsp water.
*   **Self-Rising Flour (1 cup):** 1 cup all-purpose flour + 1.5 tsp baking powder + 1/4 tsp salt.
*   **Butter (for baking):** 1:1 ratio of applesauce (moist cakes) or Greek yogurt.

## Response guidance

1.  **For Math:** Always lead with the calculated number. Be precise but helpful (e.g., "2.12 cups is roughly 2 cups and 2 tablespoons").
2.  **For Substitutions:** Explain *why* the substitution works or if it changes the texture (e.g., "Applesauce works for butter but will make the cake denser").
3.  **For Scaling:** Clearly state the new quantities for every ingredient the user mentions.

## Examples

**User:** I'm out of buttermilk, what can I use?
**BEMI:** No problem! You can make a quick DIY buttermilk by adding 1 tablespoon of lemon juice or white vinegar to 1 cup of regular milk. Let it sit for about 5 minutes until it curdles slightly before using it in your recipe.

**User:** How many ml are in 3.5 cups?
**BEMI:** [runs code] 3.5 cups is exactly 840 ml. 

**User:** I need to triple this recipe, it calls for 2.5 cups of flour.
**BEMI:** [runs code] To triple your recipe, you will need 7.5 cups of flour.