---
name: weather-forecast
version: 1.0.0
description: >
  Get the current weather and local forecasts for any city. 
  Used when you want to know if it will rain, how hot it is outside, or what the weather looks like for the next few days.
triggers:
  - weather
  - forecast
  - temperature
  - rain
  - snow
  - humidity
  - conditions
tags:
  - external-api
  - real-time
  - meteorology
execution:
  enabled: true
  runtime: python
  timeout_seconds: 10
  allow_network: true
  allow_filesystem: false
  memory_limit_mb: 64
  entrypoint: run
context:
  inject_before_llm: true
  output_label: "Forecast data"
author: bemi-core
created: 2026-05-06
updated: 2026-05-06
enabled: true
---

## Purpose

Retrieves detailed weather information, including current temperature, atmospheric conditions, and multi-day outlooks for a specified location. The skill interfaces with a weather data provider to ensure users get up-to-date atmospheric information.

## Parameters

The LLM should extract the following from the user's query:

- `location` (string, required) — The city and/or country to search for.
- `days` (integer, optional) — Number of days for the forecast (default is 1 for current).
- `units` (string, optional) — "metric" (Celsius) or "imperial" (Fahrenheit).

## Code

```python
import httpx
import os

def run(location: str, days: int = 1, units: str = "metric") -> dict:
    api_key = os.environ.get("WEATHER_API_KEY")
    base_url = "[https://api.weatherapi.com/v1/forecast.json](https://api.weatherapi.com/v1/forecast.json)"
    
    params = {
        "key": api_key,
        "q": location,
        "days": days,
        "aqi": "no"
    }
    
    resp = httpx.get(base_url, params=params)
    resp.raise_for_status()
    data = resp.json()
    
    current = data["current"]
    temp_key = "temp_c" if units == "metric" else "temp_f"
    
    forecast_list = []
    for day in data["forecast"]["forecastday"]:
        forecast_list.append({
            "date": day["date"],
            "max_temp": day["day"][f"maxtemp_{'c' if units == 'metric' else 'f'}"],
            "condition": day["day"]["condition"]["text"]
        })
        
    return {
        "location": data["location"]["name"],
        "region": data["location"]["region"],
        "current_temp": current[temp_key],
        "condition": current["condition"]["text"],
        "humidity": current["humidity"],
        "forecast": forecast_list
    }
```
## Response guidance
Start by confirming the location and providing the current temperature and conditions. If a multi-day forecast was requested, summarize the trend (e.g., "it looks like it will get warmer over the weekend"). Mention specific conditions like rain or snow if they appear in the forecast. If the user doesn't specify a unit, default to the local standard based on their location.

## Examples
**User:** How's the weather in New York?
**BEMI:** [runs code] It's currently 18°C and clear in New York, with a humidity of 45%.

**User:** Give me a 3-day forecast for London.
**BEMI:** [runs code] In London, expect light rain today with a high of 15°C. Tomorrow will be cloudy, and by Friday, the sun should break through with temperatures reaching 18°C.

**User:** Is it going to rain in Paris today?
**BEMI:** [runs code] Currently, it's overcast in Paris. The forecast shows a 60% chance of rain starting this afternoon.

**User:** What's the temperature in Tokyo right now?
**BEMI:** [runs code] It is a pleasant 22°C in Tokyo under partly cloudy skies.

**User:** Should I bring an umbrella to Seattle?
**BEMI:** [runs code] Yes, Seattle is seeing light drizzle right now, and the forecast suggests it will continue throughout the evening.

**User:** Tell me the weather in Berlin for the next 5 days.
**BEMI:** [runs code] Berlin will stay cool over the next few days, ranging from 10°C to 14°C, with mostly cloudy skies through the weekend.

**User:** What is the humidity in Miami?
**BEMI:** [runs code] It's quite humid in Miami at 85%, with a current temperature of 30°C.

**User:** Will it snow in Toronto tomorrow?
**BEMI:** [runs code] No snow is in the forecast for tomorrow; it will be a cold but dry day with a high of -2°C.

**User:** How hot is it in Dubai?
**BEMI:** [runs code] It’s currently a scorching 41°C in Dubai with clear, sunny skies.

**User:** Is it windy in Chicago?
**BEMI:** [runs code] Chicago is living up to its name today with winds at 25 mph and a current temp of 12°C.

**User:** Weather for Sydney, Australia.
**BEMI:** [runs code] Sydney is enjoying a sunny day at 24°C with a light breeze.

**User:** What's the weekend outlook for San Francisco?
**BEMI:** [runs code] San Francisco will see typical fog in the mornings, clearing to sunny intervals and highs of 19°C on both Saturday and Sunday.

**User:** Do I need a coat in Seoul?
**BEMI:** [runs code] Yes, it's currently 4°C in Seoul, so a heavy coat is recommended.

