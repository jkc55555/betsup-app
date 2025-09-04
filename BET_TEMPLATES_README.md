# BetBuddies - Comprehensive Bet Template System

## 🎯 Overview

The BetBuddies app now features a comprehensive bet template system that makes creating bets intuitive and covers all popular betting scenarios. Users can choose from pre-configured templates or create custom bets from scratch.

## 📋 Template Categories

### 🔹 **Binary & Head-to-Head**
Simple two-outcome bets for straightforward predictions.

#### **True / False**
- **Use Case**: Simple factual predictions
- **Examples**: "Will it rain tomorrow?", "Will the stock market close up today?"
- **Sides**: True, False
- **Resolution**: Neutral party or everyone agrees

#### **Yes / No**
- **Use Case**: Question-based predictions
- **Examples**: "Will Josh show up on time?", "Will we get pizza for lunch?"
- **Sides**: Yes, No
- **Resolution**: Neutral party or everyone agrees

#### **Winner / Loser (Head-to-Head)**
- **Use Case**: Direct competition between two parties
- **Examples**: "Chiefs vs. Bills", "John vs. Mike - Chess match"
- **Sides**: Dynamic based on competitors
- **Resolution**: Neutral party, everyone agrees, or automatic

### 🔹 **Range & Threshold Bets**
Numerical predictions and closest-guess competitions.

#### **Over / Under**
- **Use Case**: Threshold-based predictions
- **Examples**: "Over/Under 50 points in the game", "Over/Under 75°F tomorrow"
- **Sides**: Over [threshold], Under [threshold]
- **Resolution**: Neutral party or automatic

#### **Closest To (Price is Right)**
- **Use Case**: Guess-the-number competitions
- **Examples**: "Closest to the final score", "Closest to tomorrow's temperature"
- **Sides**: Individual participant guesses
- **Resolution**: Neutral party or automatic
- **Features**: Optional "Price is Right" rule (must be under actual number)

#### **Exact Outcome**
- **Use Case**: Precise predictions
- **Examples**: "Exact final score: 108-95", "Exact temperature at noon: 73°F"
- **Sides**: Individual exact predictions
- **Resolution**: Neutral party or automatic

### 🔹 **Multi-Party & Ranking Bets**
Multiple participants with various outcome possibilities.

#### **Pick 'Em**
- **Use Case**: Multiple choice selections
- **Examples**: "Who will win the championship?", "Which movie will gross the most?"
- **Sides**: Configurable list of options
- **Resolution**: Neutral party or everyone agrees

#### **First To / Last To**
- **Use Case**: Achievement-based competitions
- **Examples**: "First to miss a workout this month", "Last to arrive at the party"
- **Sides**: Participant names
- **Resolution**: Everyone agrees (preferred)

#### **Leaderboard / Points System** 🏆 *Premium*
- **Use Case**: Ongoing competitions with point accumulation
- **Examples**: "March Madness bracket points", "Fantasy football season"
- **Sides**: Individual participants
- **Resolution**: Neutral party (required)
- **Features**: Multi-week tracking, custom scoring systems

### 🔹 **Sports-Oriented Templates**
Specialized templates for sports betting scenarios.

#### **Moneyline**
- **Use Case**: Straight winner bets with no spread
- **Examples**: "Lakers vs Warriors - straight up", "Chiefs vs Bills - who wins"
- **Sides**: Team names
- **Resolution**: Automatic (preferred) or neutral party

#### **Spread Bet**
- **Use Case**: Point spread betting
- **Examples**: "Lakers -7.5 vs Warriors", "Chiefs -3 vs Bills"
- **Sides**: "[Favorite] -[spread]", "[Underdog] +[spread]"
- **Resolution**: Automatic or neutral party
- **Features**: Configurable spread points

#### **Parlay / Combo** 🏆 *Premium*
- **Use Case**: Multiple bets that must all win
- **Examples**: "Lakers win + Over 220 + LeBron 25pts", "Three team moneyline parlay"
- **Sides**: Parlay Hits, Parlay Misses
- **Resolution**: Neutral party
- **Features**: Multiple leg tracking

#### **Prop Bet**
- **Use Case**: Specific in-game occurrences
- **Examples**: "First touchdown scorer", "Number of fouls in the game"
- **Sides**: Configurable based on prop type
- **Resolution**: Neutral party

### 🔹 **Tournament & Group Systems**
Advanced multi-participant tournament formats.

