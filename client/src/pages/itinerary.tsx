import { useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share, Download, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { getTrip, type Trip } from "@/lib/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from "@/hooks/use-toast";

export default function Itinerary() {
  const { id } = useParams() as { id: string };
  const { currentUser } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get trip ID from URL params or localStorage
  const tripId = id || localStorage.getItem('currentTripId');

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) {
        setError('No trip ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const tripData = await getTrip(tripId);
        
        if (!tripData) {
          setError('Trip not found');
          return;
        }
        
        console.log('Trip data:', tripData);
        console.log('Start date:', tripData.startDate);
        console.log('End date:', tripData.endDate);

        // Check if user has access to this trip
        if (currentUser && tripData.userId !== currentUser.uid) {
          setError('Access denied');
          return;
        }

        setTrip(tripData);
      } catch (err) {
        console.error('Error fetching trip:', err);
        setError('Failed to load trip');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId, currentUser]);

  // Helper function to safely format dates
  const formatDate = (date: Date | string | any) => {
    try {
      let dateObj: Date;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date && typeof date === 'object' && date.seconds) {
        // Firestore Timestamp object
        dateObj = new Date(date.seconds * 1000);
      } else if (date && typeof date === 'object' && date.toDate) {
        // Firestore Timestamp with toDate method
        dateObj = date.toDate();
      } else {
        dateObj = new Date(date);
      }
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  // Calculate trip duration from dates
  const calculateDuration = (startDate: Date | string | any, endDate: Date | string | any) => {
    try {
      let start: Date, end: Date;
      
      // Handle Firestore Timestamp objects or regular dates
      if (startDate && typeof startDate === 'object' && startDate.seconds) {
        start = new Date(startDate.seconds * 1000);
      } else if (startDate && typeof startDate === 'object' && startDate.toDate) {
        start = startDate.toDate();
      } else {
        start = startDate instanceof Date ? startDate : new Date(startDate);
      }
      
      if (endDate && typeof endDate === 'object' && endDate.seconds) {
        end = new Date(endDate.seconds * 1000);
      } else if (endDate && typeof endDate === 'object' && endDate.toDate) {
        end = endDate.toDate();
      } else {
        end = endDate instanceof Date ? endDate : new Date(endDate);
      }
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 0;
      }
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 1; // At least 1 day for same-day trips
    } catch (error) {
      console.error('Duration calculation error:', error);
      return 0;
    }
  };

  // Handle PDF download
  const handleDownload = async () => {
    if (!trip || !printRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Create a copy of the content for PDF generation
      const element = printRef.current;
      
      // Temporarily style the element for better PDF generation
      const originalStyle = element.style.cssText;
      const originalClass = element.className;
      
      // Set optimal width for PDF content
      element.style.width = '210mm'; // A4 width
      element.style.maxWidth = 'none';
      element.style.minHeight = 'auto';
      element.style.overflow = 'visible';
      element.style.transform = 'scale(1)';
      element.style.transformOrigin = 'top left';
      element.style.fontSize = '14px';
      element.style.lineHeight = '1.5';
      element.style.padding = '15mm';
      element.style.boxSizing = 'border-box';
      element.className = originalClass + ' pdf-generating';
      
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(element, {
        scale: 1.5, // Balanced quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        ignoreElements: (element) => {
          return element.classList?.contains('print-hidden') || false;
        }
      });
      
      // Restore original styles
      element.style.cssText = originalStyle;
      element.className = originalClass;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Minimal margins for maximum content area
      const margin = 5; // 5mm margin
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      // Calculate scaling to fit the content properly
      const widthRatio = availableWidth / canvasWidth;
      const heightRatio = availableHeight / canvasHeight;
      
      // Use the smaller ratio to ensure everything fits
      const scale = Math.min(widthRatio, 1); // Don't scale up, only down if needed
      
      const imgWidth = canvasWidth * scale;
      const imgHeight = canvasHeight * scale;
      
      // Center the content
      const imgX = (pdfWidth - imgWidth) / 2;
      const imgY = margin;
      
      // Check if content needs multiple pages
      if (imgHeight > availableHeight) {
        const pageHeight = availableHeight;
        const pages = Math.ceil(imgHeight / pageHeight);
        
        for (let i = 0; i < pages; i++) {
          if (i > 0) pdf.addPage();
          
          // Calculate the source area for this page
          const sourceY = (i * pageHeight) / scale;
          const sourceHeight = Math.min(pageHeight / scale, canvasHeight - sourceY);
          
          if (sourceHeight > 0) {
            // Create a temporary canvas for each page
            const pageCanvas = document.createElement('canvas');
            const ctx = pageCanvas.getContext('2d');
            if (ctx) {
              pageCanvas.width = canvasWidth;
              pageCanvas.height = sourceHeight;
              
              // Clear the canvas
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
              
              // Draw the portion of the original canvas for this page
              ctx.drawImage(
                canvas,
                0, sourceY,
                canvasWidth, sourceHeight,
                0, 0,
                pageCanvas.width, pageCanvas.height
              );
              
              // Add the page image with proper scaling
              const pageImgWidth = pageCanvas.width * scale;
              const pageImgHeight = pageCanvas.height * scale;
              const pageImgX = (pdfWidth - pageImgWidth) / 2;
              
              pdf.addImage(
                pageCanvas.toDataURL('image/png'), 
                'PNG', 
                pageImgX, 
                margin, 
                pageImgWidth, 
                pageImgHeight
              );
            }
          }
        }
      } else {
        // Single page - center the content
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', imgX, imgY, imgWidth, imgHeight);
      }
      
      // Save the PDF
      const filename = `${trip.title.replace(/[^a-zA-Z0-9]/g, '_')}_Itinerary.pdf`;
      pdf.save(filename);
      
      toast({
        title: "Download Complete",
        description: "Your itinerary has been downloaded successfully!",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle sharing
  const handleShare = async () => {
    if (!trip) return;
    
    const shareData = {
      title: `${trip.title} - Travel Itinerary`,
      text: `Check out my travel itinerary for ${trip.destination}!`,
      url: window.location.href
    };
    
    try {
      // Check if native Web Share API is available
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared Successfully",
          description: "Your itinerary has been shared!",
        });
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Itinerary link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Itinerary link copied to clipboard!",
        });
      } catch (clipboardError) {
        toast({
          title: "Share Failed",
          description: "Unable to share or copy link. Please copy the URL manually.",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="travel-container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="travel-container py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {error === 'Access denied' ? 'Access Denied' : 'Trip Not Found'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {error === 'Access denied' 
                    ? "You don't have permission to view this trip." 
                    : "The trip you're looking for doesn't exist or has been removed."
                  }
                </p>
                <Link href="/dashboard">
                  <Button className="travel-button">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const duration = calculateDuration(trip.startDate, trip.endDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="travel-container py-8 pdf-content" ref={printRef}>
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 print-hidden">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              disabled={isGeneratingPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? 'Generating...' : 'Download'}
            </Button>
          </div>
        </div>

        {/* PDF Title - Only visible in PDF */}
        <div className="pdf-title-section mb-8">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{trip.title}</h1>
            <p className="text-lg text-gray-600">{trip.destination}</p>
            <p className="text-sm text-gray-500 mt-2">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)} • {duration} {duration === 1 ? 'day' : 'days'}
            </p>
            <p className="text-xs text-gray-500">Generated by MOV-O-MATIC Travel Planner</p>
          </div>
        </div>

        {/* Trip Overview */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{trip.title}</CardTitle>
                    <div className="flex items-center space-x-2 text-gray-500 mt-2">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.destination}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      trip.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                      trip.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      trip.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                      trip.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <div className="font-medium">{formatDate(trip.startDate)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">End Date:</span>
                    <div className="font-medium">{formatDate(trip.endDate)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-semibold">{duration} {duration === 1 ? 'day' : 'days'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Travelers</div>
                  <div className="font-semibold">{trip.travelers} {trip.travelers === 1 ? 'person' : 'people'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="font-semibold">₹{trip.budget?.toLocaleString() || 'Not set'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        

        {/* Trip Planning Details */}
        <Card className="print-page-break">
          <CardHeader>
            <CardTitle>Trip Planning Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="planning" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px] print-hidden">
                <TabsTrigger value="planning">Planning Details</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              </TabsList>

              <TabsContent value="planning">
                <div className="space-y-6">
                  {/* Duplicate Hotels for Tab Content (Hidden in Print) */}
                  {trip.aiRecommendation && trip.aiRecommendation.hotels && (
                    <Card className="print-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          🏨 Recommended Hotels
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {trip.aiRecommendation.hotels.map((hotel: any, index: number) => (
                            <Card key={index} className="border border-gray-200">
                              <CardContent className="p-4">
                                <h4 className="font-semibold text-lg mb-2">{hotel.name}</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span>{hotel.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-yellow-500">⭐</span>
                                    <span>{hotel.rating}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-500" />
                                    <span>₹{hotel.pricePerNight}/night</span>
                                  </div>
                                  {hotel.amenities && Array.isArray(hotel.amenities) && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {hotel.amenities.slice(0, 4).map((amenity: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                          {amenity}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <p className="text-gray-600 mt-2">{hotel.description}</p>
                                  {/* AI insight removed - showing only core hotel info */}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Generated Attractions */}
                  {trip.aiRecommendation && trip.aiRecommendation.attractions && (
                    <Card className="print-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          🎯 Recommended Attractions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {trip.aiRecommendation.attractions.map((attraction: any, index: number) => (
                            <Card key={index} className="border border-gray-200">
                              <CardContent className="p-4">
                                <h4 className="font-semibold mb-2">{attraction.title}</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span>{attraction.location}</span>
                                  </div>
                                  {attraction.cost && (
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="w-4 h-4 text-green-500" />
                                      <span>₹{attraction.cost}</span>
                                    </div>
                                  )}
                                  {attraction.duration && (
                                    <div className="text-gray-500">
                                      ⏱️ {attraction.duration} minutes
                                    </div>
                                  )}
                                  {attraction.bestTime && (
                                    <div className="text-blue-600">
                                      🕒 Best time: {attraction.bestTime}
                                    </div>
                                  )}
                                  <p className="text-gray-600 mt-2">{attraction.description}</p>
                                  {/* Tips removed - displaying core attraction info only */}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Generated Restaurants */}
                  {trip.aiRecommendation && trip.aiRecommendation.restaurants && (
                    <Card className="print-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          🍽️ Recommended Restaurants
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {trip.aiRecommendation.restaurants.map((restaurant: any, index: number) => (
                            <Card key={index} className="border border-gray-200">
                              <CardContent className="p-4">
                                <h4 className="font-semibold mb-2">{restaurant.title}</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span>{restaurant.location}</span>
                                  </div>
                                  {restaurant.cost && (
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="w-4 h-4 text-green-500" />
                                      <span>₹{restaurant.cost}/person</span>
                                    </div>
                                  )}
                                  {restaurant.foodType && (
                                    <div className="text-orange-600">
                                      🍕 {restaurant.foodType}
                                    </div>
                                  )}
                                  <p className="text-gray-600 mt-2">{restaurant.description}</p>
                                  {restaurant.mustTry && (
                                    <div className="bg-red-50 p-2 rounded mt-2">
                                      <div className="text-red-800 text-xs font-medium">Must Try:</div>
                                      <div className="text-red-700 text-xs">
                                        {restaurant.mustTry.join(', ')}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div className="grid gap-6 lg:grid-cols-2 mt-6">
                  {/* Personal Details */}
                  {trip.metadata?.personalDetails && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">Traveler:</span>
                          <div className="font-medium">{trip.metadata.personalDetails.fullName}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Contact:</span>
                          <div className="font-medium">{trip.metadata.personalDetails.email}</div>
                          <div className="font-medium">{trip.metadata.personalDetails.phone}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">From:</span>
                          <div className="font-medium">{trip.metadata.personalDetails.cityOfResidence}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Travel Companion:</span>
                          <div className="font-medium">{trip.metadata.personalDetails.travelCompanion}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Travel Information */}
                  {trip.metadata?.travelInfo && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Travel Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">Start Location:</span>
                          <div className="font-medium">{trip.metadata.travelInfo.startLocation}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Destinations:</span>
                          <div className="font-medium">{trip.metadata.travelInfo.destinations?.join(', ')}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Trip Type:</span>
                          <div className="font-medium">{trip.metadata.travelInfo.tripType}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Primary Transport:</span>
                          <div className="font-medium">{trip.metadata.travelInfo.modeOfTravel}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preferences">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Preferences */}
                  {trip.metadata?.preferences && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Food Preferences</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {trip.metadata.preferences.foodPreferences?.map((pref, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {pref}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Activity Interests</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {trip.metadata.preferences.activityInterests?.map((activity, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {activity}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="itinerary">
                <Card>
                  <CardHeader>
                    <CardTitle>Trip Itinerary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trip.aiRecommendation && trip.aiRecommendation.itinerary ? (
                      <div className="space-y-6">
                        {/* Destination Compatibility Warnings */}
                        {trip.aiRecommendation.destinationCompatibility && (
                          <div className="mb-6">
                            {(trip.aiRecommendation.destinationCompatibility.unavailableInterests?.length > 0 ||
                              trip.aiRecommendation.destinationCompatibility.unavailableFoods?.length > 0 ||
                              trip.aiRecommendation.destinationCompatibility.unavailableActivities?.length > 0) && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-2">
                                  <div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-amber-800 mb-2">
                                      Destination Compatibility Notice
                                    </h4>
                                    <p className="text-amber-700 text-sm mb-3">
                                      {trip.aiRecommendation.destinationCompatibility.compatibilityNote}
                                    </p>
                                    
                                    {trip.aiRecommendation.destinationCompatibility.unavailableInterests?.length > 0 && (
                                      <div className="mb-2">
                                        <span className="font-medium text-amber-800">Unavailable Interests: </span>
                                        <span className="text-amber-700">
                                          {trip.aiRecommendation.destinationCompatibility.unavailableInterests.join(', ')}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {trip.aiRecommendation.destinationCompatibility.unavailableFoods?.length > 0 && (
                                      <div className="mb-2">
                                        <span className="font-medium text-amber-800">Limited Food Options: </span>
                                        <span className="text-amber-700">
                                          {trip.aiRecommendation.destinationCompatibility.unavailableFoods.join(', ')}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {trip.aiRecommendation.destinationCompatibility.unavailableActivities?.length > 0 && (
                                      <div className="mb-2">
                                        <span className="font-medium text-amber-800">Unavailable Activities: </span>
                                        <span className="text-amber-700">
                                          {trip.aiRecommendation.destinationCompatibility.unavailableActivities.join(', ')}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {trip.aiRecommendation.destinationCompatibility.alternativeSuggestions?.length > 0 && (
                                      <div className="mt-3 pt-2 border-t border-amber-200">
                                        <span className="font-medium text-amber-800">💡 Alternative Suggestions: </span>
                                        <ul className="text-amber-700 mt-1">
                                          {trip.aiRecommendation.destinationCompatibility.alternativeSuggestions.map((suggestion: string, i: number) => (
                                            <li key={i} className="text-sm">• {suggestion}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {(!trip.aiRecommendation.destinationCompatibility.unavailableInterests?.length &&
                              !trip.aiRecommendation.destinationCompatibility.unavailableFoods?.length &&
                              !trip.aiRecommendation.destinationCompatibility.unavailableActivities?.length) && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 text-green-600">✅</div>
                                  <div>
                                    <h4 className="font-semibold text-green-800">Perfect Match!</h4>
                                    <p className="text-green-700 text-sm">
                                      All your selected preferences are available at {trip.destination}!
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* AI Generated Itinerary */}
                        {trip.aiRecommendation.itinerary.map((day: any, index: number) => (
                          <Card key={day.day || index} className="border-l-4 border-l-blue-500">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-blue-600 font-semibold">Day {day.day}</span>
                                    {day.date && (
                                      <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                        {day.date}
                                      </span>
                                    )}
                                  </div>
                                  {(day.title || day.dayTitle) && (
                                    <span className="text-base font-medium text-gray-800 mt-1">
                                      {day.title || day.dayTitle}
                                    </span>
                                  )}
                                </div>
                              </CardTitle>
                              {day.theme && (
                                <p className="text-sm text-gray-600">{day.theme}</p>
                              )}
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {/* Activities */}
                                {day.activities && (
                                  <div>
                                    <h4 className="font-medium mb-2">Activities:</h4>
                                    <ul className="space-y-3">
                                      {day.activities.map((activity: any, actIndex: number) => (
                                        <li key={actIndex} className="text-sm text-gray-700">
                                          {typeof activity === 'string' ? (
                                            // Simple string activity
                                            <div className="flex items-start gap-2">
                                              <span className="text-blue-500 mt-1">•</span>
                                              <span>{activity}</span>
                                            </div>
                                          ) : (
                                            // Detailed activity object
                                            <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-l-blue-500">
                                              <div className="flex items-start justify-between mb-2">
                                                <h5 className="font-medium text-gray-900">{activity.title}</h5>
                                                {activity.startTime && activity.endTime && (
                                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                    {activity.startTime} - {activity.endTime}
                                                  </span>
                                                )}
                                              </div>
                                              {activity.description && (
                                                <p className="text-gray-600 mb-2">{activity.description}</p>
                                              )}
                                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                                {activity.location && (
                                                  <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{activity.location}</span>
                                                  </div>
                                                )}
                                                {activity.duration && (
                                                  <div className="flex items-center gap-1">
                                                    <span>⏱️ {activity.duration} min</span>
                                                  </div>
                                                )}
                                                {activity.cost && activity.cost !== '0' && (
                                                  <div className="flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3 text-green-500" />
                                                    <span className="text-green-600">₹{activity.cost}</span>
                                                  </div>
                                                )}
                                              </div>
                                              {activity.notes && (
                                                <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded">
                                                  💡 {activity.notes}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Meals */}
                                {day.meals && (
                                  <div>
                                    <h4 className="font-medium mb-2">Meals:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                      {day.meals.breakfast && (
                                        <div><strong>Breakfast:</strong> {day.meals.breakfast}</div>
                                      )}
                                      {day.meals.lunch && (
                                        <div><strong>Lunch:</strong> {day.meals.lunch}</div>
                                      )}
                                      {day.meals.dinner && (
                                        <div><strong>Dinner:</strong> {day.meals.dinner}</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Day Cost */}
                                {day.totalCost && (
                                  <div className="text-sm text-green-600 font-medium">
                                    Estimated Cost: {day.totalCost}
                                  </div>
                                )}
                                
                                {/* Tips */}
                                {day.tips && (
                                  <div className="bg-yellow-50 p-3 rounded-lg">
                                    <h4 className="font-medium text-yellow-800 mb-1">💡 Tips:</h4>
                                    <p className="text-sm text-yellow-700">{day.tips}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {/* Summary Info */}
                        {trip.aiRecommendation.summary && (
                          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                            <CardHeader>
                              <CardTitle className="text-green-700">Trip Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-700 mb-3">{trip.aiRecommendation.summary.description}</p>
                              {trip.aiRecommendation.summary.highlights && (
                                <div>
                                  <h4 className="font-medium mb-2">Highlights:</h4>
                                  <ul className="space-y-1">
                                    {trip.aiRecommendation.summary.highlights.map((highlight: string, index: number) => (
                                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="text-green-500">✨</span>
                                        {highlight}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {trip.aiRecommendation.summary.totalCost && (
                                <div className="mt-3 text-lg font-semibold text-green-600">
                                  Total Estimated Cost: {trip.aiRecommendation.summary.totalCost}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Itinerary Coming Soon!</h3>
                        <p className="text-gray-600 mb-4">
                          Your detailed day-by-day itinerary will be generated based on your preferences.
                        </p>
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                          Generate AI Itinerary
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}