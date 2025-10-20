import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  createTrip, 
  getUserTrips, 
  getTrip, 
  updateTrip, 
  deleteTrip, 
  Trip 
} from '../lib/firebaseService';
import { useToast } from './use-toast';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Fetch user trips
  const fetchTrips = async () => {
    if (!currentUser) {
      setTrips([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userTrips = await getUserTrips(currentUser.uid);
      setTrips(userTrips);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trips');
      toast({
        title: 'Error',
        description: 'Failed to load your trips',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new trip
  const addTrip = async (tripData: Omit<Trip, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) {
      throw new Error('User must be logged in to create trips');
    }

    try {
      const tripId = await createTrip({
        ...tripData,
        userId: currentUser.uid
      });

      // Refresh trips list
      await fetchTrips();

      toast({
        title: 'Success',
        description: 'Your trip has been created successfully!'
      });

      return tripId;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create trip',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Update an existing trip
  const editTrip = async (tripId: string, updates: Partial<Trip>) => {
    try {
      await updateTrip(tripId, updates);
      
      // Update local state
      setTrips(prev => prev.map(trip => 
        trip.id === tripId ? { ...trip, ...updates } : trip
      ));

      toast({
        title: 'Success',
        description: 'Trip updated successfully!'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update trip',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Delete a trip
  const removeTrip = async (tripId: string) => {
    try {
      await deleteTrip(tripId);
      
      // Update local state
      setTrips(prev => prev.filter(trip => trip.id !== tripId));

      toast({
        title: 'Success',
        description: 'Trip deleted successfully'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete trip',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Get a single trip
  const getTripById = async (tripId: string): Promise<Trip | null> => {
    try {
      return await getTrip(tripId);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load trip',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Fetch trips when user changes
  useEffect(() => {
    fetchTrips();
  }, [currentUser]);

  return {
    trips,
    loading,
    error,
    addTrip,
    editTrip,
    removeTrip,
    getTripById,
    refetch: fetchTrips
  };
}

export function useTrip(tripId: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTrip = async () => {
    try {
      setLoading(true);
      setError(null);
      const tripData = await getTrip(tripId);
      setTrip(tripData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trip');
      toast({
        title: 'Error',
        description: 'Failed to load trip details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTripData = async (updates: Partial<Trip>) => {
    try {
      await updateTrip(tripId, updates);
      setTrip(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Success',
        description: 'Trip updated successfully!'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update trip',
        variant: 'destructive'
      });
      throw err;
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  return {
    trip,
    loading,
    error,
    updateTrip: updateTripData,
    refetch: fetchTrip
  };
}