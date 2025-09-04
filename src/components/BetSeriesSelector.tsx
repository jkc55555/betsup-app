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
import {BetSeriesTemplate, BetSeriesType, BET_SERIES_TEMPLATES} from '../types/betSeries';
import {theme} from '../theme/theme';

interface Props {
  onSeriesSelected: (template: BetSeriesTemplate) => void;
  onSingleBetSelected: () => void;
  onClose: () => void;
  isPremium: boolean;
}

const BetSeriesSelector: React.FC<Props> = ({
  onSeriesSelected,
  onSingleBetSelected,
  onClose,
  isPremium,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const templates = Object.values(BET_SERIES_TEMPLATES);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.examples.some(example => 
        example.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesPremiumFilter = !showPremiumOnly || template.isPremium;
    
    return matchesSearch && matchesPremiumFilter;
  });

  const renderSeriesCard = ({item}: {item: BetSeriesTemplate}) => {
    const isLocked = item.isPremium && !isPremium;
    
    return (
      <TouchableOpacity
        style={[
          styles.seriesCard,
          isLocked && styles.lockedCard
        ]}
        onPress={() => !isLocked && onSeriesSelected(item)}
        disabled={isLocked}>
        
        <View style={styles.seriesHeader}>
          <View style={[styles.seriesIcon, {backgroundColor: item.color + '20'}]}>
            <Icon name={item.icon} size={32} color={item.color} />
          </View>
          
          <View style={styles.seriesInfo}>
            <View style={styles.seriesTitleRow}>
              <Text style={styles.seriesName}>{item.name}</Text>
              {item.isPremium && (
                <Icon name="crown" size={18} color={theme.colors.accent} />
              )}
            </View>
            <Text style={styles.seriesDescription}>{item.description}</Text>
            
            <View style={styles.seriesMeta}>
              <Text style={styles.metaText}>
                {item.minBets}-{item.maxBets || '∞'} bets
              </Text>
              <Text style={styles.metaText}>
                • {item.defaultDuration} days
              </Text>
            </View>
          </View>
          
          {isLocked && (
            <View style={styles.lockIcon}>
              <Icon name="lock" size={24} color={theme.colors.textSecondary} />
            </View>
          )}
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresLabel}>Features:</Text>
          <View style={styles.featureChips}>
            {item.features.liveUpdates && (
              <Chip mode="outlined" compact style={styles.featureChip}>
                Live Updates
              </Chip>
            )}
            {item.features.confidenceScoring && (
              <Chip mode="outlined" compact style={styles.featureChip}>
                Confidence
              </Chip>
            )}
            {item.features.weightedBets && (
              <Chip mode="outlined" compact style={styles.featureChip}>
                Weighted
              </Chip>
            )}
            {item.features.eliminationStyle && (
              <Chip mode="outlined" compact style={styles.featureChip}>
                Elimination
              </Chip>
            )}
            {item.features.achievementsEnabled && (
              <Chip mode="outlined" compact style={styles.featureChip}>
                Achievements
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.examplesSection}>
          <Text style={styles.examplesLabel}>Examples:</Text>
          {item.examples.slice(0, 2).map((example, index) => (
            <Text key={index} style={styles.exampleText}>
              • {example}
            </Text>
          ))}
        </View>

        <View style={styles.scoringInfo}>
          <Icon name="trophy-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.scoringText}>
            {item.defaultScoring.method === 'points_per_correct' && 'Points per correct pick'}
            {item.defaultScoring.method === 'confidence_points' && 'Confidence point scoring'}
            {item.defaultScoring.method === 'weighted_scoring' && 'Weighted scoring system'}
            {item.defaultScoring.method === 'elimination_style' && 'Elimination format'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Bet Series</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Create a series of related bets with overall scoring and leaderboards. Perfect for office pools, game day props, and tournaments.
      </Text>

      <Searchbar
        placeholder="Search series types..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}>
        <Chip
          selected={!showPremiumOnly}
          onPress={() => setShowPremiumOnly(false)}
          style={[
            styles.filterChip,
            !showPremiumOnly && styles.selectedFilterChip
          ]}>
          All Series
        </Chip>
        <Chip
          selected={showPremiumOnly}
          onPress={() => setShowPremiumOnly(true)}
          style={[
            styles.filterChip,
            showPremiumOnly && styles.selectedFilterChip
          ]}
          icon="crown">
          Premium Only
        </Chip>
      </ScrollView>

      <FlatList
        data={filteredTemplates}
        renderItem={renderSeriesCard}
        keyExtractor={item => item.id}
        style={styles.seriesList}
        contentContainerStyle={styles.seriesContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={onSingleBetSelected}
          style={styles.singleBetButton}
          icon="plus">
          Create Single Bet
        </Button>
        
        {!isPremium && (
          <View style={styles.premiumPrompt}>
            <Icon name="crown" size={20} color={theme.colors.accent} />
            <Text style={styles.premiumText}>
              Unlock premium series with advanced scoring and features
            </Text>
            <Button mode="outlined" compact>
              Go Premium
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
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: theme.colors.surface,
    marginRight: 8,
  },
  selectedFilterChip: {
    backgroundColor: theme.colors.primary,
  },
  seriesList: {
    flex: 1,
  },
  seriesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  seriesCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: theme.colors.background,
  },
  lockedCard: {
    opacity: 0.6,
  },
  seriesHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  seriesIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  seriesInfo: {
    flex: 1,
  },
  seriesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  seriesName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 8,
  },
  seriesDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  seriesMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  lockIcon: {
    padding: 4,
  },
  featuresSection: {
    marginBottom: 16,
  },
  featuresLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  featureChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureChip: {
    height: 28,
  },
  examplesSection: {
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
  scoringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  scoringText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  singleBetButton: {
    marginBottom: 16,
  },
  premiumPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    gap: 12,
  },
  premiumText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
});

export default BetSeriesSelector;
