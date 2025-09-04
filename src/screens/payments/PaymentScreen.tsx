import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Avatar,
  Divider,
  TextInput,
  Chip,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useBets} from '../../contexts/BetContext';
import {useAuth} from '../../contexts/AuthContext';
import VenmoService from '../../services/VenmoService';
import {theme} from '../../theme/theme';
import {PaymentRequest, Bet} from '../../types';

type PaymentScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Payment'>;
type PaymentScreenRouteProp = RouteProp<MainStackParamList, 'Payment'>;

interface Props {
  navigation: PaymentScreenNavigationProp;
  route: PaymentScreenRouteProp;
}

const PaymentScreen: React.FC<Props> = ({navigation, route}) => {
  const {requestId} = route.params;
  const {user} = useAuth();
  const {paymentRequests, bets, markPaymentCompleted} = useBets();
  
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [bet, setBet] = useState<Bet | null>(null);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [venmoAvailable, setVenmoAvailable] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const foundRequest = paymentRequests.find(req => req.id === requestId);
    setPaymentRequest(foundRequest || null);
    
    if (foundRequest?.betId) {
      const foundBet = bets.find(b => b.id === foundRequest.betId);
      setBet(foundBet || null);
    }
  }, [paymentRequests, bets, requestId]);

  useEffect(() => {
    checkVenmoAvailability();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const checkVenmoAvailability = async () => {
    const available = await VenmoService.isVenmoAvailable();
    setVenmoAvailable(available);
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // User returned to app - ask if they completed payment
      if (loading) {
        handlePaymentReturn();
      }
    }
    setAppState(nextAppState);
  };

  const handlePaymentReturn = () => {
    Alert.alert(
      'Payment Status',
      'Did you complete the payment in Venmo?',
      [
        {
          text: 'No, I\'ll try again',
          style: 'cancel',
          onPress: () => setLoading(false)
        },
        {
          text: 'Yes, I completed it',
          onPress: handlePaymentCompleted
        }
      ]
    );
  };

  const handlePaymentCompleted = async () => {
    if (!paymentRequest) return;

    try {
      await markPaymentCompleted(paymentRequest.id);
      Alert.alert(
        'Payment Confirmed',
        'Thank you! Your payment has been recorded.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithVenmo = async () => {
    if (!paymentRequest || !bet) return;

    const username = recipientUsername || getRecipientVenmoUsername();
    
    if (!username) {
      Alert.alert('Error', 'Recipient Venmo username not found. Please enter it manually.');
      return;
    }

    if (!VenmoService.isValidVenmoUsername(username)) {
      Alert.alert('Error', 'Please enter a valid Venmo username (5-30 characters, letters, numbers, hyphens, and underscores only).');
      return;
    }

    const paymentData = VenmoService.createBetPaymentRequest(
      username,
      paymentRequest.amount,
      bet.title,
      user?.displayName || 'BetBuddies User'
    );

    VenmoService.showPaymentConfirmation(
      username,
      paymentRequest.amount,
      bet.title,
      async () => {
        setLoading(true);
        const success = await VenmoService.openVenmoPayment(paymentData);
        
        if (!success) {
          setLoading(false);
          Alert.alert(
            'Cannot Open Venmo',
            'Unable to open Venmo. Please make sure the app is installed or use the web version.',
            [
              {
                text: 'Download Venmo',
                onPress: () => VenmoService.getVenmoDownloadUrl()
              },
              {text: 'OK'}
            ]
          );
        }
        // Loading state will be cleared when user returns to app
      },
      () => setLoading(false)
    );
  };

  const getRecipientVenmoUsername = (): string => {
    if (!paymentRequest) return '';
    
    // In a real app, you'd fetch the recipient's Venmo username from their profile
    // For now, we'll use a placeholder or require manual entry
    return ''; // This would come from the recipient's user profile
  };

  const getRecipientName = (): string => {
    if (!paymentRequest || !bet) return 'Unknown';
    
    // Find the winner's name from bet participants
    const winner = bet.participants.find(p => p.side === bet.winner);
    return winner?.displayName || 'Winner';
  };

  if (!paymentRequest || !bet || !user) {
    return (
      <View style={styles.container}>
        <Text>Payment request not found</Text>
      </View>
    );
  }

  const recipientName = getRecipientName();
  const facilitationFee = bet.facilitationFee || 0;
  const totalAmount = paymentRequest.amount + facilitationFee;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Payment Header */}
      <Surface style={styles.headerCard}>
        <View style={styles.paymentHeader}>
          <Icon name="cash" size={48} color={theme.colors.primary} />
          <Text style={styles.paymentTitle}>Payment Required</Text>
          <Text style={styles.paymentSubtitle}>
            You lost the bet and need to pay the winner
          </Text>
        </View>
      </Surface>

      {/* Bet Details */}
      <Surface style={styles.betCard}>
        <Text style={styles.sectionTitle}>Bet Details</Text>
        
        <View style={styles.betInfo}>
          <Text style={styles.betTitle}>{bet.title}</Text>
          <Text style={styles.betDescription}>{bet.description}</Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.resultInfo}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Winner:</Text>
            <Chip mode="outlined" style={styles.winnerChip}>
              {bet.winner}
            </Chip>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Your side:</Text>
            <Text style={styles.resultValue}>
              {bet.participants.find(p => p.userId === user.id)?.side || 'Unknown'}
            </Text>
          </View>
        </View>
      </Surface>

      {/* Payment Details */}
      <Surface style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        
        <View style={styles.recipientInfo}>
          <Avatar.Text
            size={50}
            label={recipientName.charAt(0)}
            style={styles.recipientAvatar}
          />
          <View style={styles.recipientDetails}>
            <Text style={styles.recipientName}>{recipientName}</Text>
            <Text style={styles.recipientLabel}>Bet Winner</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.amountBreakdown}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Bet Amount:</Text>
            <Text style={styles.amountValue}>${paymentRequest.amount.toFixed(2)}</Text>
          </View>
          
          {facilitationFee > 0 && (
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Facilitation Fee:</Text>
              <Text style={styles.amountValue}>${facilitationFee.toFixed(2)}</Text>
            </View>
          )}
          
          <Divider style={styles.divider} />
          
          <View style={styles.amountRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Venmo Username Input */}
        <TextInput
          label="Recipient's Venmo Username"
          value={recipientUsername}
          onChangeText={setRecipientUsername}
          mode="outlined"
          style={styles.usernameInput}
          placeholder="@username"
          left={<TextInput.Icon icon="at" />}
          helper="Enter the winner's Venmo username to send payment"
        />
      </Surface>

      {/* Payment Methods */}
      <Surface style={styles.methodsCard}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        {venmoAvailable ? (
          <Button
            mode="contained"
            onPress={handlePayWithVenmo}
            loading={loading}
            disabled={loading || !recipientUsername.trim()}
            style={styles.venmoButton}
            icon="cash"
            labelStyle={styles.venmoButtonLabel}>
            Pay with Venmo
          </Button>
        ) : (
          <View style={styles.noVenmoContainer}>
            <Icon name="alert-circle" size={24} color={theme.colors.warning} />
            <Text style={styles.noVenmoText}>
              Venmo app not found. Please install Venmo to make payments.
            </Text>
            <Button
              mode="outlined"
              onPress={() => VenmoService.getVenmoDownloadUrl()}
              style={styles.downloadButton}>
              Download Venmo
            </Button>
          </View>
        )}

        <Text style={styles.paymentNote}>
          After completing the payment in Venmo, return to this app to confirm.
        </Text>
      </Surface>

      {/* Manual Confirmation */}
      <Surface style={styles.manualCard}>
        <Text style={styles.sectionTitle}>Already Paid?</Text>
        <Text style={styles.manualText}>
          If you've already sent the payment outside of this app, you can mark it as completed.
        </Text>
        
        <Button
          mode="outlined"
          onPress={handlePaymentCompleted}
          style={styles.manualButton}
          icon="check">
          Mark as Paid
        </Button>
      </Surface>
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
    padding: 24,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  paymentHeader: {
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  paymentSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  betCard: {
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
  betInfo: {
    marginBottom: 16,
  },
  betTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  betDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    marginVertical: 16,
  },
  resultInfo: {
    gap: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  winnerChip: {
    backgroundColor: theme.colors.success,
  },
  paymentCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipientAvatar: {
    backgroundColor: theme.colors.primary,
  },
  recipientDetails: {
    marginLeft: 16,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  recipientLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  amountBreakdown: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  amountValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  usernameInput: {
    marginTop: 8,
  },
  methodsCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  venmoButton: {
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: '#3D95CE', // Venmo blue
  },
  venmoButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  noVenmoContainer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  noVenmoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: 12,
  },
  downloadButton: {
    marginTop: 8,
  },
  paymentNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  manualCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  manualText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  manualButton: {
    alignSelf: 'flex-start',
  },
});

export default PaymentScreen;
