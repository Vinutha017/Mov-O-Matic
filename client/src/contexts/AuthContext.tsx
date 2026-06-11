import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  FacebookAuthProvider,
  TwitterAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile, getUserProfile, UserProfile } from '../lib/firebaseService';

interface AuthenticatedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

interface LocalAuthAccount {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

const LOCAL_AUTH_USERS_KEY = 'planora-local-auth-users';
const LOCAL_AUTH_SESSION_KEY = 'planora-local-auth-session';
const isBrowser = typeof window !== 'undefined';
const useLocalAuthMode = import.meta.env.DEV && isBrowser && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

const readLocalAuthAccounts = (): LocalAuthAccount[] => {
  if (!isBrowser) return [];

  try {
    const stored = window.localStorage.getItem(LOCAL_AUTH_USERS_KEY);
    return stored ? JSON.parse(stored) as LocalAuthAccount[] : [];
  } catch (error) {
    console.error('Failed to read local auth accounts:', error);
    return [];
  }
};

const writeLocalAuthAccounts = (accounts: LocalAuthAccount[]) => {
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Failed to write local auth accounts:', error);
  }
};

const readLocalAuthSession = (): AuthenticatedUser | null => {
  if (!isBrowser) return null;

  try {
    const stored = window.localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
    return stored ? JSON.parse(stored) as AuthenticatedUser : null;
  } catch (error) {
    console.error('Failed to read local auth session:', error);
    return null;
  }
};

const writeLocalAuthSession = (user: AuthenticatedUser | null) => {
  if (!isBrowser) return;

  try {
    if (user) {
      window.localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
    }
  } catch (error) {
    console.error('Failed to write local auth session:', error);
  }
};

const createAuthenticatedUser = (account: LocalAuthAccount): AuthenticatedUser => ({
  uid: account.uid,
  email: account.email,
  displayName: account.displayName,
  photoURL: account.photoURL || null,
  emailVerified: false,
  metadata: {
    creationTime: account.createdAt,
    lastSignInTime: new Date().toISOString(),
  },
});

const normalizeFirebaseUser = (user: FirebaseUser): AuthenticatedUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
  metadata: {
    creationTime: user.metadata.creationTime,
    lastSignInTime: user.metadata.lastSignInTime,
  },
});

interface AuthContextType {
  currentUser: AuthenticatedUser | null;
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
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const syncLocalAuthSession = async (user: AuthenticatedUser, additionalData?: Partial<UserProfile>) => {
    setCurrentUser(user);
    writeLocalAuthSession(user);

    try {
      const profile = await createUserProfile(user, additionalData);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Failed to sync local auth session profile:', error);
      setUserProfile(null);
      return null;
    }
  };

