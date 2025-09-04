import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Chip,
  Switch,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {UserTier, SUBSCRIPTION_PLANS, SubscriptionPlan} from '../types/subscription';
import {theme} from '../theme/theme';

interface Props {
  currentTier: UserTier;
  onSelectPlan: (tier: UserTier, billingCycle: 'monthly' | 'yearly') => void;
  onClose?: () => void;
  highlightTier?: UserTier;
}

const SubscriptionPlans: React.FC<Props> = ({
  currentTier,
  onSelectPlan,
  onClose,
  highlightTier,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<UserTier | null>(null);

  const plans = Object.values(SUBSCRIPTION_PLANS).filter(plan => plan.id !== 'free');

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
  };

  const getMonthlyEquivalent = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? (plan.yearlyPrice / 12).toFixed(2) : plan.price.toFixed(2);
  };

  const getSavingsPercent = (plan: SubscriptionPlan) => {
    if (billingCycle === 'monthly' || plan.price === 0) return 0;
    const monthlyCost = plan.price * 12;
    const yearlyCost = plan.yearlyPrice;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  const handleSelectPlan = (tier: UserTier) => {
    if (tier === currentTier) {
      Alert.alert('Current Plan', 'You are already on this plan.');
      return;
    }

    setSelectedTier(tier);
    
    Alert.alert(
      'Confirm Subscription',
      `Upgrade to ${SUBSCRIPTION_PLANS[tier].displayName} for $${getPrice(SUBSCRIPTION_PLANS[tier])}/${billingCycle === 'yearly' ? 'year' : 'month'}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Subscribe',
          onPress: () => onSelectPlan(tier, billingCycle),
        },
      ]
    );
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrentPlan = plan.id === currentTier;
    const isHighlighted = plan.id === highlightTier;
    const isPopular = plan.popular;
    const savings = getSavingsPercent(plan);

    return (
      <Surface
        key={plan.id}
        style={[
          styles.planCard,
          isCurrentPlan && styles.currentPlanCard,
          isHighlighted && styles.highlightedPlanCard,
        ]}>
        
        {/* Plan Header */}
        <View style={styles.planHeader}>
          <View style={styles.planTitleRow}>
            <View style={[styles.planIcon, {backgroundColor: plan.color + '20'}]}>
              <Icon name={plan.icon} size={24} color={plan.color} />
            </View>
            
            <View style={styles.planTitleInfo}>
              <Text style={styles.planName}>{plan.displayName}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </View>
            
            {isPopular && (
              <Chip mode="flat" style={styles.popularChip} textStyle={styles.popularText}>
                Most Popular
              </Chip>
            )}
          </View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>${getMonthlyEquivalent(plan)}</Text>
              <Text style={styles.priceUnit}>/month</Text>
            </View>
            
            {billingCycle === 'yearly' && savings > 0 && (
              <View style={styles.savingsContainer}>
                <Text style={styles.savingsText}>Save {savings}% yearly</Text>
                <Text style={styles.yearlyPrice}>
                  ${getPrice(plan)}/year
                </Text>
              </View>
            )}
            
            {billingCycle === 'monthly' && (
              <Text style={styles.monthlyPrice}>
                ${getPrice(plan)}/month
              </Text>
            )}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What's included:</Text>
          
          {plan.highlights.map((highlight, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon name="check" size={16} color={theme.colors.success} />
              <Text style={styles.featureText}>{highlight}</Text>
            </View>
          ))}
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {isCurrentPlan ? (
            <Button
              mode="outlined"
              disabled
              style={styles.currentPlanButton}>
              Current Plan
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={() => handleSelectPlan(plan.id)}
              style={[
                styles.selectButton,
                {backgroundColor: plan.color}
              ]}
              loading={selectedTier === plan.id}>
              {plan.id === 'standard' && currentTier === 'free' ? 'Start Free Trial' : 'Upgrade'}
            </Button>
          )}
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>
        Unlock more features and higher limits with a subscription
      </Text>

      {/* Billing Toggle */}
      <Surface style={styles.billingToggle}>
        <View style={styles.toggleContainer}>
          <Text style={[
            styles.toggleLabel,
            billingCycle === 'monthly' && styles.activeToggleLabel
          ]}>
            Monthly
          </Text>
          
          <Switch
            value={billingCycle === 'yearly'}
            onValueChange={(value) => setBillingCycle(value ? 'yearly' : 'monthly')}
            color={theme.colors.primary}
          />
          
          <View style={styles.yearlyLabelContainer}>
            <Text style={[
              styles.toggleLabel,
              billingCycle === 'yearly' && styles.activeToggleLabel
            ]}>
              Yearly
            </Text>
            <Chip mode="flat" compact style={styles.savingsChip}>
              Save up to 17%
            </Chip>
          </View>
        </View>
      </Surface>

      {/* Plans List */}
      <ScrollView 
        style={styles.plansList}
        contentContainerStyle={styles.plansContainer}
        showsVerticalScrollIndicator={false}>
        
        {plans.map(renderPlanCard)}

        {/* Free Plan Info */}
        <Surface style={styles.freePlanCard}>
          <View style={styles.freePlanHeader}>
            <Icon name="account" size={24} color="#6B7280" />
            <Text style={styles.freePlanTitle}>Free Plan</Text>
          </View>
          
          <Text style={styles.freePlanDescription}>
            Perfect for trying out BetBuddies with basic features
          </Text>
          
          <View style={styles.freePlanFeatures}>
            {SUBSCRIPTION_PLANS.free.highlights.map((highlight, index) => (
              <View key={index} style={styles.featureItem}>
                <Icon name="check" size={14} color="#6B7280" />
                <Text style={styles.freePlanFeatureText}>{highlight}</Text>
              </View>
            ))}
          </View>
          
          {currentTier !== 'free' && (
            <Text style={styles.freePlanNote}>
              You can downgrade to Free at any time
            </Text>
          )}
        </Surface>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          • Cancel anytime • 7-day free trial • No hidden fees
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    lineHeight: 20,
  },
  billingToggle: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  activeToggleLabel: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  yearlyLabelContainer: {
    alignItems: 'center',
    gap: 4,
  },
  savingsChip: {
    backgroundColor: theme.colors.success + '20',
    height: 20,
  },
  plansList: {
    flex: 1,
  },
  plansContainer: {
    padding: 16,
    paddingTop: 0,
  },
  planCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  highlightedPlanCard: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
    elevation: 6,
  },
  planHeader: {
    marginBottom: 16,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planTitleInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  popularChip: {
    backgroundColor: theme.colors.accent,
    height: 24,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pricingContainer: {
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  priceUnit: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  savingsContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  savingsText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '500',
  },
  yearlyPrice: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  monthlyPrice: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
  actionContainer: {
    marginTop: 8,
  },
  selectButton: {
    paddingVertical: 4,
  },
  currentPlanButton: {
    paddingVertical: 4,
  },
  freePlanCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 1,
    backgroundColor: theme.colors.surface,
  },
  freePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  freePlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  freePlanDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  freePlanFeatures: {
    marginBottom: 12,
  },
  freePlanFeatureText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  freePlanNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default SubscriptionPlans;
