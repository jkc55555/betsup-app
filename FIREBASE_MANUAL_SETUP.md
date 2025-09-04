# 🔥 BetsUp! - Firebase Manual Setup Guide

## 🚨 **IMMEDIATE ACTION REQUIRED**

The Firebase CLI requires Google Cloud Terms of Service acceptance. Let's set up Firebase projects manually through the web console, which is often easier and more reliable.

## 🎯 **Step 1: Create Firebase Projects**

### **Go to Firebase Console**
**🔗 Click Here**: https://console.firebase.google.com

### **Create Development Project**
1. **Click**: "Create a project"
2. **Project name**: `BetsUp Development`
3. **Project ID**: `betsup-development` (or let Firebase generate one)
4. **Continue** → **Enable Google Analytics**: ✅ Yes
5. **Analytics account**: Create new or use existing
6. **Create project** → Wait for setup to complete

### **Create Staging Project**
1. **Click**: "Create a project" (again)
2. **Project name**: `BetsUp Staging`
3. **Project ID**: `betsup-staging`
4. **Continue** → **Enable Google Analytics**: ✅ Yes
5. **Analytics account**: Same as development
6. **Create project** → Wait for setup to complete

### **Create Production Project**
1. **Click**: "Create a project" (again)
2. **Project name**: `BetsUp Production`
3. **Project ID**: `betsup-production`
4. **Continue** → **Enable Google Analytics**: ✅ Yes
5. **Analytics account**: Same as development
6. **Create project** → Wait for setup to complete

## 🔧 **Step 2: Configure Each Project**

### **For EACH project, configure these services:**

#### **Authentication Setup**
1. **Go to**: Authentication → Sign-in method
2. **Enable providers**:
   - ✅ **Email/Password**: Enable
   - ✅ **Google**: Enable (configure OAuth client)
   - ✅ **Facebook**: Enable (need App ID and App Secret)
   - ✅ **Apple**: Enable (iOS only - need Service ID)

3. **Authorized domains**: Add these domains
   - **Development**: `localhost`, `dev.betsup.app`
   - **Staging**: `staging.betsup.app`
   - **Production**: `betsup.app`, `www.betsup.app`

#### **Firestore Database Setup**
1. **Go to**: Firestore Database
2. **Create database**: Start in test mode
3. **Location**: `us-central1` (or closest to your users)
4. **Done**: We'll update security rules later

#### **Cloud Functions Setup**
1. **Go to**: Functions
2. **Get started**: Enable Cloud Functions API
3. **Upgrade to Blaze plan**: Required for Cloud Functions (pay-as-you-go)

#### **Hosting Setup**
1. **Go to**: Hosting
2. **Get started**: Follow setup wizard
3. **Note**: We'll configure this via CLI later

#### **Cloud Messaging Setup**
1. **Go to**: Cloud Messaging
2. **Automatically enabled**: No action needed
3. **Note**: For push notifications later

## 📱 **Step 3: Add Apps to Projects**

### **For EACH project, add these apps:**

#### **Web App**
1. **Click**: Add app → Web (</>) icon
2. **App nickname**: `BetsUp Web`
3. **Hosting**: ✅ Also set up Firebase Hosting
4. **Register app**
5. **Copy Firebase config**: Save this for later!
6. **Continue to console**

#### **iOS App**
1. **Click**: Add app → iOS icon
2. **Bundle ID**:
   - Development: `com.betsup.app.dev`
   - Staging: `com.betsup.app.staging`
   - Production: `com.betsup.app`
3. **App nickname**: `BetsUp iOS`
4. **Register app**
5. **Download**: `GoogleService-Info.plist`
6. **Save file**: We'll add to Xcode later

#### **Android App**
1. **Click**: Add app → Android icon
2. **Package name**:
   - Development: `com.betsup.app.dev`
   - Staging: `com.betsup.app.staging`
   - Production: `com.betsup.app`
3. **App nickname**: `BetsUp Android`
4. **Register app**
5. **Download**: `google-services.json`
6. **Save file**: We'll add to Android project later

## 🔗 **Step 4: Connect Local Project**

After creating all Firebase projects, let's connect our local project:

```bash
# Add projects to Firebase CLI
firebase use --add

# You'll be prompted to select projects:
# 1. Select betsup-development and alias it as "development"
# 2. Select betsup-staging and alias it as "staging"  
# 3. Select betsup-production and alias it as "production"

# Set development as default
firebase use development

# Verify projects are connected
firebase projects:list
```

