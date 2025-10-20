import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "mov-o-matic.firebaseapp.com",
  projectId: "mov-o-matic",
  storageBucket: "mov-o-matic.firebasestorage.app",
  messagingSenderId: "166612558041",
  appId: "1:166612558041:web:cc43a3aba9a2fc8e9f9ec8",
  measurementId: "G-DQPHB0R31B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testCompleteSignup() {
  console.log('🔥 Testing complete signup flow...');
  
  try {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    console.log('📧 Creating user:', testEmail);
    
    // Step 1: Create user in Firebase Auth
    const { user } = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ User created in Firebase Auth:', user.uid);
    
    // Step 2: Create user profile in Firestore (now that we're authenticated)
    const userRef = doc(db, 'users', user.uid);
    const userData = {
      uid: user.uid,
      displayName: 'Test User',
      email: user.email,
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+91 9876543210',
      city: 'Mumbai',
      country: 'India',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('💾 Saving user profile to Firestore...');
    await setDoc(userRef, userData);
    console.log('✅ User profile saved successfully!');
    
    console.log('🎉 Complete signup test passed!');
    console.log('👤 User ID:', user.uid);
    console.log('📧 Email:', user.email);
    
  } catch (error) {
    console.error('❌ Signup test failed:', error);
    if (error.code) {
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    }
  }
}

testCompleteSignup();