import axios from "axios";
import type { Activity, Hotel } from "@shared/schema";

type GooglePlacePhoto = {
  name?: string;
};

type GooglePlacesV1Place = {
  id?: string;
  displayName?: {
    text?: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  rating?: number;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  photos?: GooglePlacePhoto[];
};

type PlacesV1SearchResponse = {
  places?: GooglePlacesV1Place[];
};

type NormalizedPlace = {
  id: string;
  name: string;
  address: string | null;
  rating: string;
  coordinates: { lat: number; lng: number } | null;
  images: string[];
};

type FetchOptions = {
  limit?: number;
  interests?: string[];
  foodPreferences?: string[];
  budget?: number;
  travelStyle?: string;
};

function getMapsApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY
    || process.env.GOOGLE_MAPS_API_KEY
    || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) {
    console.warn("GOOGLE_MAPS_API_KEY is missing. Places API requests will return empty arrays.");
  } else if (!process.env.GOOGLE_PLACES_API_KEY && process.env.VITE_GOOGLE_MAPS_API_KEY) {
    console.warn("Using VITE_GOOGLE_MAPS_API_KEY on server. For Railway, set GOOGLE_PLACES_API_KEY to a server-side API key.");
  }
  return key ? key.trim() : "";
}

function photoUrl(photoName?: string): string | null {
  const key = getMapsApiKey();
  if (!key || !photoName) return null;
  const url = new URL(`https://places.googleapis.com/v1/${photoName}/media`);
  url.searchParams.set("maxHeightPx", "900");
  url.searchParams.set("key", key);
  return url.toString();
}

function logApiRequest(label: string, body: unknown) {
  try {
    console.log(`[Places][REQUEST] ${label} body:`, JSON.stringify(body, null, 2));
  } catch (e) {
    console.warn(`[Places][REQUEST] ${label} -> <request body logging failed>`);
  }
}

function mockHotels(destination: string, limit = 2): Hotel[] {
  return Array.from({ length: limit }, (_, i) => ({
    id: `fallback-hotel-${i + 1}`,
    name: `Fallback Hotel ${i + 1} - ${destination}`,
    location: destination,
    address: null,
    coordinates: null,
    rating: "4.2",
    pricePerNight: String(2000 + i * 500),
    currency: "INR",
    amenities: ["WiFi", "Breakfast"],
    images: null,
    description: `Fallback hotel listing for ${destination}`,
    aiInsight: "Fallback data; Google Places returned no results",
    bookingUrl: null,
  } as unknown) as Hotel);
}

function mockActivities(destination: string, category: "attraction" | "restaurant" | "culture", limit = 3): Activity[] {
  return Array.from({ length: limit }, (_, i) => ({
    id: `fallback-${category}-${i + 1}`,
    dayId: "",
    title: `${category[0].toUpperCase() + category.slice(1)} ${i + 1} in ${destination}`,
    description: `Fallback ${category} for ${destination}`,
    location: destination,
    address: null,
    coordinates: null,
    startTime: null,
    endTime: null,
    duration: category === "restaurant" ? 75 : 120,
    cost: null,
    category,
    priority: 1,
    bookingUrl: null,
    notes: "Fallback data; Google Places returned no results",
    sortOrder: i,
  } as unknown) as Activity);
}

function compactLocation(address: string | undefined, fallback: string): string {
  if (!address) return fallback;
  return address.split(",").slice(0, 2).join(",").trim() || fallback;
}

function normalizePlace(place: GooglePlacesV1Place, fallbackId: string): NormalizedPlace {
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  const coordinates = typeof lat === "number" && typeof lng === "number"
    ? { lat, lng }
    : null;
  const images = (Array.isArray(place.photos) ? place.photos : [])
    .map((photo) => photoUrl(photo.name))
    .filter((url): url is string => Boolean(url));

  return {
    id: place.id || fallbackId,
    name: place.displayName?.text || "Unknown Place",
    address: place.formattedAddress || null,
    rating: typeof place.rating === "number" ? String(place.rating) : "4.0",
    coordinates,
    images,
  };
}

