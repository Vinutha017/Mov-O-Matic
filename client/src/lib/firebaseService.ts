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
import { User } from 'firebase/auth';

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

export const createUserProfile = async (user: User, additionalData?: Partial<UserProfile>) => {
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
      
      return userData;
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
    
    throw new Error(`Failed to create user profile: ${error.message}`);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
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
    throw error;
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
    const tripsRef = collection(db, 'trips');
    const q = query(
      tripsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const trips: Trip[] = [];
    
    querySnapshot.forEach((doc) => {
      trips.push({
        id: doc.id,
        ...doc.data()
      } as Trip);
    });
    
    return trips;
  } catch (error) {
    console.error('Error fetching user trips:', error);
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

export const deleteTrip = async (tripId: string) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    await deleteDoc(tripRef);
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};