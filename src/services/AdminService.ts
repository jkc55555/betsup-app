import AsyncStorage from '@react-native-async-storage/async-storage';
import {EditableTier, FeatureDefinition, TierAnalytics, AdminUser} from '../types/admin';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AdminService {
  private baseUrl: string;
  private adminToken: string | null = null;

  constructor() {
    // In production, use environment variable
    this.baseUrl = __DEV__ 
      ? 'http://localhost:3000/api/admin' 
      : 'https://api.betbuddies.com/admin';
  }

  // Authentication
  async authenticate(email: string, password: string): Promise<AdminUser> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
      });

      const result: ApiResponse<{user: AdminUser; token: string}> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Authentication failed');
      }

      this.adminToken = result.data.token;
      await AsyncStorage.setItem('adminToken', result.data.token);
      
      return result.data.user;
    } catch (error) {
      console.error('Admin authentication error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.adminToken) {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.adminToken = null;
      await AsyncStorage.removeItem('adminToken');
    }
  }

  async loadStoredToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      if (token) {
        this.adminToken = token;
      }
      return token;
    } catch (error) {
      console.error('Error loading stored token:', error);
      return null;
    }
  }

  // Tier Management
  async getTiers(): Promise<EditableTier[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tiers`, {
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponse<EditableTier[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch tiers');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching tiers:', error);
      throw error;
    }
  }

  async createTier(tierData: Omit<EditableTier, 'id' | 'createdAt' | 'updatedAt'>): Promise<EditableTier> {
    try {
      const response = await fetch(`${this.baseUrl}/tiers`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tierData),
      });

      const result: ApiResponse<EditableTier> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create tier');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating tier:', error);
      throw error;
    }
  }

  async updateTier(tierId: string, updates: Partial<EditableTier>): Promise<EditableTier> {
    try {
      const response = await fetch(`${this.baseUrl}/tiers/${tierId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const result: ApiResponse<EditableTier> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update tier');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating tier:', error);
      throw error;
    }
  }

  async deleteTier(tierId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/tiers/${tierId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponse<void> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete tier');
      }
    } catch (error) {
      console.error('Error deleting tier:', error);
      throw error;
    }
  }

  async duplicateTier(tierId: string): Promise<EditableTier> {
    try {
      const response = await fetch(`${this.baseUrl}/tiers/${tierId}/duplicate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponse<EditableTier> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to duplicate tier');
      }

      return result.data;
    } catch (error) {
      console.error('Error duplicating tier:', error);
      throw error;
    }
  }

  // Feature Management
  async getFeatures(): Promise<FeatureDefinition[]> {
    try {
      const response = await fetch(`${this.baseUrl}/features`, {
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponse<FeatureDefinition[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch features');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching features:', error);
      throw error;
    }
  }

  async createFeature(featureData: Omit<FeatureDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeatureDefinition> {
    try {
      const response = await fetch(`${this.baseUrl}/features`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(featureData),
      });

      const result: ApiResponse<FeatureDefinition> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create feature');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating feature:', error);
      throw error;
    }
  }

  async updateFeature(featureId: string, updates: Partial<FeatureDefinition>): Promise<FeatureDefinition> {
    try {
      const response = await fetch(`${this.baseUrl}/features/${featureId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const result: ApiResponse<FeatureDefinition> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update feature');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating feature:', error);
      throw error;
    }
  }

  async deleteFeature(featureId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/features/${featureId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponse<void> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete feature');
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
      throw error;
    }
  }

  // Analytics
  async getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<Record<string, TierAnalytics>> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics?period=${period}`, {
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponse<Record<string, TierAnalytics>> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch analytics');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async getBusinessMetrics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/business?period=${period}`, {
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponse<any> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch business metrics');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching business metrics:', error);
      throw error;
    }
  }

  // Export Functions
  async exportAnalytics(format: 'csv' | 'pdf', period: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/export`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({format, period}),
      });

      const result: ApiResponse<{downloadUrl: string}> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to export analytics');
      }

      return result.data.downloadUrl;
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkUpdateTiers(updates: Array<{id: string; updates: Partial<EditableTier>}>): Promise<EditableTier[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tiers/bulk`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({updates}),
      });

      const result: ApiResponse<EditableTier[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to bulk update tiers');
      }

      return result.data;
    } catch (error) {
      console.error('Error bulk updating tiers:', error);
      throw error;
    }
  }

  // A/B Testing
  async createABTest(config: {
    name: string;
    description: string;
    tierConfigs: EditableTier[];
    trafficSplit: number[];
    duration: number;
  }): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/ab-tests`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(config),
      });

      const result: ApiResponse<{testId: string}> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create A/B test');
      }

      return result.data.testId;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(page: number = 1, limit: number = 50, filters?: any): Promise<{users: any[]; total: number}> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters && {filters: JSON.stringify(filters)})
      });

      const response = await fetch(`${this.baseUrl}/users?${queryParams}`, {
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponse<{users: any[]; total: number}> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async updateUserTier(userId: string, tierId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/tier`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({tierId}),
      });

      const result: ApiResponse<void> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update user tier');
      }
    } catch (error) {
      console.error('Error updating user tier:', error);
      throw error;
    }
  }

  // WebSocket for Real-time Updates
  connectWebSocket(onMessage: (data: any) => void): WebSocket | null {
    try {
      if (!this.adminToken) {
        throw new Error('No admin token available');
      }

      const wsUrl = this.baseUrl.replace('http', 'ws').replace('/api/admin', '/ws/admin');
      const ws = new WebSocket(`${wsUrl}?token=${this.adminToken}`);

      ws.onopen = () => {
        console.log('Admin WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Admin WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Admin WebSocket disconnected');
      };

      return ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      return null;
    }
  }

  // Helper Methods
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.adminToken) {
      headers['Authorization'] = `Bearer ${this.adminToken}`;
    }

    return headers;
  }

  // Validation Helpers
  validateTierData(tier: Partial<EditableTier>): {valid: boolean; errors: string[]} {
    const errors: string[] = [];

    if (!tier.displayName?.trim()) {
      errors.push('Display name is required');
    }

    if (!tier.description?.trim()) {
      errors.push('Description is required');
    }

    if (tier.monthlyPrice !== undefined && tier.monthlyPrice < 0) {
      errors.push('Monthly price cannot be negative');
    }

    if (tier.yearlyPrice !== undefined && tier.yearlyPrice < 0) {
      errors.push('Yearly price cannot be negative');
    }

    if (!tier.color || !/^#[0-9A-F]{6}$/i.test(tier.color)) {
      errors.push('Valid color is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateFeatureData(feature: Partial<FeatureDefinition>): {valid: boolean; errors: string[]} {
    const errors: string[] = [];

    if (!feature.name?.trim()) {
      errors.push('Feature name is required');
    }

    if (!feature.displayName?.trim()) {
      errors.push('Display name is required');
    }

    if (!feature.description?.trim()) {
      errors.push('Description is required');
    }

    if (!feature.category) {
      errors.push('Category is required');
    }

    if (!feature.type) {
      errors.push('Feature type is required');
    }

    if (feature.type === 'access_list' && (!feature.availableOptions || feature.availableOptions.length === 0)) {
      errors.push('Access list features must have available options');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default new AdminService();
