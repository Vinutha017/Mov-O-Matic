import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Building2, Compass, Loader2, MapPinned, Utensils } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { TripRecommendationResponse, RecommendationCard } from "@shared/schema";
import type { Trip } from "@/lib/firebaseService";

interface TripRecommendationsProps {
  tripId?: string;
  trip?: Trip | null;
  destination: string;
  travelStyle?: string;
}

function scoreByIndex(index: number, base = 92) {
  return Math.max(0, Math.min(100, base - index * 4));
}

function buildLocalRecommendations(trip: Trip): TripRecommendationResponse | null {
  const aiRecommendation = trip.aiRecommendation;

  if (!aiRecommendation) {
    return null;
  }

  const hotels = Array.isArray(aiRecommendation.hotels)
    ? aiRecommendation.hotels.map((hotel: any, index: number) => ({
        id: hotel.id || hotel.name || `hotel-${index}`,
        title: hotel.name || "Hotel",
        description: hotel.location || hotel.address || trip.destination,
        score: scoreByIndex(index, typeof hotel.rating === "number" ? Math.round(hotel.rating * 20) : 92),
        reason: hotel.aiInsight || hotel.description || "Recommended stay for this trip",
        category: "hotel" as const,
        metadata: {
          rating: hotel.rating,
          pricePerNight: hotel.pricePerNight,
          amenities: hotel.amenities,
          bookingUrl: hotel.bookingUrl,
          location: hotel.location,
        },
      }))
    : [];

  const activities = Array.isArray(aiRecommendation.itinerary)
    ? aiRecommendation.itinerary.flatMap((day: any) =>
        Array.isArray(day.activities)
          ? day.activities
              .filter((activity: any) => activity && typeof activity === "object")
              .map((activity: any, index: number) => ({
                id: activity.id || `${day.day || "day"}-${index}-${activity.title || "activity"}`,
                title: activity.title || "Activity",
                description: activity.location || activity.description || `Day ${day.day || 1}`,
                score: scoreByIndex(index, 90),
                reason: activity.notes || activity.description || "Matches your itinerary",
                category: (activity.category === "restaurant" ? "restaurant" : "activity") as const,
                metadata: {
                  category: activity.category,
                  duration: activity.duration,
                  cost: activity.cost,
                  location: activity.location,
                  bookingUrl: activity.bookingUrl,
                },
              }))
          : []
      )
    : [];

  const restaurants = Array.isArray(aiRecommendation.restaurants)
    ? aiRecommendation.restaurants.map((restaurant: any, index: number) => ({
        id: restaurant.id || restaurant.name || `restaurant-${index}`,
        title: restaurant.name || restaurant.title || "Restaurant",
        description: restaurant.location || restaurant.address || trip.destination,
        score: scoreByIndex(index, 88),
        reason: restaurant.aiInsight || restaurant.description || "Food match for this trip",
        category: "restaurant" as const,
        metadata: {
          location: restaurant.location,
          bookingUrl: restaurant.bookingUrl,
        },
      }))
    : activities
        .filter((item) => item.category === "restaurant")
        .slice(0, 4)
        .map((item) => ({ ...item, category: "restaurant" as const }));

  const destinations = Array.isArray(aiRecommendation.destinations)
    ? aiRecommendation.destinations.map((destination: any, index: number) => ({
        id: destination.id || destination.name || `destination-${index}`,
        title: destination.name || "Destination",
        description: destination.description || trip.destination,
        score: scoreByIndex(index, 85),
        reason: destination.bestTimeToVisit || destination.description || "Suggested nearby destination",
        category: "destination" as const,
        metadata: {
          bestTimeToVisit: destination.bestTimeToVisit,
          image: destination.image,
          rating: destination.rating,
          coordinates: destination.coordinates,
        },
      }))
    : [];

  return {
    hotels,
    activities,
    restaurants,
    destinations,
    seasonalTips: Array.isArray(aiRecommendation.tips) ? aiRecommendation.tips.slice(0, 3) : [],
    summary: aiRecommendation.summary?.description || `Top picks for ${trip.destination}`,
  };
}

function RecommendationGroup({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ElementType;
  items: RecommendationCard[];
}) {
  return (
    <Card className="border-gray-200/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-orange-500" />
          {title}
        </CardTitle>
        <CardDescription>{items.length ? `Top ${items.length} picks ranked for this trip` : "No recommendations available"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            No recommendations yet.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <Badge variant="secondary" className="capitalize">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                </div>
                <div className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600">
                  {item.score}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">{item.reason}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function TripRecommendations({ tripId, trip, destination, travelStyle }: TripRecommendationsProps) {
  const localRecommendations = trip ? buildLocalRecommendations(trip) : null;
  const { data, isLoading, error } = useQuery<TripRecommendationResponse>({
    queryKey: ["tripRecommendations", tripId, destination, travelStyle],
    queryFn: async () => {
      if (!tripId) {
        throw new Error("Trip ID is required");
      }

      const response = await fetch(`/api/recommendations/${tripId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      return response.json();
    },
    enabled: !!tripId && !localRecommendations,
  });

  if (!tripId) {
    return null;
  }

  if (!localRecommendations && isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-8 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
          Generating personalized recommendations...
        </CardContent>
      </Card>
    );
  }

  if (!localRecommendations && error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load trip recommendations right now.
        </AlertDescription>
      </Alert>
    );
  }

  const recommendations = localRecommendations ?? data;
  const hotels = recommendations?.hotels || [];
  const activities = recommendations?.activities || [];
  const restaurants = recommendations?.restaurants || [];
  const destinationsList = recommendations?.destinations || [];
  const seasonalTips = recommendations?.seasonalTips || [];

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 via-white to-blue-50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Compass className="h-5 w-5 text-orange-500" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Tailored picks for {destination}{travelStyle ? ` · ${travelStyle}` : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{recommendations?.summary || "Recommendations are being prepared for this trip."}</p>
          {seasonalTips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {seasonalTips.map((tip) => (
                <Badge key={tip} variant="outline" className="border-orange-200 bg-white text-orange-700">
                  {tip}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecommendationGroup title="Hotels" icon={Building2} items={hotels} />
        <RecommendationGroup title="Activities" icon={MapPinned} items={activities} />
        <RecommendationGroup title="Restaurants" icon={Utensils} items={restaurants} />
        <RecommendationGroup title="Similar Destinations" icon={ArrowRight} items={destinationsList} />
      </div>
    </div>
  );
}
