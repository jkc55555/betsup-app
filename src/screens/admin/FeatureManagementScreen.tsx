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
  TextInput,
  Switch,
  IconButton,
  HelperText,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {StackNavigationProp} from '@react-navigation/stack';
import {FeatureDefinition, FeatureCategory, CORE_FEATURES} from '../../types/admin';
import {theme} from '../../theme/theme';

type AdminStackParamList = {
  TierManagement: undefined;
  EditTier: {tierId?: string};
  FeatureManagement: undefined;
};

type FeatureManagementScreenNavigationProp = StackNavigationProp<AdminStackParamList, 'FeatureManagement'>;

interface Props {
  navigation: FeatureManagementScreenNavigationProp;
}

const FEATURE_CATEGORIES: Array<{
  id: FeatureCategory;
  name: string;
  icon: string;
  color: string;
}> = [
  {id: 'limits', name: 'Limits', icon: 'speedometer', color: '#EF4444'},
  {id: 'bet_types', name: 'Bet Types', icon: 'handshake', color: '#10B981'},
  {id: 'series_types', name: 'Series Types', icon: 'trophy', color: '#F59E0B'},
  {id: 'social', name: 'Social', icon: 'account-group', color: '#3B82F6'},
  {id: 'financial', name: 'Financial', icon: 'currency-usd', color: '#059669'},
  {id: 'analytics', name: 'Analytics', icon: 'chart-line', color: '#8B5CF6'},
  {id: 'technical', name: 'Technical', icon: 'cog', color: '#6B7280'},
  {id: 'support', name: 'Support', icon: 'headset', color: '#DC2626'},
];

const FEATURE_TYPES = [
  {id: 'boolean', name: 'Boolean (On/Off)', description: 'Simple true/false feature'},
  {id: 'limit', name: 'Limit (Number)', description: 'Numeric limit with unlimited option'},
  {id: 'access_list', name: 'Access List', description: 'List of available options'},
];

