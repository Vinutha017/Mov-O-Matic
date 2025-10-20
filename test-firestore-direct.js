import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';

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
const db = getFirestore(app);

async function testFirestore() {
  console.log('🔥 Testing direct Firestore write...');
  
  try {
    // Test 1: Add a document to a test collection
    const testRef = collection(db, 'test');
    const docRef = await addDoc(testRef, {
      message: 'Hello Firestore!',
      timestamp: new Date(),
      source: 'direct-test'
    });
    console.log('✅ Test document written with ID: ', docRef.id);
    
    // Test 2: Set a document with a specific ID
    const userRef = doc(db, 'users', 'test-user-123');
    await setDoc(userRef, {
      name: 'Test User',
      email: 'test@example.com',
      city: 'Mumbai',
      createdAt: new Date()
    });
    console.log('✅ User document created successfully');
    
    console.log('🎉 All Firestore tests passed!');
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
  }
}

testFirestore();