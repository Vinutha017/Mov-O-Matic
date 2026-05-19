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
  status?: string;
  error_message?: string;
  candidates?: GooglePlaceResult[];
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
  if (!key) {
    console.warn("GOOGLE_MAPS_API_KEY is missing. Places API requests will return empty arrays.");
  }
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

function buildPhotoUrls(place: GooglePlaceResult): string[] | null {
  const photos = Array.isArray(place.photos) ? place.photos : [];
  const urls = photos
    .map((photo) => photoUrl(photo.photo_reference))
    .filter((url): url is string => Boolean(url));
  return urls.length > 0 ? urls : null;
}

async function fetchPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
  const key = getMapsApiKey();
  if (!key) return null;

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", [
      "place_id",
      "name",
      "formatted_address",
      "rating",
      "price_level",
      "types",
      "geometry",
      "photos",
      "url",
      "opening_hours",
    ].join(","));
    url.searchParams.set("key", key);

    const response = await fetch(url.toString());
    const rawText = await response.text();
    console.log("[Places][details] raw response:", rawText.slice(0, 1000));

    if (!response.ok) {
      console.warn(`[Places][details] HTTP ${response.status} for place_id=${placeId}`);
      return null;
    }

    const payload = JSON.parse(rawText) as PlacesApiResponse & { result?: GooglePlaceResult };
    if (!payload.result) {
      console.warn(`[Places][details] empty result for place_id=${placeId}`);
      return null;
    }

    return payload.result;
  } catch (error) {
    console.warn(`[Places][details] request failed for place_id=${placeId}:`, error);
    return null;
  }
}

async function searchText(query: string, limit = 10): Promise<GooglePlaceResult[]> {
  const key = getMapsApiKey();
  if (!key) return [];

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", query);
    url.searchParams.set("key", key);

    const response = await fetch(url.toString());
    const rawText = await response.text();
    console.log("[Places][textsearch] raw response:", rawText.slice(0, 1200));

    if (!response.ok) {
      console.warn(`[Places][textsearch] HTTP ${response.status} for query="${query}"`);
      return [];
    }

    const payload = JSON.parse(rawText) as PlacesApiResponse;
    if (!Array.isArray(payload.results) || payload.results.length === 0) {
      console.warn(`[Places][textsearch] empty results for query="${query}"`);
      return [];
    }

    return payload.results.slice(0, limit);
  } catch (error) {
    console.warn(`[Places][textsearch] request failed for query="${query}":`, error);
    return [];
  }
}

async function searchNearby(
  lat: number,
  lng: number,
  radius: number,
  type: string,
  keyword?: string,
  limit = 10,
): Promise<GooglePlaceResult[]> {
  const key = getMapsApiKey();
  if (!key) return [];

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(radius));
    url.searchParams.set("type", type);
    if (keyword) url.searchParams.set("keyword", keyword);
    url.searchParams.set("key", key);

    const response = await fetch(url.toString());
    const rawText = await response.text();
    console.log("[Places][nearbysearch] raw response:", rawText.slice(0, 1200));

    if (!response.ok) {
      console.warn(`[Places][nearbysearch] HTTP ${response.status} for type=${type}`);
      return [];
    }

    const payload = JSON.parse(rawText) as PlacesApiResponse;
    if (!Array.isArray(payload.results) || payload.results.length === 0) {
      console.warn(`[Places][nearbysearch] empty results for type=${type}`);
      return [];
    }

    return payload.results.slice(0, limit);
  } catch (error) {
    console.warn(`[Places][nearbysearch] request failed for type=${type}:`, error);
    return [];
  }
}

async function getDestinationAnchor(destination: string): Promise<{ lat: number; lng: number } | null> {
  const anchors = await searchText(destination, 1);
  const anchor = anchors[0];
  const coordinates = anchor ? parseCoordinates(anchor) : null;
  if (!coordinates) {
    console.warn(`[Places] Could not derive anchor coordinates for destination="${destination}"`);
  }
  return coordinates;
}

async function searchPlaces(query: string, limit = 10): Promise<GooglePlaceResult[]> {
  return searchText(query, limit);
}

async function searchPlacesWithFallbacks(queries: string[], limit = 10): Promise<GooglePlaceResult[]> {
  const seen = new Set<string>();
  const combined: GooglePlaceResult[] = [];

  for (const query of queries) {
    const results = await searchPlaces(query, limit);
    for (const place of results) {
      const key = place.place_id || place.name;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      combined.push(place);
      if (combined.length >= limit) {
        return combined;
      }
    }
  }

  return combined;
}

async function enrichPlaces(results: GooglePlaceResult[], limit: number): Promise<GooglePlaceResult[]> {
  const enriched: GooglePlaceResult[] = [];

  for (const place of results.slice(0, limit)) {
    const details = place.place_id ? await fetchPlaceDetails(place.place_id) : null;
    enriched.push(details ? { ...place, ...details } : place);
  }

  return enriched;
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
  const anchor = await getDestinationAnchor(destination);
  const nearbyResults = anchor
    ? await searchNearby(anchor.lat, anchor.lng, 10000, "lodging", `${style.trim()} hotel`.trim(), options.limit || 8)
    : [];
  const textResults = await searchPlacesWithFallbacks([
    `${style}hotels in ${destination}`,
    `${destination} hotels`,
    `${destination} resorts`,
    `${destination} stay`,
  ], options.limit || 8);

  const results = [...nearbyResults, ...textResults];

  const enriched = await enrichPlaces(results, options.limit || 3);
  const mapped = enriched.slice(0, options.limit || 3).map((place, index) => toHotel(place, index, destination, budget));
  console.log("[Places][fetchHotels] transformed hotel data:", JSON.stringify(mapped, null, 2));
  return mapped;
}

export async function fetchAttractions(destination: string, options: FetchOptions = {}): Promise<Activity[]> {
  const tags = options.interests && options.interests.length > 0
    ? options.interests
    : ["tourist attractions", "heritage sites", "local experiences"];

  const queries = [
    `${destination} tourist attractions`,
    `${destination} things to do`,
    `${destination} sightseeing`,
    ...tags.slice(0, 3).map((tag) => `${tag} in ${destination}`),
  ];

  const anchor = await getDestinationAnchor(destination);
  const nearbyResults = anchor
    ? await searchNearby(anchor.lat, anchor.lng, 15000, "tourist_attraction", tags[0], options.limit || 10)
    : [];
  const combined = [...nearbyResults, ...(await searchPlacesWithFallbacks(queries, options.limit || 10))];
  const enriched = await enrichPlaces(combined, options.limit || 10);

  const mapped = enriched
    .slice(0, options.limit || 10)
    .map((place, index) => {
      const types = Array.isArray(place.types) ? place.types.join(" ") : "";
      const category: "attraction" | "restaurant" | "culture" =
        /museum|art_gallery|temple|church|mosque|historic/i.test(types) ? "culture" : "attraction";
      return toActivity(place, index, destination, category);
    });
  console.log("[Places][fetchAttractions] transformed attractions:", JSON.stringify(mapped, null, 2));
  return mapped;
}

export async function fetchRestaurants(destination: string, options: FetchOptions = {}): Promise<Activity[]> {
  const foodHints = options.foodPreferences && options.foodPreferences.length > 0
    ? options.foodPreferences.slice(0, 3).join(" ") + " "
    : "";

  const results = await searchPlacesWithFallbacks([
    `${foodHints}restaurants in ${destination}`,
    `${destination} restaurants`,
    `${destination} cafes`,
    `${destination} eateries`,
  ], options.limit || 10);

  const anchor = await getDestinationAnchor(destination);
  const nearbyResults = anchor
    ? await searchNearby(anchor.lat, anchor.lng, 8000, "restaurant", foodHints.trim() || undefined, options.limit || 10)
    : [];

  const enriched = await enrichPlaces([...nearbyResults, ...results], options.limit || 8);

  const mapped = enriched
    .slice(0, options.limit || 8)
    .map((place, index) => toActivity(place, index, destination, "restaurant"));
  console.log("[Places][fetchRestaurants] transformed restaurants:", JSON.stringify(mapped, null, 2));
  return mapped;
}
