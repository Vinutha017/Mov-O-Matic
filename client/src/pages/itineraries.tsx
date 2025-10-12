import React from 'react';
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
  Star
} from 'lucide-react';

export default function Itineraries() {
  const savedItineraries = [
    {
      id: 1,
      title: 'Tokyo Adventure',
      destination: 'Tokyo, Japan',
      duration: '7 days',
      budget: '$2,500',
      travelers: 2,
      status: 'Upcoming',
      statusColor: 'bg-green-100 text-green-800',
      createdAt: '2024-01-15',
      thumbnail: '🏯',
      description: 'Explore traditional temples, modern architecture, and amazing cuisine',
      activities: ['Senso-ji Temple', 'Tokyo Skytree', 'Shibuya Crossing', 'Tsukiji Market']
    },
    {
      id: 2,
      title: 'Paris Romance',
      destination: 'Paris, France',
      duration: '5 days',
      budget: '$1,800',
      travelers: 2,
      status: 'Completed',
      statusColor: 'bg-blue-100 text-blue-800',
      createdAt: '2023-12-08',
      thumbnail: '🗼',
      description: 'Romantic getaway with art, culture, and fine dining',
      activities: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Montmartre']
    },
    {
      id: 3,
      title: 'Bali Retreat',
      destination: 'Bali, Indonesia',
      duration: '10 days',
      budget: '$1,200',
      travelers: 1,
      status: 'Draft',
      statusColor: 'bg-yellow-100 text-yellow-800',
      createdAt: '2024-01-20',
      thumbnail: '🏝️',
      description: 'Peaceful retreat with beaches, temples, and wellness activities',
      activities: ['Uluwatu Temple', 'Rice Terraces', 'Beach Hopping', 'Yoga Classes']
    },
    {
      id: 4,
      title: 'New York City Break',
      destination: 'New York, USA',
      duration: '4 days',
      budget: '$2,000',
      travelers: 3,
      status: 'Planning',
      statusColor: 'bg-purple-100 text-purple-800',
      createdAt: '2024-01-25',
      thumbnail: '🏙️',
      description: 'Urban adventure with shows, museums, and iconic landmarks',
      activities: ['Statue of Liberty', 'Central Park', 'Broadway Show', 'Brooklyn Bridge']
    }
  ];

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
          <Link href="/trip-wizard">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Trip
            </Button>
          </Link>
        </div>

        {/* Stats */}
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
                  <p className="text-sm text-gray-600">Countries</p>
                  <p className="text-xl font-bold text-gray-900">4</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Days Planned</p>
                  <p className="text-xl font-bold text-gray-900">26</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-xl font-bold text-gray-900">$7.5K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Itineraries Grid */}
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

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Created {new Date(itinerary.createdAt).toLocaleDateString()}
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
              <Link href="/trip-wizard">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Trip
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}