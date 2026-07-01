import fetch from "node-fetch";

export interface RouteLocation {
  latitude: number;
  longitude: number;
}

export interface Distance {
  value: number; // in meters
  text: string; // human readable
}

export interface Duration {
  value: number; // in seconds
  text: string; // human readable
}

export interface RouteElement {
  distance: Distance;
  duration: Duration;
  status: string;
}

export interface RouteInfo {
  distance: Distance;
  duration: Duration;
  distanceMeters?: number;
  durationSeconds?: number;
  route?: Array<{
    startLocation: RouteLocation;
    endLocation: RouteLocation;
  }>;
}

export class GoogleRoutesService {
  private apiKey: string;
  private distanceMatrixUrl =
    "https://maps.googleapis.com/maps/api/distancematrix/json";
  private routesUrl = "https://routes.googleapis.com/directions/v2:computeRoutes";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_MAPS_API_KEY || "";
    if (!this.apiKey) {
      console.warn("⚠️ GOOGLE_MAPS_API_KEY is not configured for Routes");
    }
  }

  /**
   * Get travel time and distance between two locations using Distance Matrix API
   */
  async getDistance(
    origin: RouteLocation,
    destination: RouteLocation,
    mode: "driving" | "walking" | "transit" = "driving"
  ): Promise<RouteElement | null> {
    try {
      if (!this.apiKey) {
        console.warn("Cannot calculate distance: API key not configured");
        return null;
      }

      const originStr = `${origin.latitude},${origin.longitude}`;
      const destStr = `${destination.latitude},${destination.longitude}`;

      console.log(`🛣️ Calculating ${mode} route from ${originStr} to ${destStr}`);

      const url = new URL(this.distanceMatrixUrl);
      url.searchParams.append("origins", originStr);
      url.searchParams.append("destinations", destStr);
      url.searchParams.append("mode", mode);
      url.searchParams.append("key", this.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        console.error(`❌ Distance Matrix API error: ${response.status}`);
        return null;
      }

      const data: any = await response.json();

      if (data.rows?.[0]?.elements?.[0]?.status === "OK") {
        const element = data.rows[0].elements[0];
        console.log(
          `✅ Route: ${element.distance.text} (${element.duration.text})`
        );
        return element;
      }

      console.warn(`⚠️ Could not calculate route: ${data.status}`);
      return null;
    } catch (error) {
      console.error("Error calculating distance:", error);
      return null;
    }
  }

  /**
   * Calculate travel time between multiple waypoints
   */
  async getRouteInfo(waypoints: RouteLocation[]): Promise<RouteInfo | null> {
    try {
      if (waypoints.length < 2) {
        console.warn("At least 2 waypoints required");
        return null;
      }

      const origin = waypoints[0];
      const destination = waypoints[waypoints.length - 1];

      const routeElement = await this.getDistance(origin, destination);

      if (!routeElement) {
        return null;
      }

      return {
        distance: routeElement.distance,
        duration: routeElement.duration,
        distanceMeters: routeElement.distance.value,
        durationSeconds: routeElement.duration.value,
        route: waypoints.map((point, idx) => ({
          startLocation: point,
          endLocation: waypoints[idx + 1] || point,
        })),
      };
    } catch (error) {
      console.error("Error getting route info:", error);
      return null;
    }
  }

  /**
   * Convert time in seconds to human-readable format
   */
  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)} secs`;
    }
    if (seconds < 3600) {
      const mins = Math.round(seconds / 60);
      return `${mins} min${mins > 1 ? "s" : ""}`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    if (mins === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""} ${mins} min${mins > 1 ? "s" : ""}`;
  }

  /**
   * Convert distance in meters to human-readable format
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  }

  /**
   * Calculate travel time between activity locations in itinerary
   */
  async calculateItineraryTravelTimes(
    itineraryDays: Array<{
      dayNumber: number;
      activities: Array<{
        title: string;
        location?: {
          lat: number;
          lng: number;
        };
      }>;
    }>
  ): Promise<any[]> {
    try {
      const enrichedDays = [];

      for (const day of itineraryDays) {
        const enrichedActivities = [];

        for (let i = 0; i < day.activities.length; i++) {
          const activity = day.activities[i];
          const nextActivity = day.activities[i + 1];

          let travelInfo = null;

          if (activity.location && nextActivity?.location) {
            const routeElement = await this.getDistance(
              {
                latitude: activity.location.lat,
                longitude: activity.location.lng,
              },
              {
                latitude: nextActivity.location.lat,
                longitude: nextActivity.location.lng,
              }
            );

            if (routeElement) {
              travelInfo = {
                toNextActivity: {
                  distance: routeElement.distance.text,
                  duration: routeElement.duration.text,
                  distanceValue: routeElement.distance.value,
                  durationValue: routeElement.duration.value,
                },
              };
            }
          }

          enrichedActivities.push({
            ...activity,
            travelInfo,
          });
        }

        enrichedDays.push({
          ...day,
          activities: enrichedActivities,
        });
      }

      return enrichedDays;
    } catch (error) {
      console.error("Error calculating itinerary travel times:", error);
      return itineraryDays;
    }
  }
}

// Export singleton instance
export const googleRoutesService = new GoogleRoutesService();
