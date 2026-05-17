import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Train, Bus, Hotel, ChevronRight, X } from "lucide-react";

interface BookingOptionsProps {
  origin?: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
}

export default function BookingOptions({
  origin,
  destination,
  startDate,
  endDate,
  travelers = 1,
}: BookingOptionsProps) {
  const [showBooking, setShowBooking] = useState(false);

  // Format dates for URLs
  const formatDateForUrl = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const formattedStartDate = formatDateForUrl(startDate);
  const formattedEndDate = formatDateForUrl(endDate);
  const encodedOrigin = encodeURIComponent(origin?.trim() || "");
  const encodedDestination = encodeURIComponent(destination.trim());

  const bookingLinks = [
    {
      id: "flights",
      name: "Book Flights",
      icon: Plane,
      description: "Search and book flights",
      url: `https://www.ixigo.com/flights?from=${encodedOrigin || "ALL"}&to=${encodedDestination}&startDate=${formattedStartDate}&adults=${travelers}`,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "trains",
      name: "Book Trains",
      icon: Train,
      description: "Search and book train tickets",
      url: origin
        ? `https://www.confirmtkt.com/trains/${encodedOrigin}-to-${encodedDestination}-train-tickets`
        : "https://www.confirmtkt.com/trains",
      color: "from-green-500 to-green-600",
    },
    {
      id: "buses",
      name: "Book Buses",
      icon: Bus,
      description: "Search and book bus tickets",
      url: origin
        ? `https://www.abhibus.com/bus-ticket-booking?fromCity=${encodedOrigin}&toCity=${encodedDestination}&doj=${formattedStartDate}&passengers=${travelers}`
        : "https://www.abhibus.com/bus-ticket-booking",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "hotels",
      name: "Book Hotels",
      icon: Hotel,
      description: "Find and book hotels",
      url: `https://www.ixigo.com/hotels?city=${encodedDestination}&checkin=${formattedStartDate}&checkout=${formattedEndDate}&rooms=1&adults=${travelers}`,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="mb-8">
      {!showBooking ? (
        <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ready to book your travel?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Book flights, trains, buses, and hotels directly through verified partners
                </p>
              </div>
              <Button
                onClick={() => setShowBooking(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-6 whitespace-nowrap"
              >
                Start Booking
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Book Your Travel</CardTitle>
              <button
                onClick={() => setShowBooking(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookingLinks.map((booking) => {
                const Icon = booking.icon;
                return (
                  <a
                    key={booking.id}
                    href={booking.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div
                      className={`
                        h-full rounded-lg p-6 bg-gradient-to-br ${booking.color}
                        text-white cursor-pointer transform transition 
                        hover:shadow-lg hover:scale-105 active:scale-95
                      `}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-3 bg-white/20 rounded-lg">
                          <Icon className="w-6 h-6" />
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <h4 className="font-semibold text-lg mb-1">{booking.name}</h4>
                      <p className="text-sm text-white/90">{booking.description}</p>
                      <p className="text-xs text-white/70 mt-3">
                        Destination: {destination}
                        {formattedStartDate && ` • ${formattedStartDate}`}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">ℹ️ Note:</span> You'll be redirected to our trusted booking partners.
                Your trip details are pre-filled where possible for a faster booking experience.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
