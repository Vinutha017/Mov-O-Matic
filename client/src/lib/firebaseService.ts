import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface AuthUserLike {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

const LOCAL_USER_PROFILES_KEY = 'planora-local-user-profiles';

const isBrowser = typeof window !== 'undefined';

const readLocalProfiles = (): Record<string, UserProfile> => {
  if (!isBrowser) return {};

  try {
    const stored = window.localStorage.getItem(LOCAL_USER_PROFILES_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored) as Record<string, any>;
    return Object.fromEntries(
      Object.entries(parsed).map(([uid, profile]) => [uid, {
        ...profile,
        createdAt: profile.createdAt ? new Date(profile.createdAt) : new Date(),
        updatedAt: profile.updatedAt ? new Date(profile.updatedAt) : new Date(),
      }])
    ) as Record<string, UserProfile>;
  } catch (error) {
    console.error('Failed to read local user profiles:', error);
    return {};
  }
};

const writeLocalProfiles = (profiles: Record<string, UserProfile>) => {
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(LOCAL_USER_PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to write local user profiles:', error);
  }
};

const upsertLocalProfile = (profile: UserProfile) => {
  const profiles = readLocalProfiles();
  profiles[profile.uid] = profile;
  writeLocalProfiles(profiles);
  return profile;
};

// User Profile Management
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  preferences?: {
    currency?: string;
    language?: string;
    notifications?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const createUserProfile = async (user: AuthUserLike, additionalData?: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', user.uid);
  
  try {
    console.log('🔥 Creating user profile for:', user.uid);
    console.log('📧 User email:', user.email);
    console.log('� Display name:', user.displayName);
    console.log('�📋 Additional data:', additionalData);
    console.log('🗂️ Collection path:', `users/${user.uid}`);
    
    // Use cache first for better performance
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const userData: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...additionalData
      };
      
      console.log('💾 Saving user data to Firestore:', userData);
      
      // Use setDoc with merge to ensure data is saved properly
      await setDoc(userRef, userData, { merge: true });
      
      console.log('✅ User profile saved successfully to users collection!');
      console.log('🔍 Document ID:', user.uid);
      
      // Verify the document was created by reading it back
      const verifyDoc = await getDoc(userRef);
      if (verifyDoc.exists()) {
        console.log('✅ Verification: Document exists in users collection');
        console.log('📄 Saved data:', verifyDoc.data());
      } else {
        console.error('❌ Verification failed: Document not found after creation');
      }
      
      return upsertLocalProfile(userData);
    }
    
    return userDoc.data() as UserProfile;
  } catch (error: any) {
    console.error('❌ Error creating user profile:', error);
    console.error('📧 Failed for user:', user.email);
    console.error('🆔 User ID:', user.uid);
    console.error('📋 Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied: Unable to create user profile. Please check Firestore security rules.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firestore service unavailable. Please try again later.');
    } else if (error.code === 'already-exists') {
      console.log('ℹ️ User profile already exists, this is normal for existing users');
      return await getUserProfile(user.uid);
    }
    
    const localProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...additionalData
    };

    console.warn('⚠️ Falling back to local profile storage for user:', user.uid);
    return upsertLocalProfile(localProfile);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return readLocalProfiles()[uid] || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return readLocalProfiles()[uid] || null;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    const existingProfile = readLocalProfiles()[uid] || {
      uid,
      displayName: '',
      email: '',
      photoURL: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    upsertLocalProfile({
      ...existingProfile,
      ...data,
      updatedAt: new Date(),
    });
  }
};

// Admin/Debug Functions
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    console.log('📋 Fetching all users from users collection...');
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    
    console.log(`✅ Found ${users.length} users in collection`);
    console.log('👥 Users:', users.map(u => ({ uid: u.uid, email: u.email, name: u.displayName })));
    
    return users;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }
};

export const verifyUserExists = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    const exists = userDoc.exists();
    
    console.log(`🔍 User ${uid} exists in collection:`, exists);
    if (exists) {
      console.log('📄 User data:', userDoc.data());
    }
    
    return exists;
  } catch (error) {
    console.error('❌ Error verifying user:', error);
    return false;
  }
};

