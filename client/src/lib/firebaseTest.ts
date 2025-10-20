import { auth, db } from './firebase';

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test auth
    console.log('Auth instance:', auth);
    console.log('Auth app:', auth.app);
    console.log('Auth currentUser:', auth.currentUser);
    
    // Test firestore
    console.log('Firestore instance:', db);
    console.log('Firestore app:', db.app);
    
    console.log('✅ Firebase connection test completed');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

// Call this on app load
testFirebaseConnection();