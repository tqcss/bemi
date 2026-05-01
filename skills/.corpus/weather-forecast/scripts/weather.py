def get_forecast(location, date):
    """
    Fetches the weather forecast for a given location and date.
    
    Parameters:
    location (str): The location for which to fetch the forecast.
    date (str): The date for which to fetch the forecast in YYYY-MM-DD format.
    
    Returns:
    str: A string describing the weather forecast.
    """
    # Simulated response for demonstration purposes
    if location.lower() == "tokyo" and date == "2024-06-01":
        return "Partly cloudy, 24°C, light winds"
    elif location.lower() == "new york" and date == "2024-06-08":
        return "Rainy, 18°C, chance of thunderstorms"
    elif location.lower() == "paris" and date == "2024-07-04":
        return "Sunny, 30°C, no precipitation"
    else:
        return "Weather data not available for the specified location and date."
    