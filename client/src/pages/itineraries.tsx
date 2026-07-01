import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useTrips } from '../hooks/use-trips';

// Helper function to get status color
function getStatusColor(status?: string) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'upcoming':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'planning':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to get emoji for destination
function getEmojiForDestination(destination?: string) {
  const emojiMap: Record<string, string> = {
    'tokyo': '🏯', 'japan': '🏯', 'paris': '🗼', 'france': '🗼', 'bali': '🏝️', 'indonesia': '🏝️',
    'new york': '🏙️', 'usa': '🗽', 'london': '🇬🇧', 'australia': '🦘', 'dubai': '🏜️',
    'thailand': '🇹🇭', 'india': '🇮🇳', 'delhi': '🇮🇳', 'mumbai': '🇮🇳', 'goa': '🏖️'
  };
  
  if (!destination) return '✈️';
  
  const lowerDest = destination.toLowerCase();
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerDest.includes(key)) return emoji;
  }
  return '🌍';
}

export default function Itineraries() {
  const { trips, loading, error } = useTrips();

  // Transform trips data to display format
  const savedItineraries = useMemo(() => {
    return trips.map((trip) => {
      // Calculate duration from startDate and endDate
      const startDate = trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate);
      const endDate = trip.endDate instanceof Date ? trip.endDate : new Date(trip.endDate);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: trip.id || 'unknown',
        title: trip.title || 'Untitled Trip',
        destination: trip.destination || 'Unknown',
        duration: duration > 0 ? `${duration} days` : 'N/A',
        budget: trip.budget ? `${trip.currency || '$'}${trip.budget}` : 'N/A',
        travelers: trip.travelers || 1,
        status: trip.status || 'planning',
        statusColor: getStatusColor(trip.status),
        createdAt: trip.createdAt ? (trip.createdAt instanceof Date ? trip.createdAt.toLocaleDateString() : new Date(trip.createdAt).toLocaleDateString()) : 'N/A',
        thumbnail: getEmojiForDestination(trip.destination),
        description: trip.metadata?.travelInfo?.destinations?.join(', ') || 'No description provided',
        activities: trip.itinerary?.flatMap(day => day.activities?.map(a => a.title) || []) || []
      };
    });
  }, [trips]);

  const getStatusBadge = (status: string, statusColor: string) => (
    <Badge className={`${statusColor} border-0`}>
      {status}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Itineraries</h1>
              <p className="text-gray-600">Your travel plans and memories</p>
            </div>
          </div>
          <Link href="/">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Trip
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading your itineraries...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="bg-red-50/70 backdrop-blur-sm border border-red-200 mb-6">
            <CardContent className="p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Error loading itineraries</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Trips</p>
                    <p className="text-xl font-bold text-gray-900">{savedItineraries.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Destinations</p>
                    <p className="text-xl font-bold text-gray-900">{new Set(savedItineraries.map(i => i.destination)).size}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Days</p>
                    <p className="text-xl font-bold text-gray-900">{savedItineraries.reduce((sum, i) => sum + (parseInt(i.duration) || 0), 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Travelers</p>
                    <p className="text-xl font-bold text-gray-900">{savedItineraries.reduce((sum, i) => sum + i.travelers, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Itineraries Grid */}
        {!loading && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {savedItineraries.map((itinerary) => (
                <Card key={itinerary.id} className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{itinerary.thumbnail}</div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-700">
                            {itinerary.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{itinerary.destination}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(itinerary.status, itinerary.statusColor)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <CardDescription className="text-gray-600">
                      {itinerary.description}
                    </CardDescription>

                    {/* Trip Details */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{itinerary.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{itinerary.travelers} travelers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{itinerary.budget}</span>
                      </div>
                    </div>

                    {/* Activities Preview */}
                    {itinerary.activities.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Key Activities:</p>
                        <div className="flex flex-wrap gap-1">
                          {itinerary.activities.slice(0, 3).map((activity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {activity}
                            </Badge>
                          ))}
                          {itinerary.activities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{itinerary.activities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Created {itinerary.createdAt}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State (if no itineraries) */}
            {savedItineraries.length === 0 && (
              <Card className="bg-white/70 backdrop-blur-sm text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">✈️</div>
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    No itineraries yet
                  </CardTitle>
                  <CardDescription className="text-gray-600 mb-6">
                    Start planning your first trip to see it here
                  </CardDescription>
                  <Link href="/">
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Trip
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}