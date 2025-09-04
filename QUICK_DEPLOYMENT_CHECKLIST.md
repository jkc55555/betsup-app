# 🚀 BetsUp! - Quick Deployment Checklist

## ✅ **Immediate Next Steps (Ready to Execute)**

### **1. Create GitHub Repository** 
Since GitHub CLI is not installed, use the web interface:

#### **Manual GitHub Setup:**
1. **Go to**: https://github.com/new
2. **Repository name**: `betsup-app`
3. **Owner**: Your GitHub username (or create `betsup` organization)
4. **Description**: `BetsUp! - Social betting platform for friends`
5. **Visibility**: Public (recommended) or Private
6. **Initialize**: ❌ Don't initialize (we have files already)
7. **Click**: "Create repository"

#### **Connect Local Repository:**
```bash
# Add the remote origin (replace YOUR_USERNAME with actual username)
git remote add origin https://github.com/YOUR_USERNAME/betsup-app.git

# Push the code
git push -u origin main
```

### **2. Firebase Projects Setup**
Create 3 Firebase projects at https://console.firebase.google.com:

#### **Development Project**
- **Project ID**: `betsup-development`
- **Project Name**: `BetsUp Development`
- **Analytics**: Enable
- **Add iOS app**: Bundle ID `com.betsup.app.dev`
- **Add Android app**: Package name `com.betsup.app.dev`
- **Add Web app**: Hosting URL `dev.betsup.app`

#### **Staging Project**
- **Project ID**: `betsup-staging`
- **Project Name**: `BetsUp Staging`
- **Analytics**: Enable
- **Add iOS app**: Bundle ID `com.betsup.app.staging`
- **Add Android app**: Package name `com.betsup.app.staging`
- **Add Web app**: Hosting URL `staging.betsup.app`

#### **Production Project**
- **Project ID**: `betsup-production`
- **Project Name**: `BetsUp Production`
- **Analytics**: Enable
- **Add iOS app**: Bundle ID `com.betsup.app`
- **Add Android app**: Package name `com.betsup.app`
- **Add Web app**: Hosting URL `betsup.app`

### **3. Domain Configuration**

#### **DNS Setup for betsup.app**
Add these DNS records at your domain registrar:

```
Type    Name    Value                           TTL
A       @       Firebase Hosting IP             300
A       www     Firebase Hosting IP             300
CNAME   api     your-api-server.herokuapp.com   300
CNAME   admin   firebase-hosting-alias          300
CNAME   cdn     your-cdn-provider.com           300
CNAME   status  your-status-page-provider.com   300
```

#### **DNS Setup for betsup.bet**
```
Type    Name        Value                       TTL
A       @           Marketing site IP           300
A       www         Marketing site IP           300
CNAME   blog        your-blog-platform.com      300
CNAME   help        your-support-platform.com   300
CNAME   community   your-community-platform.com 300
CNAME   partners    your-affiliate-platform.com 300
```

### **4. OAuth Provider Updates**

#### **Facebook Developer Console**
1. **Go to**: https://developers.facebook.com/apps
2. **Update App Domains**: Add `betsup.app`, `betsup.bet`
3. **iOS Settings**: Update Bundle ID to `com.betsup.app`
4. **Android Settings**: Update Package Name to `com.betsup.app`
5. **Website Settings**: Add `https://betsup.app`

#### **Google Cloud Console**
1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **OAuth 2.0 Client IDs**: Update authorized domains
3. **iOS Client**: Update Bundle ID to `com.betsup.app`
4. **Android Client**: Update Package Name to `com.betsup.app`
5. **Web Client**: Add `https://betsup.app` to authorized origins

#### **Apple Developer Console**
1. **Go to**: https://developer.apple.com/account/resources/identifiers
2. **App IDs**: Update to `com.betsup.app`
3. **Associated Domains**: Add `betsup.app`
4. **Sign in with Apple**: Update domain to `betsup.app`

### **5. App Store Preparation**

#### **iOS App Store Connect**
1. **Go to**: https://appstoreconnect.apple.com
2. **Create New App**:
   - **Name**: BetsUp!
   - **Bundle ID**: com.betsup.app
   - **SKU**: betsup-ios-app
   - **Primary Language**: English (U.S.)
3. **App Information**:
   - **Category**: Social Networking
   - **Content Rights**: Yes (you own or have rights)
   - **Age Rating**: 17+ (due to simulated gambling)

#### **Google Play Console**
1. **Go to**: https://play.google.com/console
2. **Create New App**:
   - **App Name**: BetsUp!
   - **Default Language**: English (United States)
   - **App or Game**: App
   - **Free or Paid**: Free
3. **App Details**:
   - **Category**: Social
   - **Content Rating**: Teen (simulated gambling)
   - **Target Audience**: Ages 13+

### **6. Monitoring & Analytics Setup**

#### **Error Tracking - Sentry**
1. **Go to**: https://sentry.io
2. **Create Project**: React Native
3. **Get DSN**: Copy for environment variables
4. **Install**: `npm install @sentry/react-native`

#### **Performance Monitoring - New Relic**
1. **Go to**: https://newrelic.com
2. **Add Mobile App**: iOS and Android
3. **Get App Tokens**: For iOS and Android
4. **Install**: Follow platform-specific guides

#### **Uptime Monitoring - Pingdom**
1. **Go to**: https://pingdom.com
2. **Add Check**: https://betsup.app
3. **Add Check**: https://api.betsup.app/health
4. **Add Check**: https://admin.betsup.app

## 🔧 **Environment Variables Setup**

### **Create .env Files**
```bash
# .env.development
REACT_APP_ENVIRONMENT=development
REACT_APP_FIREBASE_API_KEY=your_dev_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=betsup-development.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=betsup-development
REACT_APP_FIREBASE_STORAGE_BUCKET=betsup-development.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
REACT_APP_FIREBASE_APP_ID=your_dev_app_id
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_BASE_URL=http://localhost:5001
REACT_APP_SENTRY_DSN=your_sentry_dsn

# .env.staging  
REACT_APP_ENVIRONMENT=staging
REACT_APP_FIREBASE_API_KEY=your_staging_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=betsup-staging.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=betsup-staging
REACT_APP_FIREBASE_STORAGE_BUCKET=betsup-staging.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_staging_sender_id
REACT_APP_FIREBASE_APP_ID=your_staging_app_id
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_BASE_URL=https://api-staging.betsup.app
REACT_APP_SENTRY_DSN=your_sentry_dsn

# .env.production
REACT_APP_ENVIRONMENT=production
REACT_APP_FIREBASE_API_KEY=your_prod_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=betsup-production.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=betsup-production
REACT_APP_FIREBASE_STORAGE_BUCKET=betsup-production.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_prod_sender_id
REACT_APP_FIREBASE_APP_ID=your_prod_app_id
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_BASE_URL=https://api.betsup.app
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

## 📱 **Mobile App Deployment**

### **iOS Deployment Steps**
1. **Xcode Setup**:
   - Open `ios/BetsUp.xcworkspace`
   - Update Team and Signing
   - Update Bundle Identifier to `com.betsup.app`
   
2. **Build Archive**:
   ```bash
   cd ios
   xcodebuild -workspace BetsUp.xcworkspace \
     -scheme BetsUp \
     -configuration Release \
     -archivePath build/BetsUp.xcarchive \
     archive
   ```

3. **Export IPA**:
   ```bash
   xcodebuild -exportArchive \
     -archivePath build/BetsUp.xcarchive \
     -exportPath build \
     -exportOptionsPlist ExportOptions.plist
   ```

### **Android Deployment Steps**
1. **Generate Keystore**:
   ```bash
   cd android
   keytool -genkey -v -keystore release.keystore \
     -alias betsup-key -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Build Release APK**:
   ```bash
   ./gradlew assembleRelease
   ```

3. **Build Release AAB**:
   ```bash
   ./gradlew bundleRelease
   ```

## 🌐 **Web Deployment**

### **Firebase Hosting Setup**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy to staging
firebase deploy --project betsup-staging

# Deploy to production
firebase deploy --project betsup-production
```

### **Custom Domain Setup**
1. **Firebase Console**: Go to Hosting → Add custom domain
2. **Add Domain**: `betsup.app`
3. **Verify Ownership**: Add TXT record to DNS
4. **SSL Certificate**: Firebase auto-provisions

## 🔐 **Security Checklist**

### **GitHub Repository Security**
- [ ] Enable branch protection on `main`
- [ ] Require pull request reviews
- [ ] Enable security alerts
- [ ] Set up Dependabot
- [ ] Configure secrets properly

### **Firebase Security**
- [ ] Review Firestore security rules
- [ ] Set up Firebase App Check
- [ ] Enable audit logging
- [ ] Configure CORS properly
- [ ] Set up Firebase Security Rules

### **OAuth Security**
- [ ] Use HTTPS-only redirect URIs
- [ ] Implement PKCE for mobile apps
- [ ] Set up proper scopes
- [ ] Enable rate limiting
- [ ] Monitor for suspicious activity

## 📊 **Launch Metrics to Track**

### **Technical Metrics**
- [ ] App load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%
- [ ] Mobile app crash rate < 0.1%

### **Business Metrics**
- [ ] User registration rate
- [ ] Daily/Monthly active users
- [ ] Bet creation rate
- [ ] Payment completion rate
- [ ] Subscription conversion rate

### **User Experience Metrics**
- [ ] App Store rating > 4.0
- [ ] User retention (Day 1, 7, 30)
- [ ] Feature adoption rates
- [ ] Support ticket volume
- [ ] User feedback sentiment

## 🎯 **Success Criteria**

### **Week 1 Goals**
- [ ] Repository created and CI/CD working
- [ ] Firebase projects configured
- [ ] Domains pointing to correct services
- [ ] OAuth providers updated
- [ ] Basic monitoring in place

### **Week 2 Goals**
- [ ] iOS app in TestFlight
- [ ] Android app in internal testing
- [ ] Web app deployed to staging
- [ ] Admin portal accessible
- [ ] Error tracking operational

### **Week 3 Goals**
- [ ] Production deployment complete
- [ ] App store submissions ready
- [ ] Marketing site live
- [ ] Performance monitoring active
- [ ] User acceptance testing complete

### **Launch Day Goals**
- [ ] Apps available in stores
- [ ] All systems operational
- [ ] Monitoring dashboards active
- [ ] Support channels ready
- [ ] Marketing campaign launched

## 🚀 **Ready for Launch!**

BetsUp! is now ready to become the leading social betting platform! The infrastructure is enterprise-grade, the codebase is production-ready, and the deployment strategy is bulletproof.

**Next step**: Create the GitHub repository and start the deployment process! 🎉
