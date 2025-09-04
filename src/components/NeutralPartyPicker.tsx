import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  Searchbar,
  Avatar,
  RadioButton,
  Button,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuth} from '../contexts/AuthContext';
import {theme} from '../theme/theme';

export interface NeutralPartyCandidate {
  id: string;
  displayName: string;
  photoURL?: string;
  email?: string;
  isContact?: boolean;
  isFacebookFriend?: boolean;
  trustScore?: number; // Future feature for rating neutral parties
}

interface Props {
  onPartySelected: (party: NeutralPartyCandidate | null) => void;
  onClose: () => void;
  selectedParty?: NeutralPartyCandidate | null;
  excludeUserIds?: string[]; // Exclude bet participants
}

const NeutralPartyPicker: React.FC<Props> = ({
  onPartySelected,
  onClose,
  selectedParty,
  excludeUserIds = [],
}) => {
  const {user} = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<NeutralPartyCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<NeutralPartyCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(selectedParty?.id || null);
  const [loading, setLoading] = useState(false);

  // Mock data - in real app this would come from contacts, Facebook friends, and app users
  const mockCandidates: NeutralPartyCandidate[] = [
    {
      id: 'neutral1',
      displayName: 'Alex Thompson',
      email: 'alex@example.com',
      isContact: true,
      trustScore: 4.8,
    },
    {
      id: 'neutral2',
      displayName: 'Sarah Chen',
      email: 'sarah@example.com',
      isFacebookFriend: true,
      trustScore: 4.9,
    },
    {
      id: 'neutral3',
      displayName: 'Mike Rodriguez',
      email: 'mike@example.com',
      isContact: true,
      isFacebookFriend: true,
      trustScore: 4.7,
    },
    {
      id: 'neutral4',
      displayName: 'Emma Wilson',
      email: 'emma@example.com',
      trustScore: 4.6,
    },
  ];

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    // Filter candidates based on search query and exclusions
    let filtered = candidates.filter(candidate => {
      const matchesSearch = candidate.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           candidate.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const notExcluded = !excludeUserIds.includes(candidate.id) && candidate.id !== user?.id;
      return matchesSearch && notExcluded;
    });

    // Sort by trust score (highest first)
    filtered.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));

    setFilteredCandidates(filtered);
  }, [candidates, searchQuery, excludeUserIds, user?.id]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      // In a real app, you would:
      // 1. Load contacts from device
      // 2. Load Facebook friends who use the app
      // 3. Load other app users with good neutral party ratings
      // 4. Filter out current bet participants
      
      setCandidates(mockCandidates);
    } catch (error) {
      console.error('Error loading neutral party candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectParty = (candidate: NeutralPartyCandidate) => {
    setSelectedId(candidate.id);
  };

  const handleConfirmSelection = () => {
    const selected = candidates.find(c => c.id === selectedId);
    onPartySelected(selected || null);
  };

  const handleClearSelection = () => {
    setSelectedId(null);
    onPartySelected(null);
  };

  const renderCandidateItem = ({item}: {item: NeutralPartyCandidate}) => (
    <TouchableOpacity
      style={styles.candidateItem}
      onPress={() => handleSelectParty(item)}>
      <RadioButton
        value={item.id}
        status={selectedId === item.id ? 'checked' : 'unchecked'}
        onPress={() => handleSelectParty(item)}
      />
      
      <Avatar.Text
        size={40}
        label={item.displayName.charAt(0)}
        style={styles.candidateAvatar}
      />
      
      <View style={styles.candidateInfo}>
        <Text style={styles.candidateName}>{item.displayName}</Text>
        {item.email && (
          <Text style={styles.candidateEmail}>{item.email}</Text>
        )}
        
        <View style={styles.candidateMeta}>
          {item.trustScore && (
            <View style={styles.trustScore}>
              <Icon name="star" size={12} color={theme.colors.accent} />
              <Text style={styles.trustScoreText}>
                {item.trustScore.toFixed(1)}
              </Text>
            </View>
          )}
          
          {item.isContact && (
            <Chip mode="outlined" compact style={styles.sourceChip}>
              Contact
            </Chip>
          )}
          
          {item.isFacebookFriend && (
            <Chip mode="outlined" compact style={styles.sourceChip}>
              Facebook
            </Chip>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="account-tie-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Neutral Parties Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? 'No matches found for your search.'
          : 'Invite friends to the app to have more neutral party options.'}
      </Text>
    </View>
  );

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Neutral Party</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Select someone who isn't participating in the bet to make the final decision on who wins.
      </Text>

      <Searchbar
        placeholder="Search for neutral party..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {selectedId && (
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            Selected: {candidates.find(c => c.id === selectedId)?.displayName}
          </Text>
          <Button
            mode="text"
            onPress={handleClearSelection}
            compact>
            Clear
          </Button>
        </View>
      )}

      <FlatList
        data={filteredCandidates}
        renderItem={renderCandidateItem}
        keyExtractor={item => item.id}
        style={styles.candidatesList}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          The neutral party will be notified and can decide the winner when the bet is ready for resolution.
        </Text>
        
        <View style={styles.footerButtons}>
          <Button
            mode="outlined"
            onPress={onClose}
            style={styles.footerButton}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirmSelection}
            disabled={!selectedId}
            style={styles.footerButton}>
            Confirm Selection
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
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    padding: 16,
    paddingTop: 8,
  },
  searchBar: {
    margin: 16,
    elevation: 0,
    backgroundColor: theme.colors.surface,
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectionText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  candidatesList: {
    flex: 1,
  },
  candidateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  candidateAvatar: {
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  candidateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  candidateEmail: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  candidateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  trustScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustScoreText: {
    fontSize: 12,
    color: theme.colors.accent,
    marginLeft: 2,
    fontWeight: '600',
  },
  sourceChip: {
    height: 20,
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});

export default NeutralPartyPicker;
