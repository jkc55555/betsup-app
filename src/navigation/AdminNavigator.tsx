import React from 'react';
import {View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, Surface, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAdmin} from '../contexts/AdminContext';
import {theme} from '../theme/theme';

// Admin Screens
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import TierManagementScreen from '../screens/admin/TierManagementScreen';
import EditTierScreen from '../screens/admin/EditTierScreen';
import FeatureManagementScreen from '../screens/admin/FeatureManagementScreen';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';

export type AdminStackParamList = {
  AdminLogin: undefined;
  AdminTabs: undefined;
  TierManagement: undefined;
  EditTier: {tierId?: string};
  FeatureManagement: undefined;
  Analytics: undefined;
};

export type AdminTabParamList = {
  Tiers: undefined;
  Features: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<AdminStackParamList>();
const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminTabs = () => {
  const {signOutAdmin} = useAdmin();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Tiers':
              iconName = focused ? 'layers' : 'layers-outline';
              break;
            case 'Features':
              iconName = focused ? 'cog' : 'cog-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'chart-line' : 'chart-line-variant';
              break;
            case 'Settings':
              iconName = focused ? 'account-cog' : 'account-cog-outline';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}>
      
      <Tab.Screen 
        name="Tiers" 
        component={TierManagementScreen}
        options={{
          title: 'Tier Management',
          headerRight: () => (
            <Icon 
              name="logout" 
              size={24} 
              color={theme.colors.text}
              style={{marginRight: 16}}
              onPress={signOutAdmin}
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Features" 
        component={FeatureManagementScreen}
        options={{
          title: 'Feature Management',
        }}
      />
      
      <Tab.Screen 
        name="Analytics" 
        component={AdminAnalyticsScreen}
        options={{
          title: 'Analytics Dashboard',
        }}
      />
      
      <Tab.Screen 
        name="Settings" 
        component={AdminSettingsScreen}
        options={{
          title: 'Admin Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// Simple admin settings screen
const AdminSettingsScreen = () => {
  const {adminUser, signOutAdmin} = useAdmin();

  return (
    <View style={{flex: 1, padding: 16, backgroundColor: theme.colors.background}}>
      <Surface style={{padding: 16, borderRadius: 12, elevation: 2, marginBottom: 16}}>
        <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 8}}>
          Admin Profile
        </Text>
        <Text style={{fontSize: 16, marginBottom: 4}}>
          {adminUser?.displayName}
        </Text>
        <Text style={{fontSize: 14, color: theme.colors.textSecondary, marginBottom: 4}}>
          {adminUser?.email}
        </Text>
        <Text style={{fontSize: 12, color: theme.colors.textSecondary}}>
          Role: {adminUser?.role?.replace('_', ' ').toUpperCase()}
        </Text>
      </Surface>

      <Surface style={{padding: 16, borderRadius: 12, elevation: 2, marginBottom: 16}}>
        <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 12}}>
          Permissions
        </Text>
        {adminUser?.permissions.map(permission => (
          <View key={permission} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <Icon name="check-circle" size={16} color={theme.colors.success} />
            <Text style={{marginLeft: 8, fontSize: 14}}>
              {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </View>
        ))}
      </Surface>

      <Button
        mode="contained"
        onPress={signOutAdmin}
        icon="logout"
        style={{backgroundColor: theme.colors.error}}>
        Sign Out
      </Button>
    </View>
  );
};

const AdminNavigator = () => {
  const {isAdminAuthenticated} = useAdmin();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      
      {!isAdminAuthenticated ? (
        <Stack.Screen 
          name="AdminLogin" 
          component={AdminLoginScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : (
        <>
          <Stack.Screen 
            name="AdminTabs" 
            component={AdminTabs}
            options={{
              headerShown: false,
            }}
          />
          
          <Stack.Screen 
            name="EditTier" 
            component={EditTierScreen}
            options={{
              title: 'Edit Tier',
              presentation: 'modal',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AdminNavigator;
