import type { Activity } from "@shared/schema";

export interface WeatherForecast {
  date: string;
  location: string;
  temperature: { min: number; max: number };
  humidity: number;
  windSpeed: number;
  condition: string; // "sunny", "rainy", "cloudy", "stormy", etc.
  precipitationChance: number;
  icon: string; // weather icon code
  alerts: WeatherAlert[];
  hourlyForecast?: HourlyWeather[];
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  condition: string;
  precipitationChance: number;
  windSpeed: number;
}

export interface WeatherAlert {
  type: string; // "rain", "storm", "heat", "cold", etc.
  severity: "low" | "medium" | "high";
  message: string;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl = "https://api.openweathermap.org/data/2.5";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.WEATHER_API_KEY || "";
  }

  /**
   * Fetch weather forecast for destination during trip dates
   */
  async getWeatherForecast(
    destination: string,
    startDate: string,
    endDate: string,
    latitude?: number,
    longitude?: number
  ): Promise<WeatherForecast[]> {
    try {
      if (!this.apiKey) {
        console.warn("Weather API key not configured, returning mock forecasts");
        return this.generateMockForecasts(destination, startDate, endDate);
      }

      const resolvedLocation =
        latitude !== undefined && longitude !== undefined
          ? { lat: latitude, lon: longitude, name: destination }
          : (await this.resolveDestinationCoordinates(destination)) || this.getCoordinatesForDestination(destination);

      // Fetch current and forecast data
      const forecastUrl = `${this.baseUrl}/forecast?lat=${resolvedLocation.lat}&lon=${resolvedLocation.lon}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(forecastUrl);
      
      if (!response.ok) {
        console.error(`Weather API error: ${response.status}`);
        return this.generateMockForecasts(destination, startDate, endDate);
      }

      const data = await response.json();
      return this.parseForecastData(data, (resolvedLocation && (resolvedLocation as any).name) || destination, startDate, endDate);
    } catch (error) {
      console.error("Weather service error:", error);
      return this.generateMockForecasts(destination, startDate, endDate);
    }
  }

  /**
   * Resolve a destination name to coordinates using OpenWeatherMap geocoding.
   */
  private async resolveDestinationCoordinates(destination: string): Promise<{ lat: number; lon: number; name: string } | null> {
    try {
      const query = encodeURIComponent(destination.trim());
      const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
      const response = await fetch(geocodeUrl);

      if (!response.ok) {
        console.warn(`Weather geocoding failed for ${destination}: ${response.status}`);
        return null;
      }

      const results = (await response.json()) as Array<{ lat: number; lon: number; name?: string; state?: string; country?: string }>;
      const match = results[0];

      if (!match) {
        return null;
      }

      const labelParts = [match.name, match.state, match.country].filter(Boolean);
      return {
        lat: match.lat,
        lon: match.lon,
        name: labelParts.join(", ") || destination,
      };
    } catch (error) {
      console.warn(`Weather geocoding error for ${destination}:`, error);
      return null;
    }
  }

  /**
   * Get weather alerts for high-impact conditions
   */
  private getWeatherAlerts(forecast: any): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const temp = forecast.main?.temp || 0;
    const precipitation = forecast.pop || 0; // probability of precipitation
    const windSpeed = forecast.wind?.speed || 0;
    const condition = forecast.weather?.[0]?.main || "";

    // Heat alert
    if (temp > 38) {
      alerts.push({
        type: "heat",
        severity: temp > 42 ? "high" : "medium",
        message: `High temperature ${Math.round(temp)}°C. Stay hydrated and avoid outdoor activities during peak hours.`
      });
    }

    // Cold alert
    if (temp < 5) {
      alerts.push({
        type: "cold",
        severity: temp < 0 ? "high" : "medium",
        message: `Cold weather ${Math.round(temp)}°C. Bring warm clothing and be cautious of icy conditions.`
      });
    }

    // Rain/storm alert
    if (precipitation > 0.6 || condition.toLowerCase().includes("rain")) {
      alerts.push({
        type: "rain",
        severity: condition.toLowerCase().includes("thunderstorm") ? "high" : "medium",
        message: condition.toLowerCase().includes("thunderstorm") 
          ? "Thunderstorm expected. Avoid outdoor activities and stay indoors."
          : "Rain expected. Bring umbrella and waterproof gear. Some outdoor activities may need rescheduling."
      });
    }

    // Wind alert
    if (windSpeed > 8) {
      alerts.push({
        type: "wind",
        severity: windSpeed > 12 ? "high" : "medium",
        message: `Strong winds (${Math.round(windSpeed)} m/s). Secure loose items and be cautious during outdoor activities.`
      });
    }

    return alerts;
  }

  /**
   * Parse OpenWeatherMap forecast API response
   */
  private parseForecastData(
    data: any,
    destination: string,
    startDate: string,
    endDate: string
  ): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Group forecasts by day
    const dayForecasts: Record<string, any[]> = {};

    data.list?.forEach((forecast: any) => {
      const date = new Date(forecast.dt * 1000);
      const dateKey = date.toISOString().split("T")[0];

      if (date >= start && date <= end) {
        if (!dayForecasts[dateKey]) {
          dayForecasts[dateKey] = [];
        }
        dayForecasts[dateKey].push(forecast);
      }
    });

    // Convert daily forecasts
    Object.entries(dayForecasts).forEach(([dateKey, dailyData]) => {
      if (dailyData.length === 0) return;

      // Calculate daily stats (use midday data and aggregates)
      const midday = dailyData.find((f) => {
        const hour = new Date(f.dt * 1000).getHours();
        return hour >= 11 && hour <= 13;
      }) || dailyData[Math.floor(dailyData.length / 2)];

      const temps = dailyData.map((f) => f.main.temp);
      const precipProbs = dailyData.map((f) => f.pop || 0);
      const winds = dailyData.map((f) => f.wind?.speed || 0);

      forecasts.push({
        date: dateKey,
        location: destination,
        temperature: {
          min: Math.round(Math.min(...temps) * 10) / 10,
          max: Math.round(Math.max(...temps) * 10) / 10,
        },
        humidity: Math.round(midday.main.humidity),
        windSpeed: Math.round(Math.max(...winds) * 10) / 10,
        condition: this.normalizeCondition(midday.weather?.[0]?.main),
        precipitationChance: Math.round(Math.max(...precipProbs) * 100),
        icon: midday.weather?.[0]?.icon || "01d",
        alerts: this.getWeatherAlerts(midday),
        hourlyForecast: this.parseHourlyData(dailyData),
      });
    });

    return forecasts;
  }

  /**
   * Parse hourly forecast data for detailed timeline
   */
  private parseHourlyData(dailyData: any[]): HourlyWeather[] {
    return dailyData.map((f) => ({
      time: new Date(f.dt * 1000).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      temperature: Math.round(f.main.temp * 10) / 10,
      condition: this.normalizeCondition(f.weather?.[0]?.main),
      precipitationChance: Math.round((f.pop || 0) * 100),
      windSpeed: Math.round((f.wind?.speed || 0) * 10) / 10,
    }));
  }

  /**
   * Normalize weather condition names
   */
  private normalizeCondition(condition: string): string {
    if (!condition) return "unknown";
    const lower = condition.toLowerCase();
    if (lower.includes("cloud")) return "cloudy";
    if (lower.includes("rain")) return "rainy";
    if (lower.includes("thunderstorm")) return "stormy";
    if (lower.includes("clear") || lower.includes("sunny")) return "sunny";
    if (lower.includes("mist") || lower.includes("fog")) return "misty";
    if (lower.includes("snow")) return "snowy";
    if (lower.includes("wind")) return "windy";
    return lower.replace(/\s+/g, "_");
  }

  /**
   * Get latitude/longitude for Indian cities
   */
  private getCoordinatesForDestination(destination: string): { lat: number; lon: number } {
    const coords: Record<string, { lat: number; lon: number }> = {
      "Mumbai": { lat: 19.0760, lon: 72.8777 },
      "Delhi": { lat: 28.7041, lon: 77.1025 },
      "Bangalore": { lat: 12.9716, lon: 77.5946 },
      "Goa": { lat: 15.2993, lon: 73.8243 },
      "Jaipur": { lat: 26.9124, lon: 75.7873 },
      "Udaipur": { lat: 24.5854, lon: 73.7125 },
      "Kochi": { lat: 9.9312, lon: 76.2673 },
      "Agra": { lat: 27.1767, lon: 78.0081 },
      "Varanasi": { lat: 25.3201, lon: 82.9989 },
      "Rajasthan": { lat: 27.0238, lon: 74.2179 },
      "Himachal Pradesh": { lat: 31.7833, lon: 77.1167 },
      "Kerala": { lat: 10.8505, lon: 76.2711 },
      "Manali": { lat: 32.2396, lon: 77.1887 },
      "Shimla": { lat: 31.7725, lon: 77.1739 },
    };

    return (
      coords[destination] ||
      coords[Object.keys(coords).find((k) => destination.toLowerCase().includes(k.toLowerCase())) || "Delhi"] ||
      { lat: 28.7041, lon: 77.1025 } // Default to Delhi
    );
  }

  /**
   * Generate mock forecasts when API is unavailable
   */
  private generateMockForecasts(destination: string, startDate: string, endDate: string): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const conditions = ["sunny", "cloudy", "rainy"];
    const icons = ["01d", "02d", "09d"];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const conditionIdx = Math.floor(Math.random() * conditions.length);
      const hasRain = Math.random() > 0.7;

      forecasts.push({
        date: d.toISOString().split("T")[0],
        location: destination,
        temperature: {
          min: 20 + Math.floor(Math.random() * 10),
          max: 30 + Math.floor(Math.random() * 12),
        },
        humidity: 40 + Math.floor(Math.random() * 40),
        windSpeed: 5 + Math.floor(Math.random() * 15),
        condition: hasRain ? "rainy" : conditions[conditionIdx],
        precipitationChance: hasRain ? 60 + Math.floor(Math.random() * 40) : Math.floor(Math.random() * 30),
        icon: hasRain ? "09d" : icons[conditionIdx],
        alerts: hasRain ? [{ type: "rain", severity: "medium", message: "Rainy weather expected" }] : [],
      });
    }

    return forecasts;
  }

  /**
   * Suggest activities based on weather
   */
  suggestActivitiesByWeather(
    weather: WeatherForecast,
    availableActivities: Activity[],
    preferences?: { interests?: string[] }
  ): { recommended: Activity[]; warnings: string[] } {
    const warnings: string[] = [];
    const recommended: Activity[] = [];

    // Filter based on weather
    if (weather.condition === "rainy" || weather.condition === "stormy") {
      warnings.push("Outdoor activities may be affected by rain. Consider indoor alternatives.");
      recommended.push(
        ...availableActivities.filter(
          (a) =>
            a.category?.toLowerCase().includes("indoor") ||
            a.category?.toLowerCase().includes("museum") ||
            a.category?.toLowerCase().includes("restaurant") ||
            a.category?.toLowerCase().includes("temple")
        )
      );
    } else if (weather.condition === "sunny") {
      recommended.push(
        ...availableActivities.filter(
          (a) =>
            a.category?.toLowerCase().includes("beach") ||
            a.category?.toLowerCase().includes("hiking") ||
            a.category?.toLowerCase().includes("sightseeing") ||
            a.category?.toLowerCase().includes("outdoor")
        )
      );
    } else if (weather.condition === "cloudy") {
      recommended.push(...availableActivities.slice(0, Math.ceil(availableActivities.length / 2)));
    }

    // Temperature-based warnings
    if (weather.temperature.max > 38) {
      warnings.push("High temperatures. Avoid strenuous outdoor activities. Stay hydrated.");
    } else if (weather.temperature.min < 5) {
      warnings.push("Cold weather. Bring warm clothing. Indoor activities recommended.");
    }

    // Wind/precipitation warnings
    if (weather.windSpeed > 10) {
      warnings.push("Strong winds. Beach and water activities may be risky.");
    }

    if (weather.precipitationChance > 70) {
      warnings.push("High chance of rain. Waterproof gear recommended.");
    }

    return {
      recommended: recommended.slice(0, 5), // Top 5 recommendations
      warnings,
    };
  }
}

export const weatherService = new WeatherService();
