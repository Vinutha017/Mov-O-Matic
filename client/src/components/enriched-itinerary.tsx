import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Navigation,
  AlertCircle,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import EnrichedPlaceCard from "./enriched-place-card";
import type { EnrichedItineraryDay, EnrichedActivity } from "@shared/schema";

interface EnrichedItineraryProps {
  days: EnrichedItineraryDay[];
  destination: string;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

export default function EnrichedItinerary({
  days,
  destination,
  loading = false,
  error = null,
  onRefresh,
}: EnrichedItineraryProps) {
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [showPlaceDetailsId, setShowPlaceDetailsId] = useState<string | null>(null);

  const stats = {
    totalDays: days.length,
    verifiedActivities: days.reduce(
      (sum, day) =>
        sum + day.activities.filter((act) => act.enrichedPlace).length,
      0
    ),
    totalActivities: days.reduce((sum, day) => sum + day.activities.length, 0),
    unverifiedActivities: days.reduce(
      (sum, day) =>
        sum + day.activities.filter((act) => !act.enrichedPlace).length,
      0
    ),
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <p className="text-gray-600 font-medium">Enriching itinerary with real-time place data...</p>
          <p className="text-xs text-gray-500">This may take a moment</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Error Loading Itinerary</CardTitle>
            </div>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Retry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (days.length === 0) {
    return (
      <Card className="w-full text-center py-12">
        <CardContent>
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No itinerary data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4">
            <div className="text-sm text-blue-900 font-medium">Total Days</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{stats.totalDays}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4">
            <div className="text-sm text-green-900 font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Verified
            </div>
            <div className="text-2xl font-bold text-green-900 mt-1">{stats.verifiedActivities}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="p-4">
            <div className="text-sm text-amber-900 font-medium">Total Places</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{stats.totalActivities}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardContent className="p-4">
            <div className="text-sm text-orange-900 font-medium">Unverified</div>
            <div className="text-2xl font-bold text-orange-900 mt-1">{stats.unverifiedActivities}</div>
          </CardContent>
        </Card>
      </div>

      {/* Itinerary Days */}
      <div className="space-y-3">
        {days.map((day, dayIdx) => (
          <Card key={day.id || dayIdx} className="overflow-hidden">
            {/* Day Header */}
            <button
              onClick={() =>
                setExpandedDayId(expandedDayId === day.id ? null : day.id)
              }
              className="w-full text-left"
            >
              <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-transparent hover:from-orange-100 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-600 text-white font-bold">
                      {day.dayNumber}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {day.title || `Day ${day.dayNumber}`}
                      </CardTitle>
                      {day.date && (
                        <CardDescription className="text-xs">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {day.activities.length} place{day.activities.length !== 1 ? "s" : ""}
                    </Badge>
                    <Badge
                      className={`text-xs ${
                        day.activities.every((a) => a.enrichedPlace)
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {day.activities.filter((a) => a.enrichedPlace).length} verified
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </button>

            {/* Day Content */}
            {expandedDayId === day.id && (
              <CardContent className="p-0 border-t">
                <div className="space-y-2 p-4">
                  {day.activities.map((activity, actIdx) => (
                    <div key={activity.id || actIdx} className="space-y-2">
                      {/* Activity Header */}
                      <button
                        onClick={() =>
                          setExpandedActivityId(
                            expandedActivityId === activity.id ? null : activity.id
                          )
                        }
                        className="w-full text-left"
                      >
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border-l-4 border-orange-600">
                          <div className="flex items-center gap-2 mt-1">
                            {activity.enrichedPlace ? (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">
                              {activity.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 flex-wrap">
                              {activity.startTime && (
                                <>
                                  <Clock className="w-3 h-3" />
                                  <span>{activity.startTime}</span>
                                </>
                              )}
                              {activity.enrichedPlace?.location && (
                                <>
                                  <MapPin className="w-3 h-3" />
                                  <span>
                                    {activity.enrichedPlace.location.lat.toFixed(3)},
                                    {activity.enrichedPlace.location.lng.toFixed(3)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {activity.travelInfo?.toNextActivity && (
                              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                <Navigation className="w-3 h-3 mr-1" />
                                {activity.travelInfo.toNextActivity.duration}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Activity Details */}
                      {expandedActivityId === activity.id && (
                        <div className="ml-8 space-y-3 p-3 bg-white rounded-lg border border-gray-200">
                          {activity.description && (
                            <p className="text-sm text-gray-600">{activity.description}</p>
                          )}

                          {/* Travel Info */}
                          {activity.travelInfo?.toNextActivity && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs font-medium text-blue-900 mb-2">To Next Activity:</p>
                              <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                                <div>📏 {activity.travelInfo.toNextActivity.distance}</div>
                                <div>⏱️ {activity.travelInfo.toNextActivity.duration}</div>
                              </div>
                            </div>
                          )}

                          {/* Enriched Place Details */}
                          {activity.enrichedPlace ? (
                            <div
                              className="cursor-pointer"
                              onClick={() =>
                                setShowPlaceDetailsId(
                                  showPlaceDetailsId === activity.id ? null : activity.id
                                )
                              }
                            >
                              <p className="text-xs font-medium text-gray-700 mb-2">Google Place Details:</p>
                              {showPlaceDetailsId === activity.id && (
                                <EnrichedPlaceCard
                                  place={activity.enrichedPlace}
                                  placeTitle={activity.title}
                                />
                              )}
                              {showPlaceDetailsId !== activity.id && (
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                  Show Details
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-amber-800">
                                Place not verified in Google Places. Try searching manually.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Bottom Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-gray-700">
            ✅ <strong>{stats.verifiedActivities} of {stats.totalActivities} places</strong> have been
            verified with real Google Places data. All locations include addresses, ratings, contact information,
            and working hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
