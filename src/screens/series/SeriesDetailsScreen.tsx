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
  Chip,
  FAB,
  Menu,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useAuth} from '../../contexts/AuthContext';
import SeriesLeaderboard from '../../components/SeriesLeaderboard';
import {BetSeries, SeriesParticipant, SeriesBet} from '../../types/betSeries';
import {BET_SERIES_TEMPLATES} from '../../types/betSeries';
import {theme} from '../../theme/theme';

type SeriesDetailsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'SeriesDetails'>;
type SeriesDetailsScreenRouteProp = RouteProp<MainStackParamList, 'SeriesDetails'>;

interface Props {
  navigation: SeriesDetailsScreenNavigationProp;
  route: SeriesDetailsScreenRouteProp;
}

const SeriesDetailsScreen: React.FC<Props> = ({navigation, route}) => {
  const {user} = useAuth();
  const {seriesId} = route.params;

  // Mock data - in real app, fetch from backend
  const [series, setSeries] = useState<BetSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [currentTab, setCurrentTab] = useState<'overview' | 'leaderboard' | 'bets'>('overview');

  useEffect(() => {
    loadSeriesData();
  }, [seriesId]);

  const loadSeriesData = async () => {
    setLoading(true);
    try {
      // Mock series data - replace with actual API call
      const mockSeries: BetSeries = {
        id: seriesId,
        title: 'NFL Week 12 Office Pool',
        description: 'Weekly picks for all Sunday games with confidence scoring',
        type: 'office_pool',
        createdBy: 'user123',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        
        bets: [
          {
            id: 'bet1',
            title: 'Chiefs vs Bills',
            description: 'Sunday Night Football',
            template: 'moneyline',
            templateData: {},
            sides: ['Chiefs', 'Bills'],
            resolutionType: 'automatic',
            status: 'resolved',
            winner: 'Chiefs',
            resolvedAt: new Date('2024-01-14'),
            order: 0,
          },
          {
            id: 'bet2',
            title: 'Cowboys vs Eagles',
            description: 'NFC East rivalry game',
            template: 'spread',
            templateData: {},
            sides: ['Cowboys -3', 'Eagles +3'],
            resolutionType: 'automatic',
            status: 'active',
            order: 1,
          },
          // Add more mock bets...
        ],
        
        scoring: {
          method: 'confidence_points',
          confidenceRange: {min: 1, max: 16},
          bonusPoints: {
            perfectWeek: 15,
            streakBonus: 5,
          },
        },
        
        participants: [
          {
            userId: 'user1',
            displayName: 'John Smith',
            photoURL: 'https://via.placeholder.com/40',
            joinedAt: new Date('2024-01-10'),
            status: 'active',
            paidEntry: true,
            totalScore: 145,
            correctPicks: 12,
            totalPicks: 16,
            currentStreak: 3,
            longestStreak: 5,
            currentRank: 1,
            previousRank: 2,
            picks: {},
            achievements: ['perfect_week', 'streak_master'],
          },
          {
            userId: user?.id || 'user2',
            displayName: user?.displayName || 'You',
            photoURL: user?.photoURL || 'https://via.placeholder.com/40',
            joinedAt: new Date('2024-01-10'),
            status: 'active',
            paidEntry: true,
            totalScore: 138,
            correctPicks: 11,
            totalPicks: 16,
            currentStreak: 2,
            longestStreak: 4,
            currentRank: 2,
            previousRank: 3,
            picks: {},
            achievements: ['comeback_kid'],
          },
          // Add more participants...
        ],
        
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-21'),
        registrationDeadline: new Date('2024-01-14'),
        status: 'active',
        
        entryFee: 20,
        currency: 'USD',
        maxParticipants: 20,
        minParticipants: 5,
        allowLateEntry: false,
        
        payoutStructure: {
          first: 60,
          second: 25,
          third: 15,
        },
        
        isPublic: false,
        inviteCode: 'NFL2024',
        tags: ['nfl', 'office', 'weekly'],
        
        totalPot: 400,
        facilitationFee: 20,
        isPremium: false,
      };

      setSeries(mockSeries);
    } catch (error) {
      Alert.alert('Error', 'Failed to load series data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSeries = async () => {
    if (!series || !user) return;

    try {
      // API call to join series
      Alert.alert('Success', 'You have joined the series!');
      // Refresh data
      loadSeriesData();
    } catch (error) {
      Alert.alert('Error', 'Failed to join series');
    }
  };

  const handleShareSeries = async () => {
    if (!series) return;

    try {
      await Share.share({
        message: `Join my bet series: ${series.title}\nInvite code: ${series.inviteCode}`,
        title: series.title,
      });
    } catch (error) {
      console.error('Error sharing series:', error);
    }
  };

  const handleMakePicks = () => {
    if (!series) return;
    // Navigate to picks screen
    navigation.navigate('SeriesPicks', {seriesId: series.id});
  };

  const isParticipant = series?.participants.some(p => p.userId === user?.id);
  const canJoin = series?.status === 'registration_open' && !isParticipant;
  const template = series ? BET_SERIES_TEMPLATES[series.type] : null;

  if (loading || !series || !template) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading series...</Text>
      </View>
    );
  }

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      {/* Series Header */}
      <Surface style={styles.headerCard}>
        <View style={styles.seriesHeader}>
          <View style={[styles.seriesIcon, {backgroundColor: template.color + '20'}]}>
            <Icon name={template.icon} size={32} color={template.color} />
          </View>
          <View style={styles.seriesInfo}>
            <Text style={styles.seriesTitle}>{series.title}</Text>
            <Text style={styles.seriesDescription}>{series.description}</Text>
            
            <View style={styles.seriesMeta}>
              <Chip mode="outlined" compact style={styles.metaChip}>
                {template.name}
              </Chip>
              <Chip mode="outlined" compact style={styles.metaChip}>
                ${series.entryFee} entry
              </Chip>
              <Chip 
                mode="outlined" 
                compact 
                style={[styles.metaChip, {backgroundColor: getStatusColor(series.status)}]}>
                {series.status.replace('_', ' ').toUpperCase()}
              </Chip>
            </View>
          </View>
        </View>
      </Surface>

      {/* Prize Pool */}
      <Surface style={styles.prizeCard}>
        <View style={styles.prizeHeader}>
          <Icon name="trophy" size={24} color="#F59E0B" />
          <Text style={styles.prizeTitle}>Prize Pool: ${series.totalPot}</Text>
        </View>
        
        <View style={styles.payoutStructure}>
          <View style={styles.payoutItem}>
            <Text style={styles.payoutPlace}>1st</Text>
            <Text style={styles.payoutAmount}>${(series.totalPot * series.payoutStructure.first / 100).toFixed(0)}</Text>
          </View>
          {series.payoutStructure.second && (
            <View style={styles.payoutItem}>
              <Text style={styles.payoutPlace}>2nd</Text>
              <Text style={styles.payoutAmount}>${(series.totalPot * series.payoutStructure.second / 100).toFixed(0)}</Text>
            </View>
          )}
          {series.payoutStructure.third && (
            <View style={styles.payoutItem}>
              <Text style={styles.payoutPlace}>3rd</Text>
              <Text style={styles.payoutAmount}>${(series.totalPot * series.payoutStructure.third / 100).toFixed(0)}</Text>
            </View>
          )}
        </View>
      </Surface>

      {/* Series Progress */}
      <Surface style={styles.progressCard}>
        <Text style={styles.progressTitle}>Series Progress</Text>
        
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{series.bets.filter(b => b.status === 'resolved').length}</Text>
            <Text style={styles.progressLabel}>Completed</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{series.bets.filter(b => b.status === 'active').length}</Text>
            <Text style={styles.progressLabel}>Active</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{series.bets.length}</Text>
            <Text style={styles.progressLabel}>Total Bets</Text>
          </View>
        </View>
      </Surface>

      {/* Recent Activity */}
      <Surface style={styles.activityCard}>
        <Text style={styles.activityTitle}>Recent Activity</Text>
        
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Icon name="check-circle" size={20} color="#10B981" />
            <Text style={styles.activityText}>Chiefs vs Bills resolved - Chiefs won</Text>
            <Text style={styles.activityTime}>2h ago</Text>
          </View>
          
          <View style={styles.activityItem}>
            <Icon name="account-plus" size={20} color="#3B82F6" />
            <Text style={styles.activityText}>Sarah joined the series</Text>
            <Text style={styles.activityTime}>4h ago</Text>
          </View>
          
          <View style={styles.activityItem}>
            <Icon name="trophy" size={20} color="#F59E0B" />
            <Text style={styles.activityText}>John achieved Perfect Week</Text>
            <Text style={styles.activityTime}>1d ago</Text>
          </View>
        </View>
      </Surface>
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981' + '20';
      case 'completed': return '#6B7280' + '20';
      case 'registration_open': return '#3B82F6' + '20';
      default: return theme.colors.surface;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <Surface style={styles.tabBar}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'overview' && styles.activeTab]}
            onPress={() => setCurrentTab('overview')}>
            <Text style={[styles.tabText, currentTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, currentTab === 'leaderboard' && styles.activeTab]}
            onPress={() => setCurrentTab('leaderboard')}>
            <Text style={[styles.tabText, currentTab === 'leaderboard' && styles.activeTabText]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, currentTab === 'bets' && styles.activeTab]}
            onPress={() => setCurrentTab('bets')}>
            <Text style={[styles.tabText, currentTab === 'bets' && styles.activeTabText]}>
              Bets ({series.bets.length})
            </Text>
          </TouchableOpacity>
        </View>
      </Surface>

      {/* Tab Content */}
      {currentTab === 'overview' && renderOverview()}
      {currentTab === 'leaderboard' && (
        <SeriesLeaderboard
          series={series}
          currentUserId={user?.id}
          showDetailed={true}
        />
      )}
      {currentTab === 'bets' && (
        <ScrollView style={styles.tabContent}>
          {/* Bets list would go here */}
          <Text style={styles.comingSoon}>Bets list coming soon...</Text>
        </ScrollView>
      )}

      {/* Action Buttons */}
      {canJoin && (
        <FAB
          icon="account-plus"
          label="Join Series"
          style={styles.joinFab}
          onPress={handleJoinSeries}
        />
      )}

      {isParticipant && (
        <FAB
          icon="vote"
          label="Make Picks"
          style={styles.picksFab}
          onPress={handleMakePicks}
        />
      )}

      {/* Menu */}
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={
          <FAB
            icon="dots-vertical"
            style={styles.menuFab}
            size="small"
            onPress={() => setShowMenu(true)}
          />
        }>
        <Menu.Item onPress={handleShareSeries} title="Share Series" leadingIcon="share" />
        <Menu.Item onPress={() => {}} title="Series Rules" leadingIcon="information" />
        <Divider />
        <Menu.Item onPress={() => {}} title="Leave Series" leadingIcon="exit-to-app" />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  seriesHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  seriesIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  seriesInfo: {
    flex: 1,
  },
  seriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  seriesDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  seriesMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    height: 24,
  },
  prizeCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  prizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  prizeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  payoutStructure: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  payoutItem: {
    alignItems: 'center',
  },
  payoutPlace: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
  },
  progressCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  activityCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 12,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  comingSoon: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 32,
  },
  joinFab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
  picksFab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
  menuFab: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: theme.colors.surface,
  },
});

export default SeriesDetailsScreen;
