# LeanFuel - Portfolio Project Documentation

## Executive Summary

**LeanFuel** is a production-grade React Native mobile application for nutrition tracking and fitness management, built with modern architecture patterns and industry best practices. This comprehensive calorie and macro tracking app demonstrates advanced full-stack development skills across mobile development, backend engineering, database design, and UX implementation.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Design Patterns](#3-architecture--design-patterns)
4. [Core Features & Implementation](#4-core-features--implementation)
5. [State Management Deep Dive](#5-state-management-deep-dive)
6. [Database Design & Supabase Integration](#6-database-design--supabase-integration)
7. [Evidence-Based Nutrition Calculations](#7-evidence-based-nutrition-calculations)
8. [Security & Authentication](#8-security--authentication)
9. [Advanced Functionality Highlights](#9-advanced-functionality-highlights)
10. [Technical Challenges & Solutions](#10-technical-challenges--solutions)

---

## 1. Project Overview

### What It Is
LeanFuel is a comprehensive nutrition tracking mobile application that allows users to:
- Track daily calorie and macronutrient intake
- Log food entries across meals (breakfast, lunch, dinner, snacks)
- Monitor water consumption
- Track weight progress over time
- Receive personalized nutrition goals based on evidence-based formulas

### Key Differentiators
| Feature | Why It Matters |
|---------|----------------|
| Evidence-based calculations | Uses Mifflin-St Jeor equation and research-backed macro formulas |
| Atomic database operations | All-or-nothing transactions prevent data corruption |
| Intelligent caching | 5-minute TTL with soft invalidation for optimal UX |
| Stale request guards | Prevents race conditions in async data fetching |
| Full authentication flow | Complete auth lifecycle with protected route guards |

---

## 2. Technology Stack

### Frontend
```
React Native 0.81.5      - Cross-platform mobile framework
Expo SDK 54              - Development tooling and native APIs
TypeScript 5.9           - Type-safe development
Zustand 5.0              - Lightweight state management
React Navigation         - Navigation with expo-router
NativeWind 4.1           - Tailwind CSS for React Native
React Native Reanimated  - High-performance animations
React Native SVG         - Vector graphics (progress rings)
```

### Backend (Supabase)
```
PostgreSQL               - Relational database
Row Level Security (RLS) - Fine-grained access control
PL/pgSQL Functions       - Server-side business logic
Real-time Subscriptions  - Live data updates
Edge Functions           - Serverless compute (future)
```

### Development Tools
```
Jest + Testing Library   - Unit and integration testing
pnpm                     - Fast, disk-efficient package manager
ESLint + Prettier        - Code quality and formatting
```

---

## 3. Architecture & Design Patterns

### Project Structure
```
leanfuel/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Auth screens (signin, signup)
│   ├── (tabs)/                   # Main app tabs (dashboard, food logging, profile)
│   ├── _layout.tsx               # Root layout with route guards
│   ├── index.tsx                 # Landing page
│   └── onboarding.tsx            # Onboarding flow entry
├── components/
│   ├── dashboard/                # Dashboard widgets (CalorieCard, MacroBar, WaterTracker)
│   ├── food/                     # Food logging components (modals, selectors)
│   ├── onboarding/               # Multi-step onboarding components
│   └── common/                   # Reusable UI components
├── stores/                       # Zustand state stores
│   ├── foodLogStore.ts           # Food logging state (654 lines)
│   ├── userStore.ts              # User profile and auth state
│   ├── foodSearchStore.ts        # Food search with abort controller
│   └── useOnboardingStore.ts     # Onboarding wizard state
├── database/migrations/          # Versioned SQL migrations with rollbacks
├── types/                        # TypeScript type definitions
├── utils/                        # Validation and error handling utilities
├── hooks/                        # Custom React hooks
├── lib/                          # Core libraries (Supabase client)
└── constants/                    # Theme colors and gradients
```

### Design Patterns Used

#### 1. **Separation of Concerns**
- State logic isolated in Zustand stores
- UI components focused purely on presentation
- Database operations abstracted via Supabase client
- Validation logic extracted to utility modules

#### 2. **Compound Component Pattern**
The `CalorieCard` uses composition for flexibility:
```tsx
<ProgressRing progress={progress} gradientColors={gradientColors}>
    <View style={styles.ringCenter}>
        <Text>{consumed.toLocaleString()}</Text>
        <Text>{goal.toLocaleString()}</Text>
    </View>
</ProgressRing>
```

#### 3. **Route Guard Pattern**
Five-layer authentication guard in `_layout.tsx`:
1. Redirect unauthenticated users from protected routes
2. Force onboarding completion before dashboard access
3. Prevent completed users from re-accessing onboarding
4. Redirect authenticated users from landing page
5. Redirect authenticated users from auth pages

#### 4. **Cache-First with Invalidation**
The `foodLogStore` implements intelligent caching:
- 5-minute TTL for fresh data
- Soft invalidation keeps stale data visible during refetch
- Stale request guards prevent race conditions

---

## 4. Core Features & Implementation

### 4.1 User Onboarding Flow

A 5-step wizard collecting:
| Step | Data Collected | Validation |
|------|----------------|------------|
| Goal | Weight goal (lose/maintain/gain) | Required selection |
| Activity | Activity level (sedentary to extra active) | Required selection |
| Personal Info | Age (13-120), Gender, Weight (30-500kg), Height (100-250cm) | Range validation |
| Target | Target weight, Timeframe (3/6/12 months or flexible) | Logical validation (target must match goal direction) |
| Review | Summary with calculated BMR, TDEE, and macros | Full data validation before submit |

**Advanced Feature:** Cross-field validation ensures goal matches weight direction:
```typescript
if (data.goal === 'lose' && targetWeight >= weight) {
    errors.targetWeight = 'Target weight should be less than current weight for weight loss';
}
```

### 4.2 Dashboard

The dashboard displays real-time nutrition data:
- **CalorieCard**: Animated progress ring with gradient colors
- **MacroBar**: Individual macro progress (protein, carbs, fat)
- **WaterTracker**: Daily water intake tracking
- **ActivityGrid**: Activity summary widgets

**Status Intelligence:** The CalorieCard implements a 10% buffer zone:
```typescript
if (actualProgress >= 100 && actualProgress <= 110) return 'GOAL MET';
if (isOverGoal && actualProgress > 110) return 'OVER';
```

### 4.3 Food Logging

Complete CRUD operations for daily food entries:
- **Search**: Debounced search with abort controller for race condition prevention
- **Add**: Modal-based portion selector with nutrition preview
- **Edit**: Full editing of servings and meal type with recalculation
- **Delete**: Immediate removal with cache invalidation

**Date Navigation:** Users can navigate between days to view/edit historical logs.

### 4.4 Water Tracking

Two-table architecture for performance:
- `water_logs`: Individual entries with timestamps
- `daily_water_summary`: Pre-aggregated totals for fast dashboard queries

Quick-add functions for common amounts:
```sql
add_water_glass()  -- 250ml
add_water_bottle() -- 500ml  
add_water_liter()  -- 1000ml
```

---

## 5. State Management Deep Dive

### Zustand Store Architecture

The `foodLogStore` (~654 lines) demonstrates production-grade state management:

```typescript
interface FoodLogState {
    selectedDate: string;
    days: Record<string, CachedDay>;  // Date-keyed cache
}

interface CachedDay {
    logs: FoodLog[];
    summary: DailyNutritionSummary | null;
    logsFetchedAt: number;        // Timestamp for TTL
    summaryFetchedAt: number;
    isFetchingLogs: boolean;      // Prevents duplicate fetches
    isFetchingSummary: boolean;
    error: string | null;
}
```

### Advanced Caching Strategy

#### Cache TTL Check
```typescript
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isLogsCacheValid(day: CachedDay | undefined): boolean {
    if (!day) return false;
    return now() - day.logsFetchedAt < CACHE_TTL;
}
```

#### Soft Invalidation
After mutations, data is marked stale but kept visible:
```typescript
const invalidateDay = (days: Record<string, CachedDay>, date: string) => {
    const day = days[date];
    if (!day) return days;
    return {
        ...days,
        [date]: {
            ...day,                    // Keep existing data visible
            logsFetchedAt: 0,          // Mark as stale
            summaryFetchedAt: 0,
            error: null,
        },
    };
};
```

### Stale Request Guards

Race conditions are prevented with request IDs:
```typescript
const activeLogRequests = new Map<string, string>();

// In fetchLogsForDate:
const requestId = `${date}-${Date.now()}`;
activeLogRequests.set(date, requestId);

// After async operation:
if (activeLogRequests.get(date) !== requestId) {
    return; // Stale request, ignore results
}
```

### Food Search with AbortController

```typescript
let currentAbortController: AbortController | null = null;

search: async (query: string) => {
    // Cancel previous request
    if (currentAbortController) currentAbortController.abort();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    const { data, error } = await supabase
        .from('food_items')
        .select('...')
        .abortSignal(signal);  // Pass to Supabase

    if (signal.aborted) return;  // Don't update state if aborted
}
```

---

## 6. Database Design & Supabase Integration

### Migration Strategy

Versioned migrations with paired rollbacks:
```
database/migrations/
├── 001_add_onboarding_columns.sql
├── 001_rollback.sql
├── 002_create_weight_logs.sql
├── 002_rollback.sql
├── ...
├── 008_add_water_tracking.sql
├── 008_rollback.sql
└── README.md
```

### Key Database Functions

#### 1. `complete_onboarding()` - Atomic Transaction
```sql
CREATE OR REPLACE FUNCTION complete_onboarding(
  p_user_id UUID,
  p_goal TEXT,
  p_activity_level TEXT,
  -- ... more params
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tdee_result JSON;
  v_macro_result JSON;
BEGIN
  -- Calculate TDEE
  v_tdee_result := calculate_tdee(...);
  
  -- Calculate macros
  v_macro_result := calculate_macro_goals(...);
  
  -- Atomic update - all or nothing
  UPDATE profiles SET
    goal = p_goal,
    daily_calorie_goal = v_calorie_goal,
    protein_goal_g = v_protein_goal,
    onboarding_completed = true,
    -- ... more fields
  WHERE id = p_user_id;
  
  -- Create initial weight log
  INSERT INTO weight_logs (user_id, weight, date, notes)
  VALUES (p_user_id, p_current_weight, CURRENT_DATE, 'Initial weight');
  
  RETURN json_build_object('success', true, 'profile', ...);
END;
$$;
```

#### 2. Row Level Security (RLS)
```sql
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "water_logs_select" ON water_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "water_logs_insert" ON water_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Computed Columns (Generated Always)
```sql
goal_percentage INTEGER GENERATED ALWAYS AS (
  CASE 
    WHEN daily_goal_ml > 0 THEN (total_ml * 100) / daily_goal_ml
    ELSE 0
  END
) STORED
```

---

## 7. Evidence-Based Nutrition Calculations

### BMR Calculation (Mifflin-St Jeor Equation)

The most accurate equation for estimating Basal Metabolic Rate:

```sql
-- Men: BMR = (10 × weight) + (6.25 × height) − (5 × age) + 5
-- Women: BMR = (10 × weight) + (6.25 × height) − (5 × age) − 161

IF p_gender = 'male' THEN
    v_bmr := (10 * p_weight) + (6.25 * p_height) - (5 * p_age) + 5;
ELSIF p_gender = 'female' THEN
    v_bmr := (10 * p_weight) + (6.25 * p_height) - (5 * p_age) - 161;
END IF;
```

### TDEE Activity Multipliers

```sql
v_activity_multiplier := CASE p_activity_level
    WHEN 'sedentary' THEN 1.2      -- Little/no exercise
    WHEN 'light' THEN 1.375        -- Light exercise 1-3 days/week
    WHEN 'moderate' THEN 1.55      -- Moderate exercise 3-5 days/week
    WHEN 'very' THEN 1.725         -- Hard exercise 6-7 days/week
    WHEN 'extra' THEN 1.9          -- Very hard exercise + physical job
END;
```

### Macro Calculation Strategy

Based on research from Carbon Diet Coach, MacroFactor, and StrongerByScience:

| Macro | Formula | Rationale |
|-------|---------|-----------|
| **Protein** | 1.6-2.2 g/kg body weight | Higher during deficit (2.0g) to preserve muscle |
| **Fat** | 0.9 g/kg OR minimum 25% calories | Essential for hormone health |
| **Carbs** | Fill remaining calories | Flexible based on preference |

```sql
-- Protein during deficit: 2.0 g/kg (higher to preserve muscle)
v_protein_multiplier := CASE p_goal
    WHEN 'lose' THEN 2.0
    WHEN 'gain' THEN 1.8
    ELSE 1.8
END CASE;

-- For significant weight loss (>15%), use average weight
IF p_goal = 'lose' AND p_target_weight < (p_current_weight * 0.85) THEN
    v_weight_for_protein := (p_current_weight + p_target_weight) / 2;
END IF;
```

---

## 8. Security & Authentication

### Supabase Auth Integration

```typescript
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: AsyncStorage,          // Persist session on device
        autoRefreshToken: true,         // Auto-refresh before expiry
        persistSession: true,
        detectSessionInUrl: false,      // Mobile app doesn't use URL auth
    },
});

// Auto-refresh management based on app state
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});
```

### Error Handling Strategy

```typescript
// Error type detection
export function isNetworkError(error: any): boolean {
    const errorMessage = error.message?.toLowerCase() || '';
    return (
        errorMessage.includes('network') ||
        errorMessage.includes('fetch failed') ||
        errorCode === 'econnrefused'
    );
}

// Retry with exponential backoff (only for network errors)
export async function retryOperation<T>(
    operation: () => Promise<T>,
    options: { maxRetries: 3, retryDelay: 1000 }
): Promise<T>
```

### Input Validation

Comprehensive validation prevents invalid data:

```typescript
export function validateOnboardingData(data: OnboardingData): ValidationResult {
    const errors: Partial<Record<keyof OnboardingData, string>> = {};

    // Type validation
    if (!['lose', 'maintain', 'gain'].includes(data.goal)) {
        errors.goal = 'Please select a valid goal';
    }

    // Range validation
    const age = Number(data.age);
    if (age < 13 || age > 120) {
        errors.age = 'Please enter a valid age';
    }

    // Cross-field validation (goal matches weight direction)
    if (data.goal === 'lose' && targetWeight >= weight) {
        errors.targetWeight = 'Target weight should be less than current weight';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
}
```

---

## 9. Advanced Functionality Highlights

### Animated Progress Ring

Custom SVG component with smooth animations:

```tsx
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressRing = ({ progress, size, gradientColors }) => {
    const ringProgress = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        Animated.timing(ringProgress, {
            toValue: progress,
            duration: 2000,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: false, // Required for SVG
        }).start();
    }, [progress]);

    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = ringProgress.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    return (
        <Svg>
            <Defs>
                <SvgLinearGradient id="ringGradient">
                    <Stop offset="0%" stopColor={gradientColors[0]} />
                    <Stop offset="50%" stopColor={gradientColors[1]} />
                    <Stop offset="100%" stopColor={gradientColors[2]} />
                </SvgLinearGradient>
            </Defs>
            <AnimatedCircle
                stroke="url(#ringGradient)"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
            />
        </Svg>
    );
};
```

### Dynamic Gradient System

```typescript
export const createGradient = (baseColor: string): [string, string, string] => {
    // Parse hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const lighten = (amount: number) => /* RGB + amount */;
    const darken = (amount: number) => /* RGB - amount */;

    return [lighten(20), baseColor, darken(15)];
};

export const Gradients = {
    success: createGradient('#10b981'),
    error: createGradient('#ef4444'),
    primary: createGradient('#3c9d5c'),
};
```

### Debounced Search with Custom Hook

```typescript
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}
```

---

## 10. Technical Challenges & Solutions

### Challenge 1: Race Conditions in Date Navigation
**Problem:** User rapidly switches dates, causing stale data to overwrite fresh data.

**Solution:** Request ID guards with Map storage:
```typescript
const requestId = `${date}-${Date.now()}`;
activeLogRequests.set(date, requestId);
// After fetch...
if (activeLogRequests.get(date) !== requestId) return; // Ignore stale
```

---

### Challenge 2: Maintaining UX During Data Refresh
**Problem:** Clearing data during refetch causes UI flicker.

**Solution:** Soft invalidation keeps stale data visible:
```typescript
const invalidateDay = (days, date) => ({
    ...days,
    [date]: {
        ...days[date],        // Keep visible
        logsFetchedAt: 0,     // But mark stale
    },
});
```

---

### Challenge 3: Atomic Onboarding with Multiple Operations
**Problem:** Need to calculate BMR/TDEE, save profile, create weight log atomically.

**Solution:** Single PostgreSQL function with transaction semantics:
```sql
CREATE FUNCTION complete_onboarding(...) RETURNS JSON AS $$
BEGIN
    -- All operations succeed or all fail
    v_tdee := calculate_tdee(...);
    v_macros := calculate_macro_goals(...);
    UPDATE profiles SET ... WHERE id = p_user_id;
    INSERT INTO weight_logs VALUES (...);
    RETURN json_build_object('success', true);
END;
$$;
```

---

### Challenge 4: Cross-Platform Shadow Styling
**Problem:** iOS and Android have different shadow APIs.

**Solution:** Platform-specific styling:
```typescript
...Platform.select({
    ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
    },
    android: {
        elevation: 6,
    },
}),
```



## Key Metrics & Stats

| Metric | Value |
|--------|-------|
| Total TypeScript/TSX Files | ~50+ |
| Lines of Store Code | ~1,100+ (all stores combined) |
| Database Migrations | 8 (with rollbacks) |
| SQL Function Count | 12+ |
| Component Count | 40+ |
| Custom Hooks | 4 |
| Type Definitions | 20+ interfaces |

---

## Future Enhancements

1. **Offline Support** - Implement optimistic updates with sync queue
2. **Barcode Scanning** - Add food lookup via barcode API
3. **Workout Tracking** - Expand beyond nutrition to exercise logging
4. **Social Features** - Friend challenges and shared goals
5. **AI Meal Suggestions** - Integration with AI for personalized recommendations
6. **Push Notifications** - Meal reminders and hydration alerts
7. **Retry Logic in UI** - User-facing retry buttons for failed operations with exponential backoff
8. **Enhanced Loading States** - Skeleton loaders and shimmer effects for better perceived performance
9. **Error Display in UI** - Toast notifications and inline error messages with actionable recovery options
10. **Pull to Refresh** - Native pull-to-refresh gesture on all list views for manual data refresh

---

## Conclusion

LeanFuel demonstrates mastery of:
- **React Native** - Cross-platform mobile development with Expo
- **TypeScript** - Type-safe development with complex interfaces
- **State Management** - Advanced Zustand patterns with caching and concurrency handling
- **Backend Engineering** - PostgreSQL, RLS, atomic transactions, evidence-based algorithms
- **UX Engineering** - Animations, theming, responsive design
- **Software Architecture** - Clean separation of concerns, maintainable structure
- **Security** - Authentication flows, input validation, error handling


