import { storage } from "../storage";
import { aiTravelPlanner } from "./gemini";
import type { Activity, Hotel, Trip, TripWithDetails, Destination, RecommendationCard, TripRecommendationResponse } from "@shared/schema";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function extractTripInterests(trip: TripWithDetails | Trip): string[] {
  const metadataInterests = (trip as any).metadata?.preferences?.activityInterests || [];
  const recommendationInterests = Array.isArray((trip as any).preferences)
    ? (trip as any).preferences
    : [];

  const aiInterests = Array.isArray((trip as any).aiRecommendation?.tips)
    ? (trip as any).aiRecommendation.tips
    : [];

  const interests = [
    ...(metadataInterests || []),
    ...recommendationInterests,
    ...aiInterests,
    (trip as any).travelStyle,
    (trip as any).tripType,
  ]
    .filter(Boolean)
    .map((item) => normalizeText(item))
    .filter(Boolean);

  return Array.from(new Set(interests));
}

function buildReason(parts: string[]): string {
  return parts.filter(Boolean).join(" · ");
}

function scoreHotel(hotel: Hotel, trip: TripWithDetails | Trip): number {
  const budgetValue = typeof trip.budget === "string" ? Number(trip.budget) : Number(trip.budget || 0);
  const hotelPrice = Number(hotel.pricePerNight || 0);
  const rating = Number(hotel.rating || 0);
  const destinationMatch = normalizeText(hotel.location).includes(normalizeText(trip.destination));

  const priceScore = budgetValue && hotelPrice ? Math.max(0, 40 - Math.abs(budgetValue - hotelPrice) / 200) : 20;
  const ratingScore = rating ? rating * 12 : 0;
  const locationScore = destinationMatch ? 20 : 5;
  const amenityScore = Array.isArray(hotel.amenities) ? Math.min(hotel.amenities.length * 2, 10) : 0;

  return clampScore(priceScore + ratingScore + locationScore + amenityScore);
}

function scoreActivity(activity: Activity, trip: TripWithDetails | Trip): number {
  const interests = extractTripInterests(trip);
  const category = normalizeText(activity.category);
  const title = normalizeText(activity.title);
  const description = normalizeText(activity.description);
  const location = normalizeText(activity.location);

  const matchScore = interests.reduce((score, interest) => {
    if (category.includes(interest) || title.includes(interest) || description.includes(interest) || location.includes(interest)) {
      return score + 18;
    }
    return score;
  }, 10);

  const priorityScore = Number(activity.priority || 1) * 8;
  const costValue = Number(activity.cost || 0);
  const budgetValue = typeof trip.budget === "string" ? Number(trip.budget) : Number(trip.budget || 0);
  const budgetScore = budgetValue && costValue ? Math.max(0, 18 - costValue / Math.max(budgetValue / 6, 1)) : 8;

  return clampScore(matchScore + priorityScore + budgetScore);
}

function scoreDestination(destination: Destination, trip: TripWithDetails | Trip): number {
  const destinationName = normalizeText(destination.name);
  const tripDestination = normalizeText(trip.destination);
  const travelStyle = normalizeText(trip.travelStyle);
  const category = normalizeText(destination.category);
  const bestTime = normalizeText(destination.bestTimeToVisit);

  let score = 20;
  if (destinationName === tripDestination || tripDestination.includes(destinationName) || destinationName.includes(tripDestination)) {
    score += 55;
  }

  if (travelStyle && category.includes(travelStyle)) {
    score += 15;
  }

  if (bestTime.includes("october") || bestTime.includes("november") || bestTime.includes("march")) {
    score += 5;
  }

  score += Number(destination.popularityScore || 0) / 10;
  return clampScore(score);
}

function cardFromHotel(hotel: Hotel, score: number, trip: TripWithDetails | Trip): RecommendationCard {
  const reasonParts = [
    hotel.aiInsight || "Well-matched stay for this trip",
    hotel.rating ? `Rated ${hotel.rating}/5` : "",
    Array.isArray(hotel.amenities) && hotel.amenities.length ? `Amenities: ${hotel.amenities.slice(0, 3).join(", ")}` : "",
  ];

  return {
    id: hotel.id,
    title: hotel.name,
    description: `${hotel.location}${hotel.pricePerNight ? ` · ₹${hotel.pricePerNight}/night` : ""}`,
    score,
    reason: buildReason(reasonParts),
    category: "hotel",
    metadata: {
      rating: hotel.rating,
      pricePerNight: hotel.pricePerNight,
      amenities: hotel.amenities,
      bookingUrl: hotel.bookingUrl,
      location: hotel.location,
    },
  };
}

function cardFromActivity(activity: Activity, score: number): RecommendationCard {
  const reasonParts = [
    activity.description || "Strong activity match",
    activity.category ? `Category: ${activity.category}` : "",
    activity.location ? `Near ${activity.location}` : "",
  ];

  return {
    id: activity.id,
    title: activity.title,
    description: activity.location || activity.description || "Recommended stop",
    score,
    reason: buildReason(reasonParts),
    category: activity.category === "restaurant" ? "restaurant" : "activity",
    metadata: {
      category: activity.category,
      duration: activity.duration,
      cost: activity.cost,
      location: activity.location,
      bookingUrl: activity.bookingUrl,
    },
  };
}

