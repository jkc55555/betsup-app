import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  RadioButton,
  Switch,
  Chip,
  Avatar,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useBets} from '../../contexts/BetContext';
import {useAuth} from '../../contexts/AuthContext';
import FacebookFriendsPicker from '../../components/FacebookFriendsPicker';
import FacebookFriendsService, {FacebookFriend} from '../../services/FacebookFriendsService';
import NeutralPartyPicker, {NeutralPartyCandidate} from '../../components/NeutralPartyPicker';
import BetTemplateSelector from '../../components/BetTemplateSelector';
import TemplateBetForm from '../../components/TemplateBetForm';
import FeatureGateModal, {BetTypeGateModal, LimitGateModal} from '../../components/FeatureGateModal';
import {BetTemplate} from '../../types/betTemplates';
import {UserTier, FeatureGate} from '../../types/subscription';
import {theme} from '../../theme/theme';
import {Bet} from '../../types';

type CreateBetScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CreateBet'>;

interface Props {
  navigation: CreateBetScreenNavigationProp;
}

const CreateBetScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useAuth();
  const {createBet, calculateFacilitationFee} = useBets();

  // Template flow state
  const [currentStep, setCurrentStep] = useState<'template' | 'form' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<BetTemplate | null>(null);

  // Original form data for custom bets
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    resolutionType: 'neutral_party' as 'neutral_party' | 'everyone_agrees',
    sides: ['', ''], // Two sides by default
  });

  const [invitedFriends, setInvitedFriends] = useState<FacebookFriend[]>([]);
  const [showFriendsPicker, setShowFriendsPicker] = useState(false);
  const [neutralParty, setNeutralParty] = useState<NeutralPartyCandidate | null>(null);
  const [showNeutralPartyPicker, setShowNeutralPartyPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendFacebookInvites, setSendFacebookInvites] = useState(false);

  // Feature gate state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalInfo, setUpgradeModalInfo] = useState<{
    requiredTier: UserTier;
    featureName: string;
    type: 'bet_type' | 'limit';
  } | null>(null);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const updateSide = (index: number, value: string) => {
    const newSides = [...formData.sides];
    newSides[index] = value;
    updateFormData('sides', newSides);
  };

  const addSide = () => {
    if (formData.sides.length < 5) { // Max 5 sides
      updateFormData('sides', [...formData.sides, '']);
    }
  };

  const removeSide = (index: number) => {
    if (formData.sides.length > 2) { // Min 2 sides
      const newSides = formData.sides.filter((_, i) => i !== index);
      updateFormData('sides', newSides);
    }
  };

  const handleFriendsSelected = (friends: FacebookFriend[]) => {
    setInvitedFriends(friends);
    setShowFriendsPicker(false);
  };

  const removeFriend = (friendId: string) => {
    setInvitedFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const handleNeutralPartySelected = (party: NeutralPartyCandidate | null) => {
    setNeutralParty(party);
    setShowNeutralPartyPicker(false);
  };

  const handleTemplateSelected = (template: BetTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('form');
  };

  const handleTemplateFormSubmit = async (templateBetData: any) => {
    if (!user) return;

    setLoading(true);
    try {
      const amount = parseFloat(templateBetData.amount || '10'); // Default amount if not specified
      const sides = templateBetData.sides.length > 0 ? templateBetData.sides : ['Side A', 'Side B'];

      const betData: Omit<Bet, 'id' | 'createdAt' | 'updatedAt'> = {
        title: templateBetData.title,
        description: templateBetData.description,
        amount,
        currency: 'USD',
        createdBy: user.id,
        participants: [{
          userId: user.id,
          displayName: user.displayName,
          photoURL: user.photoURL,
          side: sides[0], // Creator joins first side by default
        }],
        neutralParty: neutralParty?.id,
        status: 'pending',
        resolutionType: templateBetData.resolutionType,
        facilitationFee: calculateFacilitationFee(amount),
        chatMessages: [],
        evidence: [],
      };

      const betId = await createBet(betData);

      // Send Facebook invitations if requested
      if (sendFacebookInvites && invitedFriends.length > 0) {
        try {
          const message = `${user.displayName} invited you to join a bet: "${templateBetData.title}"`;
          const inviteData = {
            betId,
            betTitle: templateBetData.title,
            amount,
            inviterName: user.displayName,
          };

          await FacebookFriendsService.sendAppRequest(
            invitedFriends.map(f => f.id),
            message,
            inviteData
          );

          Alert.alert(
            'Success',
            `Bet created and invitations sent to ${invitedFriends.length} Facebook friends!`
          );
        } catch (error) {
          Alert.alert(
            'Bet Created',
            'Bet created successfully, but there was an error sending Facebook invitations.'
          );
        }
      } else {
        Alert.alert('Success', 'Bet created successfully!');
      }

      navigation.navigate('BetDetails', {betId});
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create bet');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTemplates = () => {
    setCurrentStep('template');
    setSelectedTemplate(null);
  };

  const handleUseCustomForm = () => {
    // Check if user can create more bets
    if (!FeatureGate.canCreateBet(user?.tier || 'free', user?.currentUsage?.activeBets || 0)) {
      setUpgradeModalInfo({
        requiredTier: FeatureGate.getNextTier(user?.tier || 'free') || 'standard',
        featureName: 'Create More Bets',
        type: 'limit'
      });
      setShowUpgradeModal(true);
      return;
    }
    
    setCurrentStep('custom');
  };

  const handleUpgradeRequired = (requiredTier: UserTier, templateName: string) => {
    setUpgradeModalInfo({
      requiredTier,
      featureName: templateName,
      type: 'bet_type'
    });
    setShowUpgradeModal(true);
  };

  const handleUpgrade = (tier: UserTier) => {
    setShowUpgradeModal(false);
    // Navigate to subscription screen
    navigation.navigate('Subscription');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a bet title');
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a bet description');
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid bet amount');
      return false;
    }

    const validSides = formData.sides.filter(side => side.trim());
    if (validSides.length < 2) {
      Alert.alert('Error', 'Please enter at least 2 bet sides');
      return false;
    }

    if (formData.resolutionType === 'neutral_party' && !neutralParty) {
      Alert.alert('Error', 'Please select a neutral party to decide the winner');
      return false;
    }

    return true;
  };

  const handleCreateBet = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      const amount = parseFloat(formData.amount);
      const validSides = formData.sides.filter(side => side.trim());

      const betData: Omit<Bet, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount,
        currency: 'USD',
        createdBy: user.id,
        participants: [{
          userId: user.id,
          displayName: user.displayName,
          photoURL: user.photoURL,
          side: validSides[0], // Creator joins first side by default
        }],
        neutralParty: neutralParty?.id,
        status: 'pending',
        resolutionType: formData.resolutionType,
        facilitationFee: calculateFacilitationFee(amount),
        chatMessages: [],
        evidence: [],
      };

      const betId = await createBet(betData);

      // Send Facebook invitations if requested
      if (sendFacebookInvites && invitedFriends.length > 0) {
        try {
          const message = `${user.displayName} invited you to join a bet: "${formData.title}"`;
          const inviteData = {
            betId,
            betTitle: formData.title,
            amount,
            inviterName: user.displayName,
          };

          await FacebookFriendsService.sendAppRequest(
            invitedFriends.map(f => f.id),
            message,
            inviteData
          );

          Alert.alert(
            'Success',
            `Bet created and invitations sent to ${invitedFriends.length} Facebook friends!`
          );
        } catch (error) {
          Alert.alert(
            'Bet Created',
            'Bet created successfully, but there was an error sending Facebook invitations.'
          );
        }
      } else {
        Alert.alert('Success', 'Bet created successfully!');
      }

      navigation.navigate('BetDetails', {betId});
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create bet');
    } finally {
      setLoading(false);
    }
  };

  const facilitationFee = calculateFacilitationFee(parseFloat(formData.amount) || 0);

  // Render template selector
  if (currentStep === 'template') {
    return (
      <>
        <BetTemplateSelector
          onTemplateSelected={handleTemplateSelected}
          onCustomFormSelected={handleUseCustomForm}
          onClose={() => navigation.goBack()}
          onUpgradeRequired={handleUpgradeRequired}
          userTier={user?.tier || 'free'}
        />
        
        {/* Feature Gate Modal */}
        {upgradeModalInfo && (
          <>
            {upgradeModalInfo.type === 'bet_type' && (
              <BetTypeGateModal
                visible={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onUpgrade={handleUpgrade}
                currentTier={user?.tier || 'free'}
                betType={upgradeModalInfo.featureName}
                betTypeName={upgradeModalInfo.featureName}
              />
            )}
            
            {upgradeModalInfo.type === 'limit' && (
              <LimitGateModal
                visible={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onUpgrade={handleUpgrade}
                currentTier={user?.tier || 'free'}
                limitType="bets"
                currentCount={user?.currentUsage?.activeBets || 0}
                limit={1} // Free tier limit
              />
            )}
          </>
        )}
      </>
    );
  }

  // Render template form
  if (currentStep === 'form' && selectedTemplate) {
    return (
      <TemplateBetForm
        template={selectedTemplate}
        onSubmit={handleTemplateFormSubmit}
        onBack={handleBackToTemplates}
        loading={loading}
      />
    );
  }

  // Render custom form (original)
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Custom Form Header */}
      <Surface style={styles.card}>
        <View style={styles.customFormHeader}>
          <Button
            mode="text"
            onPress={handleBackToTemplates}
            icon="arrow-left"
            compact>
            Back to Templates
          </Button>
          <Text style={styles.customFormTitle}>Custom Bet</Text>
        </View>
      </Surface>

      <Surface style={styles.card}>
        <Text style={styles.sectionTitle}>Bet Details</Text>

        <TextInput
          label="Bet Title"
          value={formData.title}
          onChangeText={(value) => updateFormData('title', value)}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Who will win the Super Bowl?"
        />

        <TextInput
          label="Description"
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          placeholder="Provide details about the bet conditions..."
        />

        <TextInput
          label="Bet Amount ($)"
          value={formData.amount}
          onChangeText={(value) => updateFormData('amount', value)}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          placeholder="0.00"
        />

        {facilitationFee > 0 && (
          <Text style={styles.feeText}>
            Facilitation fee: ${facilitationFee.toFixed(2)}
          </Text>
        )}
      </Surface>

      <Surface style={styles.card}>
        <Text style={styles.sectionTitle}>Bet Sides</Text>
        
        {formData.sides.map((side, index) => (
          <View key={index} style={styles.sideContainer}>
            <TextInput
              label={`Side ${index + 1}`}
              value={side}
              onChangeText={(value) => updateSide(index, value)}
              mode="outlined"
              style={styles.sideInput}
              placeholder={`e.g., ${index === 0 ? 'Team A' : 'Team B'}`}
            />
            {formData.sides.length > 2 && (
              <Button
                mode="text"
                onPress={() => removeSide(index)}
                style={styles.removeSideButton}>
                <Icon name="close" size={16} />
              </Button>
            )}
          </View>
        ))}

        {formData.sides.length < 5 && (
          <Button
            mode="outlined"
            onPress={addSide}
            style={styles.addSideButton}
            icon="plus">
            Add Another Side
          </Button>
        )}
      </Surface>

      <Surface style={styles.card}>
        <Text style={styles.sectionTitle}>Resolution Method</Text>
        
        <RadioButton.Group
          onValueChange={(value) => updateFormData('resolutionType', value)}
          value={formData.resolutionType}>
          <View style={styles.radioOption}>
            <RadioButton value="neutral_party" />
            <View style={styles.radioContent}>
              <Text style={styles.radioTitle}>Neutral Party</Text>
              <Text style={styles.radioSubtitle}>
                Appoint someone to decide the winner
              </Text>
            </View>
          </View>

          {formData.resolutionType === 'neutral_party' && (
            <View style={styles.neutralPartySection}>
              {neutralParty ? (
                <Surface style={styles.selectedPartyCard}>
                  <Avatar.Text
                    size={40}
                    label={neutralParty.displayName.charAt(0)}
                    style={styles.partyAvatar}
                  />
                  <View style={styles.partyInfo}>
                    <Text style={styles.partyName}>{neutralParty.displayName}</Text>
                    <Text style={styles.partyRole}>Neutral Party</Text>
                  </View>
                  <Button
                    mode="text"
                    onPress={() => setNeutralParty(null)}
                    compact>
                    Change
                  </Button>
                </Surface>
              ) : (
                <Button
                  mode="outlined"
                  onPress={() => setShowNeutralPartyPicker(true)}
                  style={styles.selectPartyButton}
                  icon="account-tie">
                  Select Neutral Party
                </Button>
              )}
            </View>
          )}
          
          <View style={styles.radioOption}>
            <RadioButton value="everyone_agrees" />
            <View style={styles.radioContent}>
              <Text style={styles.radioTitle}>Everyone Agrees</Text>
              <Text style={styles.radioSubtitle}>
                All participants must agree on the outcome
              </Text>
            </View>
          </View>
        </RadioButton.Group>
      </Surface>

      <Surface style={styles.card}>
        <Text style={styles.sectionTitle}>Invite Friends</Text>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Send Facebook invitations</Text>
          <Switch
            value={sendFacebookInvites}
            onValueChange={setSendFacebookInvites}
          />
        </View>

        {sendFacebookInvites && (
          <>
            <Button
              mode="outlined"
              onPress={() => setShowFriendsPicker(true)}
              style={styles.inviteFriendsButton}
              icon="facebook">
              Select Facebook Friends
            </Button>

            {invitedFriends.length > 0 && (
              <View style={styles.selectedFriends}>
                <Text style={styles.selectedFriendsTitle}>
                  Selected Friends ({invitedFriends.length})
                </Text>
                <View style={styles.friendChips}>
                  {invitedFriends.map(friend => (
                    <Chip
                      key={friend.id}
                      onClose={() => removeFriend(friend.id)}
                      style={styles.friendChip}>
                      {friend.name}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </Surface>

      <Button
        mode="contained"
        onPress={handleCreateBet}
        loading={loading}
        disabled={loading}
        style={styles.createButton}
        labelStyle={styles.createButtonLabel}>
        Create Bet
      </Button>

      <Modal
        visible={showFriendsPicker}
        animationType="slide"
        presentationStyle="pageSheet">
        <FacebookFriendsPicker
          onFriendsSelected={handleFriendsSelected}
          onClose={() => setShowFriendsPicker(false)}
          selectedFriends={invitedFriends}
        />
      </Modal>

      <Modal
        visible={showNeutralPartyPicker}
        animationType="slide"
        presentationStyle="pageSheet">
        <NeutralPartyPicker
          onPartySelected={handleNeutralPartySelected}
          onClose={() => setShowNeutralPartyPicker(false)}
          selectedParty={neutralParty}
          excludeUserIds={[user?.id || '']}
        />
      </Modal>
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
  card: {
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
    marginBottom: 16,
  },
  feeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  sideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sideInput: {
    flex: 1,
  },
  removeSideButton: {
    marginLeft: 8,
  },
  addSideButton: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioContent: {
    marginLeft: 8,
    flex: 1,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  radioSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  inviteFriendsButton: {
    marginBottom: 16,
  },
  selectedFriends: {
    marginTop: 8,
  },
  selectedFriendsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  friendChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  friendChip: {
    marginBottom: 4,
  },
  createButton: {
    paddingVertical: 8,
    marginTop: 16,
  },
  createButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  neutralPartySection: {
    marginTop: 16,
    marginLeft: 32, // Align with radio button content
  },
  selectedPartyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  partyAvatar: {
    backgroundColor: theme.colors.primary,
  },
  partyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  partyName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  partyRole: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  selectPartyButton: {
    alignSelf: 'flex-start',
  },
  customFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

export default CreateBetScreen;