#### **Bracket / Knockout** 🏆 *Premium*
- **Use Case**: Tournament-style elimination
- **Examples**: "March Madness bracket challenge", "World Cup knockout stage"
- **Sides**: Individual bracket picks
- **Resolution**: Neutral party (required)
- **Features**: Configurable scoring systems, up to 20 participants

#### **Round Robin / Pool** 🏆 *Premium*
- **Use Case**: Everyone plays everyone format
- **Examples**: "NFL weekly pick 'em pool", "College basketball season pool"
- **Sides**: Individual participants
- **Resolution**: Neutral party
- **Features**: Multi-week tracking, win-loss records

#### **Survivor / Last Man Standing** 🏆 *Premium*
- **Use Case**: Elimination-style pools
- **Examples**: "NFL Survivor - pick one team per week", "March Madness Survivor"
- **Sides**: Remaining participants
- **Resolution**: Neutral party
- **Features**: Weekly picks, team reuse options

### 🔹 **Social & Lifestyle Bets**
Personal and social betting scenarios.

#### **Tab Bet** 🏆 *Premium*
- **Use Case**: Ongoing tallies and obligations
- **Examples**: "Who owes drinks this week", "Chore duty tracker"
- **Sides**: Ongoing tracking
- **Resolution**: Everyone agrees
- **Features**: Reset periods, maximum debt limits

#### **Condition-Based**
- **Use Case**: If-then scenarios
- **Examples**: "If you miss gym 3x this week, owe $10", "If it rains tomorrow, buy lunch"
- **Sides**: Condition Met, Condition Not Met
- **Resolution**: Everyone agrees or neutral party

#### **Milestone / Goal**
- **Use Case**: Achievement competitions
- **Examples**: "Who loses 10 pounds first?", "Who runs a marathon faster?"
- **Sides**: Individual participants
- **Resolution**: Everyone agrees or neutral party
- **Features**: Progress tracking, multiple winner types

## 🎨 **User Interface Features**

### **Template Selector**
- **Visual Categories**: Color-coded categories with intuitive icons
- **Search Functionality**: Find templates by name, description, or examples
- **Premium Indicators**: Clear marking of premium-only templates
- **Examples Display**: Show real-world examples for each template
- **Resolution Types**: Display available resolution methods

### **Dynamic Form Generation**
- **Smart Fields**: Forms adapt based on selected template
- **Validation**: Real-time validation with helpful error messages
- **Field Types**: Text, number, date, select, boolean, multi-select
- **Help Text**: Contextual guidance for each field
- **Auto-Generation**: Automatic bet title and description generation

### **Template Metadata**
- **Participant Limits**: Minimum and maximum participant counts
- **Resolution Options**: Available resolution methods per template
- **Premium Features**: Advanced templates for premium users
- **Custom UI**: Specialized interfaces for complex bet types

## 🔧 **Technical Implementation**

### **Type Safety**
```typescript
interface BetTemplate {
  id: BetTemplateType;
  category: BetTemplateCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  isPremium: boolean;
  fields: BetTemplateField[];
  defaultSides: string[];
  resolutionTypes: ResolutionType[];
  // ... additional configuration
}
```

### **Dynamic Field Rendering**
- **Field Types**: Support for all common input types
- **Validation Rules**: Built-in validation with custom rules
- **Conditional Logic**: Fields can depend on other field values
- **Help System**: Contextual help and examples

### **Smart Defaults**
- **Auto-Population**: Intelligent form pre-filling
- **Side Generation**: Automatic bet side creation based on template
- **Resolution Selection**: Smart default resolution methods
- **Title Generation**: Automatic bet title creation from form data

## 🚀 **Benefits**

### **For Users**
- **Intuitive Creation**: No need to think about bet structure
- **Comprehensive Coverage**: Templates for every betting scenario
- **Smart Defaults**: Minimal configuration required
- **Learning Tool**: Examples teach users about different bet types

### **For Developers**
- **Extensible System**: Easy to add new templates
- **Type Safety**: Full TypeScript support
- **Reusable Components**: Modular template system
- **Maintainable**: Clear separation of template logic and UI

### **For Business**
- **Premium Upsell**: Advanced templates drive subscription revenue
- **User Engagement**: More bet types = more usage
- **Reduced Support**: Self-explanatory templates reduce confusion
- **Scalability**: Easy to add new templates based on user demand

## 📈 **Usage Analytics**

Track template usage to understand user preferences:
- Most popular templates by category
- Premium template conversion rates
- Template completion rates
- User feedback on template usefulness

This comprehensive template system transforms BetBuddies from a simple betting app into a sophisticated platform that handles every conceivable betting scenario with ease and intelligence.
