# BetBuddies Backend API

This document outlines the backend infrastructure and API design for the BetBuddies social betting application.

## Architecture Overview

The BetBuddies backend is built using Firebase services for rapid development and scalability:

- **Firebase Authentication**: User authentication with OAuth providers
- **Cloud Firestore**: NoSQL database for real-time data
- **Cloud Functions**: Serverless API endpoints and business logic
- **Firebase Storage**: File storage for evidence and images
- **Cloud Messaging**: Push notifications

## Database Schema

### Collections

#### Users Collection (`users`)
```typescript
interface User {
  id: string;                    // Document ID (matches Auth UID)
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  venmoUsername?: string;
  isPremium: boolean;
  premiumExpiresAt?: Timestamp;
  trustScore?: number;           // For neutral party ratings
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Statistics
  totalBets: number;
  betsWon: number;
  totalWinnings: number;
  neutralPartyRating?: number;   // Average rating as neutral party
}
```

#### Bets Collection (`bets`)
```typescript
interface Bet {
  id: string;                    // Document ID
  title: string;
  description: string;
  amount: number;
  currency: 'USD';
  createdBy: string;             // User ID
  participants: BetParticipant[];
  neutralParty?: string;         // User ID
  status: BetStatus;
  resolutionType: 'neutral_party' | 'everyone_agrees';
  resolutionDeadline?: Timestamp;
  winner?: string;               // Winning side
  resolvedAt?: Timestamp;
  resolvedBy?: string;           // User ID or 'consensus'
  facilitationFee: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Subcollections
  chatMessages: ChatMessage[];
  evidence: BetEvidence[];
  
  // Metadata
  groupId?: string;              // If bet belongs to a group
  isPrivate: boolean;
  tags?: string[];               // For categorization
}
```

#### Payment Requests Collection (`paymentRequests`)
```typescript
interface PaymentRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  betId?: string;
  tabId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  venmoDeepLink?: string;
  paymentMethod: 'venmo' | 'manual';
  createdAt: Timestamp;
  completedAt?: Timestamp;
  
  // Verification
  verificationCode?: string;     // For manual verification
  screenshot?: string;           // Storage URL for payment proof
}
```

#### Groups Collection (`groups`)
```typescript
interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  createdBy: string;
  isPrivate: boolean;
  inviteCode?: string;
  settings: {
    allowBetting: boolean;
    requireApproval: boolean;
    maxBetAmount?: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Tabs Collection (`tabs`)
```typescript
interface Tab {
  id: string;
  groupId: string;
  name: string;
  participants: TabParticipant[];
  transactions: TabTransaction[];
  isSettled: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Settings
  autoSettle: boolean;
  settlementThreshold?: number;  // Auto-settle when balance exceeds
}
```

## API Endpoints (Cloud Functions)

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user after Firebase Auth signup
```typescript
Request: {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}
Response: {
  success: boolean;
  user: User;
}
```

#### POST `/api/auth/updateProfile`
Update user profile information
```typescript
Request: {
  uid: string;
  updates: Partial<User>;
}
Response: {
  success: boolean;
  user: User;
}
```

### Bet Management Endpoints

#### POST `/api/bets/create`
Create a new bet
```typescript
Request: {
  title: string;
  description: string;
  amount: number;
  resolutionType: 'neutral_party' | 'everyone_agrees';
  neutralParty?: string;
  participants: BetParticipant[];
  groupId?: string;
}
Response: {
  success: boolean;
  betId: string;
  facilitationFee: number;
}
```

#### POST `/api/bets/{betId}/join`
Join an existing bet
```typescript
Request: {
  userId: string;
  side: string;
}
Response: {
  success: boolean;
  bet: Bet;
}
```

#### POST `/api/bets/{betId}/resolve`
Resolve a bet (neutral party or consensus)
```typescript
Request: {
  userId: string;
  winningSide: string;
  evidence?: BetEvidence[];
}
Response: {
  success: boolean;
  paymentRequests: PaymentRequest[];
}
```

#### POST `/api/bets/{betId}/agree`
Agree to bet resolution (everyone agrees mode)
```typescript
Request: {
  userId: string;
  winningSide?: string;
}
Response: {
  success: boolean;
  allAgreed: boolean;
  bet: Bet;
}
```

### Payment Endpoints

#### POST `/api/payments/create`
Create a payment request
```typescript
Request: {
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  betId?: string;
  paymentMethod: 'venmo' | 'manual';
}
Response: {
  success: boolean;
  paymentRequest: PaymentRequest;
  venmoDeepLink?: string;
}
```

#### POST `/api/payments/{paymentId}/verify`
Verify payment completion
```typescript
Request: {
  userId: string;
  verificationCode?: string;
  screenshot?: string;
}
Response: {
  success: boolean;
  verified: boolean;
}
```

### Subscription Endpoints

#### POST `/api/subscriptions/create`
Create premium subscription
```typescript
Request: {
  userId: string;
  plan: 'monthly' | 'yearly';
  paymentMethodId: string;
}
Response: {
  success: boolean;
  subscription: Subscription;
  clientSecret?: string; // For Stripe confirmation
}
```

#### POST `/api/subscriptions/{subscriptionId}/cancel`
Cancel premium subscription
```typescript
Request: {
  userId: string;
}
Response: {
  success: boolean;
  cancelledAt: Timestamp;
}
```

### Notification Endpoints

#### POST `/api/notifications/send`
Send push notification
```typescript
Request: {
  userIds: string[];
  title: string;
  message: string;
  data?: any;
  type: NotificationType;
}
Response: {
  success: boolean;
  messageIds: string[];
}
```

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Others can read basic profile info
    }
    
    // Bets are readable by participants and neutral party
    match /bets/{betId} {
      allow read: if request.auth != null && (
        request.auth.uid in resource.data.participants.map(p => p.userId) ||
        request.auth.uid == resource.data.neutralParty ||
        request.auth.uid == resource.data.createdBy
      );
      allow create: if request.auth != null && request.auth.uid == request.resource.data.createdBy;
      allow update: if request.auth != null && (
        request.auth.uid in resource.data.participants.map(p => p.userId) ||
        request.auth.uid == resource.data.neutralParty ||
        request.auth.uid == resource.data.createdBy
      );
    }
    
    // Payment requests are readable by sender and receiver
    match /paymentRequests/{requestId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.fromUserId ||
        request.auth.uid == resource.data.toUserId
      );
    }
    
    // Groups are readable by members
    match /groups/{groupId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.members.map(m => m.userId);
      allow write: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
  }
}
```

