import React, {useState} from 'react';
import {Alert} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useAuth} from '../../contexts/AuthContext';
import BetSeriesSelector from '../../components/BetSeriesSelector';
import SeriesCreationForm from '../../components/SeriesCreationForm';
import SeriesBetBuilder from '../../components/SeriesBetBuilder';
import BetTemplateSelector from '../../components/BetTemplateSelector';
import TemplateBetForm from '../../components/TemplateBetForm';
import {BetSeriesTemplate, BetSeries, SeriesBet} from '../../types/betSeries';
import {BetTemplate} from '../../types/betTemplates';

type CreateSeriesScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CreateSeries'>;

interface Props {
  navigation: CreateSeriesScreenNavigationProp;
}

type CreationStep = 'series_select' | 'series_form' | 'bet_builder' | 'single_bet_template' | 'single_bet_form';

const CreateSeriesScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useAuth();

  // Navigation state
  const [currentStep, setCurrentStep] = useState<CreationStep>('series_select');
  const [selectedSeriesTemplate, setSelectedSeriesTemplate] = useState<BetSeriesTemplate | null>(null);
  const [selectedBetTemplate, setSelectedBetTemplate] = useState<BetTemplate | null>(null);
  
  // Form data
  const [seriesConfig, setSeriesConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSeriesSelected = (template: BetSeriesTemplate) => {
    setSelectedSeriesTemplate(template);
    setCurrentStep('series_form');
  };

  const handleSingleBetSelected = () => {
    setCurrentStep('single_bet_template');
  };

  const handleSeriesFormSubmit = (seriesData: Partial<BetSeries>) => {
    // Here you would typically save to your backend
    console.log('Creating series:', seriesData);
    
    Alert.alert(
      'Series Created!',
      `${seriesData.title} has been created successfully. Participants can now join using the invite code.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  const handleAddBets = (config: any) => {
    setSeriesConfig(config);
    setCurrentStep('bet_builder');
  };

  const handleBetsUpdated = (bets: SeriesBet[]) => {
    if (seriesConfig) {
      setSeriesConfig({
        ...seriesConfig,
        betsAdded: bets,
      });
    }
  };

  const handleBackFromBetBuilder = () => {
    setCurrentStep('series_form');
  };

  const handleBetTemplateSelected = (template: BetTemplate) => {
    setSelectedBetTemplate(template);
    setCurrentStep('single_bet_form');
  };

  const handleSingleBetFormSubmit = async (betData: any) => {
    if (!user) return;

    setLoading(true);
    try {
      // Create a single bet (using existing bet creation logic)
      // This would integrate with your existing bet creation system
      console.log('Creating single bet:', betData);
      
      Alert.alert('Success', 'Bet created successfully!');
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create bet');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSeriesSelect = () => {
    setCurrentStep('series_select');
    setSelectedSeriesTemplate(null);
    setSeriesConfig(null);
  };

  const handleBackToSeriesForm = () => {
    setCurrentStep('series_form');
    setSelectedBetTemplate(null);
  };

  const handleBackToSingleBetTemplate = () => {
    setCurrentStep('single_bet_template');
    setSelectedBetTemplate(null);
  };

  // Render series selector
  if (currentStep === 'series_select') {
    return (
      <BetSeriesSelector
        onSeriesSelected={handleSeriesSelected}
        onSingleBetSelected={handleSingleBetSelected}
        onClose={() => navigation.goBack()}
        isPremium={user?.isPremium || false}
      />
    );
  }

  // Render series creation form
  if (currentStep === 'series_form' && selectedSeriesTemplate) {
    return (
      <SeriesCreationForm
        template={selectedSeriesTemplate}
        onSubmit={handleSeriesFormSubmit}
        onBack={handleBackToSeriesSelect}
        onAddBets={handleAddBets}
        loading={loading}
      />
    );
  }

  // Render bet builder for series
  if (currentStep === 'bet_builder' && selectedSeriesTemplate && seriesConfig) {
    return (
      <SeriesBetBuilder
        seriesTemplate={selectedSeriesTemplate}
        existingBets={seriesConfig.betsAdded || []}
        onBetsUpdated={handleBetsUpdated}
        onBack={handleBackFromBetBuilder}
      />
    );
  }

  // Render single bet template selector
  if (currentStep === 'single_bet_template') {
    return (
      <BetTemplateSelector
        onTemplateSelected={handleBetTemplateSelected}
        onCustomFormSelected={() => {
          // Handle custom form for single bet
          navigation.navigate('CreateBet');
        }}
        onClose={handleBackToSeriesSelect}
        isPremium={user?.isPremium || false}
      />
    );
  }

  // Render single bet form
  if (currentStep === 'single_bet_form' && selectedBetTemplate) {
    return (
      <TemplateBetForm
        template={selectedBetTemplate}
        onSubmit={handleSingleBetFormSubmit}
        onBack={handleBackToSingleBetTemplate}
        loading={loading}
      />
    );
  }

  // Fallback
  return null;
};

export default CreateSeriesScreen;
