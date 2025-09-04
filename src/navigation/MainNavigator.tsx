import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme/theme';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import BetsScreen from '../screens/main/BetsScreen';
import GroupsScreen from '../screens/main/GroupsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CreateBetScreen from '../screens/bets/CreateBetScreen';
import BetDetailsScreen from '../screens/bets/BetDetailsScreen';
import PaymentScreen from '../screens/payments/PaymentScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import TabsScreen from '../screens/tabs/TabsScreen';
import BillSplittingScreen from '../screens/bills/BillSplittingScreen';
import CreateSeriesScreen from '../screens/series/CreateSeriesScreen';
import SeriesDetailsScreen from '../screens/series/SeriesDetailsScreen';

export type MainTabParamList = {
  Home: undefined;
  Bets: undefined;
  Groups: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  CreateBet: undefined;
  CreateSeries: undefined;
  BetDetails: {betId: string};
  SeriesDetails: {seriesId: string};
  SeriesPicks: {seriesId: string};
  Payment: {requestId: string};
  Subscription: undefined;
  Tabs: undefined;
  BillSplitting: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Bets':
              iconName = focused ? 'handshake' : 'handshake-outline';
              break;
            case 'Groups':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
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
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bets" component={BetsScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{headerShown: false}} 
      />
      <Stack.Screen 
        name="CreateBet" 
        component={CreateBetScreen}
        options={{title: 'Create Bet'}}
      />
      <Stack.Screen 
        name="BetDetails" 
        component={BetDetailsScreen}
        options={{title: 'Bet Details'}}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{title: 'Payment'}}
      />
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{title: 'Premium Subscription'}}
      />
      <Stack.Screen 
        name="Tabs" 
        component={TabsScreen}
        options={{title: 'Tabs'}}
      />
      <Stack.Screen 
        name="BillSplitting" 
        component={BillSplittingScreen}
        options={{title: 'Split Bill'}}
      />
      <Stack.Screen 
        name="CreateSeries" 
        component={CreateSeriesScreen}
        options={{title: 'Create Series'}}
      />
      <Stack.Screen 
        name="SeriesDetails" 
        component={SeriesDetailsScreen}
        options={{title: 'Series Details'}}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
