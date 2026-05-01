---
name: "weather-forecast"
description: "Retrieves weather forecast by date and location"
tags:
  - "weather"
  - "forecast"
  - "api"
version: "1.0.0"
author: "BEMI Core"
network_allowed: true
---

## Overview
This skill retrieves weather forecasts for a given location and date using an external data source.

## Capabilities
The skill can provide current weather conditions, temperature, and a brief forecast summary for a specified location and date. It is useful for users who want to know the weather for planning activities, travel, or general information.

### Inputs
- Location (city or coordinates)
- Date

### Outputs
- Weather conditions
- Temperature
- Forecast summary

## Instructions

### When to Use
- If the user asks about weather
- When a forecast is requested for a specific date/location

### How to Respond
Provide a short weather summary including temperature and conditions.

### Constraints
- Requires network access

## Execution

### External Script Reference
scripts/weather.py → get_forecast

## Examples

### Example 1

**User Input:**
```
Weather in Tokyo tomorrow
```

**Expected Output:**
```
Partly cloudy, 24°C, light winds
```

### Example 2

**User Input:**
```
What's the weather like in New York next week?
```

**Expected Output:**
```
Rainy, 18°C, chance of thunderstorms
```

### Example 3

**User Input:**
```
Give me the weather forecast for Paris on July 4th.
```

**Expected Output:**
```
Sunny, 30°C, no precipitation
```

## Retrieval Keywords
weather, forecast, temperature, climate
