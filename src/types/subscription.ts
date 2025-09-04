export type UserTier = 'free' | 'standard' | 'pro' | 'premium';

export interface SubscriptionPlan {
  id: UserTier;
  name: string;
  displayName: string;
  price: number; // Monthly price in USD
  yearlyPrice: number; // Yearly price in USD (with discount)
  color: string;
  icon: string;
  description: string;
  popular?: boolean;
  
  // Core limits
  limits: {
    maxFriends: number | 'unlimited';
    activeBetsPerWeek: number | 'unlimited';
    groupsPerUser: number | 'unlimited';
    seriesPerMonth: number | 'unlimited';
    participantsPerSeries: number | 'unlimited';
  };
  
  // Feature access
  features: {
    // Basic bet types
    basicBetTypes: string[];
    
    // Advanced bet types  
    advancedBetTypes: string[];
    
    // Sports templates
    sportsTemplates: string[];
    
    // Series types
    seriesTypes: string[];
    
    // Resolution methods
    resolutionMethods: string[];
    
    // Social features
    groupChat: boolean;
    betComments: boolean;
    pushNotifications: boolean;
    premiumReminders: boolean;
    
    // Financial features
    runningTabs: boolean;
    checkSplitting: boolean;
    sharedTabs: boolean;
    autoReconciliation: boolean;
    
    // Data & Analytics
    exportHistory: boolean;
    advancedAnalytics: boolean;
    leaderboards: boolean;
    seasonTracking: boolean;
    
    // Technical features
    cloudBackup: boolean;
    multiDeviceSync: boolean;
    prioritySupport: boolean;
    customTemplates: boolean;
  };
  
  // Marketing copy
  highlights: string[];
  upgradePrompts: {
    title: string;
    description: string;
    ctaText: string;
  };
}

