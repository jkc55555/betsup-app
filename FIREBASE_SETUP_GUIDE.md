# 🔥 BetsUp! - Firebase Setup Guide

## 🎯 **Firebase Projects Overview**

We need to create 3 separate Firebase projects for proper environment isolation:

1. **Development** - `betsup-development`
2. **Staging** - `betsup-staging`  
3. **Production** - `betsup-production`

## 🚀 **Step-by-Step Firebase Setup**

### **1. Create Firebase Projects**

#### **Development Project**
1. **Go to**: https://console.firebase.google.com
2. **Click**: "Create a project"
3. **Project name**: `BetsUp Development`
4. **Project ID**: `betsup-development`
5. **Analytics**: ✅ Enable Google Analytics
6. **Analytics account**: Create new or use existing
7. **Click**: "Create project"

#### **Staging Project**
1. **Click**: "Create a project"
2. **Project name**: `BetsUp Staging`
3. **Project ID**: `betsup-staging`
4. **Analytics**: ✅ Enable Google Analytics
5. **Analytics account**: Same as development
6. **Click**: "Create project"

#### **Production Project**
1. **Click**: "Create a project"
2. **Project name**: `BetsUp Production`
3. **Project ID**: `betsup-production`
4. **Analytics**: ✅ Enable Google Analytics
5. **Analytics account**: Same as development
6. **Click**: "Create project"

### **2. Configure Firebase Services**

For **each project**, configure these services:

#### **Authentication**
1. **Go to**: Authentication → Sign-in method
2. **Enable providers**:
   - ✅ **Email/Password**
   - ✅ **Google** (configure OAuth client)
   - ✅ **Facebook** (add App ID and App Secret)
   - ✅ **Apple** (iOS only - add Service ID and Key)
3. **Authorized domains**:
   - Development: `localhost`, `dev.betsup.app`
   - Staging: `staging.betsup.app`
   - Production: `betsup.app`, `www.betsup.app`

#### **Firestore Database**
1. **Go to**: Firestore Database
2. **Create database**: Start in test mode
3. **Location**: `us-central1` (or closest to your users)
4. **Security rules**: We'll update these later with our custom rules

#### **Cloud Functions**
1. **Go to**: Functions
2. **Get started**: This will enable the Cloud Functions API
3. **Billing**: Upgrade to Blaze plan (pay-as-you-go) for Cloud Functions

#### **Hosting**
1. **Go to**: Hosting
2. **Get started**: Follow the setup wizard
3. **We'll configure this via CLI later**

#### **Cloud Messaging**
1. **Go to**: Cloud Messaging
2. **This is automatically enabled**
3. **We'll configure push notifications later**

#### **Analytics**
1. **Go to**: Analytics
2. **Already enabled during project creation**
3. **Configure custom events later**

### **3. Add Apps to Firebase Projects**

For **each project**, add these apps:

#### **Web App**
1. **Click**: "Add app" → Web (</>) icon
2. **App nickname**: `BetsUp Web`
3. **Hosting**: ✅ Also set up Firebase Hosting
4. **Register app**
5. **Copy config**: Save the Firebase config object
6. **Continue to console**

#### **iOS App**
1. **Click**: "Add app" → iOS icon
2. **Bundle ID**: 
   - Development: `com.betsup.app.dev`
   - Staging: `com.betsup.app.staging`
   - Production: `com.betsup.app`
3. **App nickname**: `BetsUp iOS`
4. **App Store ID**: Leave blank for now
5. **Register app**
6. **Download**: `GoogleService-Info.plist`
7. **Add to Xcode**: Drag into `ios/BetsUp/` folder

#### **Android App**
1. **Click**: "Add app" → Android icon
2. **Package name**:
   - Development: `com.betsup.app.dev`
   - Staging: `com.betsup.app.staging`
   - Production: `com.betsup.app`
3. **App nickname**: `BetsUp Android`
4. **Debug signing certificate**: Generate and add SHA-1
5. **Register app**
6. **Download**: `google-services.json`
7. **Add to Android**: Place in `android/app/` folder

### **4. Configure Firebase CLI**

#### **Install Firebase CLI**
```bash
# Install globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify login
firebase projects:list
```

#### **Initialize Firebase in Project**
```bash
# Initialize Firebase (run from project root)
firebase init

# Select features:
# ✅ Firestore: Configure security rules and indexes
# ✅ Functions: Configure and deploy Cloud Functions
# ✅ Hosting: Configure files for Firebase Hosting
# ✅ Storage: Configure security rules for Cloud Storage

# Select projects:
# Choose "Use an existing project"
# Select betsup-development (we'll add others later)

# Firestore setup:
# Rules file: firestore.rules (already exists)
# Indexes file: firestore.indexes.json (already exists)

# Functions setup:
# Language: TypeScript
# ESLint: Yes
# Install dependencies: Yes

# Hosting setup:
# Public directory: build
# Single-page app: Yes
# Automatic builds: No (we'll use GitHub Actions)
```

#### **Add Multiple Projects**
```bash
# Add staging project
firebase use --add betsup-staging

# Add production project  
firebase use --add betsup-production

# Set default to development
firebase use betsup-development

# List all projects
firebase projects:list
```

### **5. Configure Hosting Targets**

