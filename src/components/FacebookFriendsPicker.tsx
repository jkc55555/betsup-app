import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  Checkbox,
  Button,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FacebookFriendsService, {FacebookFriend} from '../services/FacebookFriendsService';
import {theme} from '../theme/theme';

interface Props {
  onFriendsSelected: (friends: FacebookFriend[]) => void;
  onClose: () => void;
  selectedFriends?: FacebookFriend[];
}

const FacebookFriendsPicker: React.FC<Props> = ({
  onFriendsSelected,
  onClose,
  selectedFriends = [],
}) => {
  const [friends, setFriends] = useState<FacebookFriend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<FacebookFriend[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedFriends.map(f => f.id))
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    // Filter friends based on search query
    if (searchQuery.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const filtered = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFriends(filtered);
    }
  }, [friends, searchQuery]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const facebookFriends = await FacebookFriendsService.getFriends();
      setFriends(facebookFriends);
      setFilteredFriends(facebookFriends);
    } catch (error: any) {
      Alert.alert(
        'Error Loading Friends',
        error.message || 'Failed to load Facebook friends. Make sure you\'re logged in with Facebook and have granted the necessary permissions.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friend: FacebookFriend) => {
    const newSelectedIds = new Set(selectedIds);
    if (selectedIds.has(friend.id)) {
      newSelectedIds.delete(friend.id);
    } else {
      newSelectedIds.add(friend.id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleConfirmSelection = () => {
    const selectedFriendsList = friends.filter(friend =>
      selectedIds.has(friend.id)
    );
    onFriendsSelected(selectedFriendsList);
  };

  const renderFriendItem = ({item}: {item: FacebookFriend}) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => toggleFriendSelection(item)}>
      <View style={styles.friendInfo}>
        <Image
          source={{
            uri: item.picture?.data?.url || 'https://via.placeholder.com/50',
          }}
          style={styles.friendAvatar}
        />
        <Text style={styles.friendName}>{item.name}</Text>
      </View>
      <Checkbox
        status={selectedIds.has(item.id) ? 'checked' : 'unchecked'}
        onPress={() => toggleFriendSelection(item)}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <Surface style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Loading Facebook Friends</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your Facebook friends...</Text>
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invite Facebook Friends</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Searchbar
        placeholder="Search friends..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {filteredFriends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="account-group-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Friends Found</Text>
          <Text style={styles.emptySubtitle}>
            {friends.length === 0
              ? 'No Facebook friends are using BetBuddies yet. Invite them to join!'
              : 'No friends match your search.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          renderItem={renderFriendItem}
          keyExtractor={item => item.id}
          style={styles.friendsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.selectionCount}>
          {selectedIds.size} friend{selectedIds.size !== 1 ? 's' : ''} selected
        </Text>
        <View style={styles.footerButtons}>
          <Button mode="outlined" onPress={onClose} style={styles.cancelButton}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirmSelection}
            disabled={selectedIds.size === 0}
            style={styles.confirmButton}>
            Invite Selected
          </Button>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  searchBar: {
    margin: 16,
    elevation: 0,
    backgroundColor: theme.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  friendsList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendName: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  selectionCount: {
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

export default FacebookFriendsPicker;
