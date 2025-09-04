import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Text,
  Surface,
  Searchbar,
  Chip,
  Button,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {BetTemplate, BetTemplateCategory, BET_TEMPLATES} from '../types/betTemplates';
import {UserTier, FeatureGate} from '../types/subscription';
import {theme} from '../theme/theme';

interface Props {
  onTemplateSelected: (template: BetTemplate) => void;
  onCustomFormSelected: () => void;
  onClose: () => void;
  onUpgradeRequired: (requiredTier: UserTier, templateName: string) => void;
  userTier: UserTier;
}

const CATEGORIES: Array<{
  id: BetTemplateCategory;
  name: string;
  icon: string;
  color: string;
}> = [
  {
    id: 'binary',
    name: 'Binary & Head-to-Head',
    icon: 'swap-horizontal',
    color: '#10B981',
  },
  {
    id: 'range',
    name: 'Range & Threshold',
    icon: 'trending-up',
    color: '#F59E0B',
  },
  {
    id: 'multi_party',
    name: 'Multi-Party & Ranking',
    icon: 'account-group',
    color: '#8B5CF6',
  },
  {
    id: 'sports',
    name: 'Sports-Oriented',
    icon: 'football',
    color: '#EF4444',
  },
  {
    id: 'tournament',
    name: 'Tournament & Group',
    icon: 'trophy',
    color: '#059669',
  },
  {
    id: 'social',
    name: 'Social & Lifestyle',
    icon: 'account-heart',
    color: '#3B82F6',
  },
];

const BetTemplateSelector: React.FC<Props> = ({
  onTemplateSelected,
  onCustomFormSelected,
  onClose,
  onUpgradeRequired,
  userTier,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BetTemplateCategory | 'all'>('all');

  const templates = Object.values(BET_TEMPLATES);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.examples.some(example => 
        example.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderTemplateCard = ({item}: {item: BetTemplate}) => {
    const canAccess = FeatureGate.canAccessBetType(userTier, item.id);
    const isLocked = !canAccess;
    
    return (
      <TouchableOpacity
        style={[
          styles.templateCard,
          isLocked && styles.lockedCard
        ]}
        onPress={() => {
          if (isLocked) {
            onUpgradeRequired(item.requiredTier, item.name);
          } else {
            onTemplateSelected(item);
          }
        }}>
        <View style={styles.templateHeader}>
          <View style={[styles.templateIcon, {backgroundColor: item.color + '20'}]}>
            <Icon name={item.icon} size={24} color={item.color} />
          </View>
          
          <View style={styles.templateInfo}>
            <View style={styles.templateTitleRow}>
              <Text style={styles.templateName}>{item.name}</Text>
              {item.requiredTier !== 'free' && (
                <Icon name="crown" size={16} color={theme.colors.accent} />
              )}
            </View>
            <Text style={styles.templateDescription}>{item.description}</Text>
          </View>
          
          {isLocked && (
            <View style={styles.lockIcon}>
              <Icon name="lock" size={20} color={theme.colors.textSecondary} />
            </View>
          )}
        </View>

        <View style={styles.templateExamples}>
          <Text style={styles.examplesLabel}>Examples:</Text>
          {item.examples.slice(0, 2).map((example, index) => (
            <Text key={index} style={styles.exampleText}>
              • {example}
            </Text>
          ))}
        </View>

        <View style={styles.templateFooter}>
          <View style={styles.templateMeta}>
            <Text style={styles.metaText}>
              {item.minParticipants}+ players
            </Text>
            {item.maxParticipants && (
              <Text style={styles.metaText}>
                • Max {item.maxParticipants}
              </Text>
            )}
          </View>
          
          <View style={styles.resolutionTypes}>
            {item.resolutionTypes.includes('automatic') && (
              <Chip mode="outlined" compact style={styles.resolutionChip}>
                Auto
              </Chip>
            )}
            {item.resolutionTypes.includes('neutral_party') && (
              <Chip mode="outlined" compact style={styles.resolutionChip}>
                Neutral
              </Chip>
            )}
            {item.resolutionTypes.includes('everyone_agrees') && (
              <Chip mode="outlined" compact style={styles.resolutionChip}>
                Consensus
              </Chip>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryChip = (category: {id: BetTemplateCategory | 'all'; name: string; icon?: string}) => (
    <Chip
      key={category.id}
      selected={selectedCategory === category.id}
      onPress={() => setSelectedCategory(category.id)}
      style={[
        styles.categoryChip,
        selectedCategory === category.id && styles.selectedCategoryChip
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedCategory === category.id && styles.selectedCategoryChipText
      ]}
      icon={category.icon}>
      {category.name}
    </Chip>
  );

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Bet Type</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Select a template to get started with pre-configured bet types and smart defaults.
      </Text>

      <Searchbar
        placeholder="Search bet types..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}>
        {renderCategoryChip({id: 'all', name: 'All', icon: 'view-grid'})}
        {CATEGORIES.map(renderCategoryChip)}
      </ScrollView>

      <FlatList
        data={filteredTemplates}
        renderItem={renderTemplateCard}
        keyExtractor={item => item.id}
        style={styles.templatesList}
        contentContainerStyle={styles.templatesContainer}
        showsVerticalScrollIndicator={false}
        numColumns={1}
      />

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={onCustomFormSelected}
          style={styles.customButton}
          icon="pencil">
          Create Custom Bet
        </Button>
        
        {userTier === 'free' && (
          <View style={styles.premiumPrompt}>
            <Icon name="crown" size={20} color={theme.colors.accent} />
            <Text style={styles.premiumText}>
              Unlock premium templates with advanced features
            </Text>
            <Button mode="outlined" compact>
              Upgrade Plan
            </Button>
          </View>
        )}
      </View>
    </Surface>
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
    lineHeight: 20,
    padding: 16,
    paddingTop: 8,
  },
  searchBar: {
    margin: 16,
    elevation: 0,
    backgroundColor: theme.colors.surface,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primary,
  },
  categoryChipText: {
    color: theme.colors.text,
    fontSize: 12,
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  templatesList: {
    flex: 1,
  },
  templatesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  templateCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: theme.colors.background,
  },
  lockedCard: {
    opacity: 0.6,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 8,
  },
  templateDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  lockIcon: {
    padding: 4,
  },
  templateExamples: {
    marginBottom: 12,
  },
  examplesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  resolutionTypes: {
    flexDirection: 'row',
    gap: 4,
  },
  resolutionChip: {
    height: 24,
  },
  premiumPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  premiumText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  customButton: {
    marginBottom: 16,
  },
});

export default BetTemplateSelector;
