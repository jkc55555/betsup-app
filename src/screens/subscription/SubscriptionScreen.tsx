import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MainStackParamList} from '../../navigation/MainNavigator';
import {useAuth} from '../../contexts/AuthContext';
import SubscriptionPlans from '../../components/SubscriptionPlans';
import {UserTier} from '../../types/subscription';
import {theme} from '../../theme/theme';

type SubscriptionScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Subscription'>;

interface Props {
  navigation: SubscriptionScreenNavigationProp;
}

const SubscriptionScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (tier: UserTier, billingCycle: 'monthly' | 'yearly') => {
    setLoading(true);
    
    try {
      // Here you would integrate with your payment processor
      // (Stripe, Apple Pay, Google Pay, etc.)
      
      console.log(`Subscribing to ${tier} plan (${billingCycle})`);
      
      // Mock subscription process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Subscription Successful!',
        `You've successfully upgraded to ${tier}. Enjoy your new features!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
    } catch (error) {
      Alert.alert(
        'Subscription Failed',
        'There was an error processing your subscription. Please try again.',
        [{text: 'OK'}]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SubscriptionPlans
        currentTier={user?.tier || 'free'}
        onSelectPlan={handleSelectPlan}
        onClose={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default SubscriptionScreen;