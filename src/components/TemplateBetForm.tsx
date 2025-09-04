import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  RadioButton,
  Switch,
  Chip,
  HelperText,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {BetTemplate, BetTemplateField} from '../types/betTemplates';
import {theme} from '../theme/theme';

interface Props {
  template: BetTemplate;
  onSubmit: (betData: any) => void;
  onBack: () => void;
  loading: boolean;
}

interface FormData {
  [key: string]: any;
}

const TemplateBetForm: React.FC<Props> = ({
  template,
  onSubmit,
  onBack,
  loading,
}) => {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resolutionType, setResolutionType] = useState(template.defaultResolutionType);

  useEffect(() => {
    // Initialize form with default values
    const initialData: FormData = {};
    template.fields.forEach(field => {
      if (field.type === 'boolean') {
        initialData[field.id] = false;
      } else if (field.type === 'number') {
        initialData[field.id] = field.min || 0;
      } else {
        initialData[field.id] = '';
      }
    });
    setFormData(initialData);
  }, [template]);

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({...prev, [fieldId]: value}));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({...prev, [fieldId]: ''}));
    }
  };

  const validateField = (field: BetTemplateField, value: any): string | null => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`;
    }

    if (field.type === 'number' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return `${field.label} must be a valid number`;
      }
      if (field.min !== undefined && numValue < field.min) {
        return `${field.label} must be at least ${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        return `${field.label} must be at most ${field.max}`;
      }
    }

    if (field.validation && value && !field.validation.test(value)) {
      return `${field.label} format is invalid`;
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    template.fields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const generateBetSides = (): string[] => {
    // Generate sides based on template and form data
    switch (template.id) {
      case 'winner_loser':
      case 'moneyline':
        return [formData.competitor1 || formData.team1, formData.competitor2 || formData.team2].filter(Boolean);
      
      case 'spread':
        const favorite = formData.favorite;
        const spread = formData.spread_points;
        return [
          `${favorite} -${spread}`,
          `${formData.underdog} +${spread}`
        ];
      
      case 'over_under':
        const threshold = formData.threshold;
        return [`Over ${threshold}`, `Under ${threshold}`];
      
      case 'pick_em':
        return formData.options ? formData.options.split('\n').filter(opt => opt.trim()) : [];
      
      case 'first_to':
        // Sides will be participant names, handled in parent component
        return [];
      
      default:
        return template.defaultSides;
    }
  };

  const generateBetTitle = (): string => {
    switch (template.id) {
      case 'true_false':
        return formData.statement || 'True/False Bet';
      
      case 'yes_no':
        return formData.question || 'Yes/No Bet';
      
      case 'winner_loser':
        return `${formData.competitor1} vs ${formData.competitor2}`;
      
      case 'over_under':
        return `${formData.metric} - Over/Under ${formData.threshold}`;
      
      case 'closest_to':
        return `Closest to: ${formData.target_metric}`;
      
      case 'moneyline':
        return `${formData.team1} vs ${formData.team2} (Moneyline)`;
      
      case 'spread':
        return `${formData.favorite} -${formData.spread_points} vs ${formData.underdog}`;
      
      case 'prop_bet':
        return formData.prop_description || 'Prop Bet';
      
      default:
        return formData.title || formData.question || formData.statement || template.name;
    }
  };

  const generateBetDescription = (): string => {
    switch (template.id) {
      case 'condition_based':
        return `${formData.condition} → ${formData.consequence}`;
      
      case 'milestone':
        return `Goal: ${formData.goal}. Measured by: ${formData.measurement}`;
      
      case 'parlay':
        return `Parlay: ${formData.legs}`;
      
      default:
        return formData.description || formData.event || template.description;
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    const betData = {
      title: generateBetTitle(),
      description: generateBetDescription(),
      sides: generateBetSides(),
      resolutionType,
      template: template.id,
      templateData: formData,
    };

    onSubmit(betData);
  };

  const renderField = (field: BetTemplateField) => {
    const value = formData[field.id];
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <TextInput
              label={field.label}
              value={value || ''}
              onChangeText={(text) => updateFormData(field.id, text)}
              mode="outlined"
              style={styles.input}
              placeholder={field.placeholder}
              multiline={field.id.includes('description') || field.id.includes('legs') || field.id.includes('options')}
              numberOfLines={field.id.includes('description') || field.id.includes('legs') || field.id.includes('options') ? 3 : 1}
              error={!!error}
            />
            {field.helpText && (
              <HelperText type="info" visible={!error}>
                {field.helpText}
              </HelperText>
            )}
            {error && (
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            )}
          </View>
        );

      case 'number':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <TextInput
              label={field.label}
              value={value?.toString() || ''}
              onChangeText={(text) => updateFormData(field.id, text)}
              mode="outlined"
              style={styles.input}
              placeholder={field.placeholder}
              keyboardType="numeric"
              error={!!error}
            />
            {field.helpText && (
              <HelperText type="info" visible={!error}>
                {field.helpText}
              </HelperText>
            )}
            {error && (
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            )}
          </View>
        );

      case 'date':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <TextInput
              label={field.label}
              value={value || ''}
              onChangeText={(text) => updateFormData(field.id, text)}
              mode="outlined"
              style={styles.input}
              placeholder="YYYY-MM-DD"
              error={!!error}
            />
            {field.helpText && (
              <HelperText type="info" visible={!error}>
                {field.helpText}
              </HelperText>
            )}
            {error && (
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            )}
          </View>
        );

      case 'select':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.selectLabel}>{field.label}</Text>
            <RadioButton.Group
              onValueChange={(selectedValue) => updateFormData(field.id, selectedValue)}
              value={value || ''}>
              {field.options?.map(option => (
                <View key={option} style={styles.radioOption}>
                  <RadioButton value={option} />
                  <Text style={styles.radioText}>{option}</Text>
                </View>
              ))}
            </RadioButton.Group>
            {field.helpText && (
              <HelperText type="info">
                {field.helpText}
              </HelperText>
            )}
            {error && (
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            )}
          </View>
        );

      case 'boolean':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{field.label}</Text>
              <Switch
                value={value || false}
                onValueChange={(checked) => updateFormData(field.id, checked)}
              />
            </View>
            {field.helpText && (
              <HelperText type="info">
                {field.helpText}
              </HelperText>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Template Header */}
      <Surface style={styles.headerCard}>
        <View style={styles.templateHeader}>
          <View style={[styles.templateIcon, {backgroundColor: template.color + '20'}]}>
            <Icon name={template.icon} size={32} color={template.color} />
          </View>
          <View style={styles.templateInfo}>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
          </View>
        </View>
      </Surface>

      {/* Dynamic Form Fields */}
      <Surface style={styles.formCard}>
        <Text style={styles.sectionTitle}>Bet Configuration</Text>
        {template.fields.map(renderField)}
      </Surface>

      {/* Resolution Method */}
      {template.resolutionTypes.length > 1 && (
        <Surface style={styles.formCard}>
          <Text style={styles.sectionTitle}>Resolution Method</Text>
          <RadioButton.Group
            onValueChange={setResolutionType}
            value={resolutionType}>
            {template.resolutionTypes.map(type => (
              <View key={type} style={styles.radioOption}>
                <RadioButton value={type} />
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>
                    {type === 'neutral_party' ? 'Neutral Party' : 
                     type === 'everyone_agrees' ? 'Everyone Agrees' : 'Automatic'}
                  </Text>
                  <Text style={styles.radioSubtitle}>
                    {type === 'neutral_party' ? 'Appoint someone to decide the winner' : 
                     type === 'everyone_agrees' ? 'All participants must agree on outcome' : 
                     'Automatically resolved based on external data'}
                  </Text>
                </View>
              </View>
            ))}
          </RadioButton.Group>
        </Surface>
      )}

      {/* Examples */}
      <Surface style={styles.formCard}>
        <Text style={styles.sectionTitle}>Examples</Text>
        {template.examples.map((example, index) => (
          <View key={index} style={styles.exampleItem}>
            <Icon name="lightbulb-outline" size={16} color={theme.colors.accent} />
            <Text style={styles.exampleText}>{example}</Text>
          </View>
        ))}
      </Surface>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={onBack}
          style={styles.backButton}
          disabled={loading}>
          Back to Templates
        </Button>
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}>
          Create Bet
        </Button>
      </View>
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
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  formCard: {
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
  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
  },
  selectLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
  },
  radioContent: {
    marginLeft: 8,
    flex: 1,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  radioSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  backButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default TemplateBetForm;
