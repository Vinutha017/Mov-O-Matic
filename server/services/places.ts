import type { Activity, Hotel } from "@shared/schema";

type PlaceGeometry = {
  location?: {
    lat?: number;
    lng?: number;
  };
};

type GooglePlaceResult = {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  rating?: number;
  price_level?: number;
  types?: string[];
  geometry?: PlaceGeometry;
  photos?: Array<{ photo_reference?: string }>;
};

type PlacesApiResponse = {
  results?: GooglePlaceResult[];
};

type FetchOptions = {
  limit?: number;
  interests?: string[];
  foodPreferences?: string[];
  budget?: number;
  travelStyle?: string;
};

function getMapsApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  return key ? key.trim() : "";
}

function photoUrl(photoReference?: string): string | null {
  const key = getMapsApiKey();
  if (!key || !photoReference) return null;
  const url = new URL("https://maps.googleapis.com/maps/api/place/photo");
  url.searchParams.set("maxwidth", "1280");
  url.searchParams.set("photoreference", photoReference);
  url.searchParams.set("key", key);
  return url.toString();
}

function compactLocation(address: string | undefined, fallback: string): string {
  if (!address) return fallback;
  return address.split(",").slice(0, 2).join(",").trim() || fallback;
}

function parseCoordinates(place: GooglePlaceResult): { lat: number; lng: number } | null {
  const lat = place.geometry?.location?.lat;
  const lng = place.geometry?.location?.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return { lat, lng };
}

async function searchPlaces(query: string, limit = 10): Promise<GooglePlaceResult[]> {
  const key = getMapsApiKey();
  if (!key) {
    console.warn("GOOGLE_MAPS_API_KEY is not configured; returning empty Places results");
    return [];
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", query);
    url.searchParams.set("key", key);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.warn(`Places API failed (${response.status}) for query: ${query}`);
      return [];
    }

    const payload = (await response.json()) as PlacesApiResponse;
    if (!Array.isArray(payload.results)) {
      return [];
    }

    return payload.results.slice(0, limit);
  } catch (error) {
    console.warn("Places API request failed:", error);
    return [];
  }
}

function toHotel(place: GooglePlaceResult, index: number, destination: string, budget = 6000): Hotel {
  const coordinates = parseCoordinates(place);
  const rating = typeof place.rating === "number" ? String(place.rating) : "4.0";
  const priceLevel = typeof place.price_level === "number" ? place.price_level : 2;
  const pricePerNight = String(Math.max(1200, Math.round((budget || 6000) * (0.22 + priceLevel * 0.07))));
  const image = photoUrl(place.photos?.[0]?.photo_reference);

  return {
    id: place.place_id || `places-hotel-${index + 1}`,
    name: place.name || `Hotel ${index + 1} in ${destination}`,
    location: compactLocation(place.formatted_address, destination),
    address: place.formatted_address || null,
    coordinates,
    rating,
    pricePerNight,
    currency: "INR",
    amenities: ["WiFi", "Restaurant"],
    images: image ? [image] : null,
    description: `Real hotel listing in ${destination}`,
    aiInsight: "Selected from live Google Places results based on your destination and preferences",
    bookingUrl: null,
  };
}

function toActivity(
  place: GooglePlaceResult,
  index: number,
  destination: string,
  category: "attraction" | "restaurant" | "culture",
): Activity {
  const coordinates = parseCoordinates(place);
  const ratingText = typeof place.rating === "number" ? `Rating: ${place.rating}/5` : "Rating: N/A";
  const photo = photoUrl(place.photos?.[0]?.photo_reference);
  const photoText = photo ? `Photo: ${photo}` : "Photo: N/A";

  return {
    id: place.place_id || `places-${category}-${index + 1}`,
    dayId: "",
    title: place.name || `${destination} ${category}`,
    description: `Real ${category} result in ${destination}`,
    location: compactLocation(place.formatted_address, destination),
    address: place.formatted_address || null,
    coordinates,
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
  const budget = options.budget || 6000;
  const style = options.travelStyle ? `${options.travelStyle} ` : "";
  const query = `${style}hotels in ${destination}`;
  const results = await searchPlaces(query, options.limit || 8);
  return results.slice(0, options.limit || 3).map((place, index) => toHotel(place, index, destination, budget));
}

export async function fetchAttractions(destination: string, options: FetchOptions = {}): Promise<Activity[]> {
  const tags = options.interests && options.interests.length > 0
    ? options.interests
    : ["tourist attractions", "heritage sites", "local experiences"];

  const combined: GooglePlaceResult[] = [];
  const seen = new Set<string>();

  for (const tag of tags.slice(0, 3)) {
    const results = await searchPlaces(`${tag} in ${destination}`, 10);
    for (const place of results) {
      const key = place.place_id || place.name;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      combined.push(place);
    }
  }

  return combined
    .slice(0, options.limit || 10)
    .map((place, index) => {
      const types = Array.isArray(place.types) ? place.types.join(" ") : "";
      const category: "attraction" | "restaurant" | "culture" =
        /museum|art_gallery|temple|church|mosque|historic/i.test(types) ? "culture" : "attraction";
      return toActivity(place, index, destination, category);
    });
}

export async function fetchRestaurants(destination: string, options: FetchOptions = {}): Promise<Activity[]> {
  const foodHints = options.foodPreferences && options.foodPreferences.length > 0
    ? options.foodPreferences.slice(0, 3).join(" ") + " "
    : "";

  const query = `${foodHints}restaurants in ${destination}`;
  const results = await searchPlaces(query, options.limit || 10);
  return results
    .slice(0, options.limit || 8)
    .map((place, index) => toActivity(place, index, destination, "restaurant"));
}
