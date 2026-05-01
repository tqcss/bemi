---
name: "cooking-reference"
description: "Provides kitchen measurement conversions, common ingredient substitutions, and basic cooking reference information using a mix of prose explanations and inline calculation functions."
tags:
  - "cooking"
  - "kitchen"
  - "measurements"
  - "substitutions"
version: "1.0.0"
author: "BEMI"
network_allowed: false
---

## Overview
This skill serves as a quick kitchen reference. It handles two primary categories of cooking question: measurement conversions (e.g., tablespoons to cups, grams to ounces) and ingredient substitutions (e.g., what to use when you're out of buttermilk or baking powder). It also covers basic scaling — adjusting a recipe for a different number of servings. The skill combines prose knowledge (for substitutions and cooking tips) with inline calculation code (for precise measurement math), making it useful across a wide range of kitchen questions.

## Capabilities
- Convert between common volume measurements (teaspoons, tablespoons, cups, fluid ounces, milliliters, liters)
- Convert between weight units commonly used in cooking (grams, ounces, pounds, kilograms)
- Suggest one or more substitutions for common baking and cooking ingredients
- Scale ingredient quantities up or down for a different serving count
- Clarify common cooking terminology (e.g., "fold" vs. "stir", "simmer" vs. "boil")

### Inputs
For conversions: `value` (float), `from_unit` (string), `to_unit` (string).
For substitutions: `ingredient` (string), optionally `quantity` and `use_case` (e.g., "baking").
For scaling: `original_servings` (int), `target_servings` (int), `ingredients` (list of dicts with name, amount, unit).

### Outputs
- Conversion: numeric result with a plain-language sentence
- Substitution: prose description of one or two practical alternatives, including any technique notes
- Scaling: adjusted ingredient list with quantities recalculated

---

## Instructions

### When to Use
- If the user asks "how many tablespoons in a cup?"
- When the user says they don't have a specific ingredient and needs an alternative
- If the user wants to scale a recipe (e.g., "I want to make this for 8 instead of 4")
- When the user asks what a cooking term means
- If the task involves any kitchen measurement or ingredient question

### How to Respond
For conversions, use the inline function and return a single formatted sentence. For substitutions, respond in prose — explain the substitute, the quantity ratio, and any effect on flavor or texture the user should expect. For scaling, recalculate each ingredient proportionally and present the result as a list. Always use friendly, practical language appropriate for a home cook.

### Constraints
- Do not invent substitutions; stick to well-established culinary alternatives.
- For substitutions, note any important caveats (e.g., "this works in muffins but not in a delicate sponge cake").
- Volume-to-weight conversions (e.g., cups of flour to grams) vary by ingredient; use standard reference values and state the assumption.

---

## Execution

### Inline Function — Volume Conversion

```python
def convert_volume(value, from_unit, to_unit):
    """
    Converts between common kitchen volume units.
    Base unit: milliliters (ml).
    """
    TO_ML = {
        "tsp": 4.92892, "teaspoon": 4.92892, "teaspoons": 4.92892,
        "tbsp": 14.7868, "tablespoon": 14.7868, "tablespoons": 14.7868,
        "fl oz": 29.5735, "fluid ounce": 29.5735, "fluid ounces": 29.5735,
        "cup": 236.588, "cups": 236.588,
        "pint": 473.176, "pints": 473.176,
        "quart": 946.353, "quarts": 946.353,
        "gallon": 3785.41, "gallons": 3785.41,
        "ml": 1, "milliliter": 1, "milliliters": 1,
        "l": 1000, "liter": 1000, "liters": 1000,
    }
    f = from_unit.lower().strip()
    t = to_unit.lower().strip()
    if f not in TO_ML or t not in TO_ML:
        return None, f"Unknown unit: '{f}' or '{t}'"
    result = round(value * TO_ML[f] / TO_ML[t], 4)
    return result, f"{value} {from_unit} = {result} {to_unit}"
```

### Inline Function — Recipe Scaling

```python
def scale_recipe(original_servings, target_servings, ingredients):
    """
    Scale a list of ingredients proportionally.
    ingredients: list of {"name": str, "amount": float, "unit": str}
    Returns adjusted list with amounts rounded to 2 decimal places.
    """
    factor = target_servings / original_servings
    scaled = []
    for item in ingredients:
        scaled.append({
            "name": item["name"],
            "amount": round(item["amount"] * factor, 2),
            "unit": item["unit"]
        })
    return scaled
```

---

## Substitution Reference (Prose)

When a user is missing an ingredient, use the following established substitutions as a reference base:

**Buttermilk (1 cup):** Combine 1 cup of regular milk with 1 tablespoon of white vinegar or fresh lemon juice. Stir and let sit for 5 minutes until slightly curdled. This works well in pancakes, muffins, and quick breads, though the tang is slightly milder than true buttermilk.

**Baking powder (1 teaspoon):** Use ¼ teaspoon baking soda combined with ½ teaspoon cream of tartar. Alternatively, ¼ teaspoon baking soda plus ½ cup buttermilk (reduce other liquid in recipe by ½ cup). Use immediately — baking soda activates quickly.

**Eggs (1 large, for baking):** Use ¼ cup unsweetened applesauce, 1 tablespoon ground flaxseed mixed with 3 tablespoons water (let sit 5 minutes), or ¼ cup mashed ripe banana. Note that banana adds flavor and applesauce adds moisture; neither replicates the structural lift of a real egg in a soufflé.

**Unsalted butter (1 cup):** Substitute 1 cup salted butter and omit any additional salt in the recipe, or use ¾ cup plus 2 tablespoons vegetable shortening (the baked good will be slightly less flavorful). Coconut oil works 1:1 in most cookies and quick breads.

**Whole milk (1 cup):** Combine ½ cup evaporated milk with ½ cup water, or use any plant-based milk (oat milk is closest in fat content). For rich sauces, add 1 tablespoon melted butter to 1 cup of 2% milk.

---

## Examples

### Example 1

**User Input:**
```
How many tablespoons are in ¾ of a cup?
```
**Expected Behavior:** Call `convert_volume(0.75, "cup", "tablespoon")`.

**Expected Output:**
```
0.75 cups = 12.0 tablespoons
```

### Example 2

**User Input:**
```
I'm out of buttermilk — what can I use instead?
```
**Expected Behavior:** Return the buttermilk substitution from prose reference.

**Expected Output:**
```
No buttermilk? No problem. Combine 1 cup of regular milk with 1 tablespoon of white vinegar or lemon juice, stir, and let it sit for 5 minutes until it curdles slightly. This DIY buttermilk works beautifully in pancakes, muffins, and quick breads.
```

### Example 3

**User Input:**
```
I need to scale this recipe from 4 servings to 10:
- 2 cups flour
- 1 tsp salt
- 3 tbsp butter
```
**Expected Behavior:** Call `scale_recipe(4, 10, [...])`.

**Expected Output:**
```
Scaled to 10 servings:
• Flour: 5.0 cups
• Salt: 2.5 tsp
• Butter: 7.5 tbsp
```

### Example 4

**User Input:**
```
How many milliliters is 2 tablespoons?
```
**Expected Output:**
```
2 tablespoons = 29.5736 ml
```

---

## Notes
- Volume-to-weight conversions (cups of flour in grams) are ingredient-specific. A standard all-purpose flour conversion is approximately 125 g per cup (spooned and leveled), but this should be stated explicitly.
- "Folding" means gently incorporating ingredients with a rubber spatula in a sweeping under-and-over motion to preserve air bubbles — contrast with stirring, which is circular and deflates whipped mixtures.
- "Simmer" means maintaining liquid at 85–95°C (185–203°F), with small bubbles breaking the surface but no vigorous rolling boil.

## Retrieval Keywords
cooking, baking, recipe, measurement, convert, tablespoon, teaspoon, cup, milliliter, substitution, substitute, ingredient swap, out of, scale recipe, servings, buttermilk, baking powder, kitchen math, flour, butter, eggs, cooking terms