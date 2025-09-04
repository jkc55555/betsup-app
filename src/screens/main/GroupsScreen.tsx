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
  Button,
  FAB,
  Avatar,
  Chip,
  IconButton,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useAuth} from '../../contexts/AuthContext';
import {theme} from '../../theme/theme';
import {Group, GroupMember} from '../../types';

type GroupsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'MainTabs'>;

interface Props {
  navigation: GroupsScreenNavigationProp;
}

// Mock data for groups - in real app this would come from context/API
const mockGroups: Group[] = [
  {
    id: '1',
    name: 'College Friends',
    description: 'Our old college crew for friendly bets',
    members: [
      {userId: '1', displayName: 'John Doe', role: 'admin', joinedAt: new Date()},
      {userId: '2', displayName: 'Jane Smith', role: 'member', joinedAt: new Date()},
      {userId: '3', displayName: 'Mike Johnson', role: 'member', joinedAt: new Date()},
    ],
    createdBy: '1',
    isPrivate: false,
    inviteCode: 'COLLEGE123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Work Squad',
    description: 'Office betting pool',
    members: [
      {userId: '1', displayName: 'John Doe', role: 'member', joinedAt: new Date()},
      {userId: '4', displayName: 'Sarah Wilson', role: 'admin', joinedAt: new Date()},
      {userId: '5', displayName: 'Tom Brown', role: 'member', joinedAt: new Date()},
    ],
    createdBy: '4',
    isPrivate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const GroupsScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useAuth();
  const [groups] = useState<Group[]>(mockGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refresh logic would go here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getUserRole = (group: Group) => {
    const member = group.members.find(m => m.userId === user?.id);
    return member?.role || null;
  };

  const isUserInGroup = (group: Group) => {
    return group.members.some(m => m.userId === user?.id);
  };

  const renderGroupItem = ({item}: {item: Group}) => {
    const userRole = getUserRole(item);
    const isInGroup = isUserInGroup(item);

    return (
      <Surface style={styles.groupCard}>
        <View style={styles.groupHeader}>
          <View style={styles.groupInfo}>
            <View style={styles.groupTitleContainer}>
              <Text style={styles.groupName}>{item.name}</Text>
              {item.isPrivate && (
                <Icon name="lock" size={16} color={theme.colors.textSecondary} />
              )}
            </View>
            
            {item.description && (
              <Text style={styles.groupDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>

          {userRole === 'admin' && (
            <IconButton
              icon="cog"
              size={20}
              onPress={() => {/* Navigate to group settings */}}
            />
          )}
        </View>

        <View style={styles.groupMembers}>
          <View style={styles.membersAvatars}>
            {item.members.slice(0, 3).map((member, index) => (
              <Avatar.Text
                key={member.userId}
                size={32}
                label={member.displayName.charAt(0)}
                style={[
                  styles.memberAvatar,
                  {marginLeft: index > 0 ? -8 : 0}
                ]}
              />
            ))}
            {item.members.length > 3 && (
              <Avatar.Text
                size={32}
                label={`+${item.members.length - 3}`}
                style={[styles.memberAvatar, {marginLeft: -8}]}
              />
            )}
          </View>

          <Text style={styles.membersCount}>
            {item.members.length} member{item.members.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.groupFooter}>
          <View style={styles.groupMeta}>
            {userRole && (
              <Chip
                mode="outlined"
                compact
                style={styles.roleChip}
                textStyle={styles.roleChipText}>
                {userRole}
              </Chip>
            )}
            
            <Text style={styles.createdDate}>
              Created {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {isInGroup ? (
            <Button
              mode="outlined"
              compact
              onPress={() => {/* Navigate to group details */}}>
              View Group
            </Button>
          ) : (
            <Button
              mode="contained"
              compact
              onPress={() => {/* Join group logic */}}>
              Join Group
            </Button>
          )}
        </View>

        {item.inviteCode && userRole === 'admin' && (
          <View style={styles.inviteCodeContainer}>
            <Text style={styles.inviteCodeLabel}>Invite Code:</Text>
            <Text style={styles.inviteCode}>{item.inviteCode}</Text>
            <IconButton
              icon="content-copy"
              size={16}
              onPress={() => {/* Copy invite code */}}
            />
          </View>
        )}
      </Surface>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="account-group-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Groups Found</Text>
      <Text style={styles.emptySubtitle}>
        Create or join a group to start betting with friends!
      </Text>
      <Button
        mode="contained"
        onPress={() => {/* Navigate to create group */}}
        style={styles.emptyButton}>
        Create Group
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search groups..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.headerActions}>
          <Button
            mode="outlined"
            onPress={() => {/* Navigate to join by code */}}
            icon="key"
            style={styles.headerButton}>
            Join by Code
          </Button>
        </View>
      </View>

      <FlatList
        data={filteredGroups}
        renderItem={renderGroupItem}
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
        onPress={() => {/* Navigate to create group */}}
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerButton: {
    paddingHorizontal: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  groupCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
    marginRight: 8,
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 8,
  },
  groupDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  groupMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  membersAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    backgroundColor: theme.colors.primary,
  },
  membersCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupMeta: {
    flex: 1,
    marginRight: 12,
  },
  roleChip: {
    alignSelf: 'flex-start',
    height: 24,
    marginBottom: 4,
  },
  roleChipText: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  createdDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  inviteCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
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

export default GroupsScreen;
