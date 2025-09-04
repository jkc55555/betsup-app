import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Avatar,
  Badge,
  FAB,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useAuth} from '../../contexts/AuthContext';
import {useBets} from '../../contexts/BetContext';
import {theme} from '../../theme/theme';
import {Bet} from '../../types';

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList, 'MainTabs'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useAuth();
  const {bets, activeBets, paymentRequests, loading} = useBets();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh logic would go here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const pendingPayments = paymentRequests.filter(req => req.status === 'pending');
  const recentBets = bets.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'awaiting_resolution': return theme.colors.warning;
      case 'resolved': return theme.colors.accent;
      case 'completed': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'clock-outline';
      case 'awaiting_resolution': return 'gavel';
      case 'resolved': return 'check-circle-outline';
      case 'completed': return 'trophy-outline';
      default: return 'help-circle-outline';
    }
  };

  const renderBetCard = (bet: Bet) => (
    <TouchableOpacity
      key={bet.id}
      onPress={() => navigation.navigate('BetDetails', {betId: bet.id})}>
      <Surface style={styles.betCard}>
        <View style={styles.betHeader}>
          <Text style={styles.betTitle} numberOfLines={1}>
            {bet.title}
          </Text>
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor(bet.status)}]}>
            <Icon name={getStatusIcon(bet.status)} size={12} color="white" />
            <Text style={styles.statusText}>{bet.status.replace('_', ' ')}</Text>
          </View>
        </View>
        
        <Text style={styles.betAmount}>${bet.amount.toFixed(2)}</Text>
        
        <View style={styles.betFooter}>
          <Text style={styles.betParticipants}>
            {bet.participants.length} participant{bet.participants.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.betDate}>
            {new Date(bet.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Avatar.Text
                size={50}
                label={user?.displayName?.charAt(0) || 'U'}
                style={styles.avatar}
              />
              <View style={styles.userDetails}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
              </View>
            </View>
            
            {user?.isPremium && (
              <View style={styles.premiumBadge}>
                <Icon name="crown" size={16} color={theme.colors.accent} />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{activeBets.length}</Text>
            <Text style={styles.statLabel}>Active Bets</Text>
          </Surface>
          
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{bets.length}</Text>
            <Text style={styles.statLabel}>Total Bets</Text>
          </Surface>
          
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingPayments.length}</Text>
            <Text style={styles.statLabel}>Pending Payments</Text>
          </Surface>
        </View>

        {/* Pending Payments Alert */}
        {pendingPayments.length > 0 && (
          <Surface style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Icon name="alert-circle" size={24} color={theme.colors.warning} />
              <Text style={styles.alertTitle}>Payment Required</Text>
            </View>
            <Text style={styles.alertText}>
              You have {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Payment', {requestId: pendingPayments[0].id})}
              style={styles.alertButton}>
              Pay Now
            </Button>
          </Surface>
        )}

        {/* Recent Bets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bets</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Bets')}
              compact>
              View All
            </Button>
          </View>

          {recentBets.length > 0 ? (
            recentBets.map(renderBetCard)
          ) : (
            <Surface style={styles.emptyCard}>
              <Icon name="handshake-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No bets yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first bet to get started!
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CreateBet')}
                style={styles.emptyButton}>
                Create Bet
              </Button>
            </Surface>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('CreateBet')}>
              <Icon name="plus-circle" size={32} color={theme.colors.primary} />
              <Text style={styles.actionText}>Create Bet</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('CreateSeries')}>
              <Icon name="trophy" size={32} color="#F59E0B" />
              <Text style={styles.actionText}>Bet Series</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Groups')}>
              <Icon name="account-group" size={32} color={theme.colors.secondary} />
              <Text style={styles.actionText}>Join Group</Text>
            </TouchableOpacity>
            
            {user?.isPremium && (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Tabs')}>
                <Icon name="receipt" size={32} color={theme.colors.accent} />
                <Text style={styles.actionText}>Manage Tabs</Text>
              </TouchableOpacity>
            )}

            {user?.isPremium && (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('BillSplitting')}>
                <Icon name="receipt-text" size={32} color={theme.colors.secondary} />
                <Text style={styles.actionText}>Split Bill</Text>
              </TouchableOpacity>
            )}
            
            {!user?.isPremium && (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Subscription')}>
                <Icon name="crown" size={32} color={theme.colors.accent} />
                <Text style={styles.actionText}>Go Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  userDetails: {
    marginLeft: 12,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  alertCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: theme.colors.surface,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  alertText: {
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  alertButton: {
    alignSelf: 'flex-start',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  betTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  betAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  betFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  betParticipants: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  betDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
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
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 1,
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
