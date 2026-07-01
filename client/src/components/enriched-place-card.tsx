import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Star,
  Phone,
  Globe,
  Clock,
  DollarSign,
  ExternalLink,
  Verified,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EnrichedPlace } from "@shared/schema";

interface EnrichedPlaceCardProps {
  place: EnrichedPlace | undefined;
  placeTitle?: string;
  loading?: boolean;
  error?: string;
  showPhotoGallery?: boolean;
  onPhotosClick?: () => void;
}

export default function EnrichedPlaceCard({
  place,
  placeTitle,
  loading = false,
  error = null,
  showPhotoGallery = true,
  onPhotosClick,
}: EnrichedPlaceCardProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-orange-600 mr-3" />
          <p className="text-gray-600">Loading place details...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">{placeTitle || "Place"}</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!place) {
    return (
      <Card className="w-full border-gray-200 bg-gray-50">
        <CardContent className="p-6">
          <p className="text-gray-600 text-center">
            {placeTitle || "Place"} details not found. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPriceLevelDisplay = (priceLevel?: string) => {
    if (!priceLevel) return null;
    const levels: Record<string, string> = {
      PRICE_LEVEL_INEXPENSIVE: "$",
      PRICE_LEVEL_MODERATE: "$$",
      PRICE_LEVEL_EXPENSIVE: "$$$",
      PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
    };
    return levels[priceLevel] || priceLevel;
  };

  const formatOpeningHours = (hours?: any) => {
    if (!hours) return "Hours not available";
    if (typeof hours === "string") return hours;
    if (Array.isArray(hours) && hours.length > 0) {
      return hours[0]?.open
        ? `${hours[0].open.hour}:${String(hours[0].open.minute).padStart(2, "0")}`
        : "Hours not available";
    }
    return "Hours not available";
  };

  return (
    <Card className="w-full border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{place.name}</CardTitle>
              <Badge className="bg-green-100 text-green-800 border-0 flex items-center gap-1">
                <Verified className="w-3 h-3" />
                Verified by Google
              </Badge>
            </div>
            {place.rating && (
              <div className="flex items-center gap-1 text-sm">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(place.rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium text-gray-700">{place.rating.toFixed(1)}</span>
                {place.totalRatings && (
                  <span className="text-gray-500">({place.totalRatings.toLocaleString()} reviews)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Address */}
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Address</p>
            <p className="text-sm text-gray-600">{place.address || place.formattedAddress}</p>
            <p className="text-xs text-gray-500 mt-1">
              📍 {place.location.lat.toFixed(4)}, {place.location.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Additional Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Price Level */}
          {place.priceLevel && (
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-sm font-semibold text-gray-900">{getPriceLevelDisplay(place.priceLevel)}</p>
              </div>
            </div>
          )}

          {/* Opening Hours */}
          {place.openingHours && (
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
              <Clock className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Opens</p>
                <p className="text-sm font-semibold text-gray-900">{formatOpeningHours(place.openingHours)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Contact and Web */}
        <div className="flex flex-wrap gap-2">
          {place.phoneNumber && (
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href={`tel:${place.phoneNumber}`}>
                <Phone className="w-3 h-3 mr-1" />
                Call
              </a>
            </Button>
          )}

          {place.websiteUri && (
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href={place.websiteUri} target="_blank" rel="noopener noreferrer">
                <Globe className="w-3 h-3 mr-1" />
                Website
              </a>
            </Button>
          )}

          {place.mapsUri && (
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href={place.mapsUri} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                Google Maps
              </a>
            </Button>
          )}
        </div>

        {/* Photo Gallery Preview */}
        {showPhotoGallery && place.photos && place.photos.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-gray-700 mb-2 flex items-center">
              📸 {place.photos.length} Photo{place.photos.length > 1 ? "s" : ""}
              {place.photos[0]?.authorAttributions && (
                <span className="text-gray-500 ml-1">
                  by {place.photos[0].authorAttributions[0]?.displayName}
                </span>
              )}
            </p>
            {onPhotosClick && (
              <Button variant="secondary" size="sm" className="w-full text-xs" onClick={onPhotosClick}>
                View Photos
              </Button>
            )}
          </div>
        )}

        {/* Place ID and Status */}
        <div className="text-xs text-gray-500 border-t pt-2 space-y-1">
          <p>Place ID: <span className="font-mono text-gray-600 break-all">{place.placeId}</span></p>
          {place.businessStatus && (
            <p className="capitalize">
              Status: <span className="font-medium">{place.businessStatus.replace(/_/g, " ")}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
