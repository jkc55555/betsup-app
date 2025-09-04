import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  RadioButton,
  Switch,
  Chip,
  HelperText,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {BetSeriesTemplate, BetSeries, SeriesBet} from '../types/betSeries';
import {BetTemplate, BET_TEMPLATES} from '../types/betTemplates';
import {theme} from '../theme/theme';

interface Props {
  template: BetSeriesTemplate;
  onSubmit: (seriesData: Partial<BetSeries>) => void;
  onBack: () => void;
  onAddBets: (seriesConfig: any) => void;
  loading: boolean;
}

interface SeriesFormData {
  title: string;
  description: string;
  entryFee: string;
  maxParticipants: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  isPublic: boolean;
  allowLateEntry: boolean;
  
  // Payout structure
  firstPlace: string;
  secondPlace: string;
  thirdPlace: string;
  participationRefund: string;
  
  // Scoring configuration
  pointsPerCorrect: string;
  perfectWeekBonus: string;
  streakBonus: string;
  enableConfidenceScoring: boolean;
  enableWeightedBets: boolean;
  enableDifficultyMultiplier: boolean;
}

const SeriesCreationForm: React.FC<Props> = ({
  template,
  onSubmit,
  onBack,
  onAddBets,
  loading,
}) => {
  const [formData, setFormData] = useState<SeriesFormData>({
    title: '',
    description: '',
    entryFee: '10',
    maxParticipants: '20',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    isPublic: false,
    allowLateEntry: true,
    
    firstPlace: '60',
    secondPlace: '25',
    thirdPlace: '15',
    participationRefund: '0',
    
    pointsPerCorrect: template.defaultScoring.pointsPerCorrect?.toString() || '1',
    perfectWeekBonus: template.defaultScoring.bonusPoints?.perfectWeek?.toString() || '0',
    streakBonus: template.defaultScoring.bonusPoints?.streakBonus?.toString() || '0',
    enableConfidenceScoring: template.features.confidenceScoring,
    enableWeightedBets: template.features.weightedBets,
    enableDifficultyMultiplier: template.defaultScoring.bonusPoints?.difficultyMultiplier || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [betsAdded, setBetsAdded] = useState<SeriesBet[]>([]);

  useEffect(() => {
    // Set default dates
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endDate = new Date(startDate.getTime() + template.defaultDuration * 24 * 60 * 60 * 1000);
    const regDeadline = new Date(startDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before start

    setFormData(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      registrationDeadline: regDeadline.toISOString().slice(0, 16), // Include time
    }));
  }, [template]);

  const updateFormData = (field: keyof SeriesFormData, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Series title is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    const entryFee = parseFloat(formData.entryFee);
    if (isNaN(entryFee) || entryFee < 0) {
      newErrors.entryFee = 'Entry fee must be a valid number';
      isValid = false;
    }

    const maxParticipants = parseInt(formData.maxParticipants);
    if (isNaN(maxParticipants) || maxParticipants < template.minBets) {
      newErrors.maxParticipants = `Must be at least ${template.minBets} participants`;
      isValid = false;
    }

    // Validate payout percentages add up to 100 or less
    const totalPayout = parseFloat(formData.firstPlace) + 
                       parseFloat(formData.secondPlace || '0') + 
                       parseFloat(formData.thirdPlace || '0') +
                       parseFloat(formData.participationRefund || '0');
    
    if (totalPayout > 100) {
      newErrors.firstPlace = 'Total payouts cannot exceed 100%';
      isValid = false;
    }

    if (betsAdded.length < template.minBets) {
      newErrors.bets = `Must add at least ${template.minBets} bets to the series`;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddBets = () => {
    const seriesConfig = {
      template,
      formData,
      betsAdded,
    };
    onAddBets(seriesConfig);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    const seriesData: Partial<BetSeries> = {
      title: formData.title,
      description: formData.description,
      type: template.id,
      bets: betsAdded,
      
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      registrationDeadline: new Date(formData.registrationDeadline),
      
      entryFee: parseFloat(formData.entryFee),
      currency: 'USD',
      maxParticipants: parseInt(formData.maxParticipants),
      minParticipants: template.minBets,
      allowLateEntry: formData.allowLateEntry,
      
      payoutStructure: {
        first: parseFloat(formData.firstPlace),
        second: formData.secondPlace ? parseFloat(formData.secondPlace) : undefined,
        third: formData.thirdPlace ? parseFloat(formData.thirdPlace) : undefined,
        participationRefund: formData.participationRefund ? parseFloat(formData.participationRefund) : undefined,
      },
      
      scoring: {
        method: formData.enableConfidenceScoring ? 'confidence_points' : 
                formData.enableWeightedBets ? 'weighted_scoring' : 'points_per_correct',
        pointsPerCorrect: parseInt(formData.pointsPerCorrect),
        bonusPoints: {
          perfectWeek: parseInt(formData.perfectWeekBonus),
          streakBonus: parseInt(formData.streakBonus),
          difficultyMultiplier: formData.enableDifficultyMultiplier,
        },
        confidenceRange: formData.enableConfidenceScoring ? {min: 1, max: betsAdded.length} : undefined,
      },
      
      isPublic: formData.isPublic,
      status: 'draft',
      participants: [],
      totalPot: 0,
      facilitationFee: 0,
      isPremium: template.isPremium,
      tags: [],
    };

    onSubmit(seriesData);
  };

  const removeBet = (betId: string) => {
    setBetsAdded(prev => prev.filter(bet => bet.id !== betId));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Template Header */}
      <Surface style={styles.headerCard}>
        <View style={styles.templateHeader}>
          <View style={[styles.templateIcon, {backgroundColor: template.color + '20'}]}>
            <Icon name={template.icon} size={32} color={template.color} />
          </View>
          <View style={styles.templateInfo}>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
          </View>
        </View>
      </Surface>

      {/* Basic Information */}
      <Surface style={styles.formCard}>
        <Text style={styles.sectionTitle}>Series Information</Text>
        
        <TextInput
          label="Series Title"
          value={formData.title}
          onChangeText={(value) => updateFormData('title', value)}
          mode="outlined"
          style={styles.input}
          placeholder={`${template.name} - Week 1`}
          error={!!errors.title}
        />
        {errors.title && (
          <HelperText type="error" visible={true}>
            {errors.title}
          </HelperText>
        )}

        <TextInput
          label="Description"
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          mode="outlined"
          style={styles.input}
          placeholder="Describe the series and rules..."
          multiline
          numberOfLines={3}
          error={!!errors.description}
        />
        {errors.description && (
          <HelperText type="error" visible={true}>
            {errors.description}
          </HelperText>
        )}
      </Surface>

      {/* Timing Configuration */}
      <Surface style={styles.formCard}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        
        <TextInput
          label="Start Date"
          value={formData.startDate}
          onChangeText={(value) => updateFormData('startDate', value)}
          mode="outlined"
          style={styles.input}
          placeholder="YYYY-MM-DD"
        />

        <TextInput
          label="End Date (Optional)"
          value={formData.endDate}
          onChangeText={(value) => updateFormData('endDate', value)}
          mode="outlined"
          style={styles.input}
          placeholder="YYYY-MM-DD"
        />

        <TextInput
          label="Registration Deadline"
          value={formData.registrationDeadline}
          onChangeText={(value) => updateFormData('registrationDeadline', value)}
          mode="outlined"
          style={styles.input}
          placeholder="YYYY-MM-DD HH:MM"
        />
      </Surface>

      {/* Entry and Participants */}
      <Surface style={styles.formCard}>
        <Text style={styles.sectionTitle}>Entry & Participants</Text>
        
        <TextInput
          label="Entry Fee ($)"
          value={formData.entryFee}
          onChangeText={(value) => updateFormData('entryFee', value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.entryFee}
        />

        <TextInput
          label="Max Participants"
          value={formData.maxParticipants}
          onChangeText={(value) => updateFormData('maxParticipants', value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.maxParticipants}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Public Series</Text>
          <Switch
            value={formData.isPublic}
            onValueChange={(value) => updateFormData('isPublic', value)}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Allow Late Entry</Text>
          <Switch
            value={formData.allowLateEntry}
            onValueChange={(value) => updateFormData('allowLateEntry', value)}
          />
        </View>
      </Surface>

      {/* Payout Structure */}
      <Surface style={styles.formCard}>
        <Text style={styles.sectionTitle}>Payout Structure (%)</Text>
        
        <View style={styles.payoutRow}>
          <TextInput
            label="1st Place"
            value={formData.firstPlace}
            onChangeText={(value) => updateFormData('firstPlace', value)}
            mode="outlined"
            style={styles.payoutInput}
            keyboardType="numeric"
            error={!!errors.firstPlace}
          />
          <TextInput
            label="2nd Place"
            value={formData.secondPlace}
            onChangeText={(value) => updateFormData('secondPlace', value)}
            mode="outlined"
            style={styles.payoutInput}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.payoutRow}>
          <TextInput
            label="3rd Place"
            value={formData.thirdPlace}
            onChangeText={(value) => updateFormData('thirdPlace', value)}
            mode="outlined"
            style={styles.payoutInput}
            keyboardType="numeric"
          />
          <TextInput
            label="Participation"
            value={formData.participationRefund}
            onChangeText={(value) => updateFormData('participationRefund', value)}
            mode="outlined"
            style={styles.payoutInput}
            keyboardType="numeric"
          />
        </View>

        {errors.firstPlace && (
          <HelperText type="error" visible={true}>
            {errors.firstPlace}
          </HelperText>
        )}
      </Surface>

      {/* Scoring Configuration */}
      <Surface style={styles.formCard}>
        <Text style={styles.sectionTitle}>Scoring System</Text>
        
        <TextInput
          label="Points Per Correct Pick"
          value={formData.pointsPerCorrect}
          onChangeText={(value) => updateFormData('pointsPerCorrect', value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
        />

        <TextInput
          label="Perfect Week Bonus"
          value={formData.perfectWeekBonus}
          onChangeText={(value) => updateFormData('perfectWeekBonus', value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
        />

        <TextInput
          label="Streak Bonus (per game)"
          value={formData.streakBonus}
          onChangeText={(value) => updateFormData('streakBonus', value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
        />

        {template.features.confidenceScoring && (
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Enable Confidence Scoring</Text>
            <Switch
              value={formData.enableConfidenceScoring}
              onValueChange={(value) => updateFormData('enableConfidenceScoring', value)}
            />
          </View>
        )}

        {template.features.weightedBets && (
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Enable Weighted Bets</Text>
            <Switch
              value={formData.enableWeightedBets}
              onValueChange={(value) => updateFormData('enableWeightedBets', value)}
            />
          </View>
        )}

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Difficulty Multiplier</Text>
          <Switch
            value={formData.enableDifficultyMultiplier}
            onValueChange={(value) => updateFormData('enableDifficultyMultiplier', value)}
          />
        </View>
      </Surface>

      {/* Bets in Series */}
      <Surface style={styles.formCard}>
        <View style={styles.betsHeader}>
          <Text style={styles.sectionTitle}>Bets in Series ({betsAdded.length})</Text>
          <Button
            mode="outlined"
            onPress={handleAddBets}
            icon="plus"
            compact>
            Add Bets
          </Button>
        </View>

        {betsAdded.length === 0 ? (
          <View style={styles.noBetsContainer}>
            <Icon name="plus-circle-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.noBetsText}>
              No bets added yet. Click "Add Bets" to start building your series.
            </Text>
            <Text style={styles.noBetsSubtext}>
              Minimum: {template.minBets} bets
            </Text>
          </View>
        ) : (
          <View style={styles.betsList}>
            {betsAdded.map((bet, index) => (
              <View key={bet.id} style={styles.betItem}>
                <View style={styles.betInfo}>
                  <Text style={styles.betTitle}>{bet.title}</Text>
                  <Text style={styles.betTemplate}>
                    {BET_TEMPLATES[bet.template]?.name || bet.template}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeBet(bet.id)}
                  style={styles.removeBetButton}>
                  <Icon name="close" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {errors.bets && (
          <HelperText type="error" visible={true}>
            {errors.bets}
          </HelperText>
        )}
      </Surface>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={onBack}
          style={styles.backButton}
          disabled={loading}>
          Back
        </Button>
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || betsAdded.length < template.minBets}
          style={styles.submitButton}>
          Create Series
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
  },
  headerCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
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
  input: {
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  payoutRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  payoutInput: {
    flex: 1,
  },
  betsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  noBetsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noBetsText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  noBetsSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  betsList: {
    gap: 8,
  },
  betItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  betInfo: {
    flex: 1,
  },
  betTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  betTemplate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  removeBetButton: {
    padding: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  backButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default SeriesCreationForm;
