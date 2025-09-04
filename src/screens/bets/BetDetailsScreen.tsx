import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Avatar,
  Chip,
  Divider,
  Menu,
  IconButton,
  TextInput,
  Modal,
  Portal,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useBets} from '../../contexts/BetContext';
import {useAuth} from '../../contexts/AuthContext';
import EveryoneAgreesResolution from '../../components/EveryoneAgreesResolution';
import {theme} from '../../theme/theme';
import {Bet, BetParticipant, ChatMessage} from '../../types';

type BetDetailsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'BetDetails'>;
type BetDetailsScreenRouteProp = RouteProp<MainStackParamList, 'BetDetails'>;

interface Props {
  navigation: BetDetailsScreenNavigationProp;
  route: BetDetailsScreenRouteProp;
}

const BetDetailsScreen: React.FC<Props> = ({navigation, route}) => {
  const {betId} = route.params;
  const {user} = useAuth();
  const {bets, joinBet, resolveBet, agreeToBetResolution, submitEvidence} = useBets();
  
  const [bet, setBet] = useState<Bet | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [selectedSide, setSelectedSide] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [evidenceModalVisible, setEvidenceModalVisible] = useState(false);
  const [evidenceText, setEvidenceText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const foundBet = bets.find(b => b.id === betId);
    setBet(foundBet || null);
  }, [bets, betId]);

  if (!bet || !user) {
    return (
      <View style={styles.container}>
        <Text>Bet not found</Text>
      </View>
    );
  }

  const userParticipant = bet.participants.find(p => p.userId === user.id);
  const isCreator = bet.createdBy === user.id;
  const canJoin = !userParticipant && bet.status === 'pending';
  const canResolve = (isCreator || bet.neutralParty === user.id) && 
                    bet.status === 'awaiting_resolution' && 
                    bet.resolutionType === 'neutral_party';
  const canAgree = userParticipant && 
                  bet.status === 'awaiting_resolution' && 
                  bet.resolutionType === 'everyone_agrees' && 
                  !userParticipant.hasAgreed;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'awaiting_resolution': return theme.colors.warning;
      case 'resolved': return theme.colors.accent;
      case 'completed': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };

  const handleJoinBet = async () => {
    if (!selectedSide) {
      Alert.alert('Error', 'Please select a side to join');
      return;
    }

    setLoading(true);
    try {
      await joinBet(bet.id, selectedSide);
      setJoinModalVisible(false);
      setSelectedSide('');
      Alert.alert('Success', 'You have joined the bet!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join bet');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveBet = (winningSide: string) => {
    Alert.alert(
      'Resolve Bet',
      `Are you sure you want to declare "${winningSide}" as the winner?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              await resolveBet(bet.id, winningSide);
              Alert.alert('Success', 'Bet has been resolved!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to resolve bet');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleAgreeToBet = async () => {
    setLoading(true);
    try {
      await agreeToBetResolution(bet.id);
      Alert.alert('Success', 'You have agreed to the bet resolution!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to agree to resolution');
    } finally {
      setLoading(false);
    }
  };

  const handleAgreeWithWinner = async (winningSide: string) => {
    setLoading(true);
    try {
      await agreeToBetResolution(bet.id, winningSide);
      Alert.alert('Success', 'You have agreed to the bet resolution!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to agree to resolution');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvidence = async () => {
    if (!evidenceText.trim()) {
      Alert.alert('Error', 'Please enter evidence description');
      return;
    }

    setLoading(true);
    try {
      await submitEvidence(bet.id, {
        type: 'text',
        content: evidenceText.trim(),
        description: evidenceText.trim(),
      });
      setEvidenceModalVisible(false);
      setEvidenceText('');
      Alert.alert('Success', 'Evidence submitted!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit evidence');
    } finally {
      setLoading(false);
    }
  };

  const handleShareBet = async () => {
    try {
      await Share.share({
        message: `Check out this bet: "${bet.title}" - $${bet.amount} on BetBuddies!`,
        title: bet.title,
      });
    } catch (error) {
      console.error('Error sharing bet:', error);
    }
  };

  const availableSides = bet.participants.length > 0 
    ? Array.from(new Set(bet.participants.map(p => p.side)))
    : ['Side A', 'Side B']; // Default sides if no participants yet

  const renderParticipant = (participant: BetParticipant) => (
    <View key={participant.userId} style={styles.participantItem}>
      <Avatar.Text
        size={40}
        label={participant.displayName.charAt(0)}
        style={styles.participantAvatar}
      />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{participant.displayName}</Text>
        <Text style={styles.participantSide}>{participant.side}</Text>
      </View>
      {participant.hasAgreed && (
        <Icon name="check-circle" size={20} color={theme.colors.success} />
      )}
    </View>
  );

  const renderEvidence = (evidence: any, index: number) => (
    <Surface key={index} style={styles.evidenceItem}>
      <View style={styles.evidenceHeader}>
        <Icon name="file-document" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.evidenceSubmitter}>
          Evidence #{index + 1}
        </Text>
        <Text style={styles.evidenceDate}>
          {new Date(evidence.submittedAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.evidenceContent}>{evidence.description}</Text>
    </Surface>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Surface style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Text style={styles.betTitle}>{bet.title}</Text>
            <View style={[styles.statusBadge, {backgroundColor: getStatusColor(bet.status)}]}>
              <Text style={styles.statusText}>{bet.status.replace('_', ' ')}</Text>
            </View>
          </View>
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }>
            <Menu.Item onPress={handleShareBet} title="Share Bet" leadingIcon="share" />
            {canResolve && (
              <Menu.Item 
                onPress={() => setEvidenceModalVisible(true)} 
                title="Submit Evidence" 
                leadingIcon="file-plus" 
              />
            )}
          </Menu>
        </View>

        <Text style={styles.betDescription}>{bet.description}</Text>

        <View style={styles.betAmount}>
          <Text style={styles.amountText}>${bet.amount.toFixed(2)}</Text>
          {bet.facilitationFee > 0 && (
            <Text style={styles.feeText}>
              +${bet.facilitationFee.toFixed(2)} facilitation fee
            </Text>
          )}
        </View>

        <View style={styles.betMeta}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>
              Created {new Date(bet.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Icon 
              name={bet.resolutionType === 'neutral_party' ? 'account-tie' : 'account-group'} 
              size={16} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.metaText}>
              {bet.resolutionType === 'neutral_party' ? 'Neutral party decides' : 'Everyone must agree'}
            </Text>
          </View>
        </View>
      </Surface>

      {/* Action Buttons */}
      {canJoin && (
        <Button
          mode="contained"
          onPress={() => setJoinModalVisible(true)}
          style={styles.actionButton}
          icon="handshake">
          Join Bet
        </Button>
      )}

      {/* Everyone Agrees Resolution */}
      {bet.resolutionType === 'everyone_agrees' && bet.status === 'awaiting_resolution' && userParticipant && (
        <EveryoneAgreesResolution
          bet={bet}
          currentUserId={user.id}
          onAgreeToResolution={handleAgreeWithWinner}
          onSimpleAgree={handleAgreeToBet}
        />
      )}

      {/* Participants */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>
          Participants ({bet.participants.length})
        </Text>
        {bet.participants.map(renderParticipant)}
      </Surface>

      {/* Resolution Actions for Authorized Users */}
      {canResolve && (
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Resolve Bet</Text>
          <Text style={styles.sectionSubtitle}>
            As the {isCreator ? 'creator' : 'neutral party'}, you can declare the winner:
          </Text>
          <View style={styles.resolutionButtons}>
            {availableSides.map(side => (
              <Button
                key={side}
                mode="outlined"
                onPress={() => handleResolveBet(side)}
                style={styles.resolutionButton}>
                {side} Wins
              </Button>
            ))}
          </View>
        </Surface>
      )}

      {/* Evidence */}
      {bet.evidence.length > 0 && (
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence</Text>
          {bet.evidence.map(renderEvidence)}
        </Surface>
      )}

      {/* Join Bet Modal */}
      <Portal>
        <Modal
          visible={joinModalVisible}
          onDismiss={() => setJoinModalVisible(false)}
          contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Join Bet</Text>
          <Text style={styles.modalSubtitle}>Choose which side you want to bet on:</Text>
          
          <View style={styles.sideOptions}>
            {availableSides.map(side => (
              <TouchableOpacity
                key={side}
                style={[
                  styles.sideOption,
                  selectedSide === side && styles.selectedSideOption
                ]}
                onPress={() => setSelectedSide(side)}>
                <Text style={[
                  styles.sideOptionText,
                  selectedSide === side && styles.selectedSideOptionText
                ]}>
                  {side}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setJoinModalVisible(false)}
              style={styles.modalButton}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleJoinBet}
              loading={loading}
              disabled={!selectedSide}
              style={styles.modalButton}>
              Join
            </Button>
          </View>
        </Modal>

        {/* Evidence Modal */}
        <Modal
          visible={evidenceModalVisible}
          onDismiss={() => setEvidenceModalVisible(false)}
          contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Submit Evidence</Text>
          
          <TextInput
            label="Evidence Description"
            value={evidenceText}
            onChangeText={setEvidenceText}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.evidenceInput}
            placeholder="Describe the evidence that supports the bet outcome..."
          />

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setEvidenceModalVisible(false)}
              style={styles.modalButton}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmitEvidence}
              loading={loading}
              disabled={!evidenceText.trim()}
              style={styles.modalButton}>
              Submit
            </Button>
          </View>
        </Modal>
      </Portal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  betTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  betDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  betAmount: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  feeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  betMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  actionButton: {
    marginBottom: 16,
    paddingVertical: 4,
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  participantAvatar: {
    backgroundColor: theme.colors.primary,
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  participantSide: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  resolutionButtons: {
    gap: 8,
  },
  resolutionButton: {
    marginBottom: 8,
  },
  evidenceItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  evidenceSubmitter: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
  evidenceDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  evidenceContent: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  sideOptions: {
    gap: 8,
    marginBottom: 24,
  },
  sideOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  selectedSideOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sideOptionText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedSideOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  evidenceInput: {
    marginBottom: 24,
  },
});

export default BetDetailsScreen;