export const SUBSCRIPTION_PLANS: Record<UserTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    displayName: 'Free Tier',
    price: 0,
    yearlyPrice: 0,
    color: '#6B7280',
    icon: 'account',
    description: 'Perfect for casual betting with close friends',
    
    limits: {
      maxFriends: 3,
      activeBetsPerWeek: 1,
      groupsPerUser: 1,
      seriesPerMonth: 0,
      participantsPerSeries: 0,
    },
    
    features: {
      basicBetTypes: ['true_false', 'winner_loser'],
      advancedBetTypes: [],
      sportsTemplates: [],
      seriesTypes: [],
      resolutionMethods: ['everyone_agrees', 'neutral_party'],
      
      groupChat: false,
      betComments: false,
      pushNotifications: true,
      premiumReminders: false,
      
      runningTabs: false,
      checkSplitting: false,
      sharedTabs: false,
      autoReconciliation: false,
      
      exportHistory: false,
      advancedAnalytics: false,
      leaderboards: false,
      seasonTracking: false,
      
      cloudBackup: false,
      multiDeviceSync: false,
      prioritySupport: false,
      customTemplates: false,
    },
    
    highlights: [
      'Up to 3 friends',
      '1 active bet per week',
      'Basic bet types',
      'Manual settlement',
      'Push notifications'
    ],
    
    upgradePrompts: {
      title: 'Upgrade to Standard',
      description: 'Get more friends, bets, and advanced features',
      ctaText: 'Upgrade for $2.99/month'
    }
  },

  standard: {
    id: 'standard',
    name: 'Standard',
    displayName: 'Standard Plan',
    price: 2.99,
    yearlyPrice: 29.99, // ~17% discount
    color: '#3B82F6',
    icon: 'star',
    description: 'Great for regular betting with expanded features',
    
    limits: {
      maxFriends: 10,
      activeBetsPerWeek: 5,
      groupsPerUser: 3,
      seriesPerMonth: 1,
      participantsPerSeries: 10,
    },
    
    features: {
      basicBetTypes: ['true_false', 'winner_loser'],
      advancedBetTypes: ['over_under', 'closest_to', 'pick_em'],
      sportsTemplates: [],
      seriesTypes: ['office_pool', 'custom_series'],
      resolutionMethods: ['everyone_agrees', 'neutral_party'],
      
      groupChat: true,
      betComments: true,
      pushNotifications: true,
      premiumReminders: false,
      
      runningTabs: true,
      checkSplitting: false,
      sharedTabs: false,
      autoReconciliation: false,
      
      exportHistory: true,
      advancedAnalytics: false,
      leaderboards: true,
      seasonTracking: false,
      
      cloudBackup: true,
      multiDeviceSync: true,
      prioritySupport: false,
      customTemplates: false,
    },
    
    highlights: [
      'Up to 10 friends per group',
      '5 active bets per week',
      'Over/Under & Pick-Em bets',
      'Running tabs',
      'Group chat & comments',
      'Export history'
    ],
    
    upgradePrompts: {
      title: 'Upgrade to Pro',
      description: 'Unlock sports betting and unlimited features',
      ctaText: 'Upgrade for $6.99/month'
    }
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    displayName: 'Pro Plan',
    price: 6.99,
    yearlyPrice: 69.99, // ~17% discount
    color: '#8B5CF6',
    icon: 'trophy',
    description: 'Perfect for serious bettors and sports fans',
    popular: true,
    
    limits: {
      maxFriends: 'unlimited',
      activeBetsPerWeek: 'unlimited',
      groupsPerUser: 'unlimited',
      seriesPerMonth: 5,
      participantsPerSeries: 50,
    },
    
    features: {
      basicBetTypes: ['true_false', 'winner_loser'],
      advancedBetTypes: ['over_under', 'closest_to', 'pick_em', 'first_to', 'exact_outcome'],
      sportsTemplates: ['moneyline', 'spread', 'prop_bet', 'parlay'],
      seriesTypes: ['office_pool', 'game_day_props', 'tournament_series', 'weekly_picks', 'custom_series'],
      resolutionMethods: ['everyone_agrees', 'neutral_party', 'automatic'],
      
      groupChat: true,
      betComments: true,
      pushNotifications: true,
      premiumReminders: true,
      
      runningTabs: true,
      checkSplitting: false,
      sharedTabs: false,
      autoReconciliation: true,
      
      exportHistory: true,
      advancedAnalytics: true,
      leaderboards: true,
      seasonTracking: true,
      
      cloudBackup: true,
      multiDeviceSync: true,
      prioritySupport: false,
      customTemplates: false,
    },
    
    highlights: [
      'Unlimited friends & bets',
      'Sports betting templates',
      'Tournament brackets',
      'Season-long tracking',
      'Advanced analytics',
      'Premium reminders',
      'Auto-reconciliation'
    ],
    
    upgradePrompts: {
      title: 'Upgrade to Premium',
      description: 'Get check splitting and premium support',
      ctaText: 'Upgrade for $9.99/month'
    }
  },

  premium: {
    id: 'premium',
    name: 'Premium',
    displayName: 'Premium Plan',
    price: 9.99,
    yearlyPrice: 99.99, // ~17% discount
    color: '#F59E0B',
    icon: 'crown',
    description: 'The ultimate betting experience with all features',
    
    limits: {
      maxFriends: 'unlimited',
      activeBetsPerWeek: 'unlimited',
      groupsPerUser: 'unlimited',
      seriesPerMonth: 'unlimited',
      participantsPerSeries: 'unlimited',
    },
    
    features: {
      basicBetTypes: ['true_false', 'winner_loser'],
      advancedBetTypes: ['over_under', 'closest_to', 'pick_em', 'first_to', 'exact_outcome'],
      sportsTemplates: ['moneyline', 'spread', 'prop_bet', 'parlay'],
      seriesTypes: ['office_pool', 'game_day_props', 'tournament_series', 'weekly_picks', 'season_long', 'custom_series'],
      resolutionMethods: ['everyone_agrees', 'neutral_party', 'automatic'],
      
      groupChat: true,
      betComments: true,
      pushNotifications: true,
      premiumReminders: true,
      
      runningTabs: true,
      checkSplitting: true,
      sharedTabs: true,
      autoReconciliation: true,
      
      exportHistory: true,
      advancedAnalytics: true,
      leaderboards: true,
      seasonTracking: true,
      
      cloudBackup: true,
      multiDeviceSync: true,
      prioritySupport: true,
      customTemplates: true,
    },
    
    highlights: [
      'Everything in Pro',
      'Restaurant check splitting',
      'Shared tabs across groups',
      'Unlimited series & participants',
      'Priority support',
      'Custom bet templates',
      'Advanced cloud features'
    ],
    
    upgradePrompts: {
      title: 'You have Premium!',
      description: 'Enjoy all features and priority support',
      ctaText: 'Manage Subscription'
    }
  }
};

// Feature gate checking functions
export class FeatureGate {
  static canAccessBetType(userTier: UserTier, betType: string): boolean {
    const plan = SUBSCRIPTION_PLANS[userTier];
    return plan.features.basicBetTypes.includes(betType) || 
           plan.features.advancedBetTypes.includes(betType) ||
           plan.features.sportsTemplates.includes(betType);
  }