const FeatureManagementScreen: React.FC<Props> = ({navigation}) => {
  const [features, setFeatures] = useState<FeatureDefinition[]>([]);
  const [filteredFeatures, setFilteredFeatures] = useState<FeatureDefinition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureDefinition | null>(null);
  const [loading, setLoading] = useState(false);

  // New feature form state
  const [newFeature, setNewFeature] = useState<Partial<FeatureDefinition>>({
    name: '',
    displayName: '',
    description: '',
    category: 'limits',
    type: 'boolean',
    icon: 'cog',
    color: '#6B7280',
    priority: 100,
    isCore: false,
    defaultValue: false,
    availableOptions: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFeatures();
  }, []);

  useEffect(() => {
    filterFeatures();
  }, [features, selectedCategory, searchQuery]);

  const loadFeatures = async () => {
    try {
      // In a real app, load from API
      setFeatures(CORE_FEATURES);
    } catch (error) {
      Alert.alert('Error', 'Failed to load features');
    }
  };

  const filterFeatures = () => {
    let filtered = features;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(f => f.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFeatures(filtered);
  };

  const validateFeatureForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newFeature.name?.trim()) {
      errors.name = 'Name is required';
    } else if (features.some(f => f.name === newFeature.name && f.id !== editingFeature?.id)) {
      errors.name = 'Name already exists';
    }

    if (!newFeature.displayName?.trim()) {
      errors.displayName = 'Display name is required';
    }

    if (!newFeature.description?.trim()) {
      errors.description = 'Description is required';
    }

    if (newFeature.type === 'access_list' && (!newFeature.availableOptions || newFeature.availableOptions.length === 0)) {
      errors.availableOptions = 'At least one option is required for access list type';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateFeature = async () => {
    if (!validateFeatureForm()) return;

    setLoading(true);
    try {
      const feature: FeatureDefinition = {
        id: editingFeature?.id || `feature_${Date.now()}`,
        name: newFeature.name!,
        displayName: newFeature.displayName!,
        description: newFeature.description!,
        category: newFeature.category!,
        type: newFeature.type!,
        defaultValue: newFeature.defaultValue,
        availableOptions: newFeature.availableOptions,
        icon: newFeature.icon!,
        color: newFeature.color!,
        priority: newFeature.priority!,
        isCore: newFeature.isCore!,
        createdAt: editingFeature?.createdAt || new Date(),
        updatedAt: new Date(),
        createdBy: editingFeature?.createdBy || 'admin',
      };

      if (editingFeature) {
        setFeatures(prev => prev.map(f => f.id === editingFeature.id ? feature : f));
        Alert.alert('Success', 'Feature updated successfully');
      } else {
        setFeatures(prev => [...prev, feature]);
        Alert.alert('Success', 'Feature created successfully');
      }

      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save feature');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFeature = (feature: FeatureDefinition) => {
    setEditingFeature(feature);
    setNewFeature({
      name: feature.name,
      displayName: feature.displayName,
      description: feature.description,
      category: feature.category,
      type: feature.type,
      defaultValue: feature.defaultValue,
      availableOptions: feature.availableOptions || [],
      icon: feature.icon,
      color: feature.color,
      priority: feature.priority,
      isCore: feature.isCore,
    });
    setShowCreateForm(true);
  };

  const handleDeleteFeature = (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    
    if (feature?.isCore) {
      Alert.alert('Cannot Delete', 'Core features cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Feature',
      'Are you sure you want to delete this feature? This will remove it from all tiers.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setFeatures(prev => prev.filter(f => f.id !== featureId));
            Alert.alert('Success', 'Feature deleted successfully');
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingFeature(null);
    setNewFeature({
      name: '',
      displayName: '',
      description: '',
      category: 'limits',
      type: 'boolean',
      icon: 'cog',
      color: '#6B7280',
      priority: 100,
      isCore: false,
      defaultValue: false,
      availableOptions: [],
    });
    setFormErrors({});
  };

  const updateNewFeature = (field: keyof FeatureDefinition, value: any) => {
    setNewFeature(prev => ({...prev, [field]: value}));
    if (formErrors[field]) {
      setFormErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const renderFeatureCard = (feature: FeatureDefinition) => (
    <Surface key={feature.id} style={styles.featureCard}>
      <View style={styles.featureHeader}>
        <View style={[styles.featureIcon, {backgroundColor: feature.color + '20'}]}>
          <Icon name={feature.icon} size={20} color={feature.color} />
        </View>
        
        <View style={styles.featureInfo}>
          <View style={styles.featureTitleRow}>
            <Text style={styles.featureName}>{feature.displayName}</Text>
            {feature.isCore && (
              <Chip mode="flat" compact style={styles.coreChip}>
                Core
              </Chip>
            )}
          </View>
          <Text style={styles.featureDescription}>{feature.description}</Text>
          
          <View style={styles.featureMeta}>
            <Chip mode="outlined" compact style={styles.metaChip}>
              {FEATURE_CATEGORIES.find(c => c.id === feature.category)?.name}
            </Chip>
            <Chip mode="outlined" compact style={styles.metaChip}>
              {FEATURE_TYPES.find(t => t.id === feature.type)?.name}
            </Chip>
          </View>
        </View>
        
        <Menu
          visible={showMenu === feature.id}
          onDismiss={() => setShowMenu(null)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => setShowMenu(feature.id)}
            />
          }>
          <Menu.Item
            onPress={() => {
              setShowMenu(null);
              handleEditFeature(feature);
            }}
            title="Edit"
            leadingIcon="pencil"
          />
          {!feature.isCore && (
            <>
              <Divider />
              <Menu.Item
                onPress={() => {
                  setShowMenu(null);
                  handleDeleteFeature(feature.id);
                }}
                title="Delete"
                leadingIcon="delete"
              />
            </>
          )}
        </Menu>
      </View>
    </Surface>
  );

  const renderCreateForm = () => (
    <Surface style={styles.createForm}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          {editingFeature ? 'Edit Feature' : 'Create New Feature'}
        </Text>
        <IconButton
          icon="close"
          size={20}
          onPress={resetForm}
        />
      </View>

      <TextInput
        label="Name (Internal)"
        value={newFeature.name}
        onChangeText={(value) => updateNewFeature('name', value)}
        mode="outlined"
        style={styles.formInput}
        error={!!formErrors.name}
      />
      {formErrors.name && <HelperText type="error">{formErrors.name}</HelperText>}

      <TextInput
        label="Display Name"
        value={newFeature.displayName}
        onChangeText={(value) => updateNewFeature('displayName', value)}
        mode="outlined"
        style={styles.formInput}
        error={!!formErrors.displayName}
      />
      {formErrors.displayName && <HelperText type="error">{formErrors.displayName}</HelperText>}

      <TextInput
        label="Description"
        value={newFeature.description}
        onChangeText={(value) => updateNewFeature('description', value)}
        mode="outlined"
        style={styles.formInput}
        multiline
        numberOfLines={2}
        error={!!formErrors.description}
      />
      {formErrors.description && <HelperText type="error">{formErrors.description}</HelperText>}

      <Text style={styles.fieldLabel}>Category</Text>
      <View style={styles.categoryGrid}>
        {FEATURE_CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryOption,
              newFeature.category === category.id && styles.selectedCategoryOption
            ]}
            onPress={() => updateNewFeature('category', category.id)}>
            <Icon name={category.icon} size={16} color={category.color} />
            <Text style={styles.categoryOptionText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Type</Text>
      <View style={styles.typeOptions}>
        {FEATURE_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeOption,
              newFeature.type === type.id && styles.selectedTypeOption
            ]}
            onPress={() => updateNewFeature('type', type.id)}>
            <Text style={styles.typeOptionTitle}>{type.name}</Text>
            <Text style={styles.typeOptionDescription}>{type.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {newFeature.type === 'access_list' && (
        <>
          <Text style={styles.fieldLabel}>Available Options</Text>
          <TextInput
            label="Options (one per line)"
            value={newFeature.availableOptions?.join('\n') || ''}
            onChangeText={(value) => {
              const options = value.split('\n').filter(opt => opt.trim());
              updateNewFeature('availableOptions', options);
            }}
            mode="outlined"
            style={styles.formInput}
            multiline
            numberOfLines={4}
            error={!!formErrors.availableOptions}
          />
          {formErrors.availableOptions && <HelperText type="error">{formErrors.availableOptions}</HelperText>}
        </>
      )}

      <View style={styles.formActions}>
        <Button
          mode="outlined"
          onPress={resetForm}
          style={styles.cancelButton}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleCreateFeature}
          loading={loading}
          style={styles.saveButton}>
          {editingFeature ? 'Update' : 'Create'}
        </Button>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <Text style={styles.title}>Feature Management</Text>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          icon="arrow-left"
          compact>
          Back
        </Button>
      </Surface>

      {/* Search and Filters */}
      <Surface style={styles.filtersCard}>
        <TextInput
          placeholder="Search features..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryFilters}>
            <Chip
              selected={selectedCategory === 'all'}
              onPress={() => setSelectedCategory('all')}
              style={styles.filterChip}>
              All
            </Chip>
            {FEATURE_CATEGORIES.map(category => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={styles.filterChip}
                icon={category.icon}>
                {category.name}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </Surface>

      {/* Create Form */}
      {showCreateForm && renderCreateForm()}

      {/* Features List */}
      <ScrollView style={styles.featuresList} contentContainerStyle={styles.featuresContainer}>
        <Text style={styles.featuresCount}>
          {filteredFeatures.length} feature{filteredFeatures.length !== 1 ? 's' : ''}
        </Text>
        
        {filteredFeatures.map(renderFeatureCard)}
      </ScrollView>

      {/* Create Feature FAB */}
      {!showCreateForm && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setShowCreateForm(true)}
          label="Add Feature"
        />
      )}
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
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  filtersCard: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 1,
  },
  searchInput: {
    marginBottom: 12,
  },
  categoryFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  createForm: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  formInput: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  selectedCategoryOption: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  categoryOptionText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  typeOptions: {
    gap: 8,
    marginBottom: 8,
  },
  typeOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedTypeOption: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  typeOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  typeOptionDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  featuresList: {
    flex: 1,
  },
  featuresContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  featuresCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  featureCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  featureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  coreChip: {
    backgroundColor: theme.colors.accent,
    height: 20,
  },
  featureDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  featureMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  metaChip: {
    height: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});

export default FeatureManagementScreen;
