import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MapStop = {
  label: string;
  location?: string;
  description?: string;
};

interface TripMapProps {
  destination: string;
  startLocation?: string;
  stops?: MapStop[];
}

function buildMapUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export default function TripMap({ destination, startLocation, stops = [] }: TripMapProps) {
  const mapQuery = `${destination}${startLocation ? ` from ${startLocation}` : ""}`;
  const filteredStops = stops.filter((stop) => Boolean(stop.location || stop.label));

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Navigation className="h-5 w-5 text-orange-500" />
              Trip Map
            </CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              Visual overview of your destination and key places to visit.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Maps
            </a>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            <iframe
              title={`${destination} map`}
              src={buildMapUrl(mapQuery)}
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <MapPin className="h-4 w-4 text-orange-500" />
                Trip Overview
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium text-gray-900">Destination:</span> {destination}
                </div>
                {startLocation && (
                  <div>
                    <span className="font-medium text-gray-900">Starting point:</span> {startLocation}
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-900">Map query:</span> {mapQuery}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 font-semibold text-gray-900">Suggested Stops</h3>
              {filteredStops.length > 0 ? (
                <div className="space-y-3">
                  {filteredStops.slice(0, 6).map((stop, index) => (
                    <div key={`${stop.label}-${index}`} className="rounded-lg bg-gray-50 p-3">
                      <div className="font-medium text-gray-900">{stop.label}</div>
                      {stop.location && <div className="text-sm text-gray-600">{stop.location}</div>}
                      {stop.description && <div className="mt-1 text-xs text-gray-500">{stop.description}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Once your itinerary loads, key hotels and attractions will appear here.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}