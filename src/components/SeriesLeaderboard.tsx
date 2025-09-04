import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Chip,
  Button,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {BetSeries, SeriesParticipant} from '../types/betSeries';
import {theme} from '../theme/theme';

interface Props {
  series: BetSeries;
  currentUserId?: string;
  onParticipantPress?: (participant: SeriesParticipant) => void;
  showDetailed?: boolean;
}

type LeaderboardView = 'overall' | 'recent' | 'achievements';

const SeriesLeaderboard: React.FC<Props> = ({
  series,
  currentUserId,
  onParticipantPress,
  showDetailed = true,
}) => {
  const [currentView, setCurrentView] = useState<LeaderboardView>('overall');

  // Sort participants by current rank
  const sortedParticipants = [...series.participants].sort((a, b) => a.currentRank - b.currentRank);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'trophy';
      case 2: return 'medal';
      case 3: return 'medal-outline';
      default: return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#F59E0B';
      case 2: return '#6B7280';
      case 3: return '#CD7F32';
      default: return theme.colors.textSecondary;
    }
  };

  const calculateWinPercentage = (participant: SeriesParticipant) => {
    if (participant.totalPicks === 0) return 0;
    return (participant.correctPicks / participant.totalPicks) * 100;
  };

  const getStreakDisplay = (participant: SeriesParticipant) => {
    if (participant.currentStreak === 0) return null;
    return participant.currentStreak > 0 ? `🔥 ${participant.currentStreak}` : `❄️ ${Math.abs(participant.currentStreak)}`;
  };

  const renderParticipantItem = ({item, index}: {item: SeriesParticipant; index: number}) => {
    const isCurrentUser = item.userId === currentUserId;
    const rankIcon = getRankIcon(item.currentRank);
    const rankColor = getRankColor(item.currentRank);
    const winPercentage = calculateWinPercentage(item);
    const streakDisplay = getStreakDisplay(item);
    
    // Calculate rank change
    const rankChange = item.previousRank ? item.previousRank - item.currentRank : 0;

    return (
      <TouchableOpacity
        style={[
          styles.participantCard,
          isCurrentUser && styles.currentUserCard
        ]}
        onPress={() => onParticipantPress?.(item)}
        disabled={!onParticipantPress}>
        
        <View style={styles.participantHeader}>
          {/* Rank */}
          <View style={styles.rankContainer}>
            {rankIcon ? (
              <Icon name={rankIcon} size={24} color={rankColor} />
            ) : (
              <Text style={[styles.rankNumber, {color: rankColor}]}>
                {item.currentRank}
              </Text>
            )}
            
            {rankChange !== 0 && (
              <View style={styles.rankChange}>
                <Icon 
                  name={rankChange > 0 ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color={rankChange > 0 ? '#10B981' : '#EF4444'} 
                />
                <Text style={[
                  styles.rankChangeText,
                  {color: rankChange > 0 ? '#10B981' : '#EF4444'}
                ]}>
                  {Math.abs(rankChange)}
                </Text>
              </View>
            )}
          </View>

          {/* Avatar and Name */}
          <View style={styles.participantInfo}>
            <Avatar.Image
              size={40}
              source={{uri: item.photoURL || 'https://via.placeholder.com/40'}}
              style={styles.avatar}
            />
            <View style={styles.nameContainer}>
              <Text style={[
                styles.participantName,
                isCurrentUser && styles.currentUserName
              ]}>
                {item.displayName}
                {isCurrentUser && ' (You)'}
              </Text>
              
              <View style={styles.statsRow}>
                <Text style={styles.statText}>
                  {item.correctPicks}/{item.totalPicks} correct
                </Text>
                {winPercentage > 0 && (
                  <Text style={styles.statText}>
                    • {winPercentage.toFixed(1)}%
                  </Text>
                )}
                {streakDisplay && (
                  <Text style={styles.streakText}>
                    • {streakDisplay}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Score */}
          <View style={styles.scoreContainer}>
            <Text style={styles.totalScore}>{item.totalScore}</Text>
            <Text style={styles.scoreLabel}>pts</Text>
          </View>
        </View>

        {/* Achievements */}
        {showDetailed && item.achievements.length > 0 && (
          <View style={styles.achievementsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {item.achievements.map((achievement, achIndex) => (
                <Chip
                  key={achIndex}
                  mode="outlined"
                  compact
                  style={styles.achievementChip}
                  textStyle={styles.achievementText}>
                  {achievement}
                </Chip>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Progress Bar for Current User */}
        {isCurrentUser && showDetailed && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress to Next Rank</Text>
              <Text style={styles.progressValue}>
                {item.totalScore} / {getNextRankThreshold(item, sortedParticipants)} pts
              </Text>
            </View>
            <ProgressBar
              progress={getProgressToNextRank(item, sortedParticipants)}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getNextRankThreshold = (participant: SeriesParticipant, allParticipants: SeriesParticipant[]) => {
    if (participant.currentRank === 1) return participant.totalScore + 10; // Arbitrary target for leader
    
    const nextRankParticipant = allParticipants.find(p => p.currentRank === participant.currentRank - 1);
    return nextRankParticipant ? nextRankParticipant.totalScore + 1 : participant.totalScore + 10;
  };

  const getProgressToNextRank = (participant: SeriesParticipant, allParticipants: SeriesParticipant[]) => {
    const threshold = getNextRankThreshold(participant, allParticipants);
    return Math.min(participant.totalScore / threshold, 1);
  };

  const renderSeriesStats = () => (
    <Surface style={styles.statsCard}>
      <Text style={styles.statsTitle}>Series Statistics</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{series.participants.length}</Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{series.bets.filter(b => b.status === 'resolved').length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{series.bets.length}</Text>
          <Text style={styles.statLabel}>Total Bets</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${series.totalPot}</Text>
          <Text style={styles.statLabel}>Prize Pool</Text>
        </View>
      </View>
    </Surface>
  );

  const renderViewSelector = () => (
    <View style={styles.viewSelector}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.viewTab,
            currentView === 'overall' && styles.activeViewTab
          ]}
          onPress={() => setCurrentView('overall')}>
          <Text style={[
            styles.viewTabText,
            currentView === 'overall' && styles.activeViewTabText
          ]}>
            Overall
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewTab,
            currentView === 'recent' && styles.activeViewTab
          ]}
          onPress={() => setCurrentView('recent')}>
          <Text style={[
            styles.viewTabText,
            currentView === 'recent' && styles.activeViewTabText
          ]}>
            Recent
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewTab,
            currentView === 'achievements' && styles.activeViewTab
          ]}
          onPress={() => setCurrentView('achievements')}>
          <Text style={[
            styles.viewTabText,
            currentView === 'achievements' && styles.activeViewTabText
          ]}>
            Achievements
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {showDetailed && renderSeriesStats()}
      {showDetailed && renderViewSelector()}
      
      <FlatList
        data={sortedParticipants}
        renderItem={renderParticipantItem}
        keyExtractor={item => item.userId}
        style={styles.leaderboardList}
        contentContainerStyle={styles.leaderboardContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statsCard: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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
  viewSelector: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  viewTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
  },
  activeViewTab: {
    backgroundColor: theme.colors.primary,
  },
  viewTabText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  activeViewTabText: {
    color: 'white',
    fontWeight: '500',
  },
  leaderboardList: {
    flex: 1,
  },
  leaderboardContainer: {
    padding: 16,
    paddingTop: 8,
  },
  participantCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: theme.colors.background,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rankChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rankChangeText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 2,
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  currentUserName: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  streakText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  totalScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scoreLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  achievementsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  achievementChip: {
    marginRight: 8,
    height: 24,
  },
  achievementText: {
    fontSize: 10,
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
});

export default SeriesLeaderboard;