// Reusable Places search helper using the new v1 Text Search endpoint.
export async function searchPlaces(query: string, limit = 10): Promise<NormalizedPlace[]> {
  const key = getMapsApiKey();
  if (!key) return [];
  const body = { textQuery: query };
  const fieldMask = [
    "places.displayName",
    "places.formattedAddress",
    "places.rating",
    "places.location",
    "places.photos",
    "places.id",
  ].join(",");

  try {
    logApiRequest("places:searchText", body);
    const response = await axios.post<PlacesV1SearchResponse>(
      "https://places.googleapis.com/v1/places:searchText",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": fieldMask,
        },
        timeout: 20000,
      },
    );

    console.log("[Places][searchText] response status:", response.status);
    console.log("[Places][searchText] full Google response:", JSON.stringify(response.data, null, 2));

    const places = Array.isArray(response.data?.places) ? response.data.places : [];
    console.log(`[Places][searchText] places count for query=\"${query}\":`, places.length);

    return places.slice(0, limit).map((place, index) => normalizePlace(place, `places-${query}-${index + 1}`));
  } catch (error: any) {
    console.error("[Places][searchText] error for query:", query);
    if (error?.response) {
      console.error("[Places][searchText] error status:", error.response.status);
      console.error("[Places][searchText] exact Google error response:", JSON.stringify(error.response.data, null, 2));
      console.error("[Places][searchText] error headers:", JSON.stringify(error.response.headers, null, 2));
      if (error.response.status === 403) {
        console.error("[Places][searchText] PERMISSION_DENIED: verify server key restrictions, billing, and Places API (New) access for this project.");
      }
    }
    console.error("[Places][searchText] error details:", error?.message || error);
    throw error;
  }
}

