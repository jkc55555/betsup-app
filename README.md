# BetsUp! - Social Betting App

A React Native app that allows groups of friends to place bets on anything and handle fair resolution with easy payments through Venmo.

## 🎯 Features

### Core Betting System
- **Create Bets**: Users can create bets with custom titles, descriptions, amounts, and multiple sides
- **Join Bets**: Friends can join bets by selecting which side they want to bet on
- **Two Resolution Methods**:
  - **Neutral Party**: Appoint someone to decide the winner
  - **Everyone Agrees**: All participants must agree on the outcome

### Payment Integration
- **Venmo Integration**: Seamless payment processing through Venmo deep links
- **Facilitation Fees**: Automatic fee calculation for bets over $20 (tiered structure)
- **Payment Tracking**: Track payment requests and completion status
- **Manual Payment Confirmation**: Users can mark payments as completed

### Social Features
- **Facebook Friends Integration**: Invite Facebook friends to join bets
- **Group Management**: Create and join betting groups
- **Evidence Submission**: Submit evidence to support bet outcomes
- **Chat & Comments**: Built-in messaging for bet discussions

### Authentication
- **Multi-OAuth Support**: 
  - Email/Password
  - Google Sign-In
  - Facebook Login (with friends permission)
  - Apple Sign-In (iOS only)

### Premium Features (Subscription)
- **Tab Management**: Keep running balances instead of paying each bet
- **Bill Splitting**: Split restaurant bills and group expenses
- **Advanced Analytics**: Detailed betting statistics
- **Unlimited Groups**: Create unlimited betting groups
- **Priority Support**: Faster customer support

## 📱 App Structure

### Authentication Flow
- Welcome screen with feature highlights
- Sign up/Sign in with multiple OAuth options
- Forgot password functionality
- Profile management

### Main Navigation
- **Home**: Dashboard with active bets, stats, and quick actions
- **Bets**: List of all user bets with filtering and search
- **Groups**: Manage betting groups and invitations
- **Profile**: User settings, stats, and account management

### Key Screens
- **Create Bet**: Full bet creation flow with Facebook friends invitation
- **Bet Details**: View bet status, join bets, submit evidence, resolve outcomes
- **Payment**: Handle Venmo payments with confirmation flow
- **Subscription**: Premium upgrade with feature comparison
- **Tabs**: Premium tab management for running balances

## 🛠 Technical Implementation

### Architecture
- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation management
- **React Native Paper**: Material Design components
- **Firebase**: Backend services (Auth, Firestore, Functions)

### Key Services
- **AuthContext**: User authentication and profile management
- **BetContext**: Bet creation, management, and resolution
- **FacebookFriendsService**: Facebook API integration for friends
- **VenmoService**: Venmo payment deep link generation

### State Management
- React Context for global state
- Local state for component-specific data
- Firebase real-time listeners for live updates

## 💰 Monetization

### Facilitation Fees
- Free for bets under $20
- Tiered fee structure for larger bets:
  - $20-$99: $1 flat fee
  - $100-$499: 2% of bet amount
  - $500-$999: 1.5% of bet amount
  - $1000+: 1% of bet amount

### Premium Subscription
- **Monthly**: $4.99/month
- **Yearly**: $49.99/year (17% savings)
- Premium features unlock advanced functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- React Native development environment
- iOS/Android development setup
- Firebase project configuration

### Installation
```bash
# Clone the repository
cd BetBuddies

# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Configuration
1. Set up Firebase project with Authentication and Firestore
2. Configure OAuth providers (Google, Facebook, Apple)
3. Add Firebase configuration files
4. Update Facebook App ID and Google Web Client ID
5. Configure Venmo deep link handling

## 📋 TODO Items Completed

✅ Project setup with React Native and dependencies  
✅ User authentication with multi-OAuth support  
✅ Bet creation flow with group invitation system  
✅ Facebook friends integration for bet invitations  
✅ Venmo payment system integration  
✅ Facilitation fee calculation system  
✅ Premium subscription with tab management  

## ✅ **All Features Complete + Admin System!**

Every requested feature has been successfully implemented, plus a comprehensive admin portal:

### 🎯 **Core Betting Features**
- ✅ Create bets on anything with custom amounts and sides
- ✅ Neutral party selection and notification system
- ✅ "Everyone agrees" bet resolution workflow
- ✅ Evidence submission and bet chat system
- ✅ Comprehensive bet lifecycle management

### 💰 **Payment & Monetization**
- ✅ Full Venmo integration with deep links
- ✅ Tiered facilitation fee system
- ✅ Payment tracking and verification
- ✅ Premium subscription ($4.99/month, $49.99/year)

### 👥 **Social Features**
- ✅ Facebook friends integration for invitations
- ✅ Multi-OAuth authentication (Google, Facebook, Apple)
- ✅ Group management and betting
- ✅ User profiles and statistics

### 🏆 **Premium Features**
- ✅ Tab management for running balances
- ✅ Restaurant bill splitting with custom item allocation
- ✅ Advanced analytics and unlimited groups
- ✅ Priority support features

### 🔧 **Technical Infrastructure**
- ✅ Complete Firebase backend with security rules
- ✅ Real-time notifications and updates
- ✅ Comprehensive API documentation
- ✅ Production-ready database schema

### 🛠️ **Admin Management System**
- ✅ **Tier Management**: Create, edit, duplicate, and delete subscription tiers
- ✅ **Dynamic Pricing**: Configure monthly/yearly rates with auto-discount calculation
- ✅ **Feature Management**: Create custom features and assign to tiers
- ✅ **Real-Time Analytics**: Subscriber metrics, revenue tracking, churn analysis
- ✅ **Visual Configuration**: Color picker, icon selector, drag-and-drop interfaces
- ✅ **Permission System**: Role-based access control for admin users
- ✅ **Audit Logging**: Complete change tracking and rollback capability
- ✅ **A/B Testing**: Multiple tier configurations for optimization

## 🚀 **Ready for Production**

The BetsUp! app is now feature-complete and production-ready with:
- **Scalable Firebase backend architecture**
- **Secure authentication and data access**
- **Real-time synchronization across devices**
- **Comprehensive error handling and validation**
- **Beautiful, intuitive user interface**
- **Cross-platform iOS and Android support**
- **Complete admin portal for business management**
- **Dynamic subscription tier system**
- **Real-time analytics and business intelligence**

## 📚 **Documentation**

### Core System Documentation
- `README.md` - Main project overview and setup
- `BET_TEMPLATES_README.md` - Bet template system guide
- `BET_SERIES_SYSTEM.md` - Bet series and tournament documentation
- `USER_TIER_SYSTEM.md` - Subscription tier system guide

### Admin System Documentation
- `ADMIN_TIER_SYSTEM.md` - Complete admin system overview
- `ADMIN_INTEGRATION_GUIDE.md` - Production integration guide
- `backend/README.md` - Firebase backend documentation
- `firestore.rules` - Database security rules

## 🎯 **Admin Portal Access**

### Demo Credentials
```
Email: admin@betbuddies.com
Password: admin123
```

### Admin Features
- **Tier Management**: Create and configure subscription tiers
- **Feature Control**: Add/remove features dynamically
- **Pricing Strategy**: Set monthly/yearly rates with discounts
- **Analytics Dashboard**: Real-time business metrics
- **User Management**: Monitor subscriber activity
- **A/B Testing**: Test different tier configurations

## 📄 License

This project is for demonstration purposes. All rights reserved.

## 🤝 Contributing

This is a demo project showcasing React Native development capabilities for a social betting application.
