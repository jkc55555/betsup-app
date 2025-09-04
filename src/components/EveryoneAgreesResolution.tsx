import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  RadioButton,
  Avatar,
  Chip,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme/theme';
import {Bet, BetParticipant} from '../types';

interface Props {
  bet: Bet;
  currentUserId: string;
  onAgreeToResolution: (winningSide: string) => Promise<void>;
  onSimpleAgree: () => Promise<void>;
}

const EveryoneAgreesResolution: React.FC<Props> = ({
  bet,
  currentUserId,
  onAgreeToResolution,
  onSimpleAgree,
}) => {
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const currentUser = bet.participants.find(p => p.userId === currentUserId);
  const hasUserAgreed = currentUser?.hasAgreed || false;
  const agreedParticipants = bet.participants.filter(p => p.hasAgreed);
  const pendingParticipants = bet.participants.filter(p => !p.hasAgreed);
  const allAgreed = bet.participants.every(p => p.hasAgreed);
  
  // Get unique sides from participants
  const availableSides = Array.from(new Set(bet.participants.map(p => p.side)));

  const handleAgreeWithWinner = async () => {
    if (!selectedWinner) {
      Alert.alert('Error', 'Please select the winning side');
      return;
    }

    setLoading(true);
    try {
      await onAgreeToResolution(selectedWinner);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to agree to resolution');
    } finally {
      setLoading(false);
    }
  };

  const handleSimpleAgree = async () => {
    setLoading(true);
    try {
      await onSimpleAgree();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to agree');
    } finally {
      setLoading(false);
    }
  };

  const renderParticipantStatus = (participant: BetParticipant) => (
    <View key={participant.userId} style={styles.participantItem}>
      <Avatar.Text
        size={32}
        label={participant.displayName.charAt(0)}
        style={styles.participantAvatar}
      />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{participant.displayName}</Text>
        <Text style={styles.participantSide}>{participant.side}</Text>
      </View>
      <View style={styles.statusContainer}>
        {participant.hasAgreed ? (
          <Chip mode="flat" style={styles.agreedChip} textStyle={styles.agreedChipText}>
            <Icon name="check" size={12} color={theme.colors.success} />
            {' '}Agreed
          </Chip>
        ) : (
          <Chip mode="outlined" style={styles.pendingChip}>
            Pending
          </Chip>
        )}
      </View>
    </View>
  );

  if (hasUserAgreed) {
    return (
      <Surface style={styles.container}>
        <View style={styles.header}>
          <Icon name="check-circle" size={32} color={theme.colors.success} />
          <Text style={styles.title}>You've Agreed</Text>
        </View>
        
        <Text style={styles.subtitle}>
          Waiting for all participants to agree on the outcome.
        </Text>

        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>
            Agreement Progress ({agreedParticipants.length}/{bet.participants.length})
          </Text>
          
          <View style={styles.participantsList}>
            {bet.participants.map(renderParticipantStatus)}
          </View>
        </View>

        {allAgreed && (
          <View style={styles.allAgreedSection}>
            <Icon name="party-popper" size={24} color={theme.colors.accent} />
            <Text style={styles.allAgreedText}>
              Everyone has agreed! The bet will be resolved automatically.
            </Text>
          </View>
        )}
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Icon name="account-group" size={32} color={theme.colors.primary} />
        <Text style={styles.title}>Everyone Must Agree</Text>
      </View>
      
      <Text style={styles.subtitle}>
        All participants need to agree on who won this bet. Select the winning side and confirm your agreement.
      </Text>

      <View style={styles.winnerSelection}>
        <Text style={styles.selectionTitle}>Who won the bet?</Text>
        
        <RadioButton.Group
          onValueChange={setSelectedWinner}
          value={selectedWinner}>
          {availableSides.map(side => (
            <View key={side} style={styles.sideOption}>
              <RadioButton value={side} />
              <Text style={styles.sideText}>{side}</Text>
            </View>
          ))}
        </RadioButton.Group>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>
          Current Status ({agreedParticipants.length}/{bet.participants.length} agreed)
        </Text>
        
        <View style={styles.participantsList}>
          {bet.participants.map(renderParticipantStatus)}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleAgreeWithWinner}
          loading={loading}
          disabled={!selectedWinner || loading}
          style={styles.agreeButton}
          icon="check">
          Agree to Resolution
        </Button>

        <Text style={styles.noteText}>
          Once you agree, you cannot change your decision. Make sure you're confident about the outcome.
        </Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  winnerSelection: {
    marginBottom: 20,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  sideOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sideText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
  },
  divider: {
    marginVertical: 16,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  participantsList: {
    gap: 8,
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
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  participantSide: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  agreedChip: {
    backgroundColor: theme.colors.success + '20',
    height: 24,
  },
  agreedChipText: {
    fontSize: 10,
    color: theme.colors.success,
  },
  pendingChip: {
    height: 24,
    borderColor: theme.colors.textSecondary,
  },
  allAgreedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.accent + '20',
    borderRadius: 8,
    marginTop: 16,
  },
  allAgreedText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    alignItems: 'center',
  },
  agreeButton: {
    paddingVertical: 4,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default EveryoneAgreesResolution;
