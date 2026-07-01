import { googlePlacesService, type EnrichedPlace } from "./google-places";
import { googleRoutesService } from "./google-routes";
import { cacheService } from "./cache";
import type {
  Activity,
  EnrichedActivity,
  PlaceValidationResult,
  EnrichedItineraryDay,
  ItineraryDay,
} from "@shared/schema";

export class PlaceEnrichmentService {
  /**
   * Enrich a single activity with Google Places data
   */
  async enrichActivity(
    activity: Activity,
    destination: string,
    maxCacheAge?: number
  ): Promise<EnrichedActivity> {
    try {
      console.log(`🌍 Enriching activity: "${activity.title}" in ${destination}`);

      // Try to get from cache first
      const cacheKey = `enriched-place:${activity.title}:${destination}`;
      const cached = cacheService.get<EnrichedPlace>(cacheKey);

      let enrichedPlace: EnrichedPlace | null = null;

      if (cached) {
        enrichedPlace = cached;
      } else {
        // Validate and fetch place data
        enrichedPlace = await googlePlacesService.validatePlace(
          activity.title,
          destination
        );

        if (enrichedPlace) {
          cacheService.set(cacheKey, enrichedPlace, maxCacheAge || 1440); // Cache for 24 hours
        }
      }

      return {
        ...activity,
        enrichedPlace: enrichedPlace || undefined,
      };
    } catch (error) {
      console.error(`❌ Error enriching activity "${activity.title}":`, error);
      // Return original activity on error
      return activity;
    }
  }

  /**
   * Enrich a restaurant with Google Places data
   */
  async enrichRestaurant(
    name: string,
    destination: string,
    cuisine?: string
  ): Promise<EnrichedPlace | null> {
    try {
      console.log(`🍽️ Enriching restaurant: "${name}" in ${destination}`);

      const cacheKey = `restaurant:${name}:${destination}:${cuisine || "any"}`;
      const cached = cacheService.get<EnrichedPlace>(cacheKey);

      if (cached) {
        return cached;
      }

      let query = `${name} restaurant`;
      if (cuisine) {
        query = `${cuisine} ${query}`;
      }
      query += ` in ${destination}`;

      const results = await googlePlacesService.searchPlaces(query);

      if (results.places.length > 0) {
        const bestMatch = results.places[0];
        cacheService.set(cacheKey, bestMatch, 1440); // Cache for 24 hours
        return bestMatch;
      }

      console.warn(
        `⚠️ No restaurant found for: "${name}" in ${destination}`
      );
      return null;
    } catch (error) {
      console.error(`❌ Error enriching restaurant "${name}":`, error);
      return null;
    }
  }

  /**
   * Enrich a hotel with Google Places data
   */
  async enrichHotel(
    name: string,
    destination: string
  ): Promise<EnrichedPlace | null> {
    try {
      console.log(`🏨 Enriching hotel: "${name}" in ${destination}`);

      const cacheKey = `hotel:${name}:${destination}`;
      const cached = cacheService.get<EnrichedPlace>(cacheKey);

      if (cached) {
        return cached;
      }

      const results = await googlePlacesService.searchHotels(destination, name);

      if (results.places.length > 0) {
        const bestMatch = results.places[0];
        cacheService.set(cacheKey, bestMatch, 1440);
        return bestMatch;
      }

      console.warn(`⚠️ No hotel found for: "${name}" in ${destination}`);
      return null;
    } catch (error) {
      console.error(`❌ Error enriching hotel "${name}":`, error);
      return null;
    }
  }

  /**
   * Enrich an entire day's itinerary
   */
  async enrichItineraryDay(
    day: ItineraryDay & { activities: Activity[] },
    destination: string
  ): Promise<EnrichedItineraryDay> {
    try {
      console.log(`📅 Enriching day ${day.dayNumber} with ${day.activities.length} activities`);

      const enrichedActivities: EnrichedActivity[] = [];

      for (let i = 0; i < day.activities.length; i++) {
        const activity = day.activities[i];
        const enrichedActivity = await this.enrichActivity(
          activity,
          destination
        );

        // Add travel info to next activity if available
        if (
          i < day.activities.length - 1 &&
          enrichedActivity.enrichedPlace?.location &&
          day.activities[i + 1]
        ) {
          const nextEnriched = await this.enrichActivity(
            day.activities[i + 1],
            destination
          );

          if (nextEnriched.enrichedPlace?.location) {
            const route = await googleRoutesService.getDistance(
              enrichedActivity.enrichedPlace.location,
              nextEnriched.enrichedPlace.location
            );

            if (route) {
              enrichedActivity.travelInfo = {
                toNextActivity: {
                  distance: route.distance.text,
                  duration: route.duration.text,
                  distanceValue: route.distance.value,
                  durationValue: route.duration.value,
                },
              };
            }
          }
        }

        enrichedActivities.push(enrichedActivity);
      }

      return {
        ...day,
        activities: enrichedActivities,
      };
    } catch (error) {
      console.error(`❌ Error enriching day ${day.dayNumber}:`, error);
      // Return day with original activities on error
      return day;
    }
  }

