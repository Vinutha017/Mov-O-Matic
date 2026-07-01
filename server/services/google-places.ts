import fetch from "node-fetch";

export interface PlaceLocation {
  lat: number;
  lng: number;
}

export interface PlacePhoto {
  name: string;
  height: number;
  width: number;
  authorAttributions?: Array<{
    displayName: string;
    uri?: string;
  }>;
}

export interface OpeningPeriod {
  open: {
    day: number;
    hour: number;
    minute: number;
  };
  close?: {
    day: number;
    hour: number;
    minute: number;
  };
}

export interface EnrichedPlace {
  name: string;
  address: string;
  placeId: string;
  location: PlaceLocation;
  rating?: number;
  totalRatings?: number;
  priceLevel?: string;
  openingHours?: OpeningPeriod[];
  websiteUri?: string;
  mapsUri?: string;
  phoneNumber?: string;
  photos?: PlacePhoto[];
  businessStatus?: string;
  types?: string[];
  formattedAddress?: string;
  displayName?: {
    text: string;
    languageCode: string;
  };
}

export interface TextSearchResult {
  places: EnrichedPlace[];
  approximateCount?: number;
}

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = "https://places.googleapis.com/v1/places:searchText";
  private getPlaceUrl = "https://places.googleapis.com/v1/places";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_PLACES_API_KEY || "";
    if (!this.apiKey) {
      console.warn("⚠️ GOOGLE_PLACES_API_KEY is not configured");
    }
  }

  /**
   * Search for places using text query
   */
  async searchPlaces(query: string, location?: string): Promise<TextSearchResult> {
    try {
      if (!this.apiKey) {
        throw new Error("Google Places API key not configured");
      }

      console.log(`🔍 Searching for: "${query}"${location ? ` near ${location}` : ""}`);

      const searchQuery = location ? `${query} ${location}` : query;

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
        },
        body: JSON.stringify({
          textQuery: searchQuery,
          maxResultCount: 5,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Google Places API error: ${response.status} - ${error}`);
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data: any = await response.json();
      
      console.log(`✅ Found ${data.places?.length || 0} places for "${query}"`);

      return {
        places: (data.places || []).map((place: any) => this.transformPlace(place)),
        approximateCount: data.approximateCount,
      };
    } catch (error) {
      console.error("❌ Error searching places:", error);
      throw error;
    }
  }

  /**
   * Get detailed information about a place
   */
  async getPlaceDetails(placeId: string): Promise<EnrichedPlace> {
    try {
      if (!this.apiKey) {
        throw new Error("Google Places API key not configured");
      }

      console.log(`📍 Fetching details for place: ${placeId}`);

      const response = await fetch(`${this.getPlaceUrl}/${placeId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Failed to get place details: ${response.status}`);
        throw new Error(`Failed to get place details: ${response.status}`);
      }

      const place: any = await response.json();
      console.log(`✅ Retrieved details for: ${place.displayName?.text}`);

      return this.transformPlace(place);
    } catch (error) {
      console.error("❌ Error getting place details:", error);
      throw error;
    }
  }

  /**
   * Search for restaurants by location and cuisine
   */
  async searchRestaurants(
    destination: string,
    cuisine?: string,
    budget?: "low" | "medium" | "high"
  ): Promise<TextSearchResult> {
    try {
      let query = `restaurants in ${destination}`;

      if (cuisine) {
        query = `${cuisine} restaurants in ${destination}`;
      }

      // Add budget filter if specified
      if (budget === "low") {
        query += " budget friendly";
      } else if (budget === "high") {
        query += " fine dining";
      }

      console.log(`🍽️ Searching restaurants: ${query}`);

      return await this.searchPlaces(query);
    } catch (error) {
      console.error("❌ Error searching restaurants:", error);
      throw error;
    }
  }

  /**
   * Search for hotels
   */
  async searchHotels(destination: string, hotelType?: string): Promise<TextSearchResult> {
    try {
      let query = `hotels in ${destination}`;

      if (hotelType) {
        query = `${hotelType} hotels in ${destination}`;
      }

      console.log(`🏨 Searching hotels: ${query}`);

      return await this.searchPlaces(query);
    } catch (error) {
      console.error("❌ Error searching hotels:", error);
      throw error;
    }
  }

  /**
   * Search for attractions/tourist places
   */
  async searchAttractions(destination: string, type?: string): Promise<TextSearchResult> {
    try {
      let query = `tourist attractions in ${destination}`;

      if (type) {
        query = `${type} in ${destination}`;
      }

      console.log(`🎯 Searching attractions: ${query}`);

      return await this.searchPlaces(query);
    } catch (error) {
      console.error("❌ Error searching attractions:", error);
      throw error;
    }
  }

  /**
   * Transform Google Places API response to our format
   */
  private transformPlace(place: any): EnrichedPlace {
    return {
      name: place.displayName?.text || place.name || "Unknown",
      address: place.formattedAddress || place.address || "",
      placeId: place.id || place.place_id || "",
      location: {
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0,
      },
      rating: place.rating,
      totalRatings: place.userRatingCount,
      priceLevel: place.priceLevel,
      openingHours: place.currentOpeningHours?.weekdayDescriptions
        ? this.parseOpeningHours(place.currentOpeningHours)
        : undefined,
      websiteUri: place.websiteUri || place.website,
      mapsUri: place.googleMapsUri || place.url,
      phoneNumber: place.internationalPhoneNumber || place.phone_number,
      photos: place.photos,
      businessStatus: place.businessStatus,
      types: place.types,
      formattedAddress: place.formattedAddress,
      displayName: place.displayName,
    };
  }

  /**
   * Parse opening hours from Google's format
   */
  private parseOpeningHours(openingHours: any): OpeningPeriod[] {
    try {
      if (openingHours.periods) {
        return openingHours.periods;
      }
      return [];
    } catch (error) {
      console.warn("Failed to parse opening hours:", error);
      return [];
    }
  }

  /**
   * Get photo URL from place photo
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://lh3.googleusercontent.com/a/${photoReference}=w${maxWidth}-h${maxWidth}`;
  }

  /**
   * Validate if a place exists (best match)
   */
  async validatePlace(placeName: string, destination: string): Promise<EnrichedPlace | null> {
    try {
      const results = await this.searchPlaces(`${placeName} near ${destination}`);

      if (results.places.length > 0) {
        console.log(`✅ Validated: "${placeName}" exists as "${results.places[0].name}"`);
        return results.places[0];
      }

      console.warn(`⚠️ Could not validate place: "${placeName}" in ${destination}`);
      return null;
    } catch (error) {
      console.error("Error validating place:", error);
      return null;
    }
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();