function cardFromDestination(destination: Destination, score: number): RecommendationCard {
  const reasonParts = [
    destination.description || "Popular destination match",
    destination.bestTimeToVisit ? `Best time: ${destination.bestTimeToVisit}` : "",
    destination.rating ? `Rated ${destination.rating}/5` : "",
  ];

  return {
    id: destination.id,
    title: `${destination.name}, ${destination.country}`,
    description: destination.description || "Suggested destination",
    score,
    reason: buildReason(reasonParts),
    category: "destination",
    metadata: {
      image: destination.image,
      popularityScore: destination.popularityScore,
      bestTimeToVisit: destination.bestTimeToVisit,
      rating: destination.rating,
      coordinates: destination.coordinates,
    },
  };
}

function buildRestaurantSuggestions(trip: TripWithDetails | Trip, activities: Activity[]): RecommendationCard[] {
  const tripDestination = normalizeText(trip.destination);
  const interests = extractTripInterests(trip);
  const restaurantActivities = activities.filter((activity) => normalizeText(activity.category).includes("restaurant") || normalizeText(activity.title).includes("food"));

  const seeded = restaurantActivities.slice(0, 4).map((activity, index) => ({
    ...cardFromActivity(activity, clampScore(92 - index * 4)),
    category: "restaurant" as const,
  }));

  if (seeded.length > 0) {
    return seeded;
  }

  return [
    {
      id: `${tripDestination}-food-1`,
      title: `${trip.destination} street food trail`,
      description: "Try local specialties and signature dishes near your main attractions.",
      score: 88,
      reason: interests.includes("food") ? "Matches your food interest" : "Best way to taste the destination",
      category: "restaurant",
      metadata: { cuisineStyle: trip.travelStyle },
    },
    {
      id: `${tripDestination}-food-2`,
      title: `${trip.destination} heritage cafe`,
      description: "A relaxed lunch stop with local flavors and a good rest break.",
      score: 82,
      reason: "Pairs well with sightseeing and mid-day downtime",
      category: "restaurant",
      metadata: { cuisineStyle: "local" },
    },
  ];
}

export async function getPersonalizedRecommendations(tripId: string): Promise<TripRecommendationResponse> {
  const trip = await storage.getTripWithDetails(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }

  const hotels = await storage.getHotelsByLocation(trip.destination);
  const destinations = await storage.getPopularDestinations(10);
  const tripDays = trip.days || [];
  const dayActivities = tripDays.flatMap((day) => day.activities || []);
  const aiRecommendedActivities = Array.isArray((trip as any).aiRecommendation?.itinerary)
    ? (trip as any).aiRecommendation.itinerary.flatMap((day: any) => Array.isArray(day.activities) ? day.activities : [])
    : [];

  const activities = [...dayActivities, ...aiRecommendedActivities].filter((activity): activity is Activity => {
    return activity && typeof activity === "object" && typeof activity.id === "string" && typeof activity.title === "string";
  });

  const hotelCards = hotels
    .map((hotel) => ({ hotel, score: scoreHotel(hotel, trip) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ hotel, score }) => cardFromHotel(hotel, score, trip));

  const activityCards = activities
    .map((activity) => ({ activity, score: scoreActivity(activity, trip) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ activity, score }) => cardFromActivity(activity, score));

  const restaurantCards = buildRestaurantSuggestions(trip, activities);

  const destinationCards = destinations
    .map((destination) => ({ destination, score: scoreDestination(destination, trip) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ destination, score }) => cardFromDestination(destination, score));

  let seasonalTips: string[] = [];
  try {
    const aiDestinations = await aiTravelPlanner.getDestinationRecommendations({
      destination: trip.destination,
      travelStyle: (trip as any).travelStyle,
      budget: typeof trip.budget === "string" ? Number(trip.budget) : Number(trip.budget || 0),
      travelers: trip.travelers || 1,
      interests: extractTripInterests(trip),
    });

    seasonalTips = aiDestinations
      .slice(0, 3)
      .map((destination: any) => destination.bestTime ? `Best time for ${destination.name}: ${destination.bestTime}` : `Consider ${destination.name} for a future trip.`);
  } catch (error) {
    console.warn("Recommendation engine AI destination enrichment failed:", error);
    seasonalTips = [
      `Plan morning sightseeing for ${trip.destination} when possible.`,
      "Keep one flexible half-day for weather, rest, or a bonus experience.",
      trip.travelStyle ? `Prioritize ${trip.travelStyle} experiences that match your trip style.` : "Mix major attractions with one local hidden-gem stop.",
    ];
  }

  const summary = `Top picks for ${trip.destination}: ${hotelCards[0]?.title || "hotel"}, ${activityCards[0]?.title || "activity"}, and ${restaurantCards[0]?.title || "restaurant"}.`;

  return {
    hotels: hotelCards,
    activities: activityCards,
    restaurants: restaurantCards,
    destinations: destinationCards,
    seasonalTips,
    summary,
  };
}
