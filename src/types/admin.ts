import {UserTier} from './subscription';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: AdminPermission[];
  createdAt: Date;
  lastLoginAt?: Date;
}

export type AdminPermission = 
  | 'manage_tiers'
  | 'manage_users' 
  | 'manage_features'
  | 'view_analytics'
  | 'manage_content'
  | 'manage_payments'
  | 'manage_support';

export interface FeatureDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: FeatureCategory;
  type: 'boolean' | 'limit' | 'access_list';
  
  // For limit-type features
  defaultValue?: number | string | boolean;
  
  // For access_list-type features (like bet types)
  availableOptions?: string[];
  
  // UI metadata
  icon: string;
  color: string;
  priority: number; // Display order
  isCore: boolean; // Cannot be removed
  
  // Business metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type FeatureCategory = 
  | 'limits'
  | 'bet_types'
  | 'series_types'
  | 'social'
  | 'financial'
  | 'analytics'
  | 'technical'
  | 'support';

export interface TierFeatureValue {
  featureId: string;
  value: number | string | boolean | string[];
  enabled: boolean;
}

export interface EditableTier {
  id: string;
  name: string;
  displayName: string;
  description: string;
  
  // Pricing
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number; // Percentage
  
  // UI
  color: string;
  icon: string;
  popular: boolean;
  
  // Features
  features: TierFeatureValue[];
  
  // Marketing
  highlights: string[];
  upgradePrompt: {
    title: string;
    description: string;
    ctaText: string;
  };
  
