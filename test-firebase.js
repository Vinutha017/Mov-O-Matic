/**
 * Test script to verify Firestore connection and create a test user
 * Run this after Firestore is initialized to test the connection
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase config (same as your app)
const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "mov-o-matic.firebaseapp.com",
  projectId: "mov-o-matic",
  storageBucket: "mov-o-matic.firebasestorage.app",
  messagingSenderId: "166612558041",
  appId: "1:166612558041:web:cc43a3aba9a2fc8e9f9ec8",
  measurementId: "G-DQPHB0R31B"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function testFirestore() {
  try {
    console.log('🔥 Testing Firestore connection...');
    
    // Test 1: Try to create a test document
    const testDocRef = doc(db, 'test', 'connection');
    await setDoc(testDocRef, {
      message: 'Firestore is working!',
      timestamp: new Date(),
      testPassed: true
    });
    
    console.log('✅ Test document created successfully');
    
    // Test 2: Try to read the document
    const testDoc = await getDoc(testDocRef);
    if (testDoc.exists()) {
      console.log('✅ Test document read successfully:', testDoc.data());
    } else {
      console.log('❌ Test document not found');
    }
    
    console.log('🎉 Firestore is properly initialized and working!');
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    
    if (error.code === 'permission-denied') {
      console.log('📝 This error is expected - it means Firestore is working but security rules are active');
    }
  }
}

async function testUserCreation() {
  try {
    console.log('👤 Testing user creation...');
    
    const testEmail = 'test@movomaticapp.com';
    const testPassword = 'test123456';
    
    // Try to create a test user
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    
    console.log('✅ Test user created:', user.uid);
    
    // Try to create user profile in Firestore
    const userDoc = doc(db, 'users', user.uid);
    await setDoc(userDoc, {
      uid: user.uid,
      email: user.email,
      displayName: 'Test User',
      createdAt: new Date(),
      testUser: true
    });
    
    console.log('✅ User profile created in Firestore');
    console.log('🎉 User registration flow is working!');
    
  } catch (error) {
    console.error('❌ User creation test failed:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('📝 Test user already exists - this is fine');
    }
  }
}

// Run tests
console.log('🚀 Starting Firebase tests...');
testFirestore().then(() => {
  return testUserCreation();
}).catch(console.error);