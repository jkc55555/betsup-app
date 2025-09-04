import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider as PaperProvider} from 'react-native-paper';
import {AuthProvider} from './src/contexts/AuthContext';
import {BetProvider} from './src/contexts/BetContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import {useAuth} from './src/contexts/AuthContext';
import {theme} from './src/theme/theme';

const Stack = createStackNavigator();

const AppContent = () => {
  const {user, loading} = useAuth();

  if (loading) {
    return null; // Add loading screen component here
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <BetProvider>
          <AppContent />
        </BetProvider>
      </AuthProvider>
    </PaperProvider>
  );
};

export default App;
