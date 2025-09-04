import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  TextInput,
  Button,
  HelperText,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAdmin} from '../../contexts/AdminContext';
import {theme} from '../../theme/theme';

type AdminStackParamList = {
  AdminLogin: undefined;
  TierManagement: undefined;
};

type AdminLoginScreenNavigationProp = StackNavigationProp<AdminStackParamList, 'AdminLogin'>;

interface Props {
  navigation: AdminLoginScreenNavigationProp;
}

const AdminLoginScreen: React.FC<Props> = ({navigation}) => {
  const {signInAsAdmin, loading} = useAdmin();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      await signInAsAdmin(formData.email, formData.password);
      navigation.navigate('TierManagement');
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'admin@betbuddies.com',
      password: 'admin123',
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="shield-crown" size={64} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Admin Portal</Text>
          <Text style={styles.subtitle}>
            Manage subscription tiers, features, and analytics
          </Text>
        </View>

        {/* Login Form */}
        <Surface style={styles.formCard}>
          <Text style={styles.formTitle}>Sign In</Text>
          
          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={!!errors.email}
            left={<TextInput.Icon icon="email" />}
          />
          {errors.email && (
            <HelperText type="error" visible={true}>
              {errors.email}
            </HelperText>
          )}

          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            autoComplete="password"
            error={!!errors.password}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          {errors.password && (
            <HelperText type="error" visible={true}>
              {errors.password}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSignIn}
            loading={loading}
            disabled={loading}
            style={styles.signInButton}>
            Sign In
          </Button>

          {/* Demo Login */}
          <View style={styles.demoSection}>
            <Text style={styles.demoText}>Demo Credentials:</Text>
            <Button
              mode="outlined"
              onPress={handleDemoLogin}
              style={styles.demoButton}
              compact>
              Use Demo Login
            </Button>
          </View>
        </Surface>

        {/* Security Notice */}
        <Surface style={styles.securityNotice}>
          <View style={styles.securityHeader}>
            <Icon name="shield-check" size={20} color={theme.colors.success} />
            <Text style={styles.securityTitle}>Secure Access</Text>
          </View>
          <Text style={styles.securityText}>
            Admin access is protected with enterprise-grade security. 
            All actions are logged and monitored.
          </Text>
        </Surface>

        {/* Features List */}
        <Surface style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Admin Capabilities</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Icon name="cog" size={16} color={theme.colors.primary} />
              <Text style={styles.featureText}>Manage subscription tiers</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Icon name="currency-usd" size={16} color={theme.colors.primary} />
              <Text style={styles.featureText}>Configure pricing and features</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Icon name="chart-line" size={16} color={theme.colors.primary} />
              <Text style={styles.featureText}>View analytics and metrics</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Icon name="account-group" size={16} color={theme.colors.primary} />
              <Text style={styles.featureText}>Monitor user engagement</Text>
            </View>
          </View>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  signInButton: {
    marginTop: 16,
    paddingVertical: 4,
  },
  demoSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  demoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  demoButton: {
    paddingHorizontal: 16,
  },
  securityNotice: {
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    marginBottom: 16,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },
  securityText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  featuresCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },
});

export default AdminLoginScreen;