  const signup = async (email: string, password: string, displayName?: string, additionalData?: Partial<UserProfile>) => {
    if (useLocalAuthMode) {
      console.log('🧪 Using local auth mode for signup');

      const localAccounts = readLocalAuthAccounts();
      const existingAccount = localAccounts.find((account) => account.email.toLowerCase() === email.toLowerCase());

      if (existingAccount) {
        const customError = new Error('An account with this email already exists. Please sign in instead or use a different email address.');
        customError.name = 'EmailAlreadyInUse';
        throw customError;
      }

      const newAccount: LocalAuthAccount = {
        uid: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        email,
        password,
        displayName: displayName || email.split('@')[0],
        photoURL: '',
        createdAt: new Date().toISOString(),
      };

      writeLocalAuthAccounts([...localAccounts, newAccount]);
      const localUser = createAuthenticatedUser(newAccount);
      await syncLocalAuthSession(localUser, additionalData);
      console.log('🎉 Local signup completed successfully!');
      return;
    }

    try {
      console.log('🚀 Starting signup process...');
      console.log('📧 Email:', email);
      console.log('👤 Display Name:', displayName);
      console.log('📋 Additional Data:', additionalData);
      
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const normalizedUser = normalizeFirebaseUser(user);
      console.log('✅ User created in Firebase Auth:', normalizedUser.uid);
      
      if (displayName) {
        await updateProfile(user, { displayName });
        console.log('✅ Display name updated');
      }
      
      // Create user profile in Firestore with additional data
      console.log('💾 Creating user profile in Firestore...');
      await createUserProfile(normalizedUser, additionalData);
      setCurrentUser(normalizedUser);
      writeLocalAuthSession(normalizedUser);
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
        const localAccounts = readLocalAuthAccounts();
        const existingAccount = localAccounts.find((account) => account.email.toLowerCase() === email.toLowerCase());

        if (existingAccount) {
          const customError = new Error('An account with this email already exists. Please sign in instead or use a different email address.');
          customError.name = 'EmailAlreadyInUse';
          throw customError;
        }

        const newAccount: LocalAuthAccount = {
          uid: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          email,
          password,
          displayName: displayName || email.split('@')[0],
          photoURL: '',
          createdAt: new Date().toISOString(),
        };

        writeLocalAuthAccounts([...localAccounts, newAccount]);

        const localUser = createAuthenticatedUser(newAccount);
        await syncLocalAuthSession(localUser, additionalData);
        console.log('🎉 Local signup completed successfully!');
        return;
      }
      
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    if (useLocalAuthMode) {
      console.log('🧪 Using local auth mode for login');

      const localAccounts = readLocalAuthAccounts();
      const account = localAccounts.find(
        (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password
      );

      if (!account) {
        const customError = new Error('Invalid email or password. Please check your credentials and try again.');
        customError.name = 'InvalidCredential';
        throw customError;
      }

      const localUser = createAuthenticatedUser(account);
      setCurrentUser(localUser);
      writeLocalAuthSession(localUser);

      const profile = await getUserProfile(localUser.uid) || await createUserProfile(localUser);
      setUserProfile(profile);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        const localAccounts = readLocalAuthAccounts();
        const account = localAccounts.find(
          (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password
        );

        if (!account) {
          const customError = new Error('Invalid email or password. Please check your credentials and try again.');
          customError.name = 'InvalidCredential';
          throw customError;
        }

        const localUser = createAuthenticatedUser(account);
        setCurrentUser(localUser);
        writeLocalAuthSession(localUser);

        const profile = await getUserProfile(localUser.uid) || await createUserProfile(localUser);
        setUserProfile(profile);
        return;
      }
      
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
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Firebase signOut failed, continuing with local session clear:', error);
    } finally {
      setCurrentUser(null);
      setUserProfile(null);
      writeLocalAuthSession(null);
    }
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
    await signInWithRedirect(auth, provider);
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const signInWithTwitter = async () => {
    const provider = new TwitterAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  useEffect(() => {
    // Set loading to true initially to wait for auth state
    setLoading(true);

    // Handle redirect results (for signInWithRedirect flows) before subscribing to auth state
    (async () => {
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult && redirectResult.user) {
          const normalizedUser = normalizeFirebaseUser(redirectResult.user);
          console.log('🔁 Redirect sign-in result detected:', normalizedUser.uid);
          try {
            let profile = await getUserProfile(normalizedUser.uid);
            if (!profile) {
              console.log('🆕 Creating profile from redirect result for user:', normalizedUser.uid);
              profile = await createUserProfile(normalizedUser);
            }
            setCurrentUser(normalizedUser);
            writeLocalAuthSession(normalizedUser);
            setUserProfile(profile);
          } catch (err) {
            console.error('❌ Error handling redirect result profile creation:', err);
          }
        }
      } catch (err: any) {
        if (err && err.code) console.warn('getRedirectResult error:', err.code, err.message);
      }
    })();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const localSession = readLocalAuthSession();
      console.log('🔐 Auth state changed:', user ? `User ${user.uid} logged in` : localSession ? `Local user ${localSession.uid} logged in` : 'User logged out');
      
      if (user) {
        const normalizedUser = normalizeFirebaseUser(user);
        setCurrentUser(normalizedUser);
        writeLocalAuthSession(normalizedUser);
      } else if (localSession) {
        setCurrentUser(localSession);
      } else {
        setCurrentUser(null);
      }
      
      if (user) {
        const normalizedUser = normalizeFirebaseUser(user);
        console.log('👤 Loading user profile for:', normalizedUser.uid);
        // Load user profile from Firestore asynchronously
        try {
          // First try to get existing profile
          let profile = await getUserProfile(normalizedUser.uid);
          
          // If no profile exists, create one (for existing Firebase Auth users)
          if (!profile) {
            console.log('🆕 No profile found, creating new profile for user:', normalizedUser.uid);
            profile = await createUserProfile(normalizedUser);
          }
          
          setUserProfile(profile);
          console.log('✅ User profile loaded successfully');
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
          setUserProfile(null);
        }
      } else if (localSession) {
        console.log('👤 Loading local user profile for:', localSession.uid);
        try {
          const profile = await getUserProfile(localSession.uid);
          if (!profile) {
            const createdProfile = await createUserProfile(localSession);
            setUserProfile(createdProfile);
          } else {
            setUserProfile(profile);
          }
          console.log('✅ Local user profile loaded successfully');
        } catch (error) {
          console.error('❌ Error loading local user profile:', error);
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