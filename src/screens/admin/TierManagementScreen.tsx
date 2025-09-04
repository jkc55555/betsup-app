import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  FAB,
  Chip,
  Menu,
  Divider,
  Switch,
  IconButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {StackNavigationProp} from '@react-navigation/stack';
import {EditableTier, TierAnalytics, CORE_FEATURES, FeatureDefinition} from '../../types/admin';
import {UserTier} from '../../types/subscription';
import {theme} from '../../theme/theme';

// Mock navigation type - replace with your actual admin navigation
type AdminStackParamList = {
  TierManagement: undefined;
  EditTier: {tierId?: string};
  FeatureManagement: undefined;
  Analytics: undefined;
};

type TierManagementScreenNavigationProp = StackNavigationProp<AdminStackParamList, 'TierManagement'>;

interface Props {
  navigation: TierManagementScreenNavigationProp;
}

const TierManagementScreen: React.FC<Props> = ({navigation}) => {
  const [tiers, setTiers] = useState<EditableTier[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, TierAnalytics>>({});
  const [features, setFeatures] = useState<FeatureDefinition[]>(CORE_FEATURES);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    loadTiersData();
  }, []);

  const loadTiersData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
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
            {featureId: 'push_notifications', value: true, enabled: true},
            {featureId: 'group_chat', value: false, enabled: false},
          ],
          highlights: [
            'Up to 3 friends',
            '1 active bet per week',
            'Basic bet types',
            'Push notifications'
          ],
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
        {
          id: 'standard',
          name: 'standard',
          displayName: 'Standard',
          description: 'Great for regular betting with expanded features',
          monthlyPrice: 2.99,
          yearlyPrice: 29.99,
          yearlyDiscount: 17,
          color: '#3B82F6',
          icon: 'star',
          popular: false,
          features: [
            {featureId: 'max_friends', value: 10, enabled: true},
            {featureId: 'active_bets_per_week', value: 5, enabled: true},
            {featureId: 'basic_bet_types', value: ['true_false', 'winner_loser'], enabled: true},
            {featureId: 'advanced_bet_types', value: ['over_under', 'closest_to', 'pick_em'], enabled: true},
            {featureId: 'group_chat', value: true, enabled: true},
            {featureId: 'running_tabs', value: true, enabled: true},
          ],
          highlights: [
            'Up to 10 friends per group',
            '5 active bets per week',
            'Advanced bet types',
            'Group chat & comments'
          ],
          upgradePrompt: {
            title: 'Upgrade to Pro',
            description: 'Unlock sports betting and unlimited features',
            ctaText: 'Upgrade for $6.99/month'
          },
          isActive: true,
          sortOrder: 2,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          createdBy: 'admin'
        },
        {
          id: 'pro',
          name: 'pro',
          displayName: 'Pro',
          description: 'Perfect for serious bettors and sports fans',
          monthlyPrice: 6.99,
          yearlyPrice: 69.99,
          yearlyDiscount: 17,
          color: '#8B5CF6',
          icon: 'trophy',
          popular: true,
          features: [
            {featureId: 'max_friends', value: 'unlimited', enabled: true},
            {featureId: 'active_bets_per_week', value: 'unlimited', enabled: true},
            {featureId: 'basic_bet_types', value: ['true_false', 'winner_loser'], enabled: true},
            {featureId: 'advanced_bet_types', value: ['over_under', 'closest_to', 'pick_em', 'first_to'], enabled: true},
            {featureId: 'sports_templates', value: ['moneyline', 'spread', 'prop_bet'], enabled: true},
            {featureId: 'leaderboards', value: true, enabled: true},
            {featureId: 'advanced_analytics', value: true, enabled: true},
          ],
          highlights: [
            'Unlimited friends & bets',
            'Sports betting templates',
            'Advanced analytics',
            'Leaderboards'
          ],
          upgradePrompt: {
            title: 'Upgrade to Premium',
            description: 'Get check splitting and premium support',
            ctaText: 'Upgrade for $9.99/month'
          },
          isActive: true,
          sortOrder: 3,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          createdBy: 'admin'
        }
      ];

      // Mock analytics
      const mockAnalytics: Record<string, TierAnalytics> = {
        free: {
          tierId: 'free',
          totalSubscribers: 1250,
          newSubscribersThisMonth: 180,
          churnRate: 0.05,
          monthlyRevenue: 0,
          averageLifetimeValue: 0,
          averageFeatureUsage: {},
          mostUsedFeatures: ['basic_bet_types', 'push_notifications'],
          leastUsedFeatures: [],
          upgradeRate: 0.15,
          downgradeRate: 0,
          supportTicketsPerUser: 0.8,
          averageResolutionTime: 24,
          lastUpdated: new Date()
        },
        standard: {
          tierId: 'standard',
          totalSubscribers: 320,
          newSubscribersThisMonth: 45,
          churnRate: 0.08,
          monthlyRevenue: 956.80,
          averageLifetimeValue: 89.70,
          averageFeatureUsage: {},
          mostUsedFeatures: ['group_chat', 'advanced_bet_types'],
          leastUsedFeatures: ['export_history'],
          upgradeRate: 0.25,
          downgradeRate: 0.03,
          supportTicketsPerUser: 0.6,
          averageResolutionTime: 18,
          lastUpdated: new Date()
        },
        pro: {
          tierId: 'pro',
          totalSubscribers: 180,
          newSubscribersThisMonth: 28,
          churnRate: 0.04,
          monthlyRevenue: 1258.20,
          averageLifetimeValue: 245.60,
          averageFeatureUsage: {},
          mostUsedFeatures: ['sports_templates', 'leaderboards'],
          leastUsedFeatures: ['season_tracking'],
          upgradeRate: 0.12,
          downgradeRate: 0.02,
          supportTicketsPerUser: 0.4,
          averageResolutionTime: 12,
          lastUpdated: new Date()
        }
      };

      setTiers(mockTiers);
      setAnalytics(mockAnalytics);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tiers data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTier = () => {
    navigation.navigate('EditTier', {});
  };

  const handleEditTier = (tierId: string) => {
    navigation.navigate('EditTier', {tierId});
  };

  const handleDuplicateTier = async (tier: EditableTier) => {
    try {
      const newTier: EditableTier = {
        ...tier,
        id: `${tier.id}_copy_${Date.now()}`,
        name: `${tier.name}_copy`,
        displayName: `${tier.displayName} Copy`,
        isActive: false,
        sortOrder: tiers.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTiers(prev => [...prev, newTier]);
      Alert.alert('Success', 'Tier duplicated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to duplicate tier');
    }
  };

  const handleToggleTierStatus = async (tierId: string, isActive: boolean) => {
    try {
      setTiers(prev => prev.map(tier => 
        tier.id === tierId ? {...tier, isActive, updatedAt: new Date()} : tier
      ));
      
      Alert.alert(
        'Success', 
        `Tier ${isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update tier status');
    }
  };

  const handleDeleteTier = (tierId: string) => {
    Alert.alert(
      'Delete Tier',
      'Are you sure you want to delete this tier? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setTiers(prev => prev.filter(tier => tier.id !== tierId));
              Alert.alert('Success', 'Tier deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete tier');
            }
          }
        }
      ]
    );
  };

  const renderTierCard = (tier: EditableTier) => {
    const tierAnalytics = analytics[tier.id];
    
    return (
      <Surface key={tier.id} style={styles.tierCard}>
        {/* Tier Header */}
        <View style={styles.tierHeader}>
          <View style={styles.tierTitleRow}>
            <View style={[styles.tierIcon, {backgroundColor: tier.color + '20'}]}>
              <Icon name={tier.icon} size={24} color={tier.color} />
            </View>
            
            <View style={styles.tierInfo}>
              <View style={styles.tierNameRow}>
                <Text style={styles.tierName}>{tier.displayName}</Text>
                {tier.popular && (
                  <Chip mode="flat" compact style={styles.popularChip}>
                    Popular
                  </Chip>
                )}
                {!tier.isActive && (
                  <Chip mode="outlined" compact style={styles.inactiveChip}>
                    Inactive
                  </Chip>
                )}
              </View>
              <Text style={styles.tierDescription}>{tier.description}</Text>
            </View>
            
            <Menu
              visible={showMenu === tier.id}
              onDismiss={() => setShowMenu(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setShowMenu(tier.id)}
                />
              }>
              <Menu.Item
                onPress={() => {
                  setShowMenu(null);
                  handleEditTier(tier.id);
                }}
                title="Edit"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={() => {
                  setShowMenu(null);
                  handleDuplicateTier(tier);
                }}
                title="Duplicate"
                leadingIcon="content-copy"
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  setShowMenu(null);
                  handleToggleTierStatus(tier.id, !tier.isActive);
                }}
                title={tier.isActive ? 'Deactivate' : 'Activate'}
                leadingIcon={tier.isActive ? 'pause' : 'play'}
              />
              <Menu.Item
                onPress={() => {
                  setShowMenu(null);
                  handleDeleteTier(tier.id);
                }}
                title="Delete"
                leadingIcon="delete"
              />
            </Menu>
          </View>
        </View>

        {/* Pricing Info */}
        <View style={styles.pricingSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Monthly:</Text>
            <Text style={styles.priceValue}>
              ${tier.monthlyPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Yearly:</Text>
            <Text style={styles.priceValue}>
              ${tier.yearlyPrice.toFixed(2)}
              {tier.yearlyDiscount > 0 && (
                <Text style={styles.discountText}> ({tier.yearlyDiscount}% off)</Text>
              )}
            </Text>
          </View>
        </View>

        {/* Analytics */}
        {tierAnalytics && (
          <View style={styles.analyticsSection}>
            <Text style={styles.analyticsTitle}>Analytics</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>
                  {tierAnalytics.totalSubscribers.toLocaleString()}
                </Text>
                <Text style={styles.analyticsLabel}>Subscribers</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>
                  ${tierAnalytics.monthlyRevenue.toLocaleString()}
                </Text>
                <Text style={styles.analyticsLabel}>Monthly Revenue</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>
                  {(tierAnalytics.churnRate * 100).toFixed(1)}%
                </Text>
                <Text style={styles.analyticsLabel}>Churn Rate</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>
                  {(tierAnalytics.upgradeRate * 100).toFixed(1)}%
                </Text>
                <Text style={styles.analyticsLabel}>Upgrade Rate</Text>
              </View>
            </View>
          </View>
        )}

        {/* Feature Count */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>
            Features: {tier.features.filter(f => f.enabled).length} enabled
          </Text>
          <View style={styles.featuresList}>
            {tier.features.slice(0, 3).map((feature, index) => {
              const featureDef = features.find(f => f.id === feature.featureId);
              return featureDef ? (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={[
                    styles.featureChip,
                    !feature.enabled && styles.disabledFeatureChip
                  ]}>
                  {featureDef.displayName}
                </Chip>
              ) : null;
            })}
            {tier.features.length > 3 && (
              <Text style={styles.moreFeatures}>
                +{tier.features.length - 3} more
              </Text>
            )}
          </View>
        </View>

        {/* Status Toggle */}
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>Active</Text>
          <Switch
            value={tier.isActive}
            onValueChange={(value) => handleToggleTierStatus(tier.id, value)}
          />
        </View>
      </Surface>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading tiers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <Text style={styles.title}>Tier Management</Text>
        <View style={styles.headerActions}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('FeatureManagement')}
            icon="cog"
            compact>
            Features
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Analytics')}
            icon="chart-line"
            compact>
            Analytics
          </Button>
        </View>
      </Surface>

      {/* Summary Stats */}
      <Surface style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Overview</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{tiers.length}</Text>
            <Text style={styles.summaryLabel}>Total Tiers</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {tiers.filter(t => t.isActive).length}
            </Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {Object.values(analytics).reduce((sum, a) => sum + a.totalSubscribers, 0).toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Total Users</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              ${Object.values(analytics).reduce((sum, a) => sum + a.monthlyRevenue, 0).toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Monthly Revenue</Text>
          </View>
        </View>
      </Surface>

      {/* Tiers List */}
      <ScrollView style={styles.tiersList} contentContainerStyle={styles.tiersContainer}>
        {tiers
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(renderTierCard)}
      </ScrollView>

      {/* Create Tier FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateTier}
        label="Create Tier"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  tiersList: {
    flex: 1,
  },
  tiersContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  tierCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  tierHeader: {
    marginBottom: 16,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tierIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tierInfo: {
    flex: 1,
  },
  tierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  tierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  popularChip: {
    backgroundColor: theme.colors.accent,
    height: 24,
  },
  inactiveChip: {
    height: 24,
  },
  tierDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  pricingSection: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  discountText: {
    fontSize: 12,
    color: theme.colors.success,
  },
  analyticsSection: {
    marginBottom: 16,
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analyticsItem: {
    alignItems: 'center',
  },
  analyticsNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  analyticsLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  featureChip: {
    height: 24,
  },
  disabledFeatureChip: {
    opacity: 0.5,
  },
  moreFeatures: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});

export default TierManagementScreen;
