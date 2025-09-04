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
  TextInput,
  Button,
  Switch,
  Chip,
  Divider,
  RadioButton,
  HelperText,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {EditableTier, FeatureDefinition, TierFeatureValue, CORE_FEATURES} from '../../types/admin';
import {theme} from '../../theme/theme';

type AdminStackParamList = {
  TierManagement: undefined;
  EditTier: {tierId?: string};
  FeatureManagement: undefined;
};

type EditTierScreenNavigationProp = StackNavigationProp<AdminStackParamList, 'EditTier'>;
type EditTierScreenRouteProp = RouteProp<AdminStackParamList, 'EditTier'>;

interface Props {
  navigation: EditTierScreenNavigationProp;
  route: EditTierScreenRouteProp;
}

const TIER_COLORS = [
  '#6B7280', '#3B82F6', '#10B981', '#F59E0B', 
  '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'
];

const TIER_ICONS = [
  'account', 'star', 'trophy', 'crown', 'diamond', 
  'rocket', 'shield', 'medal', 'gem', 'fire'
];

const EditTierScreen: React.FC<Props> = ({navigation, route}) => {
  const {tierId} = route.params;
  const isEditing = !!tierId;

  const [tier, setTier] = useState<EditableTier>({
    id: '',
    name: '',
    displayName: '',
    description: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscount: 0,
    color: TIER_COLORS[0],
    icon: TIER_ICONS[0],
    popular: false,
    features: [],
    highlights: [''],
    upgradePrompt: {
      title: '',
      description: '',
      ctaText: ''
    },
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin'
  });

  const [features, setFeatures] = useState<FeatureDefinition[]>(CORE_FEATURES);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing) {
      loadTierData();
    } else {
      initializeNewTier();
    }
  }, [tierId]);

  const loadTierData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTier: EditableTier = {
        id: tierId!,
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
          {featureId: 'advanced_bet_types', value: ['over_under', 'closest_to'], enabled: true},
          {featureId: 'group_chat', value: true, enabled: true},
        ],
        highlights: [
          'Up to 10 friends per group',
          '5 active bets per week',
          'Advanced bet types'
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
      };

      setTier(mockTier);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tier data');
    }
  };

  const initializeNewTier = () => {
    const newTier: EditableTier = {
      ...tier,
      id: `tier_${Date.now()}`,
      name: `tier_${Date.now()}`,
      features: features.map(feature => ({
        featureId: feature.id,
        value: feature.defaultValue,
        enabled: false
      }))
    };
    setTier(newTier);
  };

  const updateTier = (field: keyof EditableTier, value: any) => {
    setTier(prev => ({...prev, [field]: value, updatedAt: new Date()}));
    // Clear error when user starts editing
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const updateFeature = (featureId: string, updates: Partial<TierFeatureValue>) => {
    setTier(prev => ({
      ...prev,
      features: prev.features.map(feature =>
        feature.featureId === featureId
          ? {...feature, ...updates}
          : feature
      ),
      updatedAt: new Date()
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...tier.highlights];
    newHighlights[index] = value;
    updateTier('highlights', newHighlights);
  };

  const addHighlight = () => {
    updateTier('highlights', [...tier.highlights, '']);
  };

  const removeHighlight = (index: number) => {
    const newHighlights = tier.highlights.filter((_, i) => i !== index);
    updateTier('highlights', newHighlights);
  };

  const calculateYearlyDiscount = (monthly: number, yearly: number) => {
    if (monthly === 0 || yearly === 0) return 0;
    const annualFromMonthly = monthly * 12;
    return Math.round(((annualFromMonthly - yearly) / annualFromMonthly) * 100);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!tier.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!tier.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (tier.monthlyPrice < 0) {
      newErrors.monthlyPrice = 'Price cannot be negative';
    }

    if (tier.yearlyPrice < 0) {
      newErrors.yearlyPrice = 'Price cannot be negative';
    }

    if (!tier.upgradePrompt.title.trim()) {
      newErrors.upgradePromptTitle = 'Upgrade prompt title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setLoading(true);
    try {
      // Calculate yearly discount
      const discount = calculateYearlyDiscount(tier.monthlyPrice, tier.yearlyPrice);
      const updatedTier = {
        ...tier,
        yearlyDiscount: discount,
        name: tier.displayName.toLowerCase().replace(/\s+/g, '_'),
      };

      // Mock API call - replace with actual implementation
      console.log('Saving tier:', updatedTier);
      
      Alert.alert(
        'Success',
        `Tier ${isEditing ? 'updated' : 'created'} successfully!`,
        [{text: 'OK', onPress: () => navigation.goBack()}]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} tier`);
    } finally {
      setLoading(false);
    }
  };

  const renderFeatureEditor = (feature: FeatureDefinition) => {
    const tierFeature = tier.features.find(f => f.featureId === feature.id);
    if (!tierFeature) return null;

    return (
      <Surface key={feature.id} style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <View style={styles.featureInfo}>
            <View style={styles.featureTitleRow}>
              <Icon name={feature.icon} size={20} color={feature.color} />
              <Text style={styles.featureName}>{feature.displayName}</Text>
              <Switch
                value={tierFeature.enabled}
                onValueChange={(enabled) => updateFeature(feature.id, {enabled})}
              />
            </View>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        </View>

        {tierFeature.enabled && (
          <View style={styles.featureValueEditor}>
            {feature.type === 'boolean' && (
              <View style={styles.booleanEditor}>
                <Text style={styles.valueLabel}>Value:</Text>
                <Switch
                  value={tierFeature.value as boolean}
                  onValueChange={(value) => updateFeature(feature.id, {value})}
                />
              </View>
            )}

            {feature.type === 'limit' && (
              <View style={styles.limitEditor}>
                <Text style={styles.valueLabel}>Limit:</Text>
                <View style={styles.limitOptions}>
                  <TouchableOpacity
                    style={[
                      styles.limitOption,
                      tierFeature.value === 'unlimited' && styles.selectedLimitOption
                    ]}
                    onPress={() => updateFeature(feature.id, {value: 'unlimited'})}>
                    <Text style={[
                      styles.limitOptionText,
                      tierFeature.value === 'unlimited' && styles.selectedLimitOptionText
                    ]}>
                      Unlimited
                    </Text>
                  </TouchableOpacity>
                  
                  <TextInput
                    mode="outlined"
                    style={styles.limitInput}
                    value={tierFeature.value === 'unlimited' ? '' : tierFeature.value?.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      updateFeature(feature.id, {value: num});
                    }}
                    keyboardType="numeric"
                    placeholder="Enter number"
                    disabled={tierFeature.value === 'unlimited'}
                  />
                </View>
              </View>
            )}

            {feature.type === 'access_list' && (
              <View style={styles.accessListEditor}>
                <Text style={styles.valueLabel}>Available Options:</Text>
                <View style={styles.optionsList}>
                  {feature.availableOptions?.map(option => {
                    const isSelected = (tierFeature.value as string[])?.includes(option);
                    return (
                      <Chip
                        key={option}
                        mode={isSelected ? 'flat' : 'outlined'}
                        selected={isSelected}
                        onPress={() => {
                          const currentValues = (tierFeature.value as string[]) || [];
                          const newValues = isSelected
                            ? currentValues.filter(v => v !== option)
                            : [...currentValues, option];
                          updateFeature(feature.id, {value: newValues});
                        }}
                        style={styles.optionChip}>
                        {option.replace(/_/g, ' ')}
                      </Chip>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}
      </Surface>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Surface style={styles.headerCard}>
        <Text style={styles.title}>
          {isEditing ? 'Edit Tier' : 'Create New Tier'}
        </Text>
      </Surface>

      {/* Basic Information */}
      <Surface style={styles.formCard}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <TextInput
          label="Display Name"
          value={tier.displayName}
          onChangeText={(value) => updateTier('displayName', value)}
          mode="outlined"
          style={styles.input}
          error={!!errors.displayName}
        />
        {errors.displayName && (
          <HelperText type="error">{errors.displayName}</HelperText>
        )}

        <TextInput
          label="Description"
          value={tier.description}
          onChangeText={(value) => updateTier('description', value)}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
          error={!!errors.description}
        />
        {errors.description && (
          <HelperText type="error">{errors.description}</HelperText>
        )}

        {/* Color Selection */}
        <Text style={styles.fieldLabel}>Color</Text>
        <View style={styles.colorGrid}>
          {TIER_COLORS.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                {backgroundColor: color},
                tier.color === color && styles.selectedColorOption
              ]}
              onPress={() => updateTier('color', color)}>
              {tier.color === color && (
                <Icon name="check" size={16} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Icon Selection */}
        <Text style={styles.fieldLabel}>Icon</Text>
        <View style={styles.iconGrid}>
          {TIER_ICONS.map(icon => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                tier.icon === icon && styles.selectedIconOption
              ]}
              onPress={() => updateTier('icon', icon)}>
              <Icon name={icon} size={24} color={tier.color} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Toggle */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Mark as Popular</Text>
          <Switch
            value={tier.popular}
            onValueChange={(value) => updateTier('popular', value)}
          />
        </View>
      </Surface>

      {/* Pricing */}
      <Surface style={styles.formCard}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        
        <TextInput
          label="Monthly Price ($)"
          value={tier.monthlyPrice.toString()}
          onChangeText={(value) => {
            const price = parseFloat(value) || 0;
            updateTier('monthlyPrice', price);
          }}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.monthlyPrice}
        />

        <TextInput
          label="Yearly Price ($)"
          value={tier.yearlyPrice.toString()}
          onChangeText={(value) => {
            const price = parseFloat(value) || 0;
            updateTier('yearlyPrice', price);
          }}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.yearlyPrice}
        />

        <HelperText type="info">
          Yearly discount: {calculateYearlyDiscount(tier.monthlyPrice, tier.yearlyPrice)}%
        </HelperText>
      </Surface>

      {/* Highlights */}
      <Surface style={styles.formCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Feature Highlights</Text>
          <Button mode="outlined" onPress={addHighlight} compact>
            Add
          </Button>
        </View>

        {tier.highlights.map((highlight, index) => (
          <View key={index} style={styles.highlightRow}>
            <TextInput
              value={highlight}
              onChangeText={(value) => updateHighlight(index, value)}
              mode="outlined"
              style={styles.highlightInput}
              placeholder="Enter feature highlight"
            />
            <Button
              mode="text"
              onPress={() => removeHighlight(index)}
              icon="delete"
              compact
            />
          </View>
        ))}
      </Surface>

      {/* Upgrade Prompt */}
      <Surface style={styles.formCard}>
        <Text style={styles.sectionTitle}>Upgrade Prompt</Text>
        
        <TextInput
          label="Title"
          value={tier.upgradePrompt.title}
          onChangeText={(value) => updateTier('upgradePrompt', {
            ...tier.upgradePrompt,
            title: value
          })}
          mode="outlined"
          style={styles.input}
          error={!!errors.upgradePromptTitle}
        />

        <TextInput
          label="Description"
          value={tier.upgradePrompt.description}
          onChangeText={(value) => updateTier('upgradePrompt', {
            ...tier.upgradePrompt,
            description: value
          })}
          mode="outlined"
          style={styles.input}
          multiline
        />

        <TextInput
          label="CTA Text"
          value={tier.upgradePrompt.ctaText}
          onChangeText={(value) => updateTier('upgradePrompt', {
            ...tier.upgradePrompt,
            ctaText: value
          })}
          mode="outlined"
          style={styles.input}
        />
      </Surface>

      {/* Features */}
      <Surface style={styles.formCard}>
        <Text style={styles.sectionTitle}>Features</Text>
        <Text style={styles.sectionSubtitle}>
          Configure which features are available in this tier
        </Text>

        {features
          .sort((a, b) => a.priority - b.priority)
          .map(renderFeatureEditor)}
      </Surface>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={loading}>
          Cancel
        </Button>
        
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}>
          {isEditing ? 'Update Tier' : 'Create Tier'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  formCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    elevation: 1,
  },
  selectedIconOption: {
    backgroundColor: theme.colors.primary + '20',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  highlightInput: {
    flex: 1,
  },
  featureCard: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    elevation: 1,
  },
  featureHeader: {
    marginBottom: 8,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
    marginLeft: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  featureValueEditor: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  valueLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  booleanEditor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitEditor: {
    gap: 8,
  },
  limitOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  limitOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedLimitOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  limitOptionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  selectedLimitOptionText: {
    color: 'white',
  },
  limitInput: {
    flex: 1,
    height: 40,
  },
  accessListEditor: {
    gap: 8,
  },
  optionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    height: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});

export default EditTierScreen;
