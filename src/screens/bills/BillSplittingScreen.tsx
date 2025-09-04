import React, {useState} from 'react';
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
  TextInput,
  Button,
  Avatar,
  Chip,
  IconButton,
  Switch,
  Divider,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useAuth} from '../../contexts/AuthContext';
import VenmoService from '../../services/VenmoService';
import {theme} from '../../theme/theme';

type BillSplittingScreenNavigationProp = StackNavigationProp<MainStackParamList, 'MainTabs'>;

interface Props {
  navigation: BillSplittingScreenNavigationProp;
}

interface BillItem {
  id: string;
  description: string;
  amount: number;
  sharedBy: string[]; // User IDs who share this item
}

interface Participant {
  id: string;
  name: string;
  email?: string;
  venmoUsername?: string;
}

const BillSplittingScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useAuth();
  
  const [billTitle, setBillTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [tip, setTip] = useState('');
  const [tax, setTax] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: user?.id || '1',
      name: user?.displayName || 'You',
      email: user?.email,
      venmoUsername: user?.venmoUsername,
    }
  ]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [splitEvenly, setSplitEvenly] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!user?.isPremium) {
    return (
      <View style={styles.container}>
        <Surface style={styles.upgradeCard}>
          <Icon name="receipt-text" size={64} color={theme.colors.accent} />
          <Text style={styles.upgradeTitle}>Premium Feature</Text>
          <Text style={styles.upgradeSubtitle}>
            Bill splitting is available with BetBuddies Premium. Split restaurant bills, group expenses, and more with ease.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Subscription')}
            style={styles.upgradeButton}
            icon="crown">
            Upgrade to Premium
          </Button>
        </Surface>
      </View>
    );
  }

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: `Person ${participants.length}`,
    };
    setParticipants([...participants, newParticipant]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length <= 2) {
      Alert.alert('Error', 'You need at least 2 people to split a bill');
      return;
    }
    setParticipants(participants.filter(p => p.id !== id));
    // Remove participant from all bill items
    setBillItems(items => items.map(item => ({
      ...item,
      sharedBy: item.sharedBy.filter(userId => userId !== id)
    })));
  };

  const updateParticipant = (id: string, field: keyof Participant, value: string) => {
    setParticipants(participants.map(p => 
      p.id === id ? {...p, [field]: value} : p
    ));
  };

  const addBillItem = () => {
    if (!newItemDescription.trim() || !newItemAmount.trim()) {
      Alert.alert('Error', 'Please enter item description and amount');
      return;
    }

    const amount = parseFloat(newItemAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newItem: BillItem = {
      id: Date.now().toString(),
      description: newItemDescription.trim(),
      amount,
      sharedBy: splitEvenly ? participants.map(p => p.id) : [user?.id || ''],
    };

    setBillItems([...billItems, newItem]);
    setNewItemDescription('');
    setNewItemAmount('');
  };

  const removeBillItem = (id: string) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const toggleItemParticipant = (itemId: string, participantId: string) => {
    setBillItems(items => items.map(item => {
      if (item.id === itemId) {
        const isShared = item.sharedBy.includes(participantId);
        return {
          ...item,
          sharedBy: isShared 
            ? item.sharedBy.filter(id => id !== participantId)
            : [...item.sharedBy, participantId]
        };
      }
      return item;
    }));
  };

  const calculateSplit = () => {
    const subtotal = billItems.reduce((sum, item) => sum + item.amount, 0);
    const tipAmount = parseFloat(tip) || 0;
    const taxAmount = parseFloat(tax) || 0;
    const total = subtotal + tipAmount + taxAmount;

    const splits: Record<string, number> = {};
    
    // Initialize splits
    participants.forEach(p => {
      splits[p.id] = 0;
    });

    // Calculate item splits
    billItems.forEach(item => {
      const shareCount = item.sharedBy.length;
      if (shareCount > 0) {
        const perPersonAmount = item.amount / shareCount;
        item.sharedBy.forEach(userId => {
          splits[userId] += perPersonAmount;
        });
      }
    });

    // Add proportional tip and tax
    if (subtotal > 0) {
      participants.forEach(p => {
        const proportion = splits[p.id] / subtotal;
        splits[p.id] += (tipAmount + taxAmount) * proportion;
      });
    }

    return { splits, subtotal, total };
  };

  const handleSendPaymentRequests = async () => {
    if (!billTitle.trim()) {
      Alert.alert('Error', 'Please enter a bill title');
      return;
    }

    if (billItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item to the bill');
      return;
    }

    const { splits } = calculateSplit();
    const payerSplit = splits[user?.id || ''];
    
    setLoading(true);
    try {
      // In a real app, you'd create payment requests in your backend
      // For demo, we'll show Venmo payment links
      
      const otherParticipants = participants.filter(p => p.id !== user?.id);
      
      for (const participant of otherParticipants) {
        const amountOwed = splits[participant.id];
        
        if (amountOwed > 0 && participant.venmoUsername) {
          const paymentRequest = VenmoService.createBetPaymentRequest(
            participant.venmoUsername,
            amountOwed,
            `${billTitle} - Bill Split`,
            user?.displayName || 'BetBuddies User'
          );
          
          // In a real app, you'd save this payment request and send notifications
          console.log('Payment request created for:', participant.name, amountOwed);
        }
      }
      
      Alert.alert(
        'Bill Split Complete!',
        `Payment requests have been created. Each person owes:\n\n${otherParticipants.map(p => 
          `${p.name}: $${splits[p.id].toFixed(2)}`
        ).join('\n')}\n\nYour share: $${payerSplit.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create payment requests');
    } finally {
      setLoading(false);
    }
  };

  const { splits, subtotal, total } = calculateSplit();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bill Header */}
      <Surface style={styles.card}>
        <Text style={styles.sectionTitle}>Bill Details</Text>
        
        <TextInput
          label="Bill Title"
          value={billTitle}
          onChangeText={setBillTitle}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Dinner at Restaurant"
        />

        <View style={styles.row}>
          <TextInput
            label="Tip ($)"
            value={tip}
            onChangeText={setTip}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
            placeholder="0.00"
          />
          
          <TextInput
            label="Tax ($)"
            value={tax}
            onChangeText={setTax}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
            placeholder="0.00"
          />
        </View>
      </Surface>

      {/* Participants */}
      <Surface style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>
          <Button mode="outlined" onPress={addParticipant} compact icon="plus">
            Add Person
          </Button>
        </View>

        {participants.map((participant, index) => (
          <View key={participant.id} style={styles.participantItem}>
            <Avatar.Text
              size={40}
              label={participant.name.charAt(0)}
              style={styles.participantAvatar}
            />
            
            <View style={styles.participantInfo}>
              <TextInput
                value={participant.name}
                onChangeText={(value) => updateParticipant(participant.id, 'name', value)}
                mode="outlined"
                dense
                style={styles.participantInput}
                placeholder="Name"
              />
              
              <TextInput
                value={participant.venmoUsername || ''}
                onChangeText={(value) => updateParticipant(participant.id, 'venmoUsername', value)}
                mode="outlined"
                dense
                style={styles.participantInput}
                placeholder="@venmo-username (optional)"
                left={<TextInput.Icon icon="at" />}
              />
            </View>

            {participants.length > 2 && participant.id !== user?.id && (
              <IconButton
                icon="close"
                size={20}
                onPress={() => removeParticipant(participant.id)}
              />
            )}
          </View>
        ))}
      </Surface>

      {/* Bill Items */}
      <Surface style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.splitToggle}>
            <Text style={styles.toggleLabel}>Split evenly</Text>
            <Switch
              value={splitEvenly}
              onValueChange={setSplitEvenly}
            />
          </View>
        </View>

        {/* Add Item Form */}
        <View style={styles.addItemForm}>
          <View style={styles.row}>
            <TextInput
              label="Item Description"
              value={newItemDescription}
              onChangeText={setNewItemDescription}
              mode="outlined"
              style={[styles.input, styles.itemDescInput]}
              placeholder="e.g., Pizza"
            />
            
            <TextInput
              label="Amount ($)"
              value={newItemAmount}
              onChangeText={setNewItemAmount}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.itemAmountInput]}
              placeholder="0.00"
            />
          </View>
          
          <Button
            mode="contained"
            onPress={addBillItem}
            style={styles.addItemButton}
            icon="plus">
            Add Item
          </Button>
        </View>

        {/* Bill Items List */}
        {billItems.map((item) => (
          <View key={item.id} style={styles.billItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <Text style={styles.itemAmount}>${item.amount.toFixed(2)}</Text>
              <IconButton
                icon="close"
                size={16}
                onPress={() => removeBillItem(item.id)}
              />
            </View>
            
            {!splitEvenly && (
              <View style={styles.itemParticipants}>
                <Text style={styles.sharedByLabel}>Shared by:</Text>
                <View style={styles.participantChips}>
                  {participants.map(participant => (
                    <Chip
                      key={participant.id}
                      selected={item.sharedBy.includes(participant.id)}
                      onPress={() => toggleItemParticipant(item.id, participant.id)}
                      style={styles.participantChip}>
                      {participant.name}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </Surface>

      {/* Summary */}
      <Surface style={styles.card}>
        <Text style={styles.sectionTitle}>Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        
        {parseFloat(tip) > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tip:</Text>
            <Text style={styles.summaryValue}>${parseFloat(tip).toFixed(2)}</Text>
          </View>
        )}
        
        {parseFloat(tax) > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax:</Text>
            <Text style={styles.summaryValue}>${parseFloat(tax).toFixed(2)}</Text>
          </View>
        )}
        
        <Divider style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.splitTitle}>Individual Amounts:</Text>
        {participants.map(participant => (
          <View key={participant.id} style={styles.splitRow}>
            <Text style={styles.splitName}>{participant.name}:</Text>
            <Text style={styles.splitAmount}>${splits[participant.id].toFixed(2)}</Text>
          </View>
        ))}
      </Surface>

      {/* Send Payment Requests */}
      <Button
        mode="contained"
        onPress={handleSendPaymentRequests}
        loading={loading}
        disabled={loading || billItems.length === 0}
        style={styles.sendButton}
        icon="send">
        Send Payment Requests
      </Button>
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
  upgradeCard: {
    margin: 32,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  upgradeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  upgradeButton: {
    paddingHorizontal: 24,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  participantAvatar: {
    backgroundColor: theme.colors.primary,
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  participantInput: {
    height: 40,
  },
  splitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    color: theme.colors.text,
    marginRight: 8,
  },
  addItemForm: {
    marginBottom: 16,
  },
  itemDescInput: {
    flex: 2,
  },
  itemAmountInput: {
    flex: 1,
  },
  addItemButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  billItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemDescription: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginRight: 8,
  },
  itemParticipants: {
    marginTop: 8,
  },
  sharedByLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  participantChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  participantChip: {
    height: 28,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
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
  divider: {
    marginVertical: 12,
  },
  splitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  splitName: {
    fontSize: 14,
    color: theme.colors.text,
  },
  splitAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  sendButton: {
    paddingVertical: 8,
    marginBottom: 32,
  },
});

export default BillSplittingScreen;
