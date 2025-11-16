import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  TwitterAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile, getUserProfile, UserProfile } from '../lib/firebaseService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string, additionalData?: Partial<UserProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string, displayName?: string, additionalData?: Partial<UserProfile>) => {
    try {
      console.log('🚀 Starting signup process...');
      console.log('📧 Email:', email);
      console.log('👤 Display Name:', displayName);
      console.log('📋 Additional Data:', additionalData);
      
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ User created in Firebase Auth:', user.uid);
      
      if (displayName) {
        await updateProfile(user, { displayName });
        console.log('✅ Display name updated');
      }
      
      // Create user profile in Firestore with additional data
      console.log('💾 Creating user profile in Firestore...');
      await createUserProfile(user, additionalData);
      console.log('🎉 Signup completed successfully!');
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      
      // Handle specific Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        const customError = new Error('An account with this email already exists. Please sign in instead or use a different email address.');
        customError.name = 'EmailAlreadyInUse';
        throw customError;
      } else if (error.code === 'auth/weak-password') {
        const customError = new Error('Password is too weak. Please choose a stronger password with at least 6 characters.');
        customError.name = 'WeakPassword';
        throw customError;
      } else if (error.code === 'auth/invalid-email') {
        const customError = new Error('Please enter a valid email address.');
        customError.name = 'InvalidEmail';
        throw customError;
      } else if (error.code === 'auth/operation-not-allowed') {
        const customError = new Error('Email/password accounts are not enabled. Please contact support.');
        customError.name = 'OperationNotAllowed';
        throw customError;
      }
      
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      
      // Handle specific Firebase error codes
      if (error.code === 'auth/invalid-credential') {
        // Firebase now uses this error for both user-not-found and wrong-password for security
        const customError = new Error('Invalid email or password. Please check your credentials and try again.');
        customError.name = 'InvalidCredential';
        throw customError;
      } else if (error.code === 'auth/user-not-found') {
        const customError = new Error('No account found with this email address. Would you like to create a new account?');
        customError.name = 'UserNotFound';
        throw customError;
      } else if (error.code === 'auth/wrong-password') {
        const customError = new Error('Incorrect password. Please try again or reset your password.');
        customError.name = 'WrongPassword';
        throw customError;
      } else if (error.code === 'auth/invalid-email') {
        const customError = new Error('Please enter a valid email address.');
        customError.name = 'InvalidEmail';
        throw customError;
      } else if (error.code === 'auth/user-disabled') {
        const customError = new Error('This account has been disabled. Please contact support.');
        customError.name = 'UserDisabled';
        throw customError;
      } else if (error.code === 'auth/too-many-requests') {
        const customError = new Error('Too many failed login attempts. Please try again later.');
        customError.name = 'TooManyRequests';
        throw customError;
      }
      
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (currentUser) {
      await updateProfile(currentUser, { displayName, photoURL });
    }
  };

  const refreshUserProfile = async () => {
    if (currentUser) {
      try {
        console.log('🔄 Refreshing user profile for:', currentUser.uid);
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
        console.log('✅ User profile refreshed successfully:', profile);
      } catch (error) {
        console.error('❌ Error refreshing user profile:', error);
      }
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Create user profile if it doesn't exist
    await createUserProfile(result.user);
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Create user profile if it doesn't exist
    await createUserProfile(result.user);
  };

  const signInWithTwitter = async () => {
    const provider = new TwitterAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Create user profile if it doesn't exist
    await createUserProfile(result.user);
  };

  useEffect(() => {
    // Set loading to true initially to wait for auth state
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? `User ${user.uid} logged in` : 'User logged out');
      
      setCurrentUser(user);
      
      if (user) {
        console.log('👤 Loading user profile for:', user.uid);
        // Load user profile from Firestore asynchronously
        try {
          // First try to get existing profile
          let profile = await getUserProfile(user.uid);
          
          // If no profile exists, create one (for existing Firebase Auth users)
          if (!profile) {
            console.log('🆕 No profile found, creating new profile for user:', user.uid);
            profile = await createUserProfile(user);
          }
          
          setUserProfile(profile);
          console.log('✅ User profile loaded successfully');
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
          setUserProfile(null);
        }
      } else {
        console.log('👋 User logged out, clearing profile');
        setUserProfile(null);
      }
      
      // Set loading to false after auth state is determined
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    refreshUserProfile,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}