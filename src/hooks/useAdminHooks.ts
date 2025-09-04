import {useState, useEffect, useCallback, useRef} from 'react';
import {Alert} from 'react-native';
import {useAdmin} from '../contexts/AdminContext';
import {EditableTier, FeatureDefinition, TierAnalytics} from '../types/admin';
import AdminService from '../services/AdminService';
import {TierUtils, FeatureUtils, AnalyticsUtils} from '../utils/adminUtils';

// Tier Management Hook
export const useTierManagement = () => {
  const {tiers, createTier, updateTier, deleteTier, duplicateTier, toggleTierStatus, loading, saving} = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'subscribers' | 'revenue'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredTiers = tiers.filter(tier =>
    tier.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tier.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTiers = [...filteredTiers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.displayName.localeCompare(b.displayName);
        break;
      case 'price':
        comparison = a.monthlyPrice - b.monthlyPrice;
        break;
      case 'subscribers':
        // Would need analytics data here
        comparison = 0;
        break;
      case 'revenue':
        // Would need analytics data here
        comparison = 0;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleCreateTier = useCallback(async (tierData: Omit<EditableTier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const validation = TierUtils.validatePricing(tierData.monthlyPrice, tierData.yearlyPrice);
      if (!validation.valid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return null;
      }

      const tierId = await createTier(tierData);
      Alert.alert('Success', 'Tier created successfully');
      return tierId;
    } catch (error) {
      Alert.alert('Error', 'Failed to create tier');
      return null;
    }
  }, [createTier]);

  const handleUpdateTier = useCallback(async (tierId: string, updates: Partial<EditableTier>) => {
    try {
      if (updates.monthlyPrice !== undefined || updates.yearlyPrice !== undefined) {
        const tier = tiers.find(t => t.id === tierId);
        if (tier) {
          const monthlyPrice = updates.monthlyPrice ?? tier.monthlyPrice;
          const yearlyPrice = updates.yearlyPrice ?? tier.yearlyPrice;
          const validation = TierUtils.validatePricing(monthlyPrice, yearlyPrice);
          
          if (!validation.valid) {
            Alert.alert('Validation Error', validation.errors.join('\n'));
            return false;
          }
        }
      }

      await updateTier(tierId, updates);
      Alert.alert('Success', 'Tier updated successfully');
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to update tier');
      return false;
    }
  }, [updateTier, tiers]);

  const handleDuplicateTier = useCallback(async (tierId: string) => {
    try {
      const newTierId = await duplicateTier(tierId);
      Alert.alert('Success', 'Tier duplicated successfully');
      return newTierId;
    } catch (error) {
      Alert.alert('Error', 'Failed to duplicate tier');
      return null;
    }
  }, [duplicateTier]);

  const handleDeleteTier = useCallback((tierId: string) => {
    Alert.alert(
      'Delete Tier',
      'Are you sure you want to delete this tier? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTier(tierId);
              Alert.alert('Success', 'Tier deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete tier');
            }
          }
        }
      ]
    );
  }, [deleteTier]);

  return {
    tiers: sortedTiers,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    loading,
    saving,
    handleCreateTier,
    handleUpdateTier,
    handleDuplicateTier,
    handleDeleteTier,
    toggleTierStatus,
  };
};

// Feature Management Hook
export const useFeatureManagement = () => {
  const {features, createFeature, updateFeature, deleteFeature, loading, saving} = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuresByCategory = FeatureUtils.getFeaturesByCategory(filteredFeatures);

  const handleCreateFeature = useCallback(async (featureData: Omit<FeatureDefinition, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const validation = FeatureUtils.validateFeature(featureData);
      if (!validation.valid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return null;
      }

      const featureId = await createFeature(featureData);
      Alert.alert('Success', 'Feature created successfully');
      return featureId;
    } catch (error) {
      Alert.alert('Error', 'Failed to create feature');
      return null;
    }
  }, [createFeature]);

  const handleUpdateFeature = useCallback(async (featureId: string, updates: Partial<FeatureDefinition>) => {
    try {
      const feature = features.find(f => f.id === featureId);
      if (feature) {
        const updatedFeature = {...feature, ...updates};
        const validation = FeatureUtils.validateFeature(updatedFeature);
        
        if (!validation.valid) {
          Alert.alert('Validation Error', validation.errors.join('\n'));
          return false;
        }
      }

      await updateFeature(featureId, updates);
      Alert.alert('Success', 'Feature updated successfully');
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to update feature');
      return false;
    }
  }, [updateFeature, features]);

  const handleDeleteFeature = useCallback((featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    
    if (feature?.isCore) {
      Alert.alert('Cannot Delete', 'Core features cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Feature',
      'Are you sure you want to delete this feature? This will remove it from all tiers.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFeature(featureId);
              Alert.alert('Success', 'Feature deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete feature');
            }
          }
        }
      ]
    );
  }, [deleteFeature, features]);

  return {
    features: filteredFeatures,
    featuresByCategory,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    loading,
    saving,
    handleCreateFeature,
    handleUpdateFeature,
    handleDeleteFeature,
  };
};

// Analytics Hook
export const useAnalytics = () => {
  const {analytics, refreshAnalytics, loading} = useAdmin();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [businessMetrics, setBusinessMetrics] = useState<any>(null);

  useEffect(() => {
    loadBusinessMetrics();
  }, [period]);

  const loadBusinessMetrics = useCallback(async () => {
    try {
      const metrics = await AdminService.getBusinessMetrics(period);
      setBusinessMetrics(metrics);
    } catch (error) {
      console.error('Failed to load business metrics:', error);
    }
  }, [period]);

  const analyticsSummary = AnalyticsUtils.generateAnalyticsSummary(analytics);
  const conversionFunnel = AnalyticsUtils.calculateConversionFunnel(analytics);

  const exportAnalytics = useCallback(async (format: 'csv' | 'pdf') => {
    try {
      const downloadUrl = await AdminService.exportAnalytics(format, period);
      Alert.alert('Export Ready', `Your ${format.toUpperCase()} report is ready for download.`);
      return downloadUrl;
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to generate report');
      return null;
    }
  }, [period]);

  return {
    analytics,
    businessMetrics,
    analyticsSummary,
    conversionFunnel,
    period,
    setPeriod,
    loading,
    refreshAnalytics,
    exportAnalytics,
  };
};

// Real-time Updates Hook
export const useRealTimeUpdates = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = AdminService.connectWebSocket((data) => {
      setLastUpdate(new Date());
      
      // Handle different types of real-time updates
      switch (data.type) {
        case 'TIER_UPDATED':
          // Tier was updated by another admin
          break;
        case 'NEW_SUBSCRIBER':
          // New user subscribed
          break;
        case 'ANALYTICS_UPDATED':
          // Analytics data refreshed
          break;
      }
    });

    if (wsRef.current) {
      wsRef.current.onopen = () => setIsConnected(true);
      wsRef.current.onclose = () => setIsConnected(false);
      wsRef.current.onerror = () => setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    lastUpdate,
    connect,
    disconnect,
  };
};

// Form Validation Hook
export const useFormValidation = <T extends Record<string, any>>(
  initialData: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) => {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({...prev, [field]: value}));
    
    // Clear error when user starts editing
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  }, [errors]);

  const touchField = useCallback((field: keyof T) => {
    setTouched(prev => ({...prev, [field]: true}));
  }, []);

  const validateField = useCallback((field: keyof T): boolean => {
    const rule = validationRules[field];
    if (!rule) return true;

    const error = rule(data[field]);
    setErrors(prev => ({...prev, [field]: error || undefined}));
    
    return !error;
  }, [data, validationRules]);

  const validateAll = useCallback(): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field as keyof T];
      const error = rule(data[field as keyof T]);
      
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(data).reduce((acc, key) => ({...acc, [key]: true}), {}));
    
    return isValid;
  }, [data, validationRules]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  const hasErrors = Object.values(errors).some(error => error);
  const isFieldValid = (field: keyof T) => !errors[field] && touched[field];
  const isFieldInvalid = (field: keyof T) => !!errors[field] && touched[field];

  return {
    data,
    errors,
    touched,
    hasErrors,
    updateField,
    touchField,
    validateField,
    validateAll,
    reset,
    isFieldValid,
    isFieldInvalid,
  };
};

// Debounced Search Hook
export const useDebounceSearch = (initialValue: string = '', delay: number = 300) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue, delay]);

  return {
    searchValue,
    debouncedValue,
    setSearchValue,
  };
};

// Pagination Hook
export const usePagination = <T>(
  items: T[],
  itemsPerPage: number = 10
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [totalPages, goToPage]);

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  return {
    currentPage,
    totalPages,
    currentItems,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
  };
};

// Local Storage Hook for Admin Preferences
export const useAdminPreferences = () => {
  const [preferences, setPreferences] = useState({
    theme: 'light' as 'light' | 'dark',
    defaultPeriod: '30d' as '7d' | '30d' | '90d' | '1y',
    itemsPerPage: 10,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AdminService.loadStoredToken(); // Reuse storage logic
      if (stored) {
        // Load preferences from storage
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const updatePreference = useCallback(async (key: keyof typeof preferences, value: any) => {
    const newPreferences = {...preferences, [key]: value};
    setPreferences(newPreferences);
    
    try {
      // Save to storage
      // await AsyncStorage.setItem('adminPreferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, [preferences]);

  return {
    preferences,
    updatePreference,
  };
};