## 📝 **Step 5: Update Environment Files**

### **Development Environment** (`env.development`)
Replace the Firebase config values with the ones from your **Development** project:

```env
# Firebase Development Project Configuration
REACT_APP_FIREBASE_API_KEY=your_development_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=betsup-development.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=betsup-development
REACT_APP_FIREBASE_STORAGE_BUCKET=betsup-development.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_development_app_id
```

### **Staging Environment** (`env.staging`)
Replace with **Staging** project config:

```env
# Firebase Staging Project Configuration
REACT_APP_FIREBASE_API_KEY=your_staging_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=betsup-staging.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=betsup-staging
REACT_APP_FIREBASE_STORAGE_BUCKET=betsup-staging.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_staging_app_id
```

### **Production Environment** (`env.production`)
Replace with **Production** project config:

```env
# Firebase Production Project Configuration
REACT_APP_FIREBASE_API_KEY=your_production_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=betsup-production.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=betsup-production
REACT_APP_FIREBASE_STORAGE_BUCKET=betsup-production.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_production_app_id
```

## 🚀 **Step 6: Initialize Firebase Locally**

```bash
# Initialize Firebase in the project
firebase init

# Select features:
# ✅ Firestore: Configure security rules and indexes
# ✅ Functions: Configure Cloud Functions  
# ✅ Hosting: Configure Firebase Hosting
# ✅ Storage: Configure Cloud Storage

# Use existing projects:
# Select your betsup-development project

# Firestore setup:
# Rules file: firestore.rules (keep existing)
# Indexes file: firestore.indexes.json (keep existing)

# Functions setup:
# Language: TypeScript
# ESLint: Yes
# Install dependencies: Yes

# Hosting setup:
# Public directory: build
# Single-page app: Yes
# Automatic builds: No
```

## 🎯 **Step 7: Deploy Security Rules**

```bash
# Deploy Firestore rules to development
firebase deploy --only firestore:rules

# Deploy to staging
firebase use staging
firebase deploy --only firestore:rules

# Deploy to production
firebase use production
firebase deploy --only firestore:rules
```

## 🌐 **Step 8: Test Deployment**

```bash
# Switch to development
firebase use development

# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Test the deployment
echo "Visit your Firebase Hosting URL to test!"
```

## ✅ **Verification Checklist**

### **Firebase Projects Created**
- [ ] Development project: `betsup-development`
- [ ] Staging project: `betsup-staging`
- [ ] Production project: `betsup-production`

### **Services Enabled (for each project)**
- [ ] Authentication with Email, Google, Facebook
- [ ] Firestore Database created
- [ ] Cloud Functions enabled (Blaze plan)
- [ ] Hosting configured
- [ ] Cloud Messaging enabled

### **Apps Added (for each project)**
- [ ] Web app registered
- [ ] iOS app registered
- [ ] Android app registered
- [ ] Config files downloaded

### **Local Setup**
- [ ] Firebase CLI connected to projects
- [ ] Environment files updated with real config
- [ ] Firebase initialized in project
- [ ] Security rules deployed

### **Test Deployment**
- [ ] Development environment accessible
- [ ] Build process working
- [ ] Hosting deployment successful

## 🎉 **Success Criteria**

After completing these steps, you should have:

1. **3 Firebase projects** ready for development, staging, and production
2. **All services enabled** and configured properly
3. **Local project connected** to Firebase
4. **Environment configs** updated with real Firebase settings
5. **Initial deployment** working on development environment

## 🚀 **Next Steps After Firebase Setup**

1. **Test the deployment**: Verify the app loads in the browser
2. **Configure OAuth providers**: Update Facebook, Google with Firebase domains
3. **Deploy to staging**: Test the staging environment
4. **Deploy to production**: Make BetsUp! live!
5. **Set up custom domains**: Point betsup.app to Firebase Hosting

## 📞 **Need Help?**

If you encounter issues:
1. **Check Firebase Console**: Verify projects were created
2. **Verify billing**: Ensure Blaze plan is active for Cloud Functions
3. **Check permissions**: Ensure you have owner/editor access
4. **Review config**: Double-check Firebase config values

## 🎯 **The Goal**

By the end of this setup, BetsUp! will be:
- ✅ **Deployed to Firebase** with real backend services
- ✅ **Accessible via web** at Firebase Hosting URLs
- ✅ **Ready for mobile deployment** with proper configs
- ✅ **Scalable and production-ready** with proper environments

**Let's get BetsUp! deployed and live!** 🚀🔥
