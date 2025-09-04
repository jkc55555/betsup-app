import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {UserTier, SUBSCRIPTION_PLANS, FeatureGate} from '../types/subscription';
import {theme} from '../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUpgrade: (tier: UserTier) => void;
  
  // Feature gating info
  currentTier: UserTier;
  requiredTier: UserTier;
  featureName: string;
  featureDescription: string;
  featureIcon: string;
  
  // Optional customization
  title?: string;
  benefits?: string[];
}

const FeatureGateModal: React.FC<Props> = ({
  visible,
  onClose,
  onUpgrade,
  currentTier,
  requiredTier,
  featureName,
  featureDescription,
  featureIcon,
  title,
  benefits,
}) => {
  const requiredPlan = SUBSCRIPTION_PLANS[requiredTier];
  const currentPlan = SUBSCRIPTION_PLANS[currentTier];

  const defaultBenefits = [
    `Access to ${featureName}`,
    'All features from your current plan',
    'Priority customer support',
    'Cancel anytime'
  ];

  const displayBenefits = benefits || defaultBenefits;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      
      <View style={styles.overlay}>
        <Surface style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Feature Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.featureIcon, {backgroundColor: requiredPlan.color + '20'}]}>
              <Icon name={featureIcon} size={48} color={requiredPlan.color} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>
              {title || `Upgrade to ${requiredPlan.displayName}`}
            </Text>
            
            <Text style={styles.description}>
              {featureDescription}
            </Text>

            {/* Current vs Required Plan */}
            <View style={styles.planComparison}>
              <View style={styles.currentPlanInfo}>
                <Text style={styles.currentPlanLabel}>Current Plan</Text>
                <View style={styles.planChip}>
                  <Icon name={currentPlan.icon} size={16} color={currentPlan.color} />
                  <Text style={styles.planChipText}>{currentPlan.displayName}</Text>
                </View>
              </View>

              <Icon name="arrow-right" size={20} color={theme.colors.textSecondary} />

              <View style={styles.requiredPlanInfo}>
                <Text style={styles.requiredPlanLabel}>Required Plan</Text>
                <View style={[styles.planChip, {backgroundColor: requiredPlan.color + '20'}]}>
                  <Icon name={requiredPlan.icon} size={16} color={requiredPlan.color} />
                  <Text style={[styles.planChipText, {color: requiredPlan.color}]}>
                    {requiredPlan.displayName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>What you'll get:</Text>
              
              {displayBenefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Icon name="check-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Pricing */}
            <View style={styles.pricingContainer}>
              <Text style={styles.pricingTitle}>
                Starting at ${requiredPlan.price}/month
              </Text>
              <Text style={styles.pricingSubtitle}>
                7-day free trial • Cancel anytime
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={styles.cancelButton}>
              Maybe Later
            </Button>
            
            <Button
              mode="contained"
              onPress={() => onUpgrade(requiredTier)}
              style={[styles.upgradeButton, {backgroundColor: requiredPlan.color}]}>
              Upgrade Now
            </Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );
};

// Convenience component for common feature gates
export const BetTypeGateModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onUpgrade: (tier: UserTier) => void;
  currentTier: UserTier;
  betType: string;
  betTypeName: string;
}> = ({visible, onClose, onUpgrade, currentTier, betType, betTypeName}) => {
  const requiredTier = FeatureGate.getBetTypeRequiredTier(betType);
  
  return (
    <FeatureGateModal
      visible={visible}
      onClose={onClose}
      onUpgrade={onUpgrade}
      currentTier={currentTier}
      requiredTier={requiredTier}
      featureName={betTypeName}
      featureDescription={`Create ${betTypeName} bets with advanced features and higher limits.`}
      featureIcon="handshake"
      benefits={[
        `Access to ${betTypeName} bets`,
        'Higher betting limits',
        'Advanced resolution options',
        'Priority support'
      ]}
    />
  );
};

export const SeriesGateModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onUpgrade: (tier: UserTier) => void;
  currentTier: UserTier;
  seriesType: string;
  seriesTypeName: string;
}> = ({visible, onClose, onUpgrade, currentTier, seriesType, seriesTypeName}) => {
  const requiredTier = FeatureGate.getSeriesTypeRequiredTier(seriesType);
  
  return (
    <FeatureGateModal
      visible={visible}
      onClose={onClose}
      onUpgrade={onUpgrade}
      currentTier={currentTier}
      requiredTier={requiredTier}
      featureName={seriesTypeName}
      featureDescription={`Create ${seriesTypeName} with advanced scoring and unlimited participants.`}
      featureIcon="trophy"
      benefits={[
        `Access to ${seriesTypeName}`,
        'Advanced scoring systems',
        'Unlimited participants',
        'Leaderboards & analytics'
      ]}
    />
  );
};

export const LimitGateModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onUpgrade: (tier: UserTier) => void;
  currentTier: UserTier;
  limitType: 'bets' | 'friends' | 'groups';
  currentCount: number;
  limit: number;
}> = ({visible, onClose, onUpgrade, currentTier, limitType, currentCount, limit}) => {
  const nextTier = FeatureGate.getNextTier(currentTier);
  if (!nextTier) return null;

  const limitMessages = {
    bets: {
      name: 'Active Bets',
      description: `You've reached your limit of ${limit} active bets per week. Upgrade to create more bets and access advanced features.`,
      icon: 'handshake'
    },
    friends: {
      name: 'Friends',
      description: `You've reached your limit of ${limit} friends. Upgrade to add more friends and create bigger groups.`,
      icon: 'account-group'
    },
    groups: {
      name: 'Groups',
      description: `You've reached your limit of ${limit} groups. Upgrade to join more groups and organize your bets better.`,
      icon: 'account-multiple'
    }
  };

  const limitInfo = limitMessages[limitType];
  
  return (
    <FeatureGateModal
      visible={visible}
      onClose={onClose}
      onUpgrade={onUpgrade}
      currentTier={currentTier}
      requiredTier={nextTier}
      featureName={limitInfo.name}
      featureDescription={limitInfo.description}
      featureIcon={limitInfo.icon}
      title={`${limitInfo.name} Limit Reached`}
      benefits={[
        `Higher ${limitInfo.name.toLowerCase()} limits`,
        'Access to premium features',
        'Advanced bet types',
        'Priority support'
      ]}
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 0,
  },
  closeButton: {
    padding: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  planComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  currentPlanInfo: {
    alignItems: 'center',
    flex: 1,
  },
  requiredPlanInfo: {
    alignItems: 'center',
    flex: 1,
  },
  currentPlanLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  requiredPlanLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  planChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
  },
  planChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginLeft: 6,
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
  pricingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  pricingSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  upgradeButton: {
    flex: 2,
  },
});

export default FeatureGateModal;
