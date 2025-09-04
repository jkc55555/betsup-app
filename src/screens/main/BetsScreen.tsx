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
  Searchbar,
  Chip,
  FAB,
  Avatar,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useBets} from '../../contexts/BetContext';
import {useAuth} from '../../contexts/AuthContext';
import {theme} from '../../theme/theme';
import {Bet, BetStatus} from '../../types';

type BetsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'MainTabs'>;

interface Props {
  navigation: BetsScreenNavigationProp;
}

const BetsScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useAuth();
  const {bets, loading} = useBets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<BetStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filters: Array<{key: BetStatus | 'all'; label: string}> = [
    {key: 'all', label: 'All'},
    {key: 'active', label: 'Active'},
    {key: 'awaiting_resolution', label: 'Awaiting'},
    {key: 'resolved', label: 'Resolved'},
    {key: 'completed', label: 'Completed'},
  ];

  const filteredBets = bets.filter(bet => {
    const matchesSearch = bet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bet.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || bet.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh logic would go here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getStatusColor = (status: BetStatus) => {
    switch (status) {
      case 'pending': return theme.colors.textSecondary;
      case 'active': return theme.colors.success;
      case 'awaiting_resolution': return theme.colors.warning;
      case 'resolved': return theme.colors.accent;
      case 'completed': return theme.colors.primary;
      case 'cancelled': return theme.colors.error;
      case 'disputed': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: BetStatus) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'active': return 'play-circle-outline';
      case 'awaiting_resolution': return 'gavel';
      case 'resolved': return 'check-circle-outline';
      case 'completed': return 'trophy-outline';
      case 'cancelled': return 'close-circle-outline';
      case 'disputed': return 'alert-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getUserSide = (bet: Bet) => {
    const participant = bet.participants.find(p => p.userId === user?.id);
    return participant?.side || 'Not joined';
  };

  const isUserCreator = (bet: Bet) => {
    return bet.createdBy === user?.id;
  };

  const renderBetItem = ({item}: {item: Bet}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BetDetails', {betId: item.id})}>
      <Surface style={styles.betCard}>
        <View style={styles.betHeader}>
          <View style={styles.betTitleContainer}>
            <Text style={styles.betTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {isUserCreator(item) && (
              <Chip
                mode="outlined"
                compact
                style={styles.creatorChip}
                textStyle={styles.creatorChipText}>
                Creator
              </Chip>
            )}
          </View>
          
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
            <Icon name={getStatusIcon(item.status)} size={12} color="white" />
          </View>
        </View>

        <Text style={styles.betDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.betDetails}>
          <View style={styles.amountContainer}>
            <Text style={styles.betAmount}>${item.amount.toFixed(2)}</Text>
            {item.facilitationFee > 0 && (
              <Text style={styles.feeText}>
                +${item.facilitationFee.toFixed(2)} fee
              </Text>
            )}
          </View>

          <View style={styles.sideContainer}>
            <Text style={styles.sideLabel}>Your side:</Text>
            <Text style={styles.sideText}>{getUserSide(item)}</Text>
          </View>
        </View>

        <View style={styles.betFooter}>
          <View style={styles.participantsContainer}>
            <Icon name="account-group" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.participantsText}>
              {item.participants.length} participant{item.participants.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.dateContainer}>
            <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Resolution type indicator */}
        <View style={styles.resolutionContainer}>
          <Icon 
            name={item.resolutionType === 'neutral_party' ? 'account-tie' : 'account-group'} 
            size={14} 
            color={theme.colors.textSecondary} 
          />
          <Text style={styles.resolutionText}>
            {item.resolutionType === 'neutral_party' ? 'Neutral party' : 'Everyone agrees'}
          </Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="handshake-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>
        {selectedFilter === 'all' ? 'No bets yet' : `No ${selectedFilter} bets`}
      </Text>
      <Text style={styles.emptySubtitle}>
        {selectedFilter === 'all' 
          ? 'Create your first bet or join one from a friend!'
          : `You don't have any ${selectedFilter} bets at the moment.`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search bets..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <FlatList
          horizontal
          data={filters}
          renderItem={({item}) => (
            <Chip
              selected={selectedFilter === item.key}
              onPress={() => setSelectedFilter(item.key)}
              style={[
                styles.filterChip,
                selectedFilter === item.key && styles.selectedFilterChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedFilter === item.key && styles.selectedFilterChipText
              ]}>
              {item.label}
            </Chip>
          )}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.filtersContainer}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={filteredBets}
        renderItem={renderBetItem}
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
        onPress={() => navigation.navigate('CreateBet')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 0,
    backgroundColor: theme.colors.surface,
  },
  filtersContainer: {
    paddingHorizontal: 0,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: theme.colors.surface,
  },
  selectedFilterChip: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.text,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  betCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  betTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  betTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  creatorChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  creatorChipText: {
    fontSize: 10,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  betDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  betDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountContainer: {
    alignItems: 'flex-start',
  },
  betAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  feeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  sideContainer: {
    alignItems: 'flex-end',
  },
  sideLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  sideText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  betFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  resolutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resolutionText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    fontStyle: 'italic',
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default BetsScreen;