async function searchPlacesWithFallbacks(queries: string[], limit = 10): Promise<NormalizedPlace[]> {
  const seen = new Set<string>();
  const combined: NormalizedPlace[] = [];
  let lastError: unknown = null;

  for (const query of queries) {
    try {
      const results = await searchPlaces(query, limit);
      for (const place of results) {
        const dedupeKey = place.id || place.name;
        if (!dedupeKey || seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        combined.push(place);
        if (combined.length >= limit) {
          return combined;
        }
      }
    } catch (error) {
      lastError = error;
      console.error("[Places][searchText] query failed, trying next fallback query:", query);
    }
  }

  if (combined.length === 0 && lastError) {
    throw lastError;
  }

  return combined;
}

function toHotel(place: NormalizedPlace, index: number, destination: string, budget = 6000): Hotel {
  const base = budget || 6000;
  const pricePerNight = String(Math.max(1200, Math.round(base * 0.28)));

  return {
    id: place.id || `places-hotel-${index + 1}`,
    name: place.name || `Hotel ${index + 1} in ${destination}`,
    location: compactLocation(place.address || undefined, destination),
    address: place.address || null,
    coordinates: place.coordinates,
    rating: place.rating,
    pricePerNight,
    currency: "INR",
    amenities: ["WiFi", "Restaurant"],
    images: place.images,
    description: `Real hotel listing in ${destination}`,
    aiInsight: "Selected from live Google Places results based on your destination and preferences",
    bookingUrl: null,
  };
}

function toActivity(
  place: NormalizedPlace,
  index: number,
  destination: string,
  category: "attraction" | "restaurant" | "culture",
): Activity {
  const ratingText = place.rating ? `Rating: ${place.rating}/5` : "Rating: N/A";
  const photoText = place.images.length > 0 ? `Photo: ${place.images[0]}` : "Photo: N/A";

  return {
    id: place.id || `places-${category}-${index + 1}`,
    dayId: "",
    title: place.name || `${destination} ${category}`,
    description: `Real ${category} result in ${destination}`,
    location: compactLocation(place.address || undefined, destination),
    address: place.address || null,
    coordinates: place.coordinates,
    startTime: null,
    endTime: null,
    duration: category === "restaurant" ? 75 : 120,
    cost: null,
    category,
    priority: 1,
    bookingUrl: null,
    notes: `${ratingText}. ${photoText}`,
    sortOrder: index,
  };
}

export async function fetchHotels(destination: string, options: FetchOptions = {}): Promise<Hotel[]> {
  try {
    const budget = options.budget || 6000;
    const style = options.travelStyle ? `${options.travelStyle} ` : "";
    const places = await searchPlacesWithFallbacks([
      `${style}hotels in ${destination}`,
      `${style}lodging in ${destination}`,
      `${destination} hotels`,
      `${destination} resorts`,
    ], options.limit || 8);

    const mapped = places
      .slice(0, options.limit || 3)
      .map((place, index) => toHotel(place, index, destination, budget));

    console.log("[Places][fetchHotels] transformed hotel data:", JSON.stringify(mapped, null, 2));

    if (mapped.length > 0) {
      return mapped;
    }

    console.warn(`[Places][fetchHotels] no live hotels found for destination=${destination}; returning empty results instead of mock data`);
    return [];
  } catch (error) {
    console.error("[Places][fetchHotels] error:", error);
    console.warn(`[Places][fetchHotels] API failed for destination=${destination}; returning fallback mock hotels`);
    return mockHotels(destination, options.limit || 2);
  }
}

export async function fetchAttractions(destination: string, options: FetchOptions = {}): Promise<Activity[]> {
  try {
    const tags = options.interests && options.interests.length > 0
      ? options.interests
      : ["tourist attractions", "heritage sites", "local experiences"];

    const places = await searchPlacesWithFallbacks([
      `${destination} tourist attractions`,
      `${destination} things to do`,
      `${destination} sightseeing`,
      ...tags.slice(0, 3).map((tag) => `${tag} in ${destination}`),
    ], options.limit || 10);

    const mapped = places
      .slice(0, options.limit || 10)
      .map((place, index) => toActivity(place, index, destination, "attraction"));

    console.log("[Places][fetchAttractions] transformed attractions:", JSON.stringify(mapped, null, 2));

    if (mapped.length > 0) {
      return mapped;
    }

    console.warn(`[Places][fetchAttractions] no live attractions found for destination=${destination}; returning empty results instead of mock data`);
    return [];
  } catch (error) {
    console.error("[Places][fetchAttractions] error:", error);
    console.warn(`[Places][fetchAttractions] API failed for destination=${destination}; returning fallback mock attractions`);
    return mockActivities(destination, "attraction", options.limit || 4);
  }
}

export async function fetchRestaurants(destination: string, options: FetchOptions = {}): Promise<Activity[]> {
  try {
    const foodHints = options.foodPreferences && options.foodPreferences.length > 0
      ? options.foodPreferences.slice(0, 3).join(" ") + " "
      : "";

    const places = await searchPlacesWithFallbacks([
      `${foodHints}restaurants in ${destination}`,
      `${destination} restaurants`,
      `${destination} cafes`,
      `${destination} eateries`,
    ], options.limit || 10);

    const mapped = places
      .slice(0, options.limit || 8)
      .map((place, index) => toActivity(place, index, destination, "restaurant"));

    console.log("[Places][fetchRestaurants] transformed restaurants:", JSON.stringify(mapped, null, 2));

    if (mapped.length > 0) {
      return mapped;
    }

    console.warn(`[Places][fetchRestaurants] no live restaurants found for destination=${destination}; returning empty results instead of mock data`);
    return [];
  } catch (error) {
    console.error("[Places][fetchRestaurants] error:", error);
    console.warn(`[Places][fetchRestaurants] API failed for destination=${destination}; returning fallback mock restaurants`);
    return mockActivities(destination, "restaurant", options.limit || 3);
  }
}
