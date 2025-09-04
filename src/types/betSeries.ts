import {BetTemplateType} from './betTemplates';

export type BetSeriesType = 
  | 'office_pool'
  | 'game_day_props'
  | 'tournament_series'
  | 'weekly_picks'
  | 'season_long'
  | 'custom_series';

export type ScoringMethod = 
  | 'points_per_correct'
  | 'weighted_scoring'
  | 'confidence_points'
  | 'elimination_style'
  | 'percentage_based';

export interface BetSeriesScoring {
  method: ScoringMethod;
  pointsPerCorrect?: number;
  bonusPoints?: {
    perfectWeek?: number;
    streakBonus?: number;
    difficultyMultiplier?: boolean;
  };
  weights?: {
    [betId: string]: number;
  };
  confidenceRange?: {
    min: number;
    max: number;
  };
}

export interface SeriesBet {
  id: string;
  title: string;
  description: string;
  template: BetTemplateType;
  templateData: any;
  sides: string[];
  resolutionType: 'neutral_party' | 'everyone_agrees' | 'automatic';
  deadline?: Date;
  weight?: number; // For weighted scoring
  difficulty?: 'easy' | 'medium' | 'hard'; // For difficulty multipliers
  status: 'pending' | 'active' | 'resolved' | 'cancelled';
  winner?: string;
  resolvedAt?: Date;
  order: number; // Display order within series
}

export interface BetSeries {
  id: string;
  title: string;
  description: string;
  type: BetSeriesType;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Series configuration
  bets: SeriesBet[];
  scoring: BetSeriesScoring;
  participants: SeriesParticipant[];
  
  // Timing and lifecycle
  startDate: Date;
  endDate?: Date;
  registrationDeadline?: Date;
  status: 'draft' | 'registration_open' | 'active' | 'completed' | 'cancelled';
  
  // Series rules
  entryFee?: number;
  currency: string;
  maxParticipants?: number;
  minParticipants: number;
  allowLateEntry: boolean;
  
  // Payout structure
  payoutStructure: {
    first: number; // Percentage
    second?: number;
    third?: number;
    participationRefund?: number; // Refund percentage for completing all bets
  };
  
  // Social features
  isPublic: boolean;
  inviteCode?: string;
  tags: string[];
  
  // Metadata
  totalPot: number;
  facilitationFee: number;
  isPremium: boolean; // Premium series have advanced features
}

export interface SeriesParticipant {
  userId: string;
  displayName: string;
  photoURL?: string;
  joinedAt: Date;
  
  // Participant state
  status: 'registered' | 'active' | 'eliminated' | 'completed';
  paidEntry: boolean;
  
  // Scoring data
  totalScore: number;
  correctPicks: number;
  totalPicks: number;
  currentStreak: number;
  longestStreak: number;
  
  // Individual bet picks
  picks: {
    [betId: string]: {
      selection: string;
      confidence?: number; // For confidence scoring
      submittedAt: Date;
      isCorrect?: boolean;
      points?: number;
    };
  };
  
  // Rankings
  currentRank: number;
  previousRank?: number;
  
  // Achievements
  achievements: string[]; // 'perfect_week', 'comeback_kid', etc.
}

export interface BetSeriesTemplate {
  id: BetSeriesType;
  name: string;
  description: string;
  icon: string;
  color: string;
  isPremium: boolean;
  
  // Template configuration
  defaultScoring: BetSeriesScoring;
  suggestedBetTemplates: BetTemplateType[];
  minBets: number;
  maxBets?: number;
  
  // Timing defaults
  defaultDuration: number; // Days
  allowCustomDuration: boolean;
  
  // Features
  features: {
    liveUpdates: boolean;
    chatEnabled: boolean;
    achievementsEnabled: boolean;
    confidenceScoring: boolean;
    weightedBets: boolean;
    eliminationStyle: boolean;
  };
  
  // Examples and help
  examples: string[];
  setupGuide: string[];
}

export const BET_SERIES_TEMPLATES: Record<BetSeriesType, BetSeriesTemplate> = {
  office_pool: {
    id: 'office_pool',
    name: 'Office Pool',
    description: 'Weekly office pool with game picks and overall leaderboard',
    icon: 'office-building',
    color: '#3B82F6',
    isPremium: false,
    defaultScoring: {
      method: 'points_per_correct',
      pointsPerCorrect: 1,
      bonusPoints: {
        perfectWeek: 5,
        streakBonus: 2,
      },
    },
    suggestedBetTemplates: ['moneyline', 'spread', 'over_under'],
    minBets: 3,
    maxBets: 16,
    defaultDuration: 7,
    allowCustomDuration: true,
    features: {
      liveUpdates: true,
      chatEnabled: true,
      achievementsEnabled: true,
      confidenceScoring: false,
      weightedBets: false,
      eliminationStyle: false,
    },
    examples: [
      'NFL Sunday games office pool',
      'March Madness weekly picks',
      'College football weekend slate'
    ],
    setupGuide: [
      'Choose 5-12 games for the week',
      'Set entry fee and payout structure',
      'Invite coworkers with share code',
      'Lock picks before first game starts'
    ]
  },

  game_day_props: {
    id: 'game_day_props',
    name: 'Game Day Props',
    description: 'Collection of prop bets and over/unders for a single game',
    icon: 'football',
    color: '#EF4444',
    isPremium: false,
    defaultScoring: {
      method: 'points_per_correct',
      pointsPerCorrect: 1,
    },
    suggestedBetTemplates: ['prop_bet', 'over_under', 'exact_outcome', 'first_to'],
    minBets: 5,
    maxBets: 20,
    defaultDuration: 1,
    allowCustomDuration: false,
    features: {
      liveUpdates: true,
      chatEnabled: true,
      achievementsEnabled: true,
      confidenceScoring: true,
      weightedBets: true,
      eliminationStyle: false,
    },
    examples: [
      'Super Bowl prop bet collection',
      'NBA Finals game props',
      'March Madness championship props'
    ],
    setupGuide: [
      'Create 8-15 prop bets for the game',
      'Set different point values for difficulty',
      'Enable confidence scoring for strategy',
      'Lock all picks before game starts'
    ]
  },

  tournament_series: {
    id: 'tournament_series',
    name: 'Tournament Series',
    description: 'Multi-round tournament with elimination or points accumulation',
    icon: 'trophy',
    color: '#F59E0B',
    isPremium: true,
    defaultScoring: {
      method: 'weighted_scoring',
      bonusPoints: {
        perfectWeek: 10,
        streakBonus: 3,
        difficultyMultiplier: true,
      },
    },
    suggestedBetTemplates: ['bracket', 'moneyline', 'spread', 'pick_em'],
    minBets: 4,
    maxBets: 64,
    defaultDuration: 21,
    allowCustomDuration: true,
    features: {
      liveUpdates: true,
      chatEnabled: true,
      achievementsEnabled: true,
      confidenceScoring: true,
      weightedBets: true,
      eliminationStyle: true,
    },
    examples: [
      'March Madness bracket series',
      'World Cup knockout rounds',
      'Fantasy football playoffs'
    ],
    setupGuide: [
      'Set up tournament bracket structure',
      'Configure round-by-round scoring',
      'Enable elimination or points mode',
      'Set increasing weights per round'
    ]
  },

  weekly_picks: {
    id: 'weekly_picks',
    name: 'Weekly Picks',
    description: 'Recurring weekly competition with season-long leaderboard',
    icon: 'calendar-week',
    color: '#8B5CF6',
    isPremium: true,
    defaultScoring: {
      method: 'confidence_points',
      confidenceRange: {
        min: 1,
        max: 16,
      },
      bonusPoints: {
        perfectWeek: 15,
        streakBonus: 5,
      },
    },
    suggestedBetTemplates: ['moneyline', 'spread', 'over_under'],
    minBets: 8,
    maxBets: 16,
    defaultDuration: 7,
    allowCustomDuration: false,
    features: {
      liveUpdates: true,
      chatEnabled: true,
      achievementsEnabled: true,
      confidenceScoring: true,
      weightedBets: false,
      eliminationStyle: false,
    },
    examples: [
      'NFL confidence pool',
      'College football weekly picks',
      'Premier League weekend games'
    ],
    setupGuide: [
      'Rank games 1-16 by confidence',
      'Higher confidence = more points',
      'Perfect week bonus for all correct',
      'Season-long cumulative scoring'
    ]
  },

  season_long: {
    id: 'season_long',
    name: 'Season Long',
    description: 'Extended competition spanning multiple weeks or months',
    icon: 'calendar-range',
    color: '#059669',
    isPremium: true,
    defaultScoring: {
      method: 'points_per_correct',
      pointsPerCorrect: 1,
      bonusPoints: {
        perfectWeek: 10,
        streakBonus: 3,
        difficultyMultiplier: true,
      },
    },
    suggestedBetTemplates: ['leaderboard', 'milestone', 'pick_em', 'moneyline'],
    minBets: 10,
    maxBets: 100,
    defaultDuration: 120,
    allowCustomDuration: true,
    features: {
      liveUpdates: true,
      chatEnabled: true,
      achievementsEnabled: true,
      confidenceScoring: true,
      weightedBets: true,
      eliminationStyle: false,
    },
    examples: [
      'Fantasy football season',
      'March Madness full tournament',
      'Baseball season predictions'
    ],
    setupGuide: [
      'Plan bets across full season',
      'Set milestone checkpoints',
      'Configure playoff multipliers',
      'Enable mid-season adjustments'
    ]
  },

  custom_series: {
    id: 'custom_series',
    name: 'Custom Series',
    description: 'Build your own series with custom rules and scoring',
    icon: 'cog',
    color: '#6B7280',
    isPremium: false,
    defaultScoring: {
      method: 'points_per_correct',
      pointsPerCorrect: 1,
    },
    suggestedBetTemplates: [], // All templates available
    minBets: 2,
    defaultDuration: 7,
    allowCustomDuration: true,
    features: {
      liveUpdates: true,
      chatEnabled: true,
      achievementsEnabled: false,
      confidenceScoring: false,
      weightedBets: false,
      eliminationStyle: false,
    },
    examples: [
      'Custom office competition',
      'Friend group challenges',
      'Special event betting'
    ],
    setupGuide: [
      'Choose any combination of bet types',
      'Set custom scoring rules',
      'Configure payout structure',
      'Invite participants'
    ]
  }
};

// Achievement definitions
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: (participant: SeriesParticipant, series: BetSeries) => boolean;
}

export const SERIES_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Got every pick correct in a week',
    icon: 'star',
    color: '#F59E0B',
    condition: (participant, series) => {
      // Check if participant had a perfect week
      const weeklyBets = series.bets.filter(bet => bet.status === 'resolved');
      return weeklyBets.every(bet => 
        participant.picks[bet.id]?.isCorrect === true
      );
    }
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Moved from last place to top 3',
    icon: 'trending-up',
    color: '#10B981',
    condition: (participant, series) => {
      return (participant.previousRank || 0) >= series.participants.length - 2 && 
             participant.currentRank <= 3;
    }
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Achieved a 5+ game winning streak',
    icon: 'fire',
    color: '#EF4444',
    condition: (participant, series) => {
      return participant.longestStreak >= 5;
    }
  },
  {
    id: 'underdog_hunter',
    name: 'Underdog Hunter',
    description: 'Correctly picked 3+ underdogs in a week',
    icon: 'target',
    color: '#8B5CF6',
    condition: (participant, series) => {
      // Would need additional logic to track underdog picks
      return false; // Placeholder
    }
  }
];
