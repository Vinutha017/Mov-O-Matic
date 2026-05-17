import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, Cloud, CloudRain, Sun, Wind, Droplets, Eye } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { notify } from "@/hooks/use-notifications";

interface WeatherForecast {
  date: string;
  location: string;
  temperature: { min: number; max: number };
  humidity: number;
  windSpeed: number;
  condition: string;
  precipitationChance: number;
  icon: string;
  alerts: WeatherAlert[];
  hourlyForecast?: HourlyWeather[];
}

interface WeatherAlert {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
}

interface HourlyWeather {
  time: string;
  temperature: number;
  condition: string;
  precipitationChance: number;
  windSpeed: number;
}

interface WeatherForecastProps {
  destination: string;
  startDate?: string;
  endDate?: string;
  isLoading?: boolean;
}

export function WeatherForecast({
  destination,
  startDate,
  endDate,
  isLoading: isLoadingProp,
}: WeatherForecastProps) {
  const lastNotificationKeyRef = useRef<string>("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["weatherForecast", destination, startDate, endDate],
    queryFn: async () => {
      if (!destination || !startDate || !endDate) return null;
      const params = new URLSearchParams({
        destination,
        startDate,
        endDate,
      });
      const res = await fetch(`/api/weather/forecast?${params}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      return res.json();
    },
    enabled: !!destination && !!startDate && !!endDate,
  });

  const forecasts = data?.forecast || [];
  const isLoaderActive = isLoading || isLoadingProp;

  useEffect(() => {
    if (!forecasts.length || !destination || !startDate || !endDate) {
      return;
    }

    const notificationKey = `${destination}-${startDate}-${endDate}-${forecasts
      .map((forecast: WeatherForecast) => `${forecast.date}:${forecast.alerts?.length || 0}`)
      .join('|')}`;

    if (lastNotificationKeyRef.current === notificationKey) {
      return;
    }

    lastNotificationKeyRef.current = notificationKey;

    forecasts.forEach((forecast: WeatherForecast) => {
      const severeAlerts = (forecast.alerts || []).filter((alert) => alert.severity !== 'low');

      severeAlerts.forEach((alert) => {
        notify({
          title: `${forecast.location} weather alert`,
          description: `${forecast.date}: ${alert.message}`,
          type: 'weather',
        });
      });
    });
  }, [destination, endDate, forecasts, startDate]);

  if (!destination || !startDate || !endDate) {
    return null;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to fetch weather forecast. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("sunny") || lower.includes("clear")) {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    }
    if (lower.includes("rain")) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    }
    if (lower.includes("cloudy")) {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    }
    return <Cloud className="h-8 w-8 text-gray-400" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500 bg-red-50";
      case "medium":
        return "border-yellow-500 bg-yellow-50";
      case "low":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-200 text-red-800";
      case "medium":
        return "bg-yellow-200 text-yellow-800";
      case "low":
        return "bg-blue-200 text-blue-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const formatForecastDate = (dateValue: string) => {
    const parsedDate = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      return dateValue;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {isLoaderActive ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="inline-block animate-spin">
                <Cloud className="h-8 w-8 text-orange-500" />
              </div>
              <p className="mt-2 text-sm text-gray-600">Loading weather forecast...</p>
            </CardContent>
          </Card>
        ) : forecasts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-gray-600">No weather data available for these dates.</p>
            </CardContent>
          </Card>
        ) : (
          forecasts.map((forecast: WeatherForecast, idx: number) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {formatForecastDate(forecast.date)}
                    </CardTitle>
                    <CardDescription className="capitalize">{forecast.condition}</CardDescription>
                  </div>
                  <div className="text-right">
                    {getWeatherIcon(forecast.condition)}
                    <div className="mt-2 text-sm font-semibold">
                      {Math.round(forecast.temperature.max)}°
                    </div>
                    <div className="text-xs text-gray-600">
                      {Math.round(forecast.temperature.min)}°
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Weather metrics */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="flex items-center space-x-2 rounded bg-gray-50 p-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-600">Humidity</div>
                      <div className="text-sm font-semibold">{forecast.humidity}%</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded bg-gray-50 p-2">
                    <Wind className="h-4 w-4 text-teal-500" />
                    <div>
                      <div className="text-xs text-gray-600">Wind</div>
                      <div className="text-sm font-semibold">{forecast.windSpeed} m/s</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded bg-gray-50 p-2">
                    <CloudRain className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="text-xs text-gray-600">Rain</div>
                      <div className="text-sm font-semibold">{forecast.precipitationChance}%</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded bg-gray-50 p-2">
                    <Eye className="h-4 w-4 text-indigo-500" />
                    <div>
                      <div className="text-xs text-gray-600">Temp</div>
                      <div className="text-sm font-semibold">
                        {Math.round(forecast.temperature.max - forecast.temperature.min)}° range
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather alerts */}
                {forecast.alerts && forecast.alerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">⚠️ Weather Alerts</h4>
                    {forecast.alerts.map((alert, alertIdx) => (
                      <Alert key={alertIdx} className={`${getSeverityColor(alert.severity)}`}>
                        <AlertCircle className="h-4 w-4" />
                        <div className="flex items-start justify-between gap-2">
                          <AlertDescription className="text-sm">{alert.message}</AlertDescription>
                          <span
                            className={`whitespace-nowrap rounded px-2 py-1 text-xs font-semibold ${getSeverityBadge(
                              alert.severity
                            )}`}
                          >
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </span>
                        </div>
                      </Alert>
                    ))}
                  </div>
                )}

                {/* Hourly forecast */}
                {forecast.hourlyForecast && forecast.hourlyForecast.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-gray-900">Hourly Forecast</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {forecast.hourlyForecast.slice(0, 8).map((hour, hourIdx) => (
                        <div
                          key={hourIdx}
                          className="flex min-w-[80px] flex-col items-center rounded bg-gradient-to-b from-orange-50 to-transparent p-2 text-xs"
                        >
                          <span className="font-semibold text-gray-700">{hour.time}</span>
                          <span className="mt-1 text-sm font-bold text-gray-900">
                            {Math.round(hour.temperature)}°
                          </span>
                          <span className="capitalize text-gray-600">{hour.condition}</span>
                          <span className="mt-1 text-xs text-blue-600">
                            {hour.precipitationChance}% rain
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity recommendations based on weather */}
                {forecast.condition.toLowerCase().includes("rain") && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800">
                      💡 <strong>Rainy day tip:</strong> Consider visiting museums, temples, covered
                      markets, or enjoying local cuisine indoors.
                    </AlertDescription>
                  </Alert>
                )}

                {forecast.temperature.max > 38 && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-sm text-orange-800">
                      💡 <strong>Hot weather tip:</strong> Plan indoor activities during peak hours
                      (11 AM - 4 PM). Stay hydrated and use SPF protection.
                    </AlertDescription>
                  </Alert>
                )}

                {forecast.condition.toLowerCase().includes("sunny") && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-sm text-yellow-800">
                      💡 <strong>Perfect weather tip:</strong> Great day for outdoor activities,
                      sightseeing, and beach visits. Don't forget sunscreen!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