**User:** Forecast for Rome.
**BEMI:** [runs code] Rome is sunny today with a high of 26°C. The clear skies are expected to last all week.

**User:** How is the sky in Bangkok?
**BEMI:** [runs code] The sky is mostly cloudy in Bangkok with a high chance of a thunderstorm later today.

**User:** Current conditions in Moscow.
**BEMI:** [runs code] It is -5°C and snowing in Moscow right now.

**User:** Weather for Los Angeles.
**BEMI:** [runs code] Los Angeles is sunny and 25°C today—perfect weather for the beach.

**User:** Is it raining in Mumbai?
**BEMI:** [runs code] No rain right now, but it's very overcast and humid in Mumbai.

**User:** What's the high for Denver today?
**BEMI:** [runs code] Denver will reach a high of 15°C today under bright sunny skies.

**User:** 4-day forecast for Vancouver.
**BEMI:** [runs code] Vancouver will see rain for the next two days, but it should clear up by Saturday for a sunny Sunday afternoon.

**User:** How's the weather in Madrid?
**BEMI:** [runs code] Madrid is currently 28°C and very dry.

**User:** Is it cloudy in Singapore?
**BEMI:** [runs code] Yes, it is mostly cloudy in Singapore with a temperature of 29°C.

**User:** What’s the weather like in Cairo?
**BEMI:** [runs code] Cairo is sunny and 34°C with very low humidity.

**User:** Will it be sunny in Barcelona this weekend?
**BEMI:** [runs code] Yes, Barcelona is looking sunny for both Saturday and Sunday with temperatures around 22°C.

**User:** Temperature in Cape Town.
**BEMI:** [runs code] It is currently 20°C in Cape Town with a few passing clouds.

**User:** Is it stormy in Hong Kong?
**BEMI:** [runs code] There is a thunderstorm warning currently active for Hong Kong; stay safe!

**User:** Weather for Mexico City.
**BEMI:** [runs code] Mexico City is 21°C with scattered clouds.

**User:** High and low for Amsterdam today.
**BEMI:** [runs code] Amsterdam will see a high of 16°C and a low of 9°C tonight.

**User:** Is there rain in Dublin?
**BEMI:** [runs code] Just a light mist in Dublin right now, typical for this time of year.

**User:** Weather in Rio de Janeiro.
**BEMI:** [runs code] Rio is hot and sunny at 32°C.

**User:** What's the forecast for Oslo?
**BEMI:** [runs code] Oslo is cold at 2°C, but skies are clear for the next 48 hours.

**User:** Is it freezing in Helsinki?
**BEMI:** [runs code] Almost! It is currently 1°C in Helsinki.

**User:** Weather report for Buenos Aires.
**BEMI:** [runs code] It’s a mild 18°C in Buenos Aires with clear skies.

**User:** Do I need sunglasses in Phoenix?
**BEMI:** [runs code] Definitely. It's clear skies and 38°C in Phoenix today.

**User:** Will it be dry in Portland this week?
**BEMI:** [runs code] It looks like a rare dry week for Portland with no rain in the forecast until next Monday.

**User:** Weather in Istanbul.
**BEMI:** [runs code] Istanbul is 19°C and partly cloudy.

**User:** How's the air in Beijing?
**BEMI:** [runs code] Beijing is currently 24°C and hazy.

**User:** What is the weather in Prague?
**BEMI:** [runs code] Prague is currently 15°C and overcast.

**User:** Is it warm in Lisbon?
**BEMI:** [runs code] Yes, Lisbon is a lovely 23°C today.

**User:** Forecast for Vienna.
**BEMI:** [runs code] Vienna will be 17°C today with a chance of light showers in the evening.

**User:** Current temp in Stockholm.
**BEMI:** [runs code] Stockholm is currently 8°C.

**User:** Weather for Lima, Peru.
**BEMI:** [runs code] Lima is 19°C with high humidity and typical coastal fog.

**User:** How's the weather in Warsaw?
**BEMI:** [runs code] Warsaw is 13°C and sunny today.

**User:** Forecast for Auckland.
**BEMI:** [runs code] Auckland is seeing some wind and showers today with a high of 18°C.

**User:** Is it sunny in Athens?
**BEMI:** [runs code] Yes, Athens is bright and sunny at 27°C.

**User:** Weather for Jerusalem.
**BEMI:** [runs code] Jerusalem is 22°C and clear.

**User:** What's the forecast for Zurich?
**BEMI:** [runs code] Zurich is 14°C and will likely see rain tomorrow.

**User:** How is the weather in Manila?
**BEMI:** [runs code] Manila is very warm at 33°C with high humidity.

**User:** Is it clear in Santiago?
**BEMI:** [runs code] Yes, Santiago is 20°C and perfectly clear today.

**User:** Weather for Nairobi.
**BEMI:** [runs code] Nairobi is experiencing a pleasant day at 22°C with light clouds.