## Cloud Functions

### Bet Resolution Function
```typescript
export const resolveBet = functions.firestore
  .document('bets/{betId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if bet was just resolved
    if (before.status !== 'resolved' && after.status === 'resolved') {
      await handleBetResolution(context.params.betId, after);
    }
  });

async function handleBetResolution(betId: string, bet: any) {
  // Create payment requests
  const losers = bet.participants.filter(p => p.side !== bet.winner);
  const winners = bet.participants.filter(p => p.side === bet.winner);
  
  for (const loser of losers) {
    for (const winner of winners) {
      await admin.firestore().collection('paymentRequests').add({
        fromUserId: loser.userId,
        toUserId: winner.userId,
        amount: bet.amount / winners.length,
        description: `Payment for bet: ${bet.title}`,
        betId,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
  
  // Send notifications
  await sendNotificationToUsers(
    bet.participants.map(p => p.userId),
    'Bet Resolved!',
    `"${bet.title}" has been resolved. Winner: ${bet.winner}`,
    { betId, type: 'bet_resolved' }
  );
}
```

### Payment Verification Function
```typescript
export const verifyPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { paymentId, screenshot } = data;
  
  // In a real implementation, you might:
  // 1. Use ML to verify Venmo screenshots
  // 2. Integrate with Venmo's API for verification
  // 3. Use manual review for disputed payments
  
  await admin.firestore()
    .collection('paymentRequests')
    .doc(paymentId)
    .update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      screenshot,
    });
  
  return { success: true };
});
```

## Deployment

### Environment Variables
```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=betbuddies-prod
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=betbuddies-prod.firebaseapp.com

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
FACEBOOK_APP_ID=your-facebook-app-id
APPLE_TEAM_ID=your-apple-team-id

# Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Notification Services
FCM_SERVER_KEY=your-fcm-server-key

# External APIs
VENMO_API_KEY=your-venmo-api-key (if available)
```

### Deployment Commands
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy hosting (for admin dashboard)
firebase deploy --only hosting

# Full deployment
firebase deploy
```

## Monitoring and Analytics

### Key Metrics to Track
- Daily/Monthly Active Users
- Bet creation and completion rates
- Payment success rates
- Premium subscription conversions
- Neutral party satisfaction ratings
- App performance metrics

### Error Monitoring
- Firebase Crashlytics for crash reporting
- Cloud Functions error logging
- Payment failure tracking
- Authentication error monitoring

## Scaling Considerations

### Database Optimization
- Use composite indexes for complex queries
- Implement data archiving for old bets
- Consider sharding for high-volume collections
- Use subcollections for chat messages and evidence

### Performance Optimization
- Implement caching for frequently accessed data
- Use Cloud CDN for static assets
- Optimize Cloud Functions cold starts
- Implement pagination for large datasets

### Security Enhancements
- Regular security rule audits
- Rate limiting for API endpoints
- Input validation and sanitization
- Fraud detection for payments

This backend architecture provides a solid foundation for the BetBuddies application with room for growth and additional features.