  // Metadata
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TierTemplate {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  features: Partial<Record<string, any>>;
  category: 'basic' | 'standard' | 'premium' | 'enterprise';
}

// Pre-defined feature definitions
export const CORE_FEATURES: FeatureDefinition[] = [
  // Limits
  {
    id: 'max_friends',
    name: 'max_friends',
    displayName: 'Maximum Friends',
    description: 'Maximum number of friends a user can have',
    category: 'limits',
    type: 'limit',
    defaultValue: 3,
    icon: 'account-group',
    color: '#3B82F6',
    priority: 1,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'active_bets_per_week',
    name: 'active_bets_per_week',
    displayName: 'Active Bets Per Week',
    description: 'Maximum number of active bets per week',
    category: 'limits',
    type: 'limit',
    defaultValue: 1,
    icon: 'handshake',
    color: '#10B981',
    priority: 2,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'groups_per_user',
    name: 'groups_per_user',
    displayName: 'Groups Per User',
    description: 'Maximum number of groups a user can join',
    category: 'limits',
    type: 'limit',
    defaultValue: 1,
    icon: 'account-multiple',
    color: '#8B5CF6',
    priority: 3,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'series_per_month',
    name: 'series_per_month',
    displayName: 'Series Per Month',
    description: 'Maximum number of bet series per month',
    category: 'limits',
    type: 'limit',
    defaultValue: 0,
    icon: 'trophy',
    color: '#F59E0B',
    priority: 4,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  
  // Bet Types
  {
    id: 'basic_bet_types',
    name: 'basic_bet_types',
    displayName: 'Basic Bet Types',
    description: 'Available basic bet types',
    category: 'bet_types',
    type: 'access_list',
    availableOptions: ['true_false', 'yes_no', 'winner_loser'],
    defaultValue: ['true_false', 'winner_loser'],
    icon: 'handshake-outline',
    color: '#6B7280',
    priority: 10,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'advanced_bet_types',
    name: 'advanced_bet_types',
    displayName: 'Advanced Bet Types',
    description: 'Available advanced bet types',
    category: 'bet_types',
    type: 'access_list',
    availableOptions: ['over_under', 'closest_to', 'pick_em', 'first_to', 'exact_outcome'],
    defaultValue: [],
    icon: 'handshake',
    color: '#3B82F6',
    priority: 11,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'sports_templates',
    name: 'sports_templates',
    displayName: 'Sports Templates',
    description: 'Available sports betting templates',
    category: 'bet_types',
    type: 'access_list',
    availableOptions: ['moneyline', 'spread', 'prop_bet', 'parlay'],
    defaultValue: [],
    icon: 'football',
    color: '#EF4444',
    priority: 12,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  
  // Series Types
  {
    id: 'series_types',
    name: 'series_types',
    displayName: 'Series Types',
    description: 'Available bet series types',
    category: 'series_types',
    type: 'access_list',
    availableOptions: ['office_pool', 'game_day_props', 'tournament_series', 'weekly_picks', 'season_long', 'custom_series'],
    defaultValue: [],
    icon: 'trophy-outline',
    color: '#F59E0B',
    priority: 20,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  
  // Social Features
  {
    id: 'group_chat',
    name: 'group_chat',
    displayName: 'Group Chat',
    description: 'Access to group chat functionality',
    category: 'social',
    type: 'boolean',
    defaultValue: false,
    icon: 'chat',
    color: '#10B981',
    priority: 30,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'bet_comments',
    name: 'bet_comments',
    displayName: 'Bet Comments',
    description: 'Ability to comment on bets',
    category: 'social',
    type: 'boolean',
    defaultValue: false,
    icon: 'comment',
    color: '#3B82F6',
    priority: 31,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'push_notifications',
    name: 'push_notifications',
    displayName: 'Push Notifications',
    description: 'Basic push notification support',
    category: 'social',
    type: 'boolean',
    defaultValue: true,
    icon: 'bell',
    color: '#F59E0B',
    priority: 32,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'premium_reminders',
    name: 'premium_reminders',
    displayName: 'Premium Reminders',
    description: 'Advanced reminder and notification features',
    category: 'social',
    type: 'boolean',
    defaultValue: false,
    icon: 'bell-ring',
    color: '#8B5CF6',
    priority: 33,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  
  // Financial Features
  {
    id: 'running_tabs',
    name: 'running_tabs',
    displayName: 'Running Tabs',
    description: 'Track wins/losses with delayed settlement',
    category: 'financial',
    type: 'boolean',
    defaultValue: false,
    icon: 'receipt',
    color: '#10B981',
    priority: 40,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'check_splitting',
    name: 'check_splitting',
    displayName: 'Check Splitting',
    description: 'Restaurant and event bill splitting',
    category: 'financial',
    type: 'boolean',
    defaultValue: false,
    icon: 'receipt-text',
    color: '#F59E0B',
    priority: 41,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'shared_tabs',
    name: 'shared_tabs',
    displayName: 'Shared Tabs',
    description: 'Cross-group tab management',
    category: 'financial',
    type: 'boolean',
    defaultValue: false,
    icon: 'share-variant',
    color: '#8B5CF6',
    priority: 42,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'auto_reconciliation',
    name: 'auto_reconciliation',
    displayName: 'Auto Reconciliation',
    description: 'Smart tab settlement suggestions',
    category: 'financial',
    type: 'boolean',
    defaultValue: false,
    icon: 'auto-fix',
    color: '#DC2626',
    priority: 43,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  
  // Analytics Features
  {
    id: 'export_history',
    name: 'export_history',
    displayName: 'Export History',
    description: 'Export bet history to CSV/PDF',
    category: 'analytics',
    type: 'boolean',
    defaultValue: false,
    icon: 'download',
    color: '#6B7280',
    priority: 50,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'advanced_analytics',
    name: 'advanced_analytics',
    displayName: 'Advanced Analytics',
    description: 'Detailed statistics and performance metrics',
    category: 'analytics',
    type: 'boolean',
    defaultValue: false,
    icon: 'chart-line',
    color: '#3B82F6',
    priority: 51,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'leaderboards',
    name: 'leaderboards',
    displayName: 'Leaderboards',
    description: 'Ranking and leaderboard features',
    category: 'analytics',
    type: 'boolean',
    defaultValue: false,
    icon: 'podium',
    color: '#F59E0B',
    priority: 52,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'season_tracking',
    name: 'season_tracking',
    displayName: 'Season Tracking',
    description: 'Long-term performance tracking',
    category: 'analytics',
    type: 'boolean',
    defaultValue: false,
    icon: 'calendar-range',
    color: '#8B5CF6',
    priority: 53,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  
  // Technical Features
  {
    id: 'cloud_backup',
    name: 'cloud_backup',
    displayName: 'Cloud Backup',
    description: 'Cloud data backup and sync',
    category: 'technical',
    type: 'boolean',
    defaultValue: false,
    icon: 'cloud-upload',
    color: '#10B981',
    priority: 60,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'multi_device_sync',
    name: 'multi_device_sync',
    displayName: 'Multi-Device Sync',
    description: 'Synchronization across multiple devices',
    category: 'technical',
    type: 'boolean',
    defaultValue: false,
    icon: 'sync',
    color: '#3B82F6',
    priority: 61,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  
  // Support Features
  {
    id: 'priority_support',
    name: 'priority_support',
    displayName: 'Priority Support',
    description: 'Faster customer support response times',
    category: 'support',
    type: 'boolean',
    defaultValue: false,
    icon: 'headset',
    color: '#F59E0B',
    priority: 70,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'custom_templates',
    name: 'custom_templates',
    displayName: 'Custom Templates',
    description: 'Create custom bet and series templates',
    category: 'support',
    type: 'boolean',
    defaultValue: false,
    icon: 'palette',
    color: '#8B5CF6',
    priority: 71,
    isCore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
];

export interface TierAnalytics {
  tierId: string;
  
  // Subscription metrics
  totalSubscribers: number;
  newSubscribersThisMonth: number;
  churnRate: number;
  
  // Revenue metrics
  monthlyRevenue: number;
  averageLifetimeValue: number;
  
  // Usage metrics
  averageFeatureUsage: Record<string, number>;
  mostUsedFeatures: string[];
  leastUsedFeatures: string[];
  
  // Conversion metrics
  upgradeRate: number; // To next tier
  downgradeRate: number; // To lower tier
  
  // Support metrics
  supportTicketsPerUser: number;
  averageResolutionTime: number;
  
  // Updated timestamp
  lastUpdated: Date;
}
