import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {Alert} from 'react-native';
import {AdminUser, AdminPermission, EditableTier, FeatureDefinition, TierAnalytics} from '../types/admin';
import {UserTier} from '../types/subscription';

interface AdminContextType {
  // Admin user
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  
  // Authentication
  signInAsAdmin: (email: string, password: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
  
  // Permissions
  hasPermission: (permission: AdminPermission) => boolean;
  
  // Tier management
  tiers: EditableTier[];
  createTier: (tier: Omit<EditableTier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTier: (tierId: string, updates: Partial<EditableTier>) => Promise<void>;
  deleteTier: (tierId: string) => Promise<void>;
  duplicateTier: (tierId: string) => Promise<string>;
  toggleTierStatus: (tierId: string, isActive: boolean) => Promise<void>;
  
  // Feature management
  features: FeatureDefinition[];
  createFeature: (feature: Omit<FeatureDefinition, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateFeature: (featureId: string, updates: Partial<FeatureDefinition>) => Promise<void>;
  deleteFeature: (featureId: string) => Promise<void>;
  
  // Analytics
  analytics: Record<string, TierAnalytics>;
  refreshAnalytics: () => Promise<void>;
  
  // Loading states
  loading: boolean;
  saving: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({children}) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [tiers, setTiers] = useState<EditableTier[]>([]);
  const [features, setFeatures] = useState<FeatureDefinition[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, TierAnalytics>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      // Check if admin is already authenticated (e.g., from stored token)
      // This would typically check a secure token or session
      const storedAdminToken = null; // Replace with actual token check
      
      if (storedAdminToken) {
        // Validate token and load admin user
        await loadAdminUser();
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
    }
  };

  const loadAdminUser = async () => {
    try {
      // Mock admin user - replace with actual API call
      const mockAdminUser: AdminUser = {
        id: 'admin_1',
        email: 'admin@betbuddies.com',
        displayName: 'Admin User',
        role: 'super_admin',
        permissions: [
          'manage_tiers',
          'manage_users',
          'manage_features',
          'view_analytics',
          'manage_content',
          'manage_payments',
          'manage_support'
        ],
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date(),
      };

      setAdminUser(mockAdminUser);
      setIsAdminAuthenticated(true);
      
      // Load admin data
      await Promise.all([
        loadTiers(),
        loadFeatures(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Failed to load admin user:', error);
      throw error;
    }
  };

  const signInAsAdmin = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication - replace with actual API call
      if (email === 'admin@betbuddies.com' && password === 'admin123') {
        await loadAdminUser();
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Authentication Failed', 'Invalid email or password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutAdmin = async () => {
    try {
      setAdminUser(null);
      setIsAdminAuthenticated(false);
      setTiers([]);
      setFeatures([]);
      setAnalytics({});
    } catch (error) {
      console.error('Admin sign out failed:', error);
    }
  };

  const hasPermission = (permission: AdminPermission): boolean => {
    return adminUser?.permissions.includes(permission) || false;
  };

  const loadTiers = async () => {
    try {
      // Mock tiers data - replace with actual API call
      const mockTiers: EditableTier[] = [
        {
          id: 'free',
          name: 'free',
          displayName: 'Free',
          description: 'Perfect for casual betting with close friends',
          monthlyPrice: 0,
          yearlyPrice: 0,
          yearlyDiscount: 0,
          color: '#6B7280',
          icon: 'account',
          popular: false,
          features: [
            {featureId: 'max_friends', value: 3, enabled: true},
            {featureId: 'active_bets_per_week', value: 1, enabled: true},
            {featureId: 'basic_bet_types', value: ['true_false', 'winner_loser'], enabled: true},
          ],
          highlights: ['Up to 3 friends', '1 active bet per week', 'Basic bet types'],
          upgradePrompt: {
            title: 'Upgrade to Standard',
            description: 'Get more friends, bets, and advanced features',
            ctaText: 'Upgrade for $2.99/month'
          },
          isActive: true,
          sortOrder: 1,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          createdBy: 'admin'
        },
        // Add more mock tiers as needed
      ];

      setTiers(mockTiers);
    } catch (error) {
      console.error('Failed to load tiers:', error);
      throw error;
    }
  };

  const loadFeatures = async () => {
    try {
      // Mock features data - replace with actual API call
      const mockFeatures: FeatureDefinition[] = [
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
        // Add more mock features as needed
      ];

      setFeatures(mockFeatures);
    } catch (error) {
      console.error('Failed to load features:', error);
      throw error;
    }
  };

  const loadAnalytics = async () => {
    try {
      // Mock analytics data - replace with actual API call
      const mockAnalytics: Record<string, TierAnalytics> = {
        free: {
          tierId: 'free',
          totalSubscribers: 1250,
          newSubscribersThisMonth: 180,
          churnRate: 0.05,
          monthlyRevenue: 0,
          averageLifetimeValue: 0,
          averageFeatureUsage: {},
          mostUsedFeatures: ['basic_bet_types'],
          leastUsedFeatures: [],
          upgradeRate: 0.15,
          downgradeRate: 0,
          supportTicketsPerUser: 0.8,
          averageResolutionTime: 24,
          lastUpdated: new Date()
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      throw error;
    }
  };

  const createTier = async (tierData: Omit<EditableTier, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!hasPermission('manage_tiers')) {
      throw new Error('Insufficient permissions');
    }

    setSaving(true);
    try {
      const newTier: EditableTier = {
        ...tierData,
        id: `tier_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminUser?.id || 'unknown'
      };

      // Mock API call - replace with actual implementation
      setTiers(prev => [...prev, newTier]);
      
      return newTier.id;
    } catch (error) {
      console.error('Failed to create tier:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateTier = async (tierId: string, updates: Partial<EditableTier>): Promise<void> => {
    if (!hasPermission('manage_tiers')) {
      throw new Error('Insufficient permissions');
    }

    setSaving(true);
    try {
      // Mock API call - replace with actual implementation
      setTiers(prev => prev.map(tier => 
        tier.id === tierId 
          ? {...tier, ...updates, updatedAt: new Date()}
          : tier
      ));
    } catch (error) {
      console.error('Failed to update tier:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteTier = async (tierId: string): Promise<void> => {
    if (!hasPermission('manage_tiers')) {
      throw new Error('Insufficient permissions');
    }

    setSaving(true);
    try {
      // Mock API call - replace with actual implementation
      setTiers(prev => prev.filter(tier => tier.id !== tierId));
    } catch (error) {
      console.error('Failed to delete tier:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const duplicateTier = async (tierId: string): Promise<string> => {
    if (!hasPermission('manage_tiers')) {
      throw new Error('Insufficient permissions');
    }

    setSaving(true);
    try {
      const originalTier = tiers.find(t => t.id === tierId);
      if (!originalTier) {
        throw new Error('Tier not found');
      }

      const duplicatedTier: EditableTier = {
        ...originalTier,
        id: `${tierId}_copy_${Date.now()}`,
        name: `${originalTier.name}_copy`,
        displayName: `${originalTier.displayName} Copy`,
        isActive: false,
        sortOrder: tiers.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminUser?.id || 'unknown'
      };

      setTiers(prev => [...prev, duplicatedTier]);
      
      return duplicatedTier.id;
    } catch (error) {
      console.error('Failed to duplicate tier:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const toggleTierStatus = async (tierId: string, isActive: boolean): Promise<void> => {
    await updateTier(tierId, {isActive});
  };

  const createFeature = async (featureData: Omit<FeatureDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!hasPermission('manage_features')) {
      throw new Error('Insufficient permissions');
    }

    setSaving(true);
    try {
      const newFeature: FeatureDefinition = {
        ...featureData,
        id: `feature_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminUser?.id || 'unknown'
      };

      setFeatures(prev => [...prev, newFeature]);
      
      return newFeature.id;
    } catch (error) {
      console.error('Failed to create feature:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateFeature = async (featureId: string, updates: Partial<FeatureDefinition>): Promise<void> => {
    if (!hasPermission('manage_features')) {
      throw new Error('Insufficient permissions');
    }

    setSaving(true);
    try {
      setFeatures(prev => prev.map(feature => 
        feature.id === featureId 
          ? {...feature, ...updates, updatedAt: new Date()}
          : feature
      ));
    } catch (error) {
      console.error('Failed to update feature:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteFeature = async (featureId: string): Promise<void> => {
    if (!hasPermission('manage_features')) {
      throw new Error('Insufficient permissions');
    }

    const feature = features.find(f => f.id === featureId);
    if (feature?.isCore) {
      throw new Error('Cannot delete core features');
    }

    setSaving(true);
    try {
      setFeatures(prev => prev.filter(feature => feature.id !== featureId));
    } catch (error) {
      console.error('Failed to delete feature:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const refreshAnalytics = async (): Promise<void> => {
    if (!hasPermission('view_analytics')) {
      throw new Error('Insufficient permissions');
    }

    setLoading(true);
    try {
      await loadAnalytics();
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AdminContextType = {
    adminUser,
    isAdminAuthenticated,
    signInAsAdmin,
    signOutAdmin,
    hasPermission,
    tiers,
    createTier,
    updateTier,
    deleteTier,
    duplicateTier,
    toggleTierStatus,
    features,
    createFeature,
    updateFeature,
    deleteFeature,
    analytics,
    refreshAnalytics,
    loading,
    saving,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