  /**
   * Enrich multiple days of itinerary
   */
  async enrichItinerary(
    days: (ItineraryDay & { activities: Activity[] })[],
    destination: string
  ): Promise<EnrichedItineraryDay[]> {
    try {
      console.log(`🗓️ Enriching ${days.length} days of itinerary`);

      const enrichedDays: EnrichedItineraryDay[] = [];

      for (const day of days) {
        const enrichedDay = await this.enrichItineraryDay(day, destination);
        enrichedDays.push(enrichedDay);
      }

      console.log(`✅ Enriched ${enrichedDays.length} days successfully`);
      return enrichedDays;
    } catch (error) {
      console.error("❌ Error enriching itinerary:", error);
      throw error;
    }
  }

  /**
   * Validate all activities in an itinerary and return results
   */
  async validateItinerary(
    days: (ItineraryDay & { activities: Activity[] })[],
    destination: string
  ): Promise<PlaceValidationResult[]> {
    try {
      const validationResults: PlaceValidationResult[] = [];

      for (const day of days) {
        for (const activity of day.activities) {
          const result = await this.validatePlace(activity, destination);
          validationResults.push(result);
        }
      }

      const validCount = validationResults.filter((r) => r.isValid).length;
      console.log(
        `✅ Validation complete: ${validCount}/${validationResults.length} places verified`
      );

      return validationResults;
    } catch (error) {
      console.error("❌ Error validating itinerary:", error);
      throw error;
    }
  }

  /**
   * Validate a single place
   */
  private async validatePlace(
    activity: Activity,
    destination: string
  ): Promise<PlaceValidationResult> {
    try {
      const enrichedPlace = await googlePlacesService.validatePlace(
        activity.title,
        destination
      );

      return {
        placeName: activity.title,
        destination,
        isValid: !!enrichedPlace,
        originalPlace: activity,
        enrichedPlace: enrichedPlace || undefined,
        matchScore: enrichedPlace ? 1.0 : 0,
      };
    } catch (error) {
      console.error(`Error validating ${activity.title}:`, error);
      return {
        placeName: activity.title,
        destination,
        isValid: false,
        originalPlace: activity,
        matchScore: 0,
      };
    }
  }

  /**
   * Search for restaurants by criteria
   */
  async searchRestaurantsByType(
    destination: string,
    cuisine?: string,
    budget?: "low" | "medium" | "high"
  ): Promise<EnrichedPlace[]> {
    try {
      const cacheKey = `restaurants:${destination}:${cuisine || "any"}:${budget || "any"}`;
      const cached = cacheService.get<EnrichedPlace[]>(cacheKey);

      if (cached) {
        return cached;
      }

      const results = await googlePlacesService.searchRestaurants(
        destination,
        cuisine,
        budget
      );

      cacheService.set(cacheKey, results.places, 1440);
      return results.places;
    } catch (error) {
      console.error("❌ Error searching restaurants:", error);
      return [];
    }
  }

  /**
   * Get detailed information about a place
   */
  async getPlaceDetails(placeId: string): Promise<EnrichedPlace | null> {
    try {
      const cacheKey = `place-details:${placeId}`;
      const cached = cacheService.get<EnrichedPlace>(cacheKey);

      if (cached) {
        return cached;
      }

      const place = await googlePlacesService.getPlaceDetails(placeId);
      cacheService.set(cacheKey, place, 1440);
      return place;
    } catch (error) {
      console.error(`❌ Error getting place details for ${placeId}:`, error);
      return null;
    }
  }

  /**
   * Get cache statistics (for monitoring)
   */
  getCacheStats() {
    return cacheService.getStats();
  }

  /**
   * Clear all enrichment cache
   */
  clearCache() {
    cacheService.clear();
  }
}

// Export singleton instance
export const placeEnrichmentService = new PlaceEnrichmentService();
