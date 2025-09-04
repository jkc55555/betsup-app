export type BetTemplateCategory = 
  | 'binary'
  | 'range'
  | 'multi_party'
  | 'sports'
  | 'tournament'
  | 'social';

export type BetTemplateType =
  // Binary & Head-to-Head
  | 'true_false'
  | 'yes_no'
  | 'winner_loser'
  // Range & Threshold
  | 'over_under'
  | 'closest_to'
  | 'exact_outcome'
  // Multi-Party & Ranking
  | 'pick_em'
  | 'first_to'
  | 'leaderboard'
  // Sports-Oriented
  | 'moneyline'
  | 'spread'
  | 'parlay'
  | 'prop_bet'
  // Tournament & Group
  | 'bracket'
  | 'round_robin'
  | 'survivor'
  // Social & Lifestyle
  | 'tab_bet'
  | 'condition_based'
  | 'milestone';

export interface BetTemplateField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'multi_select' | 'boolean';
  required: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  validation?: RegExp;
  helpText?: string;
}

import {UserTier} from './subscription';

export interface BetTemplate {
  id: BetTemplateType;
  category: BetTemplateCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  isPremium: boolean;
  requiredTier: UserTier;
  
  // Template configuration
  fields: BetTemplateField[];
  defaultSides: string[];
  allowCustomSides: boolean;
  minParticipants: number;
  maxParticipants?: number;
  
  // Resolution configuration
  resolutionTypes: ('neutral_party' | 'everyone_agrees' | 'automatic')[];
  defaultResolutionType: 'neutral_party' | 'everyone_agrees' | 'automatic';
  
  // UI configuration
  customUI?: string; // Component name for custom UI
  examples: string[];
  
  // Validation rules
  validationRules?: {
    requiresDeadline?: boolean;
    requiresNeutralParty?: boolean;
    requiresExternalData?: boolean;
  };
}

