import {UserTier} from './subscription';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  venmoUsername?: string;
  
  // Subscription info
  tier: UserTier;
  isPremium: boolean; // Convenience property for tier !== 'free'
  subscriptionStatus?: 'active' | 'cancelled' | 'past_due' | 'trialing';
  premiumExpiresAt?: Date;
  trialEndsAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Usage tracking
  currentUsage: {
    activeBets: number;
    friendsCount: number;
    groupsCount: number;
    seriesThisMonth: number;
  };
}

export interface Bet {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: 'USD';
  createdBy: string;
  participants: BetParticipant[];
  neutralParty?: string;
  status: BetStatus;
  resolutionType: 'neutral_party' | 'everyone_agrees';
  resolutionDeadline?: Date;
  winner?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  facilitationFee: number;
  createdAt: Date;
  updatedAt: Date;
  chatMessages: ChatMessage[];
  evidence: BetEvidence[];
}

export interface BetParticipant {
  userId: string;
  displayName: string;
  photoURL?: string;
  side: string; // e.g., "Team A", "Yes", "No", etc.
  hasAgreed?: boolean; // for everyone_agrees resolution
  hasPaid?: boolean;
  paidAt?: Date;
}

export interface BetEvidence {
  id: string;
  submittedBy: string;
  type: 'photo' | 'video' | 'text' | 'link';
  content: string;
  description?: string;
  submittedAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system' | 'evidence';
}

export type BetStatus = 
  | 'pending' // Waiting for participants to join
  | 'active' // Bet is ongoing
  | 'awaiting_resolution' // Waiting for neutral party or everyone to agree
  | 'resolved' // Winner declared, waiting for payment
  | 'completed' // Payment made
  | 'cancelled' // Bet was cancelled
  | 'disputed'; // In dispute resolution

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  createdBy: string;
  isPrivate: boolean;
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface Tab {
  id: string;
  groupId: string;
  name: string;
  participants: TabParticipant[];
  transactions: TabTransaction[];
  isSettled: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TabParticipant {
  userId: string;
  displayName: string;
  balance: number; // Positive = owed money, Negative = owes money
}

export interface TabTransaction {
  id: string;
  type: 'bet' | 'expense' | 'payment' | 'adjustment';
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  createdAt: Date;
}

export interface PaymentRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  betId?: string;
  tabId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  venmoDeepLink?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'premium';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
}
