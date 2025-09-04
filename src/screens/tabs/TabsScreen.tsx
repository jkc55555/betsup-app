import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  FAB,
  Avatar,
  Chip,
  Divider,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useAuth} from '../../contexts/AuthContext';
import {useBets} from '../../contexts/BetContext';
import {theme} from '../../theme/theme';
import {Tab, TabParticipant, TabTransaction} from '../../types';

type TabsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Tabs'>;

interface Props {
  navigation: TabsScreenNavigationProp;
}

// Mock data for tabs - in real app this would come from context/API
const mockTabs: Tab[] = [
  {
    id: '1',
    groupId: 'group1',
    name: 'College Friends Tab',
    participants: [
      {userId: '1', displayName: 'John Doe', balance: 25.50},
      {userId: '2', displayName: 'Jane Smith', balance: -15.25},
      {userId: '3', displayName: 'Mike Johnson', balance: -10.25},
    ],
    transactions: [
      {
        id: 't1',
        type: 'bet',
        description: 'Super Bowl bet',
        amount: 50,
        paidBy: '1',
        splitBetween: ['1', '2', '3'],
        createdAt: new Date(),
      },
      {
        id: 't2',
        type: 'expense',
        description: 'Pizza dinner',
        amount: 45,
        paidBy: '2',
        splitBetween: ['1', '2', '3'],
        createdAt: new Date(),
      },
    ],
    isSettled: false,
    createdBy: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    groupId: 'group2',
    name: 'Work Squad Tab',
    participants: [
      {userId: '1', displayName: 'John Doe', balance: -8.33},
      {userId: '4', displayName: 'Sarah Wilson', balance: 16.67},
      {userId: '5', displayName: 'Tom Brown', balance: -8.34},
    ],
    transactions: [
      {
        id: 't3',
        type: 'expense',
        description: 'Team lunch',
        amount: 75,
        paidBy: '4',
        splitBetween: ['1', '4', '5'],
        createdAt: new Date(),
      },
    ],
    isSettled: false,
    createdBy: '4',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const TabsScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useAuth();
  const [tabs] = useState<Tab[]>(mockTabs);
  const [refreshing, setRefreshing] = useState(false);

  if (!user?.isPremium) {
    return (
      <View style={styles.container}>
        <Surface style={styles.upgradeCard}>
          <Icon name="crown" size={64} color={theme.colors.accent} />
          <Text style={styles.upgradeTitle}>Premium Feature</Text>
          <Text style={styles.upgradeSubtitle}>
            Tabs are available with BetBuddies Premium. Keep running balances with friends instead of paying out each bet.
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh logic would go here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getUserBalance = (tab: Tab): number => {
    const participant = tab.participants.find(p => p.userId === user.id);
    return participant?.balance || 0;
  };

  const getBalanceColor = (balance: number): string => {
    if (balance > 0) return theme.colors.success; // Owed money
    if (balance < 0) return theme.colors.error;   // Owes money
    return theme.colors.textSecondary;            // Even
  };

  const getBalanceText = (balance: number): string => {
    if (balance > 0) return `+$${balance.toFixed(2)}`;
    if (balance < 0) return `-$${Math.abs(balance).toFixed(2)}`;
    return '$0.00';
  };

  const getBalanceLabel = (balance: number): string => {
    if (balance > 0) return 'You are owed';
    if (balance < 0) return 'You owe';
    return 'Even';
  };

  const renderTabItem = ({item}: {item: Tab}) => {
    const userBalance = getUserBalance(item);
    const totalTransactions = item.transactions.length;
    const lastTransaction = item.transactions[item.transactions.length - 1];

    return (
      <TouchableOpacity
        onPress={() => {/* Navigate to tab details */}}>
        <Surface style={styles.tabCard}>
          <View style={styles.tabHeader}>
            <View style={styles.tabInfo}>
              <Text style={styles.tabName}>{item.name}</Text>
              <Text style={styles.tabMeta}>
                {item.participants.length} members • {totalTransactions} transactions
              </Text>
            </View>
            
            {item.isSettled && (
              <Chip mode="outlined" compact style={styles.settledChip}>
                Settled
              </Chip>
            )}
          </View>

          <View style={styles.balanceSection}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>
                {getBalanceLabel(userBalance)}
              </Text>
              <Text style={[
                styles.balanceAmount,
                {color: getBalanceColor(userBalance)}
              ]}>
                {getBalanceText(userBalance)}
              </Text>
            </View>

            <View style={styles.participantsPreview}>
              {item.participants.slice(0, 3).map((participant, index) => (
                <Avatar.Text
                  key={participant.userId}
                  size={32}
                  label={participant.displayName.charAt(0)}
                  style={[
                    styles.participantAvatar,
                    {marginLeft: index > 0 ? -8 : 0}
                  ]}
                />
              ))}
              {item.participants.length > 3 && (
                <Avatar.Text
                  size={32}
                  label={`+${item.participants.length - 3}`}
                  style={[styles.participantAvatar, {marginLeft: -8}]}
                />
              )}
            </View>
          </View>

          {lastTransaction && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.lastTransaction}>
                <Icon 
                  name={lastTransaction.type === 'bet' ? 'handshake' : 'receipt'} 
                  size={16} 
                  color={theme.colors.textSecondary} 
                />
                <Text style={styles.transactionText} numberOfLines={1}>
                  {lastTransaction.description} • ${lastTransaction.amount.toFixed(2)}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(lastTransaction.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </>
          )}

          <View style={styles.tabActions}>
            <Button
              mode="outlined"
              compact
              onPress={() => {/* Add expense */}}
              icon="plus">
              Add Expense
            </Button>
            
            {!item.isSettled && userBalance !== 0 && (
              <Button
                mode="contained"
                compact
                onPress={() => {/* Settle up */}}
                style={styles.settleButton}>
                Settle Up
              </Button>
            )}
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="receipt-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Tabs Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create a tab to keep running balances with your betting groups instead of paying out each bet.
      </Text>
      <Button
        mode="contained"
        onPress={() => {/* Navigate to create tab */}}
        style={styles.emptyButton}>
        Create Your First Tab
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <Surface style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Icon name="receipt" size={32} color={theme.colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Tabs</Text>
            <Text style={styles.headerSubtitle}>
              Keep running balances with friends
            </Text>
          </View>
        </View>
      </Surface>

      <FlatList
        data={tabs}
        renderItem={renderTabItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {/* Navigate to create tab */}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  headerCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  tabCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tabInfo: {
    flex: 1,
  },
  tabName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  tabMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  settledChip: {
    height: 24,
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceInfo: {
    alignItems: 'flex-start',
  },
  balanceLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  participantsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    backgroundColor: theme.colors.primary,
  },
  divider: {
    marginBottom: 12,
  },
  lastTransaction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tabActions: {
    flexDirection: 'row',
    gap: 12,
  },
  settleButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TabsScreen;