export const BET_TEMPLATES: Record<BetTemplateType, BetTemplate> = {
  // Binary & Head-to-Head
  true_false: {
    id: 'true_false',
    category: 'binary',
    name: 'True / False',
    description: 'Simple true or false prediction',
    icon: 'check-circle-outline',
    color: '#10B981',
    isPremium: false,
    requiredTier: 'free',
    fields: [
      {
        id: 'statement',
        label: 'Statement to Predict',
        type: 'text',
        required: true,
        placeholder: 'Will it rain tomorrow?',
        helpText: 'Enter a clear statement that can be true or false'
      },
      {
        id: 'deadline',
        label: 'Resolution Deadline',
        type: 'date',
        required: true,
        helpText: 'When should this be resolved?'
      }
    ],
    defaultSides: ['True', 'False'],
    allowCustomSides: false,
    minParticipants: 2,
    resolutionTypes: ['neutral_party', 'everyone_agrees'],
    defaultResolutionType: 'neutral_party',
    examples: [
      'Will it rain tomorrow?',
      'Will the stock market close up today?',
      'Will the meeting start on time?'
    ]
  },

  yes_no: {
    id: 'yes_no',
    category: 'binary',
    name: 'Yes / No',
    description: 'Yes or no question bet',
    icon: 'help-circle-outline',
    color: '#3B82F6',
    isPremium: false,
    requiredTier: 'free',
    fields: [
      {
        id: 'question',
        label: 'Yes/No Question',
        type: 'text',
        required: true,
        placeholder: 'Will Josh show up on time?',
        helpText: 'Ask a question that can be answered with yes or no'
      },
      {
        id: 'deadline',
        label: 'Resolution Deadline',
        type: 'date',
        required: true,
        helpText: 'When should this be resolved?'
      }
    ],
    defaultSides: ['Yes', 'No'],
    allowCustomSides: false,
    minParticipants: 2,
    resolutionTypes: ['neutral_party', 'everyone_agrees'],
    defaultResolutionType: 'neutral_party',
    examples: [
      'Will Josh show up on time?',
      'Will Sarah finish the project today?',
      'Will we get pizza for lunch?'
    ]
  },

  winner_loser: {
    id: 'winner_loser',
    category: 'binary',
    name: 'Head-to-Head',
    description: 'Two participants or teams compete',
    icon: 'sword-cross',
    color: '#EF4444',
    isPremium: false,
    fields: [
      {
        id: 'competitor1',
        label: 'Competitor 1',
        type: 'text',
        required: true,
        placeholder: 'Chiefs',
        helpText: 'First competitor or team'
      },
      {
        id: 'competitor2',
        label: 'Competitor 2',
        type: 'text',
        required: true,
        placeholder: 'Bills',
        helpText: 'Second competitor or team'
      },
      {
        id: 'event',
        label: 'Event/Competition',
        type: 'text',
        required: true,
        placeholder: 'Sunday Night Football',
        helpText: 'What are they competing in?'
      },
      {
        id: 'event_date',
        label: 'Event Date',
        type: 'date',
        required: true,
        helpText: 'When does the competition happen?'
      }
    ],
    defaultSides: [], // Will be set from competitor fields
    allowCustomSides: true,
    minParticipants: 2,
    resolutionTypes: ['neutral_party', 'everyone_agrees', 'automatic'],
    defaultResolutionType: 'neutral_party',
    examples: [
      'Chiefs vs. Bills - Who wins?',
      'Lakers vs. Warriors - Sunday game',
      'John vs. Mike - Chess match'
    ]
  },

  // Range & Threshold
  over_under: {
    id: 'over_under',
    category: 'range',
    name: 'Over / Under',
    description: 'Bet on whether a number will be over or under a threshold',
    icon: 'trending-up',
    color: '#F59E0B',
    isPremium: false,
    fields: [
      {
        id: 'metric',
        label: 'What are we measuring?',
        type: 'text',
        required: true,
        placeholder: 'Points scored in the game',
        helpText: 'What metric will be measured?'
      },
      {
        id: 'threshold',
        label: 'Threshold Number',
        type: 'number',
        required: true,
        placeholder: '50',
        min: 0,
        helpText: 'The over/under line'
      },
      {
        id: 'event',
        label: 'Event',
        type: 'text',
        required: true,
        placeholder: 'Lakers vs Warriors game',
        helpText: 'What event will determine the outcome?'
      },
      {
        id: 'event_date',
        label: 'Event Date',
        type: 'date',
        required: true,
        helpText: 'When does the event happen?'
      }
    ],
    defaultSides: ['Over', 'Under'],
    allowCustomSides: false,
    minParticipants: 2,
    resolutionTypes: ['neutral_party', 'everyone_agrees', 'automatic'],
    defaultResolutionType: 'neutral_party',
    examples: [
      'Over/Under 50 points in the game',
      'Over/Under 75°F tomorrow',
      'Over/Under 100 people at the party'
    ]
  },

  closest_to: {
    id: 'closest_to',
    category: 'range',
    name: 'Closest To (Price is Right)',
    description: 'Whoever guesses closest to the actual outcome wins',
    icon: 'target',
    color: '#8B5CF6',
    isPremium: false,
    fields: [
      {
        id: 'target_metric',
        label: 'What are we guessing?',
        type: 'text',
        required: true,
        placeholder: 'Final score of the game',
        helpText: 'What will participants guess?'
      },
      {
        id: 'event',
        label: 'Event',
        type: 'text',
        required: true,
        placeholder: 'Lakers vs Warriors',
        helpText: 'What event will determine the outcome?'
      },
      {
        id: 'event_date',
        label: 'Event Date',
        type: 'date',
        required: true,
        helpText: 'When does the event happen?'
      },
      {
        id: 'price_is_right_rule',
        label: 'Price is Right Rule',
        type: 'boolean',
        required: false,
        helpText: 'Must be under the actual number to win (like Price is Right)'
      }
    ],
    defaultSides: [], // Participants enter their own guesses
    allowCustomSides: true,
    minParticipants: 2,
    maxParticipants: 10,
    resolutionTypes: ['neutral_party', 'automatic'],
    defaultResolutionType: 'neutral_party',
    customUI: 'ClosestToUI',
    examples: [
      'Closest to the final score',
      'Closest to tomorrow\'s temperature',
      'Closest to the number of attendees'
    ]
  },

  exact_outcome: {
    id: 'exact_outcome',
    category: 'range',
    name: 'Exact Outcome',
    description: 'Predict the exact number, score, or outcome',
    icon: 'bullseye',
    color: '#DC2626',
    isPremium: false,
    fields: [
      {
        id: 'outcome_type',
        label: 'What are we predicting exactly?',
        type: 'text',
        required: true,
        placeholder: 'Final score of the game',
        helpText: 'What exact outcome will be predicted?'
      },
      {
        id: 'event',
        label: 'Event',
        type: 'text',
        required: true,
        placeholder: 'Lakers vs Warriors',
        helpText: 'What event will determine the outcome?'
      },
      {
        id: 'event_date',
        label: 'Event Date',
        type: 'date',
        required: true,
        helpText: 'When does the event happen?'
      }
    ],
    defaultSides: [], // Participants enter exact predictions
    allowCustomSides: true,
    minParticipants: 2,
    resolutionTypes: ['neutral_party', 'automatic'],
    defaultResolutionType: 'neutral_party',
    customUI: 'ExactOutcomeUI',
    examples: [
      'Exact final score: 108-95',
      'Exact temperature at noon: 73°F',
      'Exact number of people: 47'
    ]
  },

  // Multi-Party & Ranking
  pick_em: {
    id: 'pick_em',
    category: 'multi_party',
    name: 'Pick \'Em',
    description: 'Multiple choice - pick the winner from a list',
    icon: 'format-list-bulleted',
    color: '#059669',
    isPremium: false,
    fields: [
      {
        id: 'question',
        label: 'What are we picking?',
        type: 'text',
        required: true,
        placeholder: 'Who will win the championship?',
        helpText: 'What question are participants answering?'
      },
      {
        id: 'options',
        label: 'Options (one per line)',
        type: 'text',
        required: true,
        placeholder: 'Lakers\nWarriors\nCeltics\nHeat',
        helpText: 'List all possible choices, one per line'
      },
      {
        id: 'event_date',
        label: 'Resolution Date',
        type: 'date',
        required: true,
        helpText: 'When will we know the answer?'
      }
    ],
    defaultSides: [], // Will be parsed from options field
    allowCustomSides: false,
    minParticipants: 2,
    resolutionTypes: ['neutral_party', 'everyone_agrees'],
    defaultResolutionType: 'neutral_party',
    customUI: 'PickEmUI',
    examples: [
      'Who will win the championship?',
      'Which movie will gross the most?',
      'Who will be the next CEO?'
    ]
  },

  first_to: {
    id: 'first_to',
    category: 'multi_party',
    name: 'First To / Last To',
    description: 'Who will be first (or last) to achieve something',
    icon: 'flag-checkered',
    color: '#7C3AED',
    isPremium: false,
    fields: [
      {
        id: 'achievement',
        label: 'Achievement/Goal',
        type: 'text',
        required: true,
        placeholder: 'Miss a workout this month',
        helpText: 'What will someone be first/last to do?'
      },
      {
        id: 'first_or_last',
        label: 'First or Last?',
        type: 'select',
        required: true,
        options: ['First', 'Last'],
        helpText: 'Are we betting on who\'s first or last?'
      },
      {
        id: 'deadline',
        label: 'Deadline',
        type: 'date',
        required: true,
        helpText: 'When does the period end?'
      }
    ],
    defaultSides: [], // Participants are the sides
    allowCustomSides: true,
    minParticipants: 3,
    resolutionTypes: ['neutral_party', 'everyone_agrees'],
    defaultResolutionType: 'everyone_agrees',
    customUI: 'FirstToUI',
    examples: [
      'First to miss a workout this month',
      'Last to arrive at the party',
      'First to finish the project'
    ]
  },

  leaderboard: {
    id: 'leaderboard',
    category: 'multi_party',
    name: 'Leaderboard / Points',
    description: 'Accumulate points over multiple events',
    icon: 'trophy',
    color: '#F59E0B',
    isPremium: true,
    fields: [
      {
        id: 'competition_name',
        label: 'Competition Name',
        type: 'text',
        required: true,
        placeholder: 'March Madness Predictions',
        helpText: 'Name of the ongoing competition'
      },
      {
        id: 'scoring_system',
        label: 'How are points awarded?',
        type: 'text',
        required: true,
        placeholder: '1 point per correct prediction',
        helpText: 'Explain the scoring system'
      },
      {
        id: 'duration',
        label: 'Competition Duration',
        type: 'text',
        required: true,
        placeholder: '3 weeks',
        helpText: 'How long does this competition last?'
      },
      {
        id: 'end_date',
        label: 'End Date',
        type: 'date',
        required: true,
        helpText: 'When does the competition end?'
      }
    ],
    defaultSides: [], // Participants compete individually
    allowCustomSides: true,
    minParticipants: 3,
    resolutionTypes: ['neutral_party'],
    defaultResolutionType: 'neutral_party',
    customUI: 'LeaderboardUI',
    examples: [
      'March Madness bracket points',
      'Fantasy football season',
      'Daily trivia competition'
    ],
    validationRules: {
      requiresNeutralParty: true
    }
  },

  // Sports-Oriented
  moneyline: {
    id: 'moneyline',
    category: 'sports',
    name: 'Moneyline',
    description: 'Straight winner bet - no spread',
    icon: 'currency-usd',
    color: '#059669',
    isPremium: false,
    fields: [
      {
        id: 'team1',
        label: 'Team 1',
        type: 'text',
        required: true,
        placeholder: 'Lakers',
        helpText: 'First team'
      },
      {
        id: 'team2',
        label: 'Team 2',
        type: 'text',
        required: true,
        placeholder: 'Warriors',
        helpText: 'Second team'
      },
      {
        id: 'game_info',
        label: 'Game Info',
        type: 'text',
        required: true,
        placeholder: 'Sunday Night Basketball',
        helpText: 'Game details'
      },
      {
        id: 'game_date',
        label: 'Game Date',
        type: 'date',
        required: true,
        helpText: 'When is the game?'
      }
    ],
    defaultSides: [], // Will be set from team fields
    allowCustomSides: false,
    minParticipants: 2,
    resolutionTypes: ['neutral_party', 'automatic'],
    defaultResolutionType: 'automatic',
    examples: [
      'Lakers vs Warriors - straight up',
      'Chiefs vs Bills - who wins',
      'Celtics vs Heat - moneyline'
    ]
  },

  spread: {
    id: 'spread',
    category: 'sports',
    name: 'Spread Bet',
    description: 'Team must win by more than the spread',
    icon: 'chart-line',
    color: '#DC2626',
    isPremium: false,
    fields: [
      {
        id: 'favorite',
        label: 'Favorite Team',
        type: 'text',
        required: true,
        placeholder: 'Lakers',
        helpText: 'Team expected to win'
      },
      {
        id: 'underdog',
        label: 'Underdog Team',
        type: 'text',
        required: true,
        placeholder: 'Warriors',
        helpText: 'Team expected to lose'
      },
      {
        id: 'spread_points',
        label: 'Spread (Points)',
        type: 'number',
        required: true,
        placeholder: '7.5',
        min: 0.5,
        max: 50,
        helpText: 'How many points must the favorite win by?'
      },
      {
        id: 'game_info',
        label: 'Game Info',
        type: 'text',
        required: true,
        placeholder: 'Sunday Night Basketball',
        helpText: 'Game details'
      },
      {
        id: 'game_date',
        label: 'Game Date',
        type: 'date',
        required: true,
        helpText: 'When is the game?'
      }
    ],
    defaultSides: [], // Will be "Cover" and "Don't Cover"
    allowCustomSides: false,
    minParticipants: 2,
    resolutionTypes: ['neutral_party', 'automatic'],
    defaultResolutionType: 'automatic',
    customUI: 'SpreadUI',
    examples: [
      'Lakers -7.5 vs Warriors',
      'Chiefs -3 vs Bills',
      'Celtics -5.5 vs Heat'
    ]
  },

  parlay: {
    id: 'parlay',
    category: 'sports',
    name: 'Parlay / Combo',
    description: 'Multiple bets that must all win',
    icon: 'link-variant',
    color: '#7C3AED',
    isPremium: true,
    fields: [
      {
        id: 'parlay_name',
        label: 'Parlay Name',
        type: 'text',
        required: true,
        placeholder: 'Sunday Triple Play',
        helpText: 'Name for this parlay bet'
      },
      {
        id: 'legs',
        label: 'Parlay Legs (one per line)',
        type: 'text',
        required: true,
        placeholder: 'Lakers to win\nOver 220 total points\nLeBron 25+ points',
        helpText: 'List each bet that must hit, one per line'
      },
      {
        id: 'event_date',
        label: 'Resolution Date',
        type: 'date',
        required: true,
        helpText: 'When will all legs be resolved?'
      }
    ],
    defaultSides: ['Parlay Hits', 'Parlay Misses'],
    allowCustomSides: false,
    minParticipants: 2,
    resolutionTypes: ['neutral_party'],
    defaultResolutionType: 'neutral_party',
    customUI: 'ParlayUI',
    examples: [
      'Lakers win + Over 220 + LeBron 25pts',
      'Chiefs win + Under 45 + Mahomes 2 TDs',
      'Three team moneyline parlay'
    ]
  },

  prop_bet: {
    id: 'prop_bet',
    category: 'sports',
    name: 'Prop Bet',
    description: 'Specific in-game occurrences',
    icon: 'dice-multiple',
    color: '#F59E0B',
    isPremium: false,
    fields: [
      {
        id: 'prop_description',
        label: 'Prop Bet Description',
        type: 'text',
        required: true,
        placeholder: 'First touchdown scorer',
        helpText: 'What specific thing are we betting on?'
      },
      {
        id: 'game_info',
        label: 'Game/Event',
        type: 'text',
        required: true,
        placeholder: 'Chiefs vs Bills',
        helpText: 'What game or event?'
      },
      {
        id: 'options',
        label: 'Options (if multiple choice)',
        type: 'text',
        required: false,
        placeholder: 'Mahomes\nKelce\nHill\nOther',
        helpText: 'List options if multiple choice, leave blank for over/under'
      },
      {
        id: 'game_date',
        label: 'Game Date',
        type: 'date',
        required: true,
        helpText: 'When is the game?'
      }
    ],
    defaultSides: [], // Depends on prop type
    allowCustomSides: true,
    minParticipants: 2,
    resolutionTypes: ['neutral_party'],
    defaultResolutionType: 'neutral_party',
    customUI: 'PropBetUI',
    examples: [
      'First touchdown scorer',
      'Number of fouls in the game',
      'Will there be overtime?'
    ]
  },

  // Tournament & Group Systems
  bracket: {
    id: 'bracket',
    category: 'tournament',
    name: 'Bracket / Knockout',
    description: 'Tournament-style elimination bracket',
    icon: 'tournament',
    color: '#059669',
    isPremium: true,
    fields: [
      {
        id: 'tournament_name',
        label: 'Tournament Name',
        type: 'text',
        required: true,
        placeholder: 'March Madness Bracket',
        helpText: 'Name of the tournament'
      },
      {
        id: 'teams',
        label: 'Teams/Participants (one per line)',
        type: 'text',
        required: true,
        placeholder: 'Duke\nUNC\nKentucky\nKansas',
        helpText: 'List all teams/participants'
      },
      {
        id: 'tournament_start',
        label: 'Tournament Start Date',
        type: 'date',
        required: true,
        helpText: 'When does the tournament begin?'
      },
      {
        id: 'scoring_system',
        label: 'Scoring System',
        type: 'select',
        required: true,
        options: ['Standard (1-2-4-8)', 'Equal Points Per Round', 'Custom'],
        helpText: 'How are points awarded for correct picks?'
      }
    ],
    defaultSides: [], // Participants pick their brackets
    allowCustomSides: true,
    minParticipants: 2,
    maxParticipants: 20,
    resolutionTypes: ['neutral_party'],
    defaultResolutionType: 'neutral_party',
    customUI: 'BracketUI',
    examples: [
      'March Madness bracket challenge',
      'World Cup knockout stage',
      'Office tournament bracket'
    ],
    validationRules: {
      requiresNeutralParty: true
    }
  },

  round_robin: {
    id: 'round_robin',
    category: 'tournament',
    name: 'Round Robin / Pool',
    description: 'Everyone plays everyone, best record wins',
    icon: 'rotate-3d-variant',
    color: '#7C3AED',
    isPremium: true,
    fields: [
      {
        id: 'pool_name',
        label: 'Pool Name',
        type: 'text',
        required: true,
        placeholder: 'Weekly Pick \'Em Pool',
        helpText: 'Name of the round robin pool'
      },
      {
        id: 'games_per_week',
        label: 'Games Per Round',
        type: 'number',
        required: true,
        placeholder: '10',
        min: 1,
        max: 50,
        helpText: 'How many games per round?'
      },
      {
        id: 'duration_weeks',
        label: 'Duration (weeks)',
        type: 'number',
        required: true,
        placeholder: '4',
        min: 1,
        max: 20,
        helpText: 'How many weeks does this run?'
      },
      {
        id: 'start_date',
        label: 'Start Date',
        type: 'date',
        required: true,
        helpText: 'When does the pool start?'
      }
    ],
    defaultSides: [], // Participants compete for best record
    allowCustomSides: true,
    minParticipants: 3,
    resolutionTypes: ['neutral_party'],
    defaultResolutionType: 'neutral_party',
    customUI: 'RoundRobinUI',
    examples: [
      'NFL weekly pick \'em pool',
      'College basketball season pool',
      'Soccer league predictions'
    ]
  },

  survivor: {
    id: 'survivor',
    category: 'tournament',
    name: 'Survivor / Last Man Standing',
    description: 'Pick a team each week, lose once and you\'re out',
    icon: 'account-remove',
    color: '#DC2626',
    isPremium: true,
    fields: [
      {
        id: 'survivor_name',
        label: 'Survivor Pool Name',
        type: 'text',
        required: true,
        placeholder: 'NFL Survivor Pool',
        helpText: 'Name of the survivor pool'
      },
      {
        id: 'league',
        label: 'League/Sport',
        type: 'text',
        required: true,
        placeholder: 'NFL',
        helpText: 'What league are we picking from?'
      },
      {
        id: 'duration_weeks',
        label: 'Duration (weeks)',
        type: 'number',
        required: true,
        placeholder: '17',
        min: 1,
        max: 30,
        helpText: 'How many weeks does this run?'
      },
      {
        id: 'start_date',
        label: 'Start Date',
        type: 'date',
        required: true,
        helpText: 'When does the survivor pool start?'
      },
      {
        id: 'can_reuse_teams',
        label: 'Can reuse teams?',
        type: 'boolean',
        required: false,
        helpText: 'Can participants pick the same team multiple times?'
      }
    ],
    defaultSides: [], // Last person standing wins
    allowCustomSides: true,
    minParticipants: 3,
    resolutionTypes: ['neutral_party'],
    defaultResolutionType: 'neutral_party',
    customUI: 'SurvivorUI',
    examples: [
      'NFL Survivor - pick one team per week',
      'College Football Survivor Pool',
      'March Madness Survivor'
    ]
  },

  // Social & Lifestyle
  tab_bet: {
    id: 'tab_bet',
    category: 'social',
    name: 'Tab Bet',
    description: 'Ongoing tally - who owes drinks, chores, etc.',
    icon: 'receipt',
    color: '#059669',
    isPremium: true,
    fields: [
      {
        id: 'tab_name',
        label: 'Tab Name',
        type: 'text',
        required: true,
        placeholder: 'Drinks Tab',
        helpText: 'What kind of tab is this?'
      },
      {
        id: 'tab_item',
        label: 'What\'s being tracked?',
        type: 'text',
        required: true,
        placeholder: 'Drinks',
        helpText: 'What do people owe? (drinks, chores, etc.)'
      },
      {
        id: 'reset_period',
        label: 'Reset Period',
        type: 'select',
        required: true,
        options: ['Weekly', 'Monthly', 'Never', 'Custom'],
        helpText: 'How often does the tab reset?'
      },
      {
        id: 'max_debt',
        label: 'Max Debt (optional)',
        type: 'number',
        required: false,
        placeholder: '10',
        min: 1,
        helpText: 'Maximum number someone can owe'
      }
    ],
    defaultSides: [], // Ongoing tracking
    allowCustomSides: true,
    minParticipants: 2,
    resolutionTypes: ['everyone_agrees'],
    defaultResolutionType: 'everyone_agrees',
    customUI: 'TabBetUI',
    examples: [
      'Who owes drinks this week',
      'Chore duty tracker',
      'Coffee run obligations'
    ]
  },

  condition_based: {
    id: 'condition_based',
    category: 'social',
    name: 'Condition-Based',
    description: 'If X happens, then Y consequence',
    icon: 'arrow-decision',
    color: '#F59E0B',
    isPremium: false,
    fields: [
      {
        id: 'condition',
        label: 'Condition (If this happens...)',
        type: 'text',
        required: true,
        placeholder: 'If you miss the gym 3 times this week',
        helpText: 'What condition triggers the bet?'
      },
      {
        id: 'consequence',
        label: 'Consequence (Then...)',
        type: 'text',
        required: true,
        placeholder: 'You owe everyone $10',
        helpText: 'What happens if the condition is met?'
      },
      {
        id: 'tracking_period',
        label: 'Tracking Period',
        type: 'text',
        required: true,
        placeholder: 'This week',
        helpText: 'Over what time period is this tracked?'
      },
      {
        id: 'end_date',
        label: 'End Date',
        type: 'date',
        required: true,
        helpText: 'When does the tracking period end?'
      }
    ],
    defaultSides: ['Condition Met', 'Condition Not Met'],
    allowCustomSides: false,
    minParticipants: 2,
    resolutionTypes: ['neutral_party', 'everyone_agrees'],
    defaultResolutionType: 'everyone_agrees',
    examples: [
      'If you miss gym 3x this week, owe $10',
      'If it rains tomorrow, buy lunch',
      'If you\'re late again, do the dishes'
    ]
  },

  milestone: {
    id: 'milestone',
    category: 'social',
    name: 'Milestone / Goal',
    description: 'Who reaches a goal first or achieves a milestone',
    icon: 'flag-variant',
    color: '#8B5CF6',
    isPremium: false,
    fields: [
      {
        id: 'goal',
        label: 'Goal/Milestone',
        type: 'text',
        required: true,
        placeholder: 'Lose 10 pounds',
        helpText: 'What goal are people trying to achieve?'
      },
      {
        id: 'measurement',
        label: 'How is progress measured?',
        type: 'text',
        required: true,
        placeholder: 'Weekly weigh-ins',
        helpText: 'How will progress be tracked?'
      },
      {
        id: 'deadline',
        label: 'Deadline',
        type: 'date',
        required: true,
        helpText: 'When must the goal be achieved by?'
      },
      {
        id: 'winner_type',
        label: 'Winner Determination',
        type: 'select',
        required: true,
        options: ['First to achieve goal', 'Most progress by deadline', 'All who achieve goal'],
        helpText: 'How is the winner determined?'
      }
    ],
    defaultSides: [], // Participants compete individually
    allowCustomSides: true,
    minParticipants: 2,
    resolutionTypes: ['neutral_party', 'everyone_agrees'],
    defaultResolutionType: 'everyone_agrees',
    customUI: 'MilestoneUI',
    examples: [
      'Who loses 10 pounds first?',
      'Who runs a marathon faster?',
      'Who reads 12 books this year?'
    ]
  }
};
