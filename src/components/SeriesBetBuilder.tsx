import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  FAB,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {BetSeriesTemplate, SeriesBet} from '../types/betSeries';
import {BetTemplate, BET_TEMPLATES} from '../types/betTemplates';
import BetTemplateSelector from './BetTemplateSelector';
import TemplateBetForm from './TemplateBetForm';
import {theme} from '../theme/theme';

interface Props {
  seriesTemplate: BetSeriesTemplate;
  existingBets: SeriesBet[];
  onBetsUpdated: (bets: SeriesBet[]) => void;
  onBack: () => void;
}

type BuilderStep = 'list' | 'template_select' | 'bet_form';

const SeriesBetBuilder: React.FC<Props> = ({
  seriesTemplate,
  existingBets,
  onBetsUpdated,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<BetTemplate | null>(null);
  const [editingBet, setEditingBet] = useState<SeriesBet | null>(null);
  const [bets, setBets] = useState<SeriesBet[]>(existingBets);

  const handleTemplateSelected = (template: BetTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('bet_form');
  };

  const handleBetFormSubmit = (betData: any) => {
    const newBet: SeriesBet = {
      id: editingBet?.id || `bet_${Date.now()}`,
      title: betData.title,
      description: betData.description,
      template: selectedTemplate!.id,
      templateData: betData.templateData,
      sides: betData.sides,
      resolutionType: betData.resolutionType,
      deadline: betData.deadline ? new Date(betData.deadline) : undefined,
      weight: betData.weight || 1,
      difficulty: betData.difficulty || 'medium',
      status: 'pending',
      order: editingBet?.order || bets.length,
    };

    let updatedBets;
    if (editingBet) {
      updatedBets = bets.map(bet => bet.id === editingBet.id ? newBet : bet);
    } else {
      updatedBets = [...bets, newBet];
    }

    setBets(updatedBets);
    onBetsUpdated(updatedBets);
    
    setCurrentStep('list');
    setSelectedTemplate(null);
    setEditingBet(null);
  };

  const handleEditBet = (bet: SeriesBet) => {
    setEditingBet(bet);
    const template = BET_TEMPLATES[bet.template];
    if (template) {
      setSelectedTemplate(template);
      setCurrentStep('bet_form');
    }
  };

  const handleDeleteBet = (betId: string) => {
    const updatedBets = bets.filter(bet => bet.id !== betId);
    setBets(updatedBets);
    onBetsUpdated(updatedBets);
  };

  const handleReorderBets = (fromIndex: number, toIndex: number) => {
    const updatedBets = [...bets];
    const [movedBet] = updatedBets.splice(fromIndex, 1);
    updatedBets.splice(toIndex, 0, movedBet);
    
    // Update order property
    updatedBets.forEach((bet, index) => {
      bet.order = index;
    });
    
    setBets(updatedBets);
    onBetsUpdated(updatedBets);
  };

  const handleBackFromForm = () => {
    setCurrentStep('list');
    setSelectedTemplate(null);
    setEditingBet(null);
  };

  const handleBackFromTemplateSelect = () => {
    setCurrentStep('list');
  };

  const renderBetItem = ({item, index}: {item: SeriesBet; index: number}) => {
    const template = BET_TEMPLATES[item.template];
    
    return (
      <Surface style={styles.betCard}>
        <View style={styles.betHeader}>
          <View style={styles.betOrder}>
            <Text style={styles.orderNumber}>{index + 1}</Text>
          </View>
          
          <View style={styles.betInfo}>
            <Text style={styles.betTitle}>{item.title}</Text>
            <Text style={styles.betDescription} numberOfLines={2}>
              {item.description}
            </Text>
            
            <View style={styles.betMeta}>
              <Chip mode="outlined" compact style={styles.templateChip}>
                {template?.name || item.template}
              </Chip>
              
              {seriesTemplate.features.weightedBets && (
                <Chip mode="outlined" compact style={styles.weightChip}>
                  Weight: {item.weight}
                </Chip>
              )}
              
              <Chip 
                mode="outlined" 
                compact 
                style={[
                  styles.difficultyChip,
                  {backgroundColor: getDifficultyColor(item.difficulty || 'medium')}
                ]}>
                {item.difficulty || 'Medium'}
              </Chip>
            </View>
          </View>
          
          <View style={styles.betActions}>
            <TouchableOpacity
              onPress={() => handleEditBet(item)}
              style={styles.actionButton}>
              <Icon name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleDeleteBet(item.id)}
              style={styles.actionButton}>
              <Icon name="delete" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.betSides}>
          <Text style={styles.sidesLabel}>Sides:</Text>
          <View style={styles.sidesContainer}>
            {item.sides.map((side, sideIndex) => (
              <Chip key={sideIndex} mode="outlined" compact style={styles.sideChip}>
                {side}
              </Chip>
            ))}
          </View>
        </View>
      </Surface>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981' + '20';
      case 'hard': return '#EF4444' + '20';
      default: return '#F59E0B' + '20';
    }
  };

  // Render template selector
  if (currentStep === 'template_select') {
    return (
      <BetTemplateSelector
        onTemplateSelected={handleTemplateSelected}
        onCustomFormSelected={() => {
          // For series, we'll use a generic template
          const genericTemplate = BET_TEMPLATES.true_false;
          setSelectedTemplate(genericTemplate);
          setCurrentStep('bet_form');
        }}
        onClose={handleBackFromTemplateSelect}
        isPremium={true} // Series can use all templates
      />
    );
  }

  // Render bet form
  if (currentStep === 'bet_form' && selectedTemplate) {
    return (
      <TemplateBetForm
        template={selectedTemplate}
        onSubmit={handleBetFormSubmit}
        onBack={handleBackFromForm}
        loading={false}
      />
    );
  }

  // Render bet list
  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Build Your Series</Text>
            <Text style={styles.headerSubtitle}>
              {bets.length} of {seriesTemplate.minBets}+ bets added
            </Text>
          </View>
        </View>
      </Surface>

      <View style={styles.content}>
        {/* Series Template Info */}
        <Surface style={styles.templateCard}>
          <View style={styles.templateHeader}>
            <View style={[styles.templateIcon, {backgroundColor: seriesTemplate.color + '20'}]}>
              <Icon name={seriesTemplate.icon} size={24} color={seriesTemplate.color} />
            </View>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{seriesTemplate.name}</Text>
              <Text style={styles.templateDescription}>{seriesTemplate.description}</Text>
            </View>
          </View>
        </Surface>

        {/* Suggested Templates */}
        {seriesTemplate.suggestedBetTemplates.length > 0 && (
          <Surface style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>Suggested Bet Types</Text>
            <View style={styles.suggestionsContainer}>
              {seriesTemplate.suggestedBetTemplates.map(templateId => {
                const template = BET_TEMPLATES[templateId];
                return (
                  <TouchableOpacity
                    key={templateId}
                    onPress={() => handleTemplateSelected(template)}
                    style={styles.suggestionChip}>
                    <Icon name={template.icon} size={16} color={template.color} />
                    <Text style={styles.suggestionText}>{template.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Surface>
        )}

        {/* Bets List */}
        {bets.length === 0 ? (
          <Surface style={styles.emptyState}>
            <Icon name="plus-circle-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>No bets added yet</Text>
            <Text style={styles.emptySubtitle}>
              Add at least {seriesTemplate.minBets} bets to create your series
            </Text>
            <Button
              mode="contained"
              onPress={() => setCurrentStep('template_select')}
              style={styles.addFirstBetButton}>
              Add Your First Bet
            </Button>
          </Surface>
        ) : (
          <FlatList
            data={bets}
            renderItem={renderBetItem}
            keyExtractor={item => item.id}
            style={styles.betsList}
            contentContainerStyle={styles.betsContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Floating Action Button */}
      {bets.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setCurrentStep('template_select')}
        />
      )}

      {/* Bottom Actions */}
      <Surface style={styles.bottomActions}>
        <View style={styles.actionsContent}>
          <Text style={styles.progressText}>
            {bets.length} bets added • {Math.max(0, seriesTemplate.minBets - bets.length)} more needed
          </Text>
          
          <Button
            mode="contained"
            onPress={onBack}
            disabled={bets.length < seriesTemplate.minBets}
            style={styles.doneButton}>
            Done Adding Bets
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  templateCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  templateDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  suggestionsCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 1,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: 12,
    color: theme.colors.text,
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstBetButton: {
    paddingHorizontal: 24,
  },
  betsList: {
    flex: 1,
  },
  betsContainer: {
    paddingBottom: 100, // Space for FAB and bottom actions
  },
  betCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  betHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  betOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  betInfo: {
    flex: 1,
  },
  betTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  betDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  betMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  templateChip: {
    height: 24,
  },
  weightChip: {
    height: 24,
  },
  difficultyChip: {
    height: 24,
  },
  betActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  betSides: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sidesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  sidesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sideChip: {
    height: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    backgroundColor: theme.colors.primary,
  },
  bottomActions: {
    elevation: 8,
  },
  actionsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  doneButton: {
    marginLeft: 16,
  },
});

export default SeriesBetBuilder;