// Trip Management
export interface Trip {
  id?: string;
  userId: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  currency?: string;
  travelers: number;
  tripType: 'adventure' | 'relaxation' | 'cultural' | 'business' | 'family' | 'romantic';
  status: 'planning' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  aiRecommendation?: any; // AI-generated itinerary from Gemini
  isPublic?: boolean;
  collaborators?: TripCollaborator[];
  // Comprehensive India trip planning metadata
  metadata?: {
    personalDetails?: {
      fullName: string;
      email: string;
      phone: string;
      cityOfResidence: string;
      ageGroup: string;
      travelCompanion: string;
    };
    travelInfo?: {
      startLocation: string;
      destinations: string[];
      tripType: string;
      modeOfTravel: string;
      preferredDepartureTime: string;
    };
    budget?: {
      overallBudget: string;
      accommodationPercent?: number;
      foodPercent?: number;
      travelPercent?: number;
      activitiesPercent?: number;
    };
    hotelPreferences?: {
      hotelType: string;
      preferredHotelChains?: string[];
      roomType: string;
      facilitiesRequired?: string[];
      preferredStayArea?: string;
    };
    preferences?: {
      foodPreferences: string[];
      activityInterests: string[];
      tripThemes?: string[];
      travelPace: string;
      localTransportPreference: string;
      cabTypePreference?: string;
      pickupDropAssistance?: boolean;
      aiRecommendations: boolean;
      specialRequirements?: string;
    };
  };
  itinerary?: {
    day: number;
    activities: {
      time: string;
      title: string;
      description: string;
      location?: string;
      cost?: number;
    }[];
  }[];
  hotels?: {
    name: string;
    checkIn: Date;
    checkOut: Date;
    cost?: number;
    rating?: number;
  }[];
  expenses?: {
    category: string;
    amount: number;
    description: string;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TripCollaborator {
  email: string;
  permission: 'view' | 'edit' | 'admin';
  status: 'pending' | 'accepted' | 'declined';
  invitedBy?: string;
  invitedAt: Date;
  userId?: string;
  displayName?: string;
}

export const createTrip = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const tripsRef = collection(db, 'trips');
    const docRef = await addDoc(tripsRef, {
      ...tripData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

export const getUserTrips = async (userId: string): Promise<Trip[]> => {
  try {
    console.log('🔍 getUserTrips called with userId:', userId);
    
    const tripsRef = collection(db, 'trips');
    
    // First, let's try without orderBy to see if that's causing issues
    const simpleQuery = query(tripsRef, where('userId', '==', userId));
    
    console.log('📊 Executing query: trips where userId ==', userId);
    const querySnapshot = await getDocs(simpleQuery);
    
    console.log('📈 Query returned', querySnapshot.size, 'documents');
    
    const trips: Trip[] = [];
    
    querySnapshot.forEach((doc) => {
      console.log('📄 Found trip document:', doc.id, 'with data:', doc.data());
      trips.push({
        id: doc.id,
        ...doc.data()
      } as Trip);
    });
    
    console.log('✅ getUserTrips returning', trips.length, 'trips for user', userId);
    return trips;
  } catch (error) {
    console.error('❌ Error fetching user trips for userId', userId, ':', error);
    
    // Let's also try to get ALL trips to see what's in the collection
    try {
      console.log('🔍 Debugging: Fetching ALL trips to see what exists...');
      const allTripsSnapshot = await getDocs(collection(db, 'trips'));
      console.log('📊 Total trips in collection:', allTripsSnapshot.size);
      allTripsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Trip:', doc.id, 'userId:', data.userId, 'title:', data.title);
      });
    } catch (debugError) {
      console.error('❌ Debug query also failed:', debugError);
    }
    
    throw error;
  }
};

export const getTrip = async (tripId: string): Promise<Trip | null> => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripRef);
    
    if (tripDoc.exists()) {
      return {
        id: tripDoc.id,
        ...tripDoc.data()
      } as Trip;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching trip:', error);
    throw error;
  }
};

export const updateTrip = async (tripId: string, data: Partial<Trip>) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

export const inviteTripCollaborator = async (
  tripId: string,
  collaborator: Omit<TripCollaborator, 'invitedAt'>
) => {
  try {
    const trip = await getTrip(tripId);

    if (!trip) {
      throw new Error('Trip not found');
    }

    const collaborators = Array.isArray(trip.collaborators) ? [...trip.collaborators] : [];
    const normalizedEmail = collaborator.email.trim().toLowerCase();
    const collaboratorIndex = collaborators.findIndex(
      (entry) => entry.email.trim().toLowerCase() === normalizedEmail
    );

    const nextCollaborator: TripCollaborator = {
      ...collaborator,
      email: collaborator.email.trim(),
      invitedAt: new Date(),
    };

    if (collaboratorIndex >= 0) {
      collaborators[collaboratorIndex] = {
        ...collaborators[collaboratorIndex],
        ...nextCollaborator,
      };
    } else {
      collaborators.push(nextCollaborator);
    }

    await updateTrip(tripId, {
      collaborators,
      isPublic: true,
    });

    return collaborators;
  } catch (error) {
    console.error('Error inviting trip collaborator:', error);
    throw error;
  }
};

export const deleteTrip = async (tripId: string) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    await deleteDoc(tripRef);
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};