# Google Places Enrichment Integration Guide

## Overview

Planora now integrates with **Google Places API (New)** to enrich all generated itineraries with real-time, verified location data. Every place in your itinerary is validated and enriched with:

- ✅ Real address and coordinates
- ✅ Current rating and review count
- ✅ Operating hours
- ✅ Photos and attributions
- ✅ Contact information
- ✅ Price level
- ✅ Google Maps link
- ✅ Travel time to next activity

## Architecture

### Backend Services

#### 1. **Google Places Service** (`server/services/google-places.ts`)
- Communicates with Google Places API (New)
- Methods:
  - `searchPlaces()` - Text search for places
  - `searchRestaurants()` - Find restaurants by cuisine/budget
  - `searchHotels()` - Find hotels by name/type
  - `searchAttractions()` - Find tourist attractions
  - `validatePlace()` - Check if a place exists
  - `getPlaceDetails()` - Get detailed place information

#### 2. **Google Routes Service** (`server/services/google-routes.ts`)
- Calculates travel times and distances
- Methods:
  - `getDistance()` - Get travel time between two locations
  - `getRouteInfo()` - Get route information for waypoints
  - `calculateItineraryTravelTimes()` - Calculate travel times for all activities

#### 3. **Cache Service** (`server/services/cache.ts`)
- In-memory caching with TTL (Time To Live)
- Reduces API calls significantly
- Methods:
  - `get()` - Retrieve cached value
  - `set()` - Store value in cache
  - `getOrFetch()` - Get from cache or fetch fresh data
  - `cleanup()` - Remove expired entries

#### 4. **Place Enrichment Service** (`server/services/place-enrichment.ts`)
- Orchestrates enrichment workflow
- Methods:
  - `enrichActivity()` - Enrich single activity
  - `enrichRestaurant()` - Enrich restaurant
  - `enrichHotel()` - Enrich hotel
  - `enrichItineraryDay()` - Enrich all activities in a day
  - `enrichItinerary()` - Enrich entire itinerary
  - `validateItinerary()` - Validate all places
  - `searchRestaurantsByType()` - Search restaurants dynamically
  - `getPlaceDetails()` - Get full place details

### Frontend Components

#### 1. **EnrichedPlaceCard** (`client/src/components/enriched-place-card.tsx`)
- Displays enriched place information
- Shows:
  - Place name with "Verified by Google" badge
  - Star rating and review count
  - Address and coordinates
  - Phone number (clickable)
  - Website link
  - Google Maps link
  - Price level
  - Opening hours
  - Photo gallery preview

#### 2. **EnrichedItinerary** (`client/src/components/enriched-itinerary.tsx`)
- Shows complete itinerary with enriched data
- Features:
  - Day-by-day breakdown
  - Verification status for each place
  - Travel time between activities
  - Expandable activity details
  - Place details modal
  - Summary statistics

### React Hooks

#### 1. **useEnrichedItinerary** (`client/src/hooks/use-enriched-itinerary.ts`)
- `enrichItinerary()` - Enrich entire itinerary
- `validateItinerary()` - Validate places
- `enrichActivity()` - Enrich single activity
- `getPlaceDetails()` - Get place details
- States: enrichedDays, loading, error, progress

#### 2. **useRestaurantSearch**
- `searchRestaurants()` - Search by destination/cuisine/budget
- Dynamic restaurant fetching without hardcoded data

## API Endpoints

### Enrichment Endpoints

```
POST /api/places/enrich-activity
POST /api/places/enrich-restaurant
POST /api/places/enrich-hotel
POST /api/places/search-restaurants
POST /api/places/validate-itinerary
POST /api/places/enrich-itinerary
GET  /api/places/details/:placeId
GET  /api/places/cache-stats
```

## Usage Examples

### Example 1: Enrich an Itinerary

```typescript
import { useEnrichedItinerary } from "@/hooks/use-enriched-itinerary";

export function MyItinerary({ days, destination }) {
  const { enrichedDays, loading, error, enrichItinerary } = 
    useEnrichedItinerary({ destination });

  const handleEnrich = async () => {
    await enrichItinerary(days);
  };

  return (
    <>
      <button onClick={handleEnrich} disabled={loading}>
        {loading ? "Enriching..." : "Verify & Enrich with Google Places"}
      </button>
      
      {error && <p className="error">{error}</p>}
      
      {enrichedDays.length > 0 && (
        <EnrichedItinerary days={enrichedDays} destination={destination} />
      )}
    </>
  );
}
```

### Example 2: Search Restaurants Dynamically

```typescript
import { useRestaurantSearch } from "@/hooks/use-enriched-itinerary";

export function RestaurantFinder() {
  const { restaurants, loading, searchRestaurants } = useRestaurantSearch();

  const handleSearch = async () => {
    await searchRestaurants("Mumbai", "Indian", "medium");
  };

  return (
    <>
      <button onClick={handleSearch}>Find Restaurants</button>
      
      <div className="restaurants-grid">
        {restaurants.map(restaurant => (
          <EnrichedPlaceCard 
            key={restaurant.placeId}
            place={restaurant}
            placeTitle={restaurant.name}
          />
        ))}
      </div>
    </>
  );
}
```

### Example 3: Display Enriched Place

```typescript
import EnrichedPlaceCard from "@/components/enriched-place-card";

export function PlaceDetails({ enrichedPlace }) {
  return (
    <EnrichedPlaceCard 
      place={enrichedPlace}
      placeTitle={enrichedPlace.name}
      showPhotoGallery={true}
      onPhotosClick={() => window.open(enrichedPlace.mapsUri)}
    />
  );
}
```

## Data Flow

### Itinerary Enrichment Flow

```
1. AI generates itinerary with place names
   ↓
2. Client calls POST /api/places/enrich-itinerary
   ↓
3. PlaceEnrichmentService processes each activity
   ↓
4. For each activity:
   a. Check cache for place data
   b. If not cached, search Google Places API
   c. Calculate travel time to next activity
   d. Store in cache (1 hour TTL)
   ↓
5. Return enriched days with place details
   ↓
6. React components display enriched data
   ↓
7. User sees verified locations with real information
```

## Caching Strategy

The system uses smart caching to minimize API calls:

- **Place queries**: Cached for 24 hours
- **Place details**: Cached for 24 hours
- **Restaurant searches**: Cached for 24 hours
- **Travel times**: Cached for 1 hour (routes change)

Automatic cleanup of expired entries every 30 minutes.

## Error Handling

### API Failures
If Google Places API is down or rate-limited:
- System returns cached data if available
- Shows warning message to user
- Provides option to retry
- Continues with AI-generated data as fallback

### Place Not Found
If a place doesn't exist in Google Places:
- Shows "unverified" badge
- Searches for closest matching place
- Returns best match with lower confidence score
- Allows manual search option

### Missing Coordinates
If place data lacks coordinates:
- Uses AI-generated coordinates
- Shows warning badge
- Disables travel time calculation
- Suggests user verify location

## Configuration

### Required Environment Variables

```bash
# .env
GOOGLE_PLACES_API_KEY=your-api-key
GOOGLE_MAPS_API_KEY=your-api-key
```

### Optional Configuration

```typescript
// In place-enrichment.ts
const CACHE_TTL_MINUTES = 60; // Adjust cache duration
const MAX_SEARCH_RESULTS = 5; // Limit search results
```

## Type Definitions

All types are defined in `shared/schema.ts`:

```typescript
interface EnrichedPlace {
  name: string;
  address: string;
  placeId: string;
  location: { lat: number; lng: number };
  rating?: number;
  totalRatings?: number;
  priceLevel?: string;
  openingHours?: OpeningPeriod[];
  websiteUri?: string;
  mapsUri?: string;
  phoneNumber?: string;
  photos?: PlacePhoto[];
  verifiedByGoogle?: boolean;
}

interface EnrichedActivity extends Activity {
  enrichedPlace?: EnrichedPlace;
  travelInfo?: {
    toNextActivity?: {
      distance: string;
      duration: string;
      distanceValue: number;
      durationValue: number;
    };
  };
}

interface EnrichedItineraryDay extends ItineraryDay {
  activities: EnrichedActivity[];
}
```

## Performance Considerations

1. **API Calls**: ~5 API calls per 10 places initially
2. **Caching**: ~0.5 API calls per 10 places after cache
3. **Batch Processing**: All activities in a day are processed in parallel
4. **Response Time**: ~2-5 seconds for typical itinerary
5. **Cache Size**: ~50-100 KB for 100 places

## Monitoring

Check cache statistics:

```bash
GET /api/places/cache-stats
```

Response:
```json
{
  "totalEntries": 150,
  "validEntries": 145,
  "expiredEntries": 5,
  "cacheSize": 245280
}
```

## Future Enhancements

- [ ] Redis for distributed caching
- [ ] Scheduled cache warming
- [ ] A/B testing with AI-only vs enriched data
- [ ] User feedback on enrichment accuracy
- [ ] Custom place filtering by rating/price
- [ ] Bulk place validation with CSV import
- [ ] Enrichment analytics dashboard
- [ ] Multi-language support

## Support & Troubleshooting

### Issue: "Google Places API key not configured"
**Solution**: Add `GOOGLE_PLACES_API_KEY` to `.env` file

### Issue: "Rate limit exceeded"
**Solution**: Wait 60 seconds or upgrade API quota in Google Cloud Console

### Issue: "Place not found"
**Solution**: Try different spelling or search nearby attractions instead

### Issue: Slow enrichment
**Solution**: Check network connection or API quota usage

## Resources

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Google Routes API Documentation](https://developers.google.com/maps/documentation/routes/overview)
- [API Rate Limits](https://developers.google.com/maps/billing-and-pricing/pricing)

---

**Last Updated**: 2026-07-01
**Version**: 1.0.0
