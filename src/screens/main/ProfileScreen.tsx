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
  Button,
  Avatar,
  TextInput,
  Switch,
  Divider,
  List,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useAuth} from '../../contexts/AuthContext';
import {useBets} from '../../contexts/BetContext';
import {theme} from '../../theme/theme';

type ProfileScreenNavigationProp = StackNavigationProp<MainStackParamList, 'MainTabs'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({navigation}) => {
  const {user, signOut, updateProfile} = useAuth();
  const {bets} = useBets();
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [venmoUsername, setVenmoUsername] = useState(user?.venmoUsername || '');
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const completedBets = bets.filter(bet => bet.status === 'completed').length;
  const wonBets = bets.filter(bet => 
    bet.status === 'completed' && 
    bet.participants.find(p => p.userId === user.id)?.side === bet.winner
  ).length;
  const winRate = completedBets > 0 ? Math.round((wonBets / completedBets) * 100) : 0;

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        venmoUsername: venmoUsername.trim(),
      });
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Surface style={styles.headerCard}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user.displayName?.charAt(0) || 'U'}
            style={styles.avatar}
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            
            {user.isPremium && (
              <View style={styles.premiumBadge}>
                <Icon name="crown" size={16} color={theme.colors.accent} />
                <Text style={styles.premiumText}>Premium Member</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setEditMode(!editMode)}
            style={styles.editButton}>
            <Icon name={editMode ? 'close' : 'pencil'} size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {editMode && (
          <View style={styles.editForm}>
            <TextInput
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Venmo Username (Optional)"
              value={venmoUsername}
              onChangeText={setVenmoUsername}
              mode="outlined"
              style={styles.input}
              placeholder="@username"
            />

            <View style={styles.editButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setEditMode(false);
                  setDisplayName(user.displayName || '');
                  setVenmoUsername(user.venmoUsername || '');
                }}
                style={styles.editButton}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveProfile}
                loading={loading}
                style={styles.editButton}>
                Save
              </Button>
            </View>
          </View>
        )}
      </Surface>

      {/* Stats */}
      <Surface style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Betting Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{bets.length}</Text>
            <Text style={styles.statLabel}>Total Bets</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{wonBets}</Text>
            <Text style={styles.statLabel}>Bets Won</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>
      </Surface>

      {/* Settings */}
      <Surface style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Get notified about bet updates and payments
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>

        <Divider style={styles.divider} />

        <List.Item
          title="Payment Methods"
          description="Manage your Venmo and other payment options"
          left={props => <List.Icon {...props} icon="credit-card" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to payment methods */}}
        />

        <List.Item
          title="Privacy & Security"
          description="Manage your account privacy settings"
          left={props => <List.Icon {...props} icon="shield-account" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to privacy settings */}}
        />

        {!user.isPremium && (
          <>
            <Divider style={styles.divider} />
            <List.Item
              title="Upgrade to Premium"
              description="Unlock tabs, bill splitting, and more features"
              left={props => <List.Icon {...props} icon="crown" color={theme.colors.accent} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Subscription')}
            />
          </>
        )}
      </Surface>

      {/* Support & Legal */}
      <Surface style={styles.supportCard}>
        <Text style={styles.sectionTitle}>Support & Legal</Text>
        
        <List.Item
          title="Help & Support"
          left={props => <List.Icon {...props} icon="help-circle" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to help */}}
        />

        <List.Item
          title="Terms of Service"
          left={props => <List.Icon {...props} icon="file-document" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to terms */}}
        />

        <List.Item
          title="Privacy Policy"
          left={props => <List.Icon {...props} icon="shield-check" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to privacy policy */}}
        />

        <List.Item
          title="About BetBuddies"
          left={props => <List.Icon {...props} icon="information" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to about */}}
        />
      </Surface>

      {/* Sign Out */}
      <Button
        mode="outlined"
        onPress={handleSignOut}
        style={styles.signOutButton}
        textColor={theme.colors.error}
        icon="logout">
        Sign Out
      </Button>

      <Text style={styles.versionText}>
        BetBuddies v1.0.0
      </Text>
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
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  email: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accent,
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
  },
  editForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    marginBottom: 16,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCard: {
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
  settingsCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    marginHorizontal: 16,
  },
  supportCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  signOutButton: {
    marginBottom: 16,
    borderColor: theme.colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
});

export default ProfileScreen;
