import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {Button, Text, Surface} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import {theme} from '../../theme/theme';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<Props> = ({navigation}) => {
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎯</Text>
          <Text style={styles.title}>BetBuddies</Text>
          <Text style={styles.subtitle}>
            Friendly bets with friends, fair resolutions, easy payments
          </Text>
        </View>

        <Surface style={styles.card}>
          <Text style={styles.cardTitle}>Ready to make it interesting?</Text>
          <Text style={styles.cardSubtitle}>
            Create bets with friends, get neutral parties to decide winners, 
            and handle payments seamlessly through Venmo.
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.primaryButton}
              labelStyle={styles.buttonLabel}>
              Get Started
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Login')}
              style={styles.secondaryButton}
              labelStyle={styles.secondaryButtonLabel}>
              Sign In
            </Button>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>⚖️</Text>
              <Text style={styles.featureText}>Fair Resolution</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>💰</Text>
              <Text style={styles.featureText}>Easy Payments</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureText}>Group Bets</Text>
            </View>
          </View>
        </Surface>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    paddingVertical: 8,
  },
  secondaryButton: {
    paddingVertical: 8,
    borderColor: theme.colors.primary,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
