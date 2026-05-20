---
name: "weather-forecast"
description: "Retrieves weather forecasts for a given location and date using an external Python script. Supports current conditions and multi-day outlooks."
tags:
  - "weather"
  - "forecast"
  - "external-script"
version: "1.0.0"
author: "BEMI"
network_allowed: true
---

## Overview
This skill fetches weather forecasts by delegating to an external Python script (`scripts/weather.py`). Given a location (city name, ZIP code, or lat/lon coordinates) and an optional target date, it returns temperature, precipitation probability, wind speed, humidity, and a plain-language summary. It is the correct skill to invoke whenever a user asks about current weather, tomorrow's forecast, or conditions on a specific upcoming date.

## Capabilities
- Retrieve current weather conditions for any supported location
- Fetch a forecast for a specific future date (up to 7 days ahead)
- Return structured weather data including temperature (°C and °F), precipitation chance, wind speed, and sky conditions
- Provide a short natural-language summary suitable for direct delivery to the user

### Inputs
- `location` (string, required): City name, ZIP/postal code, or "lat,lon" coordinate pair
- `date` (string, optional): Target date in `YYYY-MM-DD` format. Defaults to today if omitted.
- `units` (string, optional): `"metric"` (default) or `"imperial"`

### Outputs
- `temperature`: numeric value in the requested unit system
- `feels_like`: apparent temperature
- `precipitation_pct`: integer 0–100
- `wind_kph` or `wind_mph`: wind speed
- `condition`: sky description (e.g., "Partly cloudy")
- `summary`: one-sentence human-readable forecast

---

## Instructions

### When to Use
- If the user asks "what's the weather in [city]?"
- When the user requests a forecast for a specific date or day of the week
- If the user asks whether they should bring an umbrella, jacket, or sunscreen (weather-dependent advice)
- When the task involves planning around weather conditions

### How to Respond
1. Extract `location` and `date` from the user's message.
2. If no date is mentioned, default to today's date.
3. Call the external script (see Execution below) with the resolved parameters.
4. Present the `summary` field prominently, followed by key stats (temperature, precipitation, wind) in a compact format.
5. If the requested date is more than 7 days out, inform the user that reliable forecasts are unavailable beyond that window.

### Constraints
- Never fabricate weather data; if the script returns an error, report it honestly.
- Do not cache results between sessions; always fetch fresh data.
- Respect rate limits from the underlying weather API; do not call the script more than once per user turn.

---

## Execution

### External Script Reference
`scripts/weather.py` → `get_forecast`

```python
# Signature of the callable entry point in scripts/weather.py:
def get_forecast(location: str, date: str = None, units: str = "metric") -> dict:
    """
    Fetches forecast data from the configured weather API.
    Returns a dict with keys: temperature, feels_like, precipitation_pct,
    wind_speed, condition, summary, unit_label.
    Raises WeatherAPIError on network or parsing failure.
    """
```

---

## Examples

### Example 1

**User Input:**
```
What's the weather like in Tokyo tomorrow?
```
**Expected Behavior:** Extract location="Tokyo", date=tomorrow's date, call `get_forecast("Tokyo", "2025-09-02", "metric")`.

**Expected Output:**
```
Tomorrow in Tokyo: Partly cloudy, 28°C (feels like 31°C).
Precipitation: 20% | Wind: 14 km/h
```

### Example 2

**User Input:**
```
Will it rain in New York on September 5th?
```
**Expected Behavior:** Extract location="New York", date="2025-09-05", focus answer on precipitation.

**Expected Output:**
```
On September 5th in New York: Scattered showers likely.
Precipitation chance: 75% | High: 22°C
Pack an umbrella!
```

### Example 3

**User Input:**
```
Current conditions in Sydney, Australia
```
**Expected Behavior:** Extract location="Sydney, Australia", date=today.

**Expected Output:**
```
Right now in Sydney: Clear skies, 19°C (feels like 18°C).
Precipitation: 5% | Wind: 22 km/h
```

### Example 4

**User Input:**
```
Give me the forecast for 90210 for the next three days
```
**Expected Behavior:** Call `get_forecast` for today, today+1, today+2 with location="90210", present as a compact 3-day table.

**Expected Output:**
```
3-Day Forecast for Beverly Hills, CA (90210):
Mon Sep 1 — Sunny, High 30°C / Low 21°C, Rain 5%
Tue Sep 2 — Partly cloudy, High 27°C / Low 19°C, Rain 15%
Wed Sep 3 — Overcast, High 24°C / Low 18°C, Rain 40%
```

---

## Notes
- `scripts/weather.py` must have a valid API key configured in the environment variable `WEATHER_API_KEY`.
- Supported API backends: OpenWeatherMap, WeatherAPI.com (configured in `weather.py`).
- For ambiguous city names (e.g., "Springfield"), the script returns the top match; relay this to the user so they can confirm.
- Forecasts beyond 3 days should be presented with a confidence caveat.

## Retrieval Keywords
weather, forecast, rain, temperature, humidity, wind, precipitation, sunny, cloudy, snow, storm, conditions, climate today, tomorrow weather, weekly forecast, umbrella, jacket