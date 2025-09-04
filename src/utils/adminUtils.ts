import {EditableTier, FeatureDefinition, TierAnalytics, TierFeatureValue} from '../types/admin';
import {UserTier} from '../types/subscription';

// Tier Utilities
export class TierUtils {
  /**
   * Calculate yearly discount percentage
   */
  static calculateYearlyDiscount(monthlyPrice: number, yearlyPrice: number): number {
    if (monthlyPrice === 0 || yearlyPrice === 0) return 0;
    const annualFromMonthly = monthlyPrice * 12;
    return Math.round(((annualFromMonthly - yearlyPrice) / annualFromMonthly) * 100);
  }

  /**
   * Generate tier name from display name
   */
  static generateTierName(displayName: string): string {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  }

  /**
   * Validate tier pricing
   */
  static validatePricing(monthlyPrice: number, yearlyPrice: number): {valid: boolean; errors: string[]} {
    const errors: string[] = [];

    if (monthlyPrice < 0) {
      errors.push('Monthly price cannot be negative');
    }

    if (yearlyPrice < 0) {
      errors.push('Yearly price cannot be negative');
    }

    if (monthlyPrice > 0 && yearlyPrice > 0) {
      const annualFromMonthly = monthlyPrice * 12;
      if (yearlyPrice >= annualFromMonthly) {
        errors.push('Yearly price should be less than 12x monthly price to provide savings');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Compare two tiers for differences
   */
  static compareTiers(tier1: EditableTier, tier2: EditableTier): {
    pricing: boolean;
    features: boolean;
    marketing: boolean;
    visual: boolean;
  } {
    return {
      pricing: tier1.monthlyPrice !== tier2.monthlyPrice || tier1.yearlyPrice !== tier2.yearlyPrice,
      features: JSON.stringify(tier1.features) !== JSON.stringify(tier2.features),
      marketing: JSON.stringify(tier1.highlights) !== JSON.stringify(tier2.highlights) ||
                JSON.stringify(tier1.upgradePrompt) !== JSON.stringify(tier2.upgradePrompt),
      visual: tier1.color !== tier2.color || tier1.icon !== tier2.icon
    };
  }

  /**
   * Get tier upgrade path
   */
  static getUpgradePath(tiers: EditableTier[]): EditableTier[] {
    return tiers
      .filter(tier => tier.isActive)
      .sort((a, b) => a.monthlyPrice - b.monthlyPrice);
  }

  /**
   * Calculate tier value score (features per dollar)
   */
  static calculateTierValue(tier: EditableTier): number {
    if (tier.monthlyPrice === 0) return Infinity; // Free tier has infinite value
    
    const enabledFeatures = tier.features.filter(f => f.enabled).length;
    return enabledFeatures / tier.monthlyPrice;
  }

  /**
   * Generate tier comparison matrix
   */
  static generateComparisonMatrix(tiers: EditableTier[], features: FeatureDefinition[]): any[][] {
    const sortedTiers = tiers.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    const matrix: any[][] = [];

    // Header row
    matrix.push(['Feature', ...sortedTiers.map(t => t.displayName)]);

    // Feature rows
    features.forEach(feature => {
      const row = [feature.displayName];
      
      sortedTiers.forEach(tier => {
        const tierFeature = tier.features.find(f => f.featureId === feature.id);
        if (!tierFeature || !tierFeature.enabled) {
          row.push('❌');
        } else {
          switch (feature.type) {
            case 'boolean':
              row.push(tierFeature.value ? '✅' : '❌');
              break;
            case 'limit':
              row.push(tierFeature.value === 'unlimited' ? '∞' : tierFeature.value);
              break;
            case 'access_list':
              const options = tierFeature.value as string[];
              row.push(options?.length || 0);
              break;
            default:
              row.push('✅');
          }
        }
      });
      
      matrix.push(row);
    });

    return matrix;
  }
}

// Feature Utilities
export class FeatureUtils {
  /**
   * Validate feature configuration
   */
  static validateFeature(feature: Partial<FeatureDefinition>): {valid: boolean; errors: string[]} {
    const errors: string[] = [];

    if (!feature.name?.trim()) {
      errors.push('Feature name is required');
    } else if (!/^[a-z][a-z0-9_]*$/.test(feature.name)) {
      errors.push('Feature name must start with a letter and contain only lowercase letters, numbers, and underscores');
    }

    if (!feature.displayName?.trim()) {
      errors.push('Display name is required');
    }

    if (!feature.description?.trim()) {
      errors.push('Description is required');
    }

    if (feature.type === 'access_list' && (!feature.availableOptions || feature.availableOptions.length === 0)) {
      errors.push('Access list features must have at least one available option');
    }

    if (feature.priority !== undefined && (feature.priority < 0 || feature.priority > 1000)) {
      errors.push('Priority must be between 0 and 1000');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate default feature value based on type
   */
  static generateDefaultValue(feature: FeatureDefinition): any {
    switch (feature.type) {
      case 'boolean':
        return false;
      case 'limit':
        return 0;
      case 'access_list':
        return [];
      default:
        return null;
    }
  }

  /**
   * Check if feature value is valid for type
   */
  static isValidFeatureValue(feature: FeatureDefinition, value: any): boolean {
    switch (feature.type) {
      case 'boolean':
        return typeof value === 'boolean';
      case 'limit':
        return typeof value === 'number' || value === 'unlimited';
      case 'access_list':
        return Array.isArray(value) && 
               value.every(v => feature.availableOptions?.includes(v));
      default:
        return true;
    }
  }

  /**
   * Format feature value for display
   */
  static formatFeatureValue(feature: FeatureDefinition, value: any): string {
    switch (feature.type) {
      case 'boolean':
        return value ? 'Enabled' : 'Disabled';
      case 'limit':
        return value === 'unlimited' ? 'Unlimited' : value.toString();
      case 'access_list':
        const options = value as string[];
        return options?.length ? `${options.length} options` : 'None';
      default:
        return value?.toString() || 'Not set';
    }
  }

  /**
   * Get features by category
   */
  static getFeaturesByCategory(features: FeatureDefinition[]): Record<string, FeatureDefinition[]> {
    return features.reduce((acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    }, {} as Record<string, FeatureDefinition[]>);
  }

  /**
   * Calculate feature adoption rate across tiers
   */
  static calculateFeatureAdoption(featureId: string, tiers: EditableTier[]): number {
    const activeTiers = tiers.filter(t => t.isActive);
    const tiersWithFeature = activeTiers.filter(tier => 
      tier.features.some(f => f.featureId === featureId && f.enabled)
    );
    
    return activeTiers.length > 0 ? tiersWithFeature.length / activeTiers.length : 0;
  }
}

// Analytics Utilities
export class AnalyticsUtils {
  /**
   * Calculate growth rate
   */
  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 1 : 0;
    return (current - previous) / previous;
  }

  /**
   * Calculate customer lifetime value
   */
  static calculateLTV(monthlyRevenue: number, churnRate: number): number {
    if (churnRate === 0) return Infinity;
    return monthlyRevenue / churnRate;
  }

  /**
   * Calculate conversion funnel
   */
  static calculateConversionFunnel(analytics: Record<string, TierAnalytics>): {
    step: string;
    count: number;
    rate: number;
  }[] {
    const freeUsers = analytics.free?.totalSubscribers || 0;
    const paidUsers = Object.entries(analytics)
      .filter(([tier]) => tier !== 'free')
      .reduce((sum, [, data]) => sum + data.totalSubscribers, 0);

    const totalUsers = freeUsers + paidUsers;
    const conversionRate = totalUsers > 0 ? paidUsers / totalUsers : 0;

    return [
      {step: 'Total Users', count: totalUsers, rate: 1.0},
      {step: 'Free Users', count: freeUsers, rate: freeUsers / totalUsers},
      {step: 'Paid Users', count: paidUsers, rate: conversionRate},
    ];
  }

  /**
   * Calculate tier performance score
   */
  static calculateTierPerformance(analytics: TierAnalytics): number {
    // Weighted score based on multiple factors
    const revenueWeight = 0.4;
    const growthWeight = 0.3;
    const churnWeight = 0.2;
    const upgradeWeight = 0.1;

    const revenueScore = Math.min(analytics.monthlyRevenue / 1000, 1); // Normalize to $1000
    const growthScore = Math.min(analytics.newSubscribersThisMonth / 100, 1); // Normalize to 100 new users
    const churnScore = 1 - Math.min(analytics.churnRate, 1); // Lower churn is better
    const upgradeScore = Math.min(analytics.upgradeRate, 1);

    return (
      revenueScore * revenueWeight +
      growthScore * growthWeight +
      churnScore * churnWeight +
      upgradeScore * upgradeWeight
    );
  }

  /**
   * Generate analytics summary
   */
  static generateAnalyticsSummary(analytics: Record<string, TierAnalytics>): {
    totalRevenue: number;
    totalSubscribers: number;
    averageChurn: number;
    averageUpgradeRate: number;
    topPerformingTier: string;
    insights: string[];
  } {
    const tiers = Object.entries(analytics);
    
    const totalRevenue = tiers.reduce((sum, [, data]) => sum + data.monthlyRevenue, 0);
    const totalSubscribers = tiers.reduce((sum, [, data]) => sum + data.totalSubscribers, 0);
    const averageChurn = tiers.reduce((sum, [, data]) => sum + data.churnRate, 0) / tiers.length;
    const averageUpgradeRate = tiers.reduce((sum, [, data]) => sum + data.upgradeRate, 0) / tiers.length;
    
    const topPerformingTier = tiers
      .sort(([, a], [, b]) => this.calculateTierPerformance(b) - this.calculateTierPerformance(a))[0]?.[0] || '';

    const insights: string[] = [];
    
    if (averageChurn > 0.1) {
      insights.push('High churn rate detected - consider improving retention strategies');
    }
    
    if (averageUpgradeRate < 0.05) {
      insights.push('Low upgrade rate - consider improving tier value propositions');
    }
    
    const freeTier = analytics.free;
    if (freeTier && freeTier.totalSubscribers > totalSubscribers * 0.8) {
      insights.push('High percentage of free users - consider improving conversion funnel');
    }

    return {
      totalRevenue,
      totalSubscribers,
      averageChurn,
      averageUpgradeRate,
      topPerformingTier,
      insights
    };
  }

  /**
   * Format analytics for export
   */
  static formatForExport(analytics: Record<string, TierAnalytics>, format: 'csv' | 'json'): string {
    const data = Object.entries(analytics).map(([tierId, data]) => ({
      tier: tierId,
      subscribers: data.totalSubscribers,
      newSubscribers: data.newSubscribersThisMonth,
      revenue: data.monthlyRevenue,
      churn: data.churnRate,
      upgradeRate: data.upgradeRate,
      ltv: data.averageLifetimeValue,
      supportTickets: data.supportTicketsPerUser,
      resolutionTime: data.averageResolutionTime,
    }));

    if (format === 'csv') {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      return [headers, ...rows].join('\n');
    }

    return JSON.stringify(data, null, 2);
  }
}

// Validation Utilities
export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate color hex code
   */
  static isValidHexColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  /**
   * Validate tier name
   */
  static isValidTierName(name: string): boolean {
    const nameRegex = /^[a-z][a-z0-9_]*$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
  }

  /**
   * Sanitize input string
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate price range
   */
  static isValidPrice(price: number): boolean {
    return price >= 0 && price <= 9999.99 && Number.isFinite(price);
  }
}

// Export Utilities
export class ExportUtils {
  /**
   * Generate CSV from data
   */
  static generateCSV(data: any[], filename: string): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  /**
   * Generate PDF report metadata
   */
  static generatePDFMetadata(analytics: Record<string, TierAnalytics>): {
    title: string;
    subject: string;
    author: string;
    creator: string;
    producer: string;
    creationDate: Date;
    modDate: Date;
  } {
    return {
      title: 'BetBuddies Analytics Report',
      subject: 'Subscription Tier Performance Analysis',
      author: 'BetBuddies Admin System',
      creator: 'BetBuddies Analytics Engine',
      producer: 'BetBuddies PDF Generator',
      creationDate: new Date(),
      modDate: new Date(),
    };
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  static formatPercentage(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  /**
   * Format large numbers with abbreviations
   */
  static formatLargeNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }
}

// Date Utilities
export class DateUtils {
  /**
   * Get date range for analytics period
   */
  static getDateRange(period: '7d' | '30d' | '90d' | '1y'): {start: Date; end: Date} {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    return {start, end};
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date, format: 'short' | 'long' | 'time' = 'short'): string {
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'long':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'time':
        return date.toLocaleString();
      default:
        return date.toLocaleDateString();
    }
  }

  /**
   * Get relative time string
   */
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return this.formatDate(date);
  }
}