```bash
# Configure hosting targets for multi-site deployment
firebase target:apply hosting app betsup-development
firebase target:apply hosting admin betsup-development-admin

firebase target:apply hosting app betsup-staging  
firebase target:apply hosting admin betsup-staging-admin

firebase target:apply hosting app betsup-production
firebase target:apply hosting admin betsup-production-admin
```

### **6. Deploy Initial Configuration**

#### **Deploy Firestore Rules**
```bash
# Deploy to development
firebase deploy --only firestore:rules --project betsup-development

# Deploy to staging
firebase deploy --only firestore:rules --project betsup-staging

# Deploy to production
firebase deploy --only firestore:rules --project betsup-production
```

#### **Test Deployment**
```bash
# Build the app
npm run build

# Deploy to development
firebase deploy --project betsup-development

# Test the deployment
# Visit: https://betsup-development.web.app
```

### **7. Environment Configuration**

#### **Update Environment Files**
Replace the placeholder values in:
- `env.development`
- `env.staging`  
- `env.production`

With the actual Firebase config values from each project.

#### **Firebase Config Example**
```javascript
// From Firebase Console → Project Settings → General → Your apps
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "betsup-development.firebaseapp.com",
  projectId: "betsup-development",
  storageBucket: "betsup-development.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### **8. Security Rules Configuration**

#### **Firestore Security Rules**
Our `firestore.rules` file already contains comprehensive security rules. Deploy them:

```bash
firebase deploy --only firestore:rules --project betsup-development
firebase deploy --only firestore:rules --project betsup-staging
firebase deploy --only firestore:rules --project betsup-production
```

#### **Storage Security Rules**
Create `storage.rules`:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own profile pictures
    match /users/{userId}/profile/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Bet evidence photos
    match /bets/{betId}/evidence/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/bets/$(betId)) &&
        get(/databases/$(database)/documents/bets/$(betId)).data.participants[request.auth.uid] != null;
    }
    
    // Admin uploads
    match /admin/{allPaths=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admin_users/$(request.auth.uid));
    }
  }
}
```

### **9. Cloud Functions Setup**

#### **Initialize Functions**
```bash
cd functions
npm install

# Install additional dependencies
npm install --save express cors helmet
npm install --save-dev @types/express @types/cors
```

#### **Basic Function Structure**
```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Bet resolution webhook
export const resolveBet = functions.https.onCall(async (data, context) => {
  // Bet resolution logic
});

// Payment processing
export const processPayment = functions.https.onCall(async (data, context) => {
  // Payment processing logic
});

// Notification triggers
export const sendBetNotification = functions.firestore
  .document('bets/{betId}')
  .onUpdate(async (change, context) => {
    // Send push notifications
  });
```

### **10. Custom Domain Setup**

#### **Add Custom Domains**
1. **Go to**: Hosting → Add custom domain
2. **Add domains**:
   - Development: `dev.betsup.app`
   - Staging: `staging.betsup.app`
   - Production: `betsup.app`
3. **Verify ownership**: Add TXT record to DNS
4. **SSL certificate**: Firebase auto-provisions

#### **DNS Configuration**
Add these DNS records at your domain registrar:

```
# For betsup.app
Type    Name    Value
A       @       Firebase Hosting IP (provided by Firebase)
CNAME   www     betsup.app
CNAME   dev     betsup-development.web.app
CNAME   staging betsup-staging.web.app
TXT     @       firebase-verification-token
```

### **11. Testing & Verification**

#### **Test Each Environment**
```bash
# Development
firebase use betsup-development
npm run build
firebase deploy
# Visit: https://dev.betsup.app

# Staging  
firebase use betsup-staging
npm run build
firebase deploy
# Visit: https://staging.betsup.app

# Production
firebase use betsup-production
npm run build
firebase deploy
# Visit: https://betsup.app
```

#### **Test Authentication**
1. **Visit each environment**
2. **Test sign-up/sign-in** with email
3. **Test OAuth providers** (Google, Facebook)
4. **Verify user data** in Firestore console

#### **Test Database**
1. **Create test data** in Firestore console
2. **Verify security rules** work correctly
3. **Test real-time updates** in the app

## ✅ **Firebase Setup Checklist**

- [ ] 3 Firebase projects created (dev, staging, prod)
- [ ] Authentication configured with all providers
- [ ] Firestore databases created with security rules
- [ ] Cloud Functions enabled and configured
- [ ] Hosting configured with custom domains
- [ ] iOS and Android apps added to each project
- [ ] Firebase CLI installed and configured
- [ ] Environment variables updated with real config
- [ ] Security rules deployed and tested
- [ ] Custom domains verified and SSL enabled
- [ ] All environments tested and working

## 🎯 **Next Steps After Firebase Setup**

1. **Update GitHub Secrets**: Add Firebase service account keys
2. **Test CI/CD Pipeline**: Verify automated deployments work
3. **Configure OAuth Providers**: Update with Firebase domains
4. **Set up Monitoring**: Enable Firebase Performance and Crashlytics
5. **Create Admin Users**: Set up initial admin accounts

## 🚀 **Firebase Setup Complete!**

With Firebase configured, BetsUp! now has:
- ✅ **Scalable backend** with real-time database
- ✅ **Multi-environment deployment** pipeline
- ✅ **Authentication** with multiple providers
- ✅ **Secure hosting** with custom domains
- ✅ **Cloud functions** for backend logic
- ✅ **Analytics and monitoring** built-in

**BetsUp! is now ready for full-scale deployment and testing!** 🎉
