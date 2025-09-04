import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Chip,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {StackNavigationProp} from '@react-navigation/stack';
import {TierAnalytics, EditableTier} from '../../types/admin';
import {theme} from '../../theme/theme';

type AdminStackParamList = {
  TierManagement: undefined;
  EditTier: {tierId?: string};
  FeatureManagement: undefined;
  Analytics: undefined;
};

type AdminAnalyticsScreenNavigationProp = StackNavigationProp<AdminStackParamList, 'Analytics'>;

interface Props {
  navigation: AdminAnalyticsScreenNavigationProp;
}

interface BusinessMetrics {
  totalMRR: number;
  totalSubscribers: number;
  averageRevenuePerUser: number;
  customerLifetimeValue: number;
  monthlyGrowthRate: number;
  overallChurnRate: number;
  conversionRate: number;
  
  // Feature metrics
  featureAdoptionRates: Record<string, number>;
  featureROI: Record<string, number>;
  
  // Tier performance
  tierPerformance: Record<string, {
    subscribers: number;
    revenue: number;
    growth: number;
    churn: number;
  }>;
}

const AdminAnalyticsScreen: React.FC<Props> = ({navigation}) => {
  const [analytics, setAnalytics] = useState<Record<string, TierAnalytics>>({});
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock analytics data - replace with actual API calls
      const mockAnalytics: Record<string, TierAnalytics> = {
        free: {
          tierId: 'free',
          totalSubscribers: 1250,
          newSubscribersThisMonth: 180,
          churnRate: 0.05,
          monthlyRevenue: 0,
          averageLifetimeValue: 0,
          averageFeatureUsage: {
            'basic_bet_types': 0.85,
            'push_notifications': 0.92,
          },
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
          averageFeatureUsage: {
            'group_chat': 0.78,
            'advanced_bet_types': 0.65,
            'running_tabs': 0.45,
          },
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
          averageFeatureUsage: {
            'sports_templates': 0.88,
            'leaderboards': 0.72,
            'advanced_analytics': 0.58,
          },
          mostUsedFeatures: ['sports_templates', 'leaderboards'],
          leastUsedFeatures: ['season_tracking'],
          upgradeRate: 0.12,
          downgradeRate: 0.02,
          supportTicketsPerUser: 0.4,
          averageResolutionTime: 12,
          lastUpdated: new Date()
        },
        premium: {
          tierId: 'premium',
          totalSubscribers: 85,
          newSubscribersThisMonth: 12,
          churnRate: 0.02,
          monthlyRevenue: 849.15,
          averageLifetimeValue: 485.20,
          averageFeatureUsage: {
            'check_splitting': 0.65,
            'shared_tabs': 0.42,
            'priority_support': 0.38,
          },
          mostUsedFeatures: ['check_splitting', 'shared_tabs'],
          leastUsedFeatures: ['custom_templates'],
          upgradeRate: 0,
          downgradeRate: 0.01,
          supportTicketsPerUser: 0.2,
          averageResolutionTime: 8,
          lastUpdated: new Date()
        }
      };

      const mockBusinessMetrics: BusinessMetrics = {
        totalMRR: 3064.15,
        totalSubscribers: 1835,
        averageRevenuePerUser: 1.67,
        customerLifetimeValue: 156.80,
        monthlyGrowthRate: 0.18,
        overallChurnRate: 0.05,
        conversionRate: 0.15,
        
        featureAdoptionRates: {
          'group_chat': 0.78,
          'sports_templates': 0.88,
          'leaderboards': 0.72,
          'check_splitting': 0.65,
          'advanced_analytics': 0.58,
        },
        
        featureROI: {
          'sports_templates': 4.2,
          'group_chat': 3.8,
          'leaderboards': 3.1,
          'advanced_analytics': 2.9,
          'check_splitting': 2.4,
        },
        
        tierPerformance: {
          free: {subscribers: 1250, revenue: 0, growth: 0.22, churn: 0.05},
          standard: {subscribers: 320, revenue: 956.80, growth: 0.16, churn: 0.08},
          pro: {subscribers: 180, revenue: 1258.20, growth: 0.18, churn: 0.04},
          premium: {subscribers: 85, revenue: 849.15, growth: 0.14, churn: 0.02},
        }
      };

      setAnalytics(mockAnalytics);
      setBusinessMetrics(mockBusinessMetrics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderKPICard = (title: string, value: string, change: string, icon: string, color: string) => (
    <Surface style={styles.kpiCard}>
      <View style={styles.kpiHeader}>
        <View style={[styles.kpiIcon, {backgroundColor: color + '20'}]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <Text style={styles.kpiTitle}>{title}</Text>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={[styles.kpiChange, {color: change.startsWith('+') ? '#10B981' : '#EF4444'}]}>
        {change}
      </Text>
    </Surface>
  );

  const renderTierPerformanceCard = (tierId: string, data: any) => (
    <Surface key={tierId} style={styles.tierPerformanceCard}>
      <View style={styles.tierPerformanceHeader}>
        <Text style={styles.tierPerformanceName}>
          {tierId.charAt(0).toUpperCase() + tierId.slice(1)}
        </Text>
        <Chip mode="outlined" compact>
          {data.subscribers} users
        </Chip>
      </View>
      
      <View style={styles.tierMetrics}>
        <View style={styles.tierMetric}>
          <Text style={styles.tierMetricLabel}>Revenue</Text>
          <Text style={styles.tierMetricValue}>${data.revenue.toFixed(0)}</Text>
        </View>
        <View style={styles.tierMetric}>
          <Text style={styles.tierMetricLabel}>Growth</Text>
          <Text style={[styles.tierMetricValue, {color: '#10B981'}]}>
            +{(data.growth * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.tierMetric}>
          <Text style={styles.tierMetricLabel}>Churn</Text>
          <Text style={[styles.tierMetricValue, {color: '#EF4444'}]}>
            {(data.churn * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    </Surface>
  );

  const renderFeatureROICard = (featureId: string, roi: number) => (
    <Surface key={featureId} style={styles.featureROICard}>
      <View style={styles.featureROIHeader}>
        <Text style={styles.featureROIName}>
          {featureId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Text>
        <Text style={[
          styles.featureROIValue,
          {color: roi >= 3 ? '#10B981' : roi >= 2 ? '#F59E0B' : '#EF4444'}
        ]}>
          {roi.toFixed(1)}x ROI
        </Text>
      </View>
      
      <View style={styles.featureROIBar}>
        <View 
          style={[
            styles.featureROIProgress,
            {
              width: `${Math.min(roi * 20, 100)}%`,
              backgroundColor: roi >= 3 ? '#10B981' : roi >= 2 ? '#F59E0B' : '#EF4444'
            }
          ]}
        />
      </View>
    </Surface>
  );

  if (loading || !businessMetrics) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Surface style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          icon="arrow-left"
          compact>
          Back
        </Button>
      </Surface>

      {/* Period Selector */}
      <Surface style={styles.periodSelector}>
        <Text style={styles.periodTitle}>Time Period</Text>
        <View style={styles.periodChips}>
          {(['7d', '30d', '90d', '1y'] as const).map(period => (
            <Chip
              key={period}
              selected={selectedPeriod === period}
              onPress={() => setSelectedPeriod(period)}
              style={styles.periodChip}>
              {period === '7d' ? '7 Days' : 
               period === '30d' ? '30 Days' :
               period === '90d' ? '90 Days' : '1 Year'}
            </Chip>
          ))}
        </View>
      </Surface>

      {/* Key Performance Indicators */}
      <View style={styles.kpiSection}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.kpiGrid}>
          {renderKPICard(
            'Monthly Recurring Revenue',
            `$${businessMetrics.totalMRR.toLocaleString()}`,
            '+12.5%',
            'currency-usd',
            '#10B981'
          )}
          {renderKPICard(
            'Total Subscribers',
            businessMetrics.totalSubscribers.toLocaleString(),
            '+18.2%',
            'account-group',
            '#3B82F6'
          )}
          {renderKPICard(
            'Average Revenue Per User',
            `$${businessMetrics.averageRevenuePerUser.toFixed(2)}`,
            '+5.8%',
            'account-cash',
            '#F59E0B'
          )}
          {renderKPICard(
            'Customer Lifetime Value',
            `$${businessMetrics.customerLifetimeValue.toFixed(0)}`,
            '+8.3%',
            'chart-line',
            '#8B5CF6'
          )}
        </View>
      </View>

      {/* Conversion Funnel */}
      <Surface style={styles.conversionSection}>
        <Text style={styles.sectionTitle}>Conversion Funnel</Text>
        <View style={styles.funnelSteps}>
          <View style={styles.funnelStep}>
            <Text style={styles.funnelStepTitle}>Free Users</Text>
            <Text style={styles.funnelStepValue}>1,250</Text>
            <Text style={styles.funnelStepPercent}>100%</Text>
          </View>
          <Icon name="arrow-right" size={20} color={theme.colors.textSecondary} />
          <View style={styles.funnelStep}>
            <Text style={styles.funnelStepTitle}>Trial Started</Text>
            <Text style={styles.funnelStepValue}>188</Text>
            <Text style={styles.funnelStepPercent}>15.0%</Text>
          </View>
          <Icon name="arrow-right" size={20} color={theme.colors.textSecondary} />
          <View style={styles.funnelStep}>
            <Text style={styles.funnelStepTitle}>Converted</Text>
            <Text style={styles.funnelStepValue}>141</Text>
            <Text style={styles.funnelStepPercent}>75.0%</Text>
          </View>
        </View>
      </Surface>

      {/* Tier Performance */}
      <View style={styles.tierPerformanceSection}>
        <Text style={styles.sectionTitle}>Tier Performance</Text>
        <View style={styles.tierPerformanceGrid}>
          {Object.entries(businessMetrics.tierPerformance).map(([tierId, data]) =>
            renderTierPerformanceCard(tierId, data)
          )}
        </View>
      </View>

      {/* Feature ROI */}
      <Surface style={styles.featureROISection}>
        <Text style={styles.sectionTitle}>Feature ROI Analysis</Text>
        <Text style={styles.sectionSubtitle}>
          Return on investment for premium features
        </Text>
        <View style={styles.featureROIList}>
          {Object.entries(businessMetrics.featureROI)
            .sort(([,a], [,b]) => b - a)
            .map(([featureId, roi]) => renderFeatureROICard(featureId, roi))}
        </View>
      </Surface>

      {/* Churn Analysis */}
      <Surface style={styles.churnSection}>
        <Text style={styles.sectionTitle}>Churn Analysis</Text>
        <View style={styles.churnMetrics}>
          <View style={styles.churnMetric}>
            <Text style={styles.churnMetricTitle}>Overall Churn Rate</Text>
            <Text style={[styles.churnMetricValue, {color: '#EF4444'}]}>
              {(businessMetrics.overallChurnRate * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.churnMetric}>
            <Text style={styles.churnMetricTitle}>Avg. Resolution Time</Text>
            <Text style={styles.churnMetricValue}>
              {Object.values(analytics).reduce((sum, a) => sum + a.averageResolutionTime, 0) / Object.values(analytics).length} hrs
            </Text>
          </View>
          <View style={styles.churnMetric}>
            <Text style={styles.churnMetricTitle}>Support Tickets/User</Text>
            <Text style={styles.churnMetricValue}>
              {(Object.values(analytics).reduce((sum, a) => sum + a.supportTicketsPerUser, 0) / Object.values(analytics).length).toFixed(1)}
            </Text>
          </View>
        </View>
      </Surface>

      {/* Export Actions */}
      <Surface style={styles.exportSection}>
        <Text style={styles.sectionTitle}>Export Data</Text>
        <View style={styles.exportButtons}>
          <Button
            mode="outlined"
            onPress={() => {/* Export CSV */}}
            icon="file-delimited"
            style={styles.exportButton}>
            Export CSV
          </Button>
          <Button
            mode="outlined"
            onPress={() => {/* Export PDF */}}
            icon="file-pdf-box"
            style={styles.exportButton}>
            Export PDF
          </Button>
          <Button
            mode="outlined"
            onPress={() => {/* Schedule Report */}}
            icon="clock"
            style={styles.exportButton}>
            Schedule Report
          </Button>
        </View>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: 32,
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
  periodSelector: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  periodChips: {
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  kpiSection: {
    padding: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  kpiTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  kpiChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  conversionSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  funnelSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  funnelStep: {
    alignItems: 'center',
    flex: 1,
  },
  funnelStepTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  funnelStepValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  funnelStepPercent: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  tierPerformanceSection: {
    padding: 16,
  },
  tierPerformanceGrid: {
    gap: 12,
  },
  tierPerformanceCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  tierPerformanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierPerformanceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tierMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tierMetric: {
    alignItems: 'center',
  },
  tierMetricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  tierMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  featureROISection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  featureROIList: {
    gap: 12,
  },
  featureROICard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  featureROIHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureROIName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  featureROIValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureROIBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  featureROIProgress: {
    height: '100%',
    borderRadius: 2,
  },
  churnSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  churnMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  churnMetric: {
    alignItems: 'center',
  },
  churnMetricTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  churnMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  exportSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
  },
});

export default AdminAnalyticsScreen;
