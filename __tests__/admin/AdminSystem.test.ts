import {renderHook, act} from '@testing-library/react-hooks';
import {Alert} from 'react-native';
import {AdminProvider, useAdmin} from '../../src/contexts/AdminContext';
import {useTierManagement, useFeatureManagement, useAnalytics} from '../../src/hooks/useAdminHooks';
import {TierUtils, FeatureUtils, AnalyticsUtils, ValidationUtils} from '../../src/utils/adminUtils';
import AdminService from '../../src/services/AdminService';
import {EditableTier, FeatureDefinition, TierAnalytics} from '../../src/types/admin';

// Mock dependencies
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock AdminService
jest.mock('../../src/services/AdminService', () => ({
  authenticate: jest.fn(),
  logout: jest.fn(),
  getTiers: jest.fn(),
  createTier: jest.fn(),
  updateTier: jest.fn(),
  deleteTier: jest.fn(),
  duplicateTier: jest.fn(),
  getFeatures: jest.fn(),
  createFeature: jest.fn(),
  updateFeature: jest.fn(),
  deleteFeature: jest.fn(),
  getAnalytics: jest.fn(),
  getBusinessMetrics: jest.fn(),
  exportAnalytics: jest.fn(),
}));

describe('Admin System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AdminContext', () => {
    test('should authenticate admin user', async () => {
      const mockAdminUser = {
        id: 'admin_1',
        email: 'admin@test.com',
        displayName: 'Test Admin',
        role: 'super_admin' as const,
        permissions: ['manage_tiers', 'manage_features'],
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      (AdminService.authenticate as jest.Mock).mockResolvedValue(mockAdminUser);

      const {result} = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      await act(async () => {
        await result.current.signInAsAdmin('admin@test.com', 'password');
      });

      expect(result.current.isAdminAuthenticated).toBe(true);
      expect(result.current.adminUser).toEqual(mockAdminUser);
    });

    test('should handle authentication failure', async () => {
      (AdminService.authenticate as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      const {result} = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      await act(async () => {
        try {
          await result.current.signInAsAdmin('invalid@test.com', 'wrong');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isAdminAuthenticated).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Authentication Failed', 'Invalid email or password');
    });

    test('should check permissions correctly', () => {
      const {result} = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      // Mock authenticated admin with specific permissions
      act(() => {
        (result.current as any).setAdminUser({
          permissions: ['manage_tiers', 'view_analytics'],
        });
      });

      expect(result.current.hasPermission('manage_tiers')).toBe(true);
      expect(result.current.hasPermission('manage_features')).toBe(false);
    });
  });

  describe('Tier Management', () => {
    const mockTier: EditableTier = {
      id: 'test_tier',
      name: 'test_tier',
      displayName: 'Test Tier',
      description: 'Test description',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      yearlyDiscount: 17,
      color: '#3B82F6',
      icon: 'star',
      popular: false,
      features: [],
      highlights: ['Feature 1', 'Feature 2'],
      upgradePrompt: {
        title: 'Upgrade',
        description: 'Get more features',
        ctaText: 'Upgrade Now',
      },
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
    };

    test('should create tier successfully', async () => {
      (AdminService.createTier as jest.Mock).mockResolvedValue(mockTier);

      const {result} = renderHook(() => useTierManagement());

      let createdTierId: string | null = null;
      await act(async () => {
        createdTierId = await result.current.handleCreateTier(mockTier);
      });

      expect(createdTierId).toBe(mockTier.id);
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Tier created successfully');
    });

    test('should validate tier pricing', async () => {
      const invalidTier = {
        ...mockTier,
        monthlyPrice: -5, // Invalid negative price
      };

      const {result} = renderHook(() => useTierManagement());

      let createdTierId: string | null = null;
      await act(async () => {
        createdTierId = await result.current.handleCreateTier(invalidTier);
      });

      expect(createdTierId).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Validation Error', expect.stringContaining('negative'));
    });

    test('should update tier successfully', async () => {
      (AdminService.updateTier as jest.Mock).mockResolvedValue({...mockTier, displayName: 'Updated Tier'});

      const {result} = renderHook(() => useTierManagement());

      let success = false;
      await act(async () => {
        success = await result.current.handleUpdateTier('test_tier', {displayName: 'Updated Tier'});
      });

      expect(success).toBe(true);
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Tier updated successfully');
    });

    test('should handle tier deletion confirmation', async () => {
      const {result} = renderHook(() => useTierManagement());

      act(() => {
        result.current.handleDeleteTier('test_tier');
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Tier',
        'Are you sure you want to delete this tier? This action cannot be undone.',
        expect.any(Array)
      );
    });
  });

  describe('Feature Management', () => {
    const mockFeature: FeatureDefinition = {
      id: 'test_feature',
      name: 'test_feature',
      displayName: 'Test Feature',
      description: 'Test feature description',
      category: 'limits',
      type: 'boolean',
      defaultValue: false,
      icon: 'cog',
      color: '#3B82F6',
      priority: 100,
      isCore: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
    };

    test('should create feature successfully', async () => {
      (AdminService.createFeature as jest.Mock).mockResolvedValue(mockFeature);

      const {result} = renderHook(() => useFeatureManagement());

      let createdFeatureId: string | null = null;
      await act(async () => {
        createdFeatureId = await result.current.handleCreateFeature(mockFeature);
      });

      expect(createdFeatureId).toBe(mockFeature.id);
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Feature created successfully');
    });

    test('should validate feature data', async () => {
      const invalidFeature = {
        ...mockFeature,
        name: '', // Invalid empty name
      };

      const {result} = renderHook(() => useFeatureManagement());

      let createdFeatureId: string | null = null;
      await act(async () => {
        createdFeatureId = await result.current.handleCreateFeature(invalidFeature);
      });

      expect(createdFeatureId).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Validation Error', expect.stringContaining('required'));
    });

    test('should prevent deletion of core features', () => {
      const coreFeature = {...mockFeature, isCore: true};
      
      const {result} = renderHook(() => useFeatureManagement());

      // Mock features array with core feature
      (result.current as any).features = [coreFeature];

      act(() => {
        result.current.handleDeleteFeature('test_feature');
      });

      expect(Alert.alert).toHaveBeenCalledWith('Cannot Delete', 'Core features cannot be deleted');
    });
  });

  describe('Analytics', () => {
    const mockAnalytics: Record<string, TierAnalytics> = {
      free: {
        tierId: 'free',
        totalSubscribers: 1000,
        newSubscribersThisMonth: 100,
        churnRate: 0.05,
        monthlyRevenue: 0,
        averageLifetimeValue: 0,
        averageFeatureUsage: {},
        mostUsedFeatures: ['basic_features'],
        leastUsedFeatures: [],
        upgradeRate: 0.15,
        downgradeRate: 0,
        supportTicketsPerUser: 0.8,
        averageResolutionTime: 24,
        lastUpdated: new Date(),
      },
      premium: {
        tierId: 'premium',
        totalSubscribers: 200,
        newSubscribersThisMonth: 25,
        churnRate: 0.02,
        monthlyRevenue: 1998,
        averageLifetimeValue: 500,
        averageFeatureUsage: {},
        mostUsedFeatures: ['premium_features'],
        leastUsedFeatures: [],
        upgradeRate: 0,
        downgradeRate: 0.01,
        supportTicketsPerUser: 0.3,
        averageResolutionTime: 12,
        lastUpdated: new Date(),
      },
    };

    test('should load and process analytics', async () => {
      (AdminService.getAnalytics as jest.Mock).mockResolvedValue(mockAnalytics);
      (AdminService.getBusinessMetrics as jest.Mock).mockResolvedValue({
        totalMRR: 1998,
        totalSubscribers: 1200,
        averageRevenuePerUser: 1.67,
      });

      const {result} = renderHook(() => useAnalytics());

      expect(result.current.analyticsSummary.totalSubscribers).toBe(1200);
      expect(result.current.analyticsSummary.totalRevenue).toBe(1998);
    });

    test('should export analytics', async () => {
      const mockDownloadUrl = 'https://example.com/report.csv';
      (AdminService.exportAnalytics as jest.Mock).mockResolvedValue(mockDownloadUrl);

      const {result} = renderHook(() => useAnalytics());

      let downloadUrl: string | null = null;
      await act(async () => {
        downloadUrl = await result.current.exportAnalytics('csv');
      });

      expect(downloadUrl).toBe(mockDownloadUrl);
      expect(Alert.alert).toHaveBeenCalledWith('Export Ready', 'Your CSV report is ready for download.');
    });
  });

  describe('Utility Functions', () => {
    describe('TierUtils', () => {
      test('should calculate yearly discount correctly', () => {
        const discount = TierUtils.calculateYearlyDiscount(10, 100);
        expect(discount).toBe(17); // (120 - 100) / 120 * 100 = 16.67 rounded to 17
      });

      test('should generate tier name from display name', () => {
        const name = TierUtils.generateTierName('Premium Pro Plan!');
        expect(name).toBe('premium_pro_plan');
      });

      test('should validate pricing correctly', () => {
        const validation1 = TierUtils.validatePricing(10, 100);
        expect(validation1.valid).toBe(true);

        const validation2 = TierUtils.validatePricing(-5, 50);
        expect(validation2.valid).toBe(false);
        expect(validation2.errors).toContain('Monthly price cannot be negative');
      });

      test('should calculate tier value score', () => {
        const tier: EditableTier = {
          ...mockTier,
          monthlyPrice: 10,
          features: [
            {featureId: 'f1', value: true, enabled: true},
            {featureId: 'f2', value: true, enabled: true},
            {featureId: 'f3', value: false, enabled: false},
          ],
        };

        const value = TierUtils.calculateTierValue(tier);
        expect(value).toBe(0.2); // 2 enabled features / $10 = 0.2
      });
    });

    describe('FeatureUtils', () => {
      test('should validate feature correctly', () => {
        const validation1 = FeatureUtils.validateFeature({
          name: 'valid_feature',
          displayName: 'Valid Feature',
          description: 'A valid feature',
          category: 'limits',
          type: 'boolean',
        });
        expect(validation1.valid).toBe(true);

        const validation2 = FeatureUtils.validateFeature({
          name: 'Invalid Feature Name!',
          displayName: '',
          description: 'Description',
        });
        expect(validation2.valid).toBe(false);
      });

      test('should generate default values correctly', () => {
        const booleanFeature: FeatureDefinition = {...mockFeature, type: 'boolean'};
        const limitFeature: FeatureDefinition = {...mockFeature, type: 'limit'};
        const listFeature: FeatureDefinition = {...mockFeature, type: 'access_list'};

        expect(FeatureUtils.generateDefaultValue(booleanFeature)).toBe(false);
        expect(FeatureUtils.generateDefaultValue(limitFeature)).toBe(0);
        expect(FeatureUtils.generateDefaultValue(listFeature)).toEqual([]);
      });

      test('should validate feature values correctly', () => {
        const booleanFeature: FeatureDefinition = {...mockFeature, type: 'boolean'};
        const limitFeature: FeatureDefinition = {...mockFeature, type: 'limit'};
        const listFeature: FeatureDefinition = {
          ...mockFeature,
          type: 'access_list',
          availableOptions: ['option1', 'option2'],
        };

        expect(FeatureUtils.isValidFeatureValue(booleanFeature, true)).toBe(true);
        expect(FeatureUtils.isValidFeatureValue(booleanFeature, 'invalid')).toBe(false);

        expect(FeatureUtils.isValidFeatureValue(limitFeature, 10)).toBe(true);
        expect(FeatureUtils.isValidFeatureValue(limitFeature, 'unlimited')).toBe(true);
        expect(FeatureUtils.isValidFeatureValue(limitFeature, 'invalid')).toBe(false);

        expect(FeatureUtils.isValidFeatureValue(listFeature, ['option1'])).toBe(true);
        expect(FeatureUtils.isValidFeatureValue(listFeature, ['invalid'])).toBe(false);
      });

      test('should format feature values for display', () => {
        const booleanFeature: FeatureDefinition = {...mockFeature, type: 'boolean'};
        const limitFeature: FeatureDefinition = {...mockFeature, type: 'limit'};
        const listFeature: FeatureDefinition = {...mockFeature, type: 'access_list'};

        expect(FeatureUtils.formatFeatureValue(booleanFeature, true)).toBe('Enabled');
        expect(FeatureUtils.formatFeatureValue(booleanFeature, false)).toBe('Disabled');

        expect(FeatureUtils.formatFeatureValue(limitFeature, 10)).toBe('10');
        expect(FeatureUtils.formatFeatureValue(limitFeature, 'unlimited')).toBe('Unlimited');

        expect(FeatureUtils.formatFeatureValue(listFeature, ['opt1', 'opt2'])).toBe('2 options');
        expect(FeatureUtils.formatFeatureValue(listFeature, [])).toBe('None');
      });
    });

    describe('AnalyticsUtils', () => {
      test('should calculate growth rate correctly', () => {
        expect(AnalyticsUtils.calculateGrowthRate(120, 100)).toBe(0.2); // 20% growth
        expect(AnalyticsUtils.calculateGrowthRate(80, 100)).toBe(-0.2); // 20% decline
        expect(AnalyticsUtils.calculateGrowthRate(100, 0)).toBe(1); // 100% growth from 0
      });

      test('should calculate LTV correctly', () => {
        expect(AnalyticsUtils.calculateLTV(100, 0.1)).toBe(1000); // $100 / 10% churn = $1000 LTV
        expect(AnalyticsUtils.calculateLTV(50, 0)).toBe(Infinity); // No churn = infinite LTV
      });

      test('should calculate tier performance score', () => {
        const analytics: TierAnalytics = {
          tierId: 'test',
          totalSubscribers: 100,
          newSubscribersThisMonth: 20,
          churnRate: 0.05,
          monthlyRevenue: 500,
          averageLifetimeValue: 1000,
          averageFeatureUsage: {},
          mostUsedFeatures: [],
          leastUsedFeatures: [],
          upgradeRate: 0.1,
          downgradeRate: 0.02,
          supportTicketsPerUser: 0.5,
          averageResolutionTime: 24,
          lastUpdated: new Date(),
        };

        const score = AnalyticsUtils.calculateTierPerformance(analytics);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(1);
      });

      test('should generate analytics summary', () => {
        const summary = AnalyticsUtils.generateAnalyticsSummary(mockAnalytics);
        
        expect(summary.totalRevenue).toBe(1998);
        expect(summary.totalSubscribers).toBe(1200);
        expect(summary.averageChurn).toBe(0.035); // (0.05 + 0.02) / 2
        expect(summary.insights).toBeInstanceOf(Array);
      });

      test('should format analytics for export', () => {
        const csvData = AnalyticsUtils.formatForExport(mockAnalytics, 'csv');
        expect(csvData).toContain('tier,subscribers,newSubscribers');
        expect(csvData).toContain('free,1000,100');

        const jsonData = AnalyticsUtils.formatForExport(mockAnalytics, 'json');
        const parsed = JSON.parse(jsonData);
        expect(parsed).toBeInstanceOf(Array);
        expect(parsed[0]).toHaveProperty('tier', 'free');
      });
    });

    describe('ValidationUtils', () => {
      test('should validate email correctly', () => {
        expect(ValidationUtils.isValidEmail('test@example.com')).toBe(true);
        expect(ValidationUtils.isValidEmail('invalid-email')).toBe(false);
        expect(ValidationUtils.isValidEmail('test@')).toBe(false);
      });

      test('should validate hex colors correctly', () => {
        expect(ValidationUtils.isValidHexColor('#FF0000')).toBe(true);
        expect(ValidationUtils.isValidHexColor('#f00')).toBe(true);
        expect(ValidationUtils.isValidHexColor('FF0000')).toBe(false);
        expect(ValidationUtils.isValidHexColor('#GG0000')).toBe(false);
      });

      test('should validate tier names correctly', () => {
        expect(ValidationUtils.isValidTierName('premium')).toBe(true);
        expect(ValidationUtils.isValidTierName('premium_pro')).toBe(true);
        expect(ValidationUtils.isValidTierName('Premium')).toBe(false); // Uppercase
        expect(ValidationUtils.isValidTierName('premium-pro')).toBe(false); // Hyphen
        expect(ValidationUtils.isValidTierName('p')).toBe(false); // Too short
      });

      test('should validate prices correctly', () => {
        expect(ValidationUtils.isValidPrice(9.99)).toBe(true);
        expect(ValidationUtils.isValidPrice(0)).toBe(true);
        expect(ValidationUtils.isValidPrice(-5)).toBe(false);
        expect(ValidationUtils.isValidPrice(10000)).toBe(false);
        expect(ValidationUtils.isValidPrice(Infinity)).toBe(false);
      });

      test('should sanitize strings correctly', () => {
        const dirty = '  <script>alert("xss")</script>  ';
        const clean = ValidationUtils.sanitizeString(dirty);
        expect(clean).toBe('scriptalert("xss")/script');
        expect(clean).not.toContain('<');
        expect(clean).not.toContain('>');
      });
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete tier creation workflow', async () => {
      // Mock successful API calls
      (AdminService.createTier as jest.Mock).mockResolvedValue(mockTier);
      (AdminService.getTiers as jest.Mock).mockResolvedValue([mockTier]);

      const {result} = renderHook(() => useTierManagement());

      // Create tier
      let tierId: string | null = null;
      await act(async () => {
        tierId = await result.current.handleCreateTier({
          name: 'test_tier',
          displayName: 'Test Tier',
          description: 'Test description',
          monthlyPrice: 9.99,
          yearlyPrice: 99.99,
          yearlyDiscount: 17,
          color: '#3B82F6',
          icon: 'star',
          popular: false,
          features: [],
          highlights: ['Feature 1'],
          upgradePrompt: {
            title: 'Upgrade',
            description: 'Get more',
            ctaText: 'Upgrade',
          },
          isActive: true,
          sortOrder: 1,
          createdBy: 'admin',
        });
      });

      expect(tierId).toBe(mockTier.id);
      expect(AdminService.createTier).toHaveBeenCalled();
    });

    test('should handle tier update with validation', async () => {
      const updatedTier = {...mockTier, displayName: 'Updated Tier'};
      (AdminService.updateTier as jest.Mock).mockResolvedValue(updatedTier);

      const {result} = renderHook(() => useTierManagement());

      let success = false;
      await act(async () => {
        success = await result.current.handleUpdateTier('test_tier', {
          displayName: 'Updated Tier',
          monthlyPrice: 19.99,
        });
      });

      expect(success).toBe(true);
      expect(AdminService.updateTier).toHaveBeenCalledWith('test_tier', {
        displayName: 'Updated Tier',
        monthlyPrice: 19.99,
      });
    });
  });
});

// Performance Tests
describe('Admin System Performance', () => {
  test('should handle large datasets efficiently', () => {
    const largeTierList: EditableTier[] = Array.from({length: 1000}, (_, i) => ({
      ...mockTier,
      id: `tier_${i}`,
      displayName: `Tier ${i}`,
    }));

    const start = performance.now();
    const sorted = largeTierList.sort((a, b) => a.displayName.localeCompare(b.displayName));
    const end = performance.now();

    expect(sorted).toHaveLength(1000);
    expect(end - start).toBeLessThan(100); // Should complete in under 100ms
  });

  test('should efficiently calculate analytics for many tiers', () => {
    const manyAnalytics: Record<string, TierAnalytics> = {};
    
    for (let i = 0; i < 100; i++) {
      manyAnalytics[`tier_${i}`] = {
        tierId: `tier_${i}`,
        totalSubscribers: Math.floor(Math.random() * 1000),
        newSubscribersThisMonth: Math.floor(Math.random() * 100),
        churnRate: Math.random() * 0.1,
        monthlyRevenue: Math.random() * 10000,
        averageLifetimeValue: Math.random() * 1000,
        averageFeatureUsage: {},
        mostUsedFeatures: [],
        leastUsedFeatures: [],
        upgradeRate: Math.random() * 0.2,
        downgradeRate: Math.random() * 0.05,
        supportTicketsPerUser: Math.random() * 2,
        averageResolutionTime: Math.random() * 48,
        lastUpdated: new Date(),
      };
    }

    const start = performance.now();
    const summary = AnalyticsUtils.generateAnalyticsSummary(manyAnalytics);
    const end = performance.now();

    expect(summary.totalRevenue).toBeGreaterThan(0);
    expect(summary.totalSubscribers).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(50); // Should complete in under 50ms
  });
});
