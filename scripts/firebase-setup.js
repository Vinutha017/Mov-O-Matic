#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Setup Helper for Mov-O-Matic\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
  } else {
    console.log('❌ .env.example file not found!');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🔧 Next steps:');
console.log('1. Update the Firebase configuration in client/src/lib/firebase.ts with your project details');
console.log('2. Or set up environment variables in .env file');
console.log('3. Run: npm run dev');
console.log('4. Run: npm run firebase:emulators (for local development)');
console.log('5. Run: npm run firebase:deploy (for production deployment)');

console.log('\n📚 Read FIREBASE_SETUP.md for detailed instructions');
console.log('\n🎉 Your Firebase integration is ready!');