import { useState, useCallback, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { EnrichedItineraryDay, ItineraryDay, Activity, EnrichedPlace } from "@shared/schema";

interface UseEnrichedItineraryOptions {
  destination?: string;
  autoEnrich?: boolean;
}

export function useEnrichedItinerary(options: UseEnrichedItineraryOptions = {}) {
  const { destination, autoEnrich = false } = options;

  const [enrichedDays, setEnrichedDays] = useState<EnrichedItineraryDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  /**
   * Enrich an itinerary with Google Places data
   */
  const enrichItinerary = useCallback(
    async (days: (ItineraryDay & { activities: Activity[] })[]) => {
      if (!destination) {
        setError("Destination is required");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        console.log(`🌍 Enriching ${days.length} days for ${destination}`);

        const response = await apiRequest(
          "POST",
          "/api/places/enrich-itinerary",
          {
            days,
            destination,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to enrich itinerary");
        }

        const data = await response.json();
        setEnrichedDays(data.enrichedDays || []);
        setProgress(100);

        console.log("✅ Itinerary enriched successfully");
      } catch (err: any) {
        const errorMsg = err.message || "Failed to enrich itinerary";
        console.error("❌ Enrichment error:", err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [destination]
  );

  /**
   * Validate itinerary and get validation results
   */
  const validateItinerary = useCallback(
    async (days: (ItineraryDay & { activities: Activity[] })[]) => {
      if (!destination) {
        setError("Destination is required");
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiRequest(
          "POST",
          "/api/places/validate-itinerary",
          {
            days,
            destination,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to validate itinerary");
        }

        const data = await response.json();
        return data.validationResults || [];
      } catch (err: any) {
        console.error("Validation error:", err);
        setError(err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [destination]
  );

  /**
   * Enrich a single activity
   */
  const enrichActivity = useCallback(async (activity: Activity) => {
    try {
      const response = await apiRequest(
        "POST",
        "/api/places/enrich-activity",
        {
          activity,
          destination,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to enrich activity");
      }

      return await response.json();
    } catch (err: any) {
      console.error("Activity enrichment error:", err);
      return activity;
    }
  }, [destination]);

  /**
   * Get place details
   */
  const getPlaceDetails = useCallback(async (placeId: string) => {
    try {
      const response = await apiRequest("GET", `/api/places/details/${placeId}`);

      if (!response.ok) {
        throw new Error("Failed to get place details");
      }

      return (await response.json()) as EnrichedPlace;
    } catch (err: any) {
      console.error("Get place details error:", err);
      return null;
    }
  }, []);

  /**
   * Clear enriched data
   */
  const clear = useCallback(() => {
    setEnrichedDays([]);
    setError(null);
    setProgress(0);
  }, []);

  return {
    enrichedDays,
    loading,
    error,
    progress,
    enrichItinerary,
    validateItinerary,
    enrichActivity,
    getPlaceDetails,
    clear,
  };
}

/**
 * Hook to search for restaurants
 */
export function useRestaurantSearch() {
  const [restaurants, setRestaurants] = useState<EnrichedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRestaurants = useCallback(
    async (
      destination: string,
      cuisine?: string,
      budget?: "low" | "medium" | "high"
    ) => {
      try {
        setLoading(true);
        setError(null);

        console.log(`🍽️ Searching for restaurants in ${destination}`);

        const response = await apiRequest(
          "POST",
          "/api/places/search-restaurants",
          {
            destination,
            cuisine,
            budget,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to search restaurants");
        }

        const data = await response.json();
        setRestaurants(data.restaurants || []);

        console.log(`✅ Found ${data.restaurants?.length || 0} restaurants`);
      } catch (err: any) {
        console.error("Restaurant search error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setRestaurants([]);
    setError(null);
  }, []);

  return {
    restaurants,
    loading,
    error,
    searchRestaurants,
    clear,
  };
}