  static canAccessSeriesType(userTier: UserTier, seriesType: string): boolean {
    const plan = SUBSCRIPTION_PLANS[userTier];
    return plan.features.seriesTypes.includes(seriesType);
  }

  static canCreateBet(userTier: UserTier, currentActiveBets: number): boolean {
    const plan = SUBSCRIPTION_PLANS[userTier];
    if (plan.limits.activeBetsPerWeek === 'unlimited') return true;
    return currentActiveBets < (plan.limits.activeBetsPerWeek as number);
  }

  static canAddFriend(userTier: UserTier, currentFriends: number): boolean {
    const plan = SUBSCRIPTION_PLANS[userTier];
    if (plan.limits.maxFriends === 'unlimited') return true;
    return currentFriends < (plan.limits.maxFriends as number);
  }

  static canCreateSeries(userTier: UserTier, currentSeriesThisMonth: number): boolean {
    const plan = SUBSCRIPTION_PLANS[userTier];
    if (plan.limits.seriesPerMonth === 'unlimited') return true;
    if (plan.limits.seriesPerMonth === 0) return false;
    return currentSeriesThisMonth < (plan.limits.seriesPerMonth as number);
  }

  static canJoinSeries(userTier: UserTier, seriesParticipantCount: number): boolean {
    const plan = SUBSCRIPTION_PLANS[userTier];
    if (plan.limits.participantsPerSeries === 'unlimited') return true;
    if (plan.limits.participantsPerSeries === 0) return false;
    return seriesParticipantCount < (plan.limits.participantsPerSeries as number);
  }

  static hasFeature(userTier: UserTier, feature: keyof SubscriptionPlan['features']): boolean {
    const plan = SUBSCRIPTION_PLANS[userTier];
    return plan.features[feature] as boolean;
  }

  static getUpgradePrompt(userTier: UserTier): SubscriptionPlan['upgradePrompts'] {
    const plan = SUBSCRIPTION_PLANS[userTier];
    return plan.upgradePrompts;
  }

  static getNextTier(userTier: UserTier): UserTier | null {
    const tiers: UserTier[] = ['free', 'standard', 'pro', 'premium'];
    const currentIndex = tiers.indexOf(userTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  static getFeatureRequiredTier(feature: keyof SubscriptionPlan['features']): UserTier {
    const tiers: UserTier[] = ['free', 'standard', 'pro', 'premium'];
    
    for (const tier of tiers) {
      if (SUBSCRIPTION_PLANS[tier].features[feature]) {
        return tier;
      }
    }
    
    return 'premium'; // Default to premium if not found
  }

  static getBetTypeRequiredTier(betType: string): UserTier {
    const tiers: UserTier[] = ['free', 'standard', 'pro', 'premium'];
    
    for (const tier of tiers) {
      const plan = SUBSCRIPTION_PLANS[tier];
      if (plan.features.basicBetTypes.includes(betType) || 
          plan.features.advancedBetTypes.includes(betType) ||
          plan.features.sportsTemplates.includes(betType)) {
        return tier;
      }
    }
    
    return 'premium';
  }

  static getSeriesTypeRequiredTier(seriesType: string): UserTier {
    const tiers: UserTier[] = ['free', 'standard', 'pro', 'premium'];
    
    for (const tier of tiers) {
      if (SUBSCRIPTION_PLANS[tier].features.seriesTypes.includes(seriesType)) {
        return tier;
      }
    }
    
    return 'premium';
  }
}

// Usage tracking for limits
export interface UserUsage {
  userId: string;
  currentTier: UserTier;
  
  // Current usage counts
  activeBets: number;
  friendsCount: number;
  groupsCount: number;
  seriesThisMonth: number;
  
  // Historical data
  totalBetsCreated: number;
  totalSeriesCreated: number;
  subscriptionStartDate?: Date;
  lastBillingDate?: Date;
  
  // Feature usage analytics
  featureUsage: {
    [feature: string]: {
      used: boolean;
      firstUsed?: Date;
      usageCount: number;
    };
  };
}

// Subscription management
export interface SubscriptionStatus {
  userId: string;
  tier: UserTier;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  
  // Billing info
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate?: Date;
  
  // Payment info
  paymentMethod?: {
    type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
    last4?: string;
    brand?: string;
  };
  
  // Subscription lifecycle
  createdAt: Date;
  cancelledAt?: Date;
  trialEndsAt?: Date;
  
  // Promotional
  promoCode?: string;
  discountPercent?: number;
}
