import React, { useState } from "react";
import { useEnrichedItinerary, useRestaurantSearch } from "@/hooks/use-enriched-itinerary";
import EnrichedItinerary from "@/components/enriched-itinerary";
import EnrichedPlaceCard from "@/components/enriched-place-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Search,
  MapPin,
  Utensils,
} from "lucide-react";
import type { ItineraryDay, Activity } from "@shared/schema";

interface EnrichedTripDisplayProps {
  tripTitle: string;
  destination: string;
  itineraryDays: (ItineraryDay & { activities: Activity[] })[];
}

/**
 * Example component showing how to use the enrichment system
 * This can be used in the itinerary builder or trip details page
 */
export default function EnrichedTripDisplay({
  tripTitle,
  destination,
  itineraryDays,
}: EnrichedTripDisplayProps) {
  const [activeTab, setActiveTab] = useState("itinerary");
  const [showAutoEnrich, setShowAutoEnrich] = useState(true);

  // Enrichment hooks
  const {
    enrichedDays,
    loading: enrichLoading,
    error: enrichError,
    progress,
    enrichItinerary,
    validateItinerary,
  } = useEnrichedItinerary({ destination, autoEnrich: showAutoEnrich });

  // Restaurant search
  const {
    restaurants,
    loading: restaurantLoading,
    error: restaurantError,
    searchRestaurants,
  } = useRestaurantSearch();

  // Search state
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState<"low" | "medium" | "high">("medium");

  // Handle auto-enrichment on mount
  React.useEffect(() => {
    if (showAutoEnrich && itineraryDays.length > 0 && enrichedDays.length === 0) {
      handleEnrichItinerary();
    }
  }, []);

  const handleEnrichItinerary = async () => {
    await enrichItinerary(itineraryDays);
  };

  const handleValidateItinerary = async () => {
    const results = await validateItinerary(itineraryDays);
    console.log("Validation results:", results);
  };

  const handleSearchRestaurants = async () => {
    await searchRestaurants(destination, cuisineFilter || undefined, budgetFilter);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{tripTitle}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4" />
                {destination}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Enriched with Real Data</p>
              <p className="text-2xl font-bold text-green-600">✓ Verified</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleEnrichItinerary}
          disabled={enrichLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {enrichLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enriching... ({progress}%)
            </>
          ) : enrichedDays.length > 0 ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Re-enrich Itinerary
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Enrich with Google Places
            </>
          )}
        </Button>

        <Button
          onClick={handleValidateItinerary}
          disabled={enrichLoading}
          variant="outline"
        >
          Validate Locations
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowAutoEnrich(!showAutoEnrich)}
          className={showAutoEnrich ? "border-green-600 text-green-600" : ""}
        >
          Auto-Enrich {showAutoEnrich ? "ON" : "OFF"}
        </Button>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="itinerary" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Enriched Itinerary
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            Restaurant Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Enriched Itinerary Tab */}
        <TabsContent value="itinerary" className="space-y-4">
          {enrichError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-900">Enrichment Error</p>
                  <p className="text-sm text-red-700">{enrichError}</p>
                  <Button
                    onClick={handleEnrichItinerary}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {enrichedDays.length > 0 ? (
            <EnrichedItinerary
              days={enrichedDays}
              destination={destination}
              loading={enrichLoading}
              error={enrichError || undefined}
              onRefresh={handleEnrichItinerary}
            />
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No enriched data yet. Click "Enrich with Google Places" to validate and enhance your
                  itinerary.
                </p>
                <Button onClick={handleEnrichItinerary} className="bg-orange-600 hover:bg-orange-700">
                  Start Enrichment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Restaurant Recommendations Tab */}
        <TabsContent value="restaurants" className="space-y-4">
          {/* Search Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Find Restaurants</CardTitle>
              <CardDescription>Search for restaurants by cuisine and budget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Cuisine Type</label>
                  <Input
                    placeholder="e.g., Italian, Indian, Chinese..."
                    value={cuisineFilter}
                    onChange={(e) => setCuisineFilter(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Budget</label>
                  <Select value={budgetFilter} onValueChange={(v: any) => setBudgetFilter(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Budget Friendly</SelectItem>
                      <SelectItem value="medium">Moderate</SelectItem>
                      <SelectItem value="high">Fine Dining</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleSearchRestaurants}
                    disabled={restaurantLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {restaurantLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {restaurantError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900">Search Error</p>
                    <p className="text-sm text-red-700">{restaurantError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Restaurant Results */}
          {restaurants.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Found {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {restaurants.map((restaurant) => (
                  <EnrichedPlaceCard
                    key={restaurant.placeId}
                    place={restaurant}
                    placeTitle={restaurant.name}
                    showPhotoGallery={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!restaurantLoading && restaurants.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Select a cuisine and budget, then click search to find recommended restaurants.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Verified Data Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900">
          <p>✓ Real-time place information from Google Places</p>
          <p>✓ Accurate addresses, phone numbers, and websites</p>
          <p>✓ Current opening hours and availability</p>
          <p>✓ Verified ratings and customer reviews</p>
          <p>✓ Travel time calculations between locations</p>
          <p>✓ Direct links to Google Maps</p>
          <p>✓ Professional photos with proper attribution</p>
        </CardContent>
      </Card>
    </div>
  );
}
