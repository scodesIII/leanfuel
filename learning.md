# LeanFuel Learning Roadmap 🚀

> **Purpose**: A comprehensive, step-by-step learning plan to level up your React Native, TypeScript, and full-stack development skills while building LeanFuel.
> 
> **Last Updated**: December 4, 2025

---

## 📊 Progress Overview

- **Phase 1: Testing Mastery** - [/] In Progress (3/10 tasks complete)
- **Phase 2: Real-time & Performance** - [ ] Not Started
- **Phase 3: Advanced TypeScript** - [ ] Not Started
- **Phase 4: Data Visualization** - [ ] Not Started
- **Phase 5: Offline-First Architecture** - [ ] Not Started
- **Phase 6: Advanced React Patterns** - [ ] Not Started

---

## Phase 1: Testing Mastery ⭐ **START HERE**

> **Why This Matters**: Your app has complex calculations (macros, TDEE) that must be correct. Testing catches bugs before users do and makes you a better developer by forcing you to think about edge cases.

### Week 1: Foundation

#### 1.1 Test Error Handling Utilities
**Status**: [ ] Not Started | [ ] In Progress | [x] Done ✅

**Goal**: Write comprehensive tests for `utils/errorHandling.ts`

**What You'll Learn**:
- Writing unit tests with Jest
- Testing pure functions
- Mocking and stubbing
- Test-driven development (TDD) basics

**Tasks**:
- [x] Create `utils/__tests__/errorHandling.test.ts`
- [x] Test `isNetworkError()` function
  - [x] Test with network error messages
  - [x] Test with error codes (ECONNREFUSED, ENOTFOUND, ETIMEDOUT)
  - [x] Test with non-network errors
  - [x] Test with null/undefined inputs
- [x] Test `isAuthError()` function
  - [x] Test with JWT errors
  - [x] Test with 401 status codes
  - [x] Test with session errors
- [x] Test `isValidationError()` function
  - [x] Test with 400 status codes
  - [x] Test with validation messages
- [x] Test `isServerError()` function
  - [x] Test with 5xx status codes
  - [x] Test boundary cases (499, 500, 599, 600)
- [x] Test `getErrorMessage()` function
  - [x] Test all error types return user-friendly messages
  - [x] Test error mapping for common Supabase errors
  - [x] Test fallback messages
- [x] Test `getErrorTitle()` function
  - [x] Test title matches error type
- [x] Run tests with coverage: `npx jest --coverage`
- [x] Aim for 100% coverage on errorHandling.ts

**Example Test Structure**:
```typescript
describe('isNetworkError', () => {
  it('should return true for network request failed error', () => {
    const error = new Error('network request failed');
    expect(isNetworkError(error)).toBe(true);
  });

  it('should return true for ECONNREFUSED error code', () => {
    const error = { code: 'ECONNREFUSED' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('should return false for auth errors', () => {
    const error = new Error('JWT expired');
    expect(isNetworkError(error)).toBe(false);
  });
});
```

**Resources**:
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

#### 1.2 Test Retry Logic
**Status**: [x] Done ✅ *(Covered in Task 1.1)*

**Goal**: Test the `retryOperation()` function with various scenarios

**What You'll Learn**:
- Testing async functions
- Using fake timers
- Testing retry logic and exponential backoff
- Mocking promises

**Tasks**:
- [ ] Test successful operation (no retries needed)
- [ ] Test network error with successful retry
- [ ] Test max retries exceeded
- [ ] Test exponential backoff timing
  - [ ] Use `jest.useFakeTimers()` to control time
  - [ ] Verify delays: 1s, 2s, 4s
- [ ] Test that auth errors don't retry
- [ ] Test that validation errors don't retry
- [ ] Test custom retry options (maxRetries, retryDelay)

**Example Test**:
```typescript
describe('retryOperation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should retry on network error and succeed', async () => {
    let attempts = 0;
    const operation = jest.fn(async () => {
      attempts++;
      if (attempts < 3) {
        throw { message: 'network request failed' };
      }
      return 'success';
    });

    const promise = retryOperation(operation, { maxRetries: 3 });
    
    // Fast-forward through retries
    await jest.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });
});
```

---

#### 1.3 Test Validation Utilities
**Status**: [ ] Not Started | [ ] In Progress | [x] Done ✅

**Goal**: Write tests for `utils/validation.ts`

**Tasks**:
- [x] Create `utils/__tests__/validation.test.ts`
- [x] Test all validation functions
- [x] Test edge cases (empty strings, special characters, boundary values)
- [x] Test error message formatting
- [x] Achieve 100% coverage

---

### Week 2: Store Testing

#### 1.4 Test FoodLogStore
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Test the complex `foodLogStore` with all its actions

**What You'll Learn**:
- Testing Zustand stores
- Mocking Supabase
- Testing state updates
- Testing async actions

**Tasks**:
- [ ] Create `stores/__tests__/foodLogStore.test.ts`
- [ ] Set up Supabase mock
  ```typescript
  jest.mock('@/lib/superbase', () => ({
    supabase: {
      from: jest.fn(),
      rpc: jest.fn(),
    },
  }));
  ```
- [ ] Test initial state
- [ ] Test `fetchTodaysLogs()`
  - [ ] Test successful fetch
  - [ ] Test error handling
  - [ ] Test caching (should not refetch if data is fresh)
- [ ] Test `fetchTodaysSummary()`
  - [ ] Test successful fetch
  - [ ] Test error handling
- [ ] Test `fetchLogsForDate()`
  - [ ] Test with different dates
  - [ ] Test selectedDate update
- [ ] Test `addLog()`
  - [ ] Test successful add
  - [ ] Test error handling
  - [ ] Test state update (log added to beginning of array)
  - [ ] Test summary refetch after add
- [ ] Test `updateLog()`
  - [ ] Test successful update
  - [ ] Test log replacement in array
- [ ] Test `deleteLog()`
  - [ ] Test successful delete
  - [ ] Test log removal from array
- [ ] Test `setSelectedDate()`
  - [ ] Test date update
  - [ ] Test automatic fetch for new date
- [ ] Test `clearError()` and `reset()`

**Example Test**:
```typescript
import { useFoodLogStore } from '../foodLogStore';
import { supabase } from '@/lib/superbase';

describe('FoodLogStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useFoodLogStore.getState().reset();
    jest.clearAllMocks();
  });

  it('should fetch todays logs successfully', async () => {
    const mockLogs = [
      { id: '1', food_item_id: 'food1', calories: 500 },
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockLogs,
            error: null,
          }),
        }),
      }),
    });

    await useFoodLogStore.getState().fetchTodaysLogs();

    const state = useFoodLogStore.getState();
    expect(state.todaysLogs).toEqual(mockLogs);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });
});
```

**Resources**:
- [Testing Zustand Stores](https://docs.pmnd.rs/zustand/guides/testing)
- [Mocking Supabase](https://supabase.com/docs/guides/getting-started/testing)

---

#### 1.5 Test UserStore
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Test user authentication and profile management

**Tasks**:
- [ ] Create `stores/__tests__/userStore.test.ts`
- [ ] Test `fetchProfile()`
- [ ] Test `updateProfile()` with retry logic
- [ ] Test `updateLastLogin()`
- [ ] Test `signOut()`
- [ ] Test `initialize()` and auth state listener

---

#### 1.6 Test OnboardingStore
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Test onboarding flow and validation

**Tasks**:
- [ ] Create `stores/__tests__/useOnboardingStore.test.ts`
- [ ] Test `setField()` and error clearing
- [ ] Test `nextStep()` with validation
- [ ] Test `prevStep()`
- [ ] Test `validateStep()` for all steps
- [ ] Test `reset()` and `complete()`
- [ ] Test AsyncStorage persistence

---

### Week 3: Component Testing

#### 1.7 Test CalorieCard Component
**Status**: [ ] Not Started | [ ] In Progress | [x] Done ✅

**Goal**: Test your CalorieCard component with different states

**What You'll Learn**:
- Component testing with React Native Testing Library
- Testing UI states (loading, error, success)
- Testing user interactions
- Snapshot testing

**Tasks**:
- [x] Create `components/dashboard/__tests__/CalorieCard.test.tsx`
- [x] Test progress calculation (6 tests)
  - [x] Test with 0% progress (NOT STARTED)
  - [x] Test with 50% progress (ON TRACK)
  - [x] Test with 100% progress (GOAL MET)
  - [x] Test with >100% progress (buffer zone)
  - [x] Test remaining calories calculation
  - [x] Test edge cases (goal of 0)
- [x] Test status function (8 tests)
  - [x] NOT STARTED (0%)
  - [x] GETTING STARTED (1-10%)
  - [x] ON TRACK (11-90%)
  - [x] CLOSE (91-99%)
  - [x] GOAL MET (100-110% with buffer)
  - [x] OVER (>110%)
- [x] Test milestone function (5 tests)
  - [x] No milestone at low progress
  - [x] "Halfway there!" at 45-55%
  - [x] "Goal reached!" at 100%
  - [x] No milestone when over 110%
- [x] Achieved 19 passing tests covering core logicssibility (screen reader labels)
- [ ] Create snapshot tests for different states

**Example Test**:
```typescript
import { render } from '@testing-library/react-native';
import { CalorieCard } from '../CalorieCard';

describe('CalorieCard', () => {
  it('should show GOAL MET when progress is 100%', () => {
    const { getByText } = render(
      <CalorieCard consumed={2000} goal={2000} />
    );
    
    expect(getByText('GOAL MET')).toBeTruthy();
  });

  it('should show OVER when calories exceed goal', () => {
    const { getByText } = render(
      <CalorieCard consumed={2500} goal={2000} />
    );
    
    expect(getByText('OVER')).toBeTruthy();
  });
});
```

---

#### 1.8 Build Profile Screen ("You" Tab)
**Status**: [ ] Not Started | [/] In Progress | [ ] Done

**Goal**: Build a premium profile screen with user info, daily summary, settings, and sign-out functionality

**What You'll Learn**:
- Creating new tab screens in Expo Router
- Building reusable card components
- Connecting to Zustand stores
- Implementing sign-out flow
- Premium UI patterns (grouped lists, micro-interactions)
- Responsive layouts and spacing
- Icon usage and visual hierarchy

**Phase 1: Core Profile Screen**

**Step 1: Create Profile Tab Structure**
- [ ] Create `app/(tabs)/profile.tsx`
- [ ] Update tab bar to include "You" tab with user icon
- [ ] Set up basic screen layout with ScrollView
- [ ] Add safe area handling

**Step 2: Build Profile Header Component**
- [ ] Create `components/profile/ProfileHeader.tsx`
- [ ] Add circular avatar placeholder (64px)
  - [ ] Use user initials if no avatar
  - [ ] Add subtle border with theme color
- [ ] Display user name (from profile, 600 weight, 20px)
- [ ] Display email (muted, 14px, 0.6 opacity)
- [ ] Add "Edit Profile" button (outline style)
- [ ] Connect to `useUserStore` for user data

**Step 3: Build Daily Summary Card**
- [ ] Create `components/profile/DailySummaryCard.tsx`
- [ ] Add card container with theme background
- [ ] Display streak counter with fire emoji
- [ ] Show weekly average calories
- [ ] Add weight trend (current → target with arrow)
- [ ] Style with proper spacing (20px padding, 16px radius)
- [ ] Add subtle shadow or border

**Step 4: Build Settings List Component**
- [ ] Create `components/profile/SettingsList.tsx`
- [ ] Create reusable `SettingsRow` component
  - [ ] Icon (left, 24px, theme.text with 0.8 opacity)
  - [ ] Label (16-17px)
  - [ ] Chevron (right, subtle)
  - [ ] Touch target: 56px height
  - [ ] Press animation: scale to 0.97
- [ ] Add Account section card:
  - [ ] Personal Info row
  - [ ] Dietary Preferences row
  - [ ] Goals & Macros row
  - [ ] Units row (show current: Metric/Imperial)
- [ ] Group rows in card with dividers

**Step 5: Implement Sign Out**
- [ ] Create sign-out button at bottom
  - [ ] Outline style (transparent bg)
  - [ ] Gray border (theme.border)
  - [ ] Subtle text (theme.text, 0.7 opacity)
  - [ ] Logout icon
  - [ ] Separated with margin
- [ ] Connect to `useUserStore.signOut()`
- [ ] Add confirmation alert before sign out
- [ ] Handle sign-out errors gracefully
- [ ] Test navigation after sign out

**Step 6: Polish & Micro-interactions**
- [ ] Add fade-in animation on mount
- [ ] Add haptic feedback on sign out (expo-haptics)
- [ ] Add press scale animation to cards
- [ ] Test on both light and dark themes
- [ ] Ensure proper spacing (16-24px between sections)
- [ ] Verify touch targets are large enough (44px minimum)

**Design Specifications**:
```typescript
// Spacing
- Card padding: 20px
- Between sections: 24px
- Row height: 56px
- Border radius: 16px

// Typography
- Name: 20px, weight 600
- Email: 14px, opacity 0.6
- Section titles: 17px, weight 600
- Row labels: 16px

// Colors
- Background: theme.background
- Cards: theme.card
- Text: theme.text
- Muted: theme.muted (0.6 opacity)
- Borders: theme.border
```

**Phase 2: Navigation & Functionality** (Later)
- [ ] Create Edit Profile screen
- [ ] Create Dietary Preferences screen
- [ ] Create Goals & Macros screen
- [ ] Create Units Settings screen
- [ ] Implement navigation from settings rows

**Resources**:
- [Expo Router Tabs](https://docs.expo.dev/router/advanced/tabs/)
- [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

#### 1.9 Integration Tests for Onboarding Flow
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Test the entire onboarding flow end-to-end

**What You'll Learn**:
- Integration testing
- Testing navigation flows
- Testing multi-step forms

**Tasks**:
- [ ] Create `app/__tests__/onboarding.integration.test.tsx`
- [ ] Test complete onboarding flow
  - [ ] Navigate through all steps
  - [ ] Test validation at each step
  - [ ] Test back navigation
  - [ ] Test data persistence
- [ ] Test error states
- [ ] Test submission to Supabase

---

### Week 4: Advanced Testing Concepts

#### 1.9 E2E Testing Setup (Optional but Recommended)
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Set up end-to-end testing with Detox

**What You'll Learn**:
- E2E testing concepts
- Testing real user flows
- CI/CD integration

**Tasks**:
- [ ] Install Detox: `npm install detox --save-dev`
- [ ] Configure Detox for iOS/Android
- [ ] Write E2E test for login flow
- [ ] Write E2E test for logging a meal
- [ ] Write E2E test for viewing dashboard

**Resources**:
- [Detox Documentation](https://wix.github.io/Detox/)

---

#### 1.10 Test Coverage & CI Setup
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Achieve high test coverage and automate testing

**Tasks**:
- [ ] Run coverage report: `npx jest --coverage`
- [ ] Aim for >80% coverage on critical files
- [ ] Set up GitHub Actions for automated testing
- [ ] Add coverage badges to README
- [ ] Configure coverage thresholds in `jest.config.js`

**Example GitHub Actions**:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test --coverage
```

---

## Phase 2: Real-time & Performance 🚀

> **Why This Matters**: As your app grows, performance becomes critical. Real-time features make your app feel modern and responsive.

### Week 5: Supabase Real-time

#### 2.1 Real-time Food Logs
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Implement real-time updates for food logs

**What You'll Learn**:
- Supabase Realtime API
- WebSocket connections
- Subscription management
- Memory leak prevention

**Tasks**:
- [ ] Add real-time subscription to `foodLogStore`
  ```typescript
  subscribeToLogs: () => {
    const userId = useUserStore.getState().user?.id;
    if (!userId) return;

    const channel = supabase
      .channel('food_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_logs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Real-time update:', payload);
          get().fetchTodaysLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };
  ```
- [ ] Call subscription in dashboard `useEffect`
- [ ] Properly clean up subscription on unmount
- [ ] Test with multiple devices/browsers
- [ ] Handle reconnection on network loss

**Resources**:
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)

---

#### 2.2 Real-time Nutrition Summary
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Update daily summary in real-time

**Tasks**:
- [ ] Subscribe to `daily_nutrition_summary` changes
- [ ] Update UI immediately when summary changes
- [ ] Handle race conditions (multiple updates)
- [ ] Add optimistic updates for better UX

---

#### 2.3 Presence Tracking (Advanced)
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Show when friends are online (if you add social features)

**Tasks**:
- [ ] Implement Supabase Presence
- [ ] Show online/offline status
- [ ] Track last seen timestamp

---

### Week 6: Performance Optimization

#### 2.4 Component Optimization
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Prevent unnecessary re-renders

**What You'll Learn**:
- React.memo
- useMemo and useCallback
- React DevTools Profiler
- Performance profiling

**Tasks**:
- [ ] Install React DevTools
- [ ] Profile dashboard rendering
- [ ] Wrap `CalorieCard` in `React.memo`
  ```typescript
  export const CalorieCard = React.memo(({ consumed, goal }) => {
    // component code
  });
  ```
- [ ] Use `useMemo` for expensive calculations
  ```typescript
  const progress = useMemo(() => {
    return (consumed / goal) * 100;
  }, [consumed, goal]);
  ```
- [ ] Use `useCallback` for event handlers
  ```typescript
  const handlePress = useCallback(() => {
    // handler code
  }, [dependencies]);
  ```
- [ ] Measure performance improvement
- [ ] Document findings

**Resources**:
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

#### 2.5 FlatList Optimization
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Build an optimized food log history list

**What You'll Learn**:
- FlatList virtualization
- Pagination
- Infinite scroll
- List performance

**Tasks**:
- [ ] Create `FoodLogList` component with FlatList
- [ ] Implement `getItemLayout` for better performance
  ```typescript
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  ```
- [ ] Add `keyExtractor`
- [ ] Implement `removeClippedSubviews`
- [ ] Add pagination (load 20 items at a time)
- [ ] Implement pull-to-refresh
- [ ] Add infinite scroll (load more on scroll)
- [ ] Test with 1000+ items

**Example**:
```typescript
<FlatList
  data={logs}
  renderItem={({ item }) => <FoodLogItem log={item} />}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: 80,
    offset: 80 * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

---

#### 2.6 Image Optimization
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Optimize food item images

**Tasks**:
- [ ] Install `expo-image`: `npx expo install expo-image`
- [ ] Replace `Image` with `expo-image`
- [ ] Implement image caching
- [ ] Add placeholder images
- [ ] Lazy load images
- [ ] Compress images before upload

---

#### 2.7 Bundle Size Optimization
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Reduce app bundle size

**Tasks**:
- [ ] Analyze bundle: `npx expo-cli customize:web`
- [ ] Remove unused dependencies
- [ ] Use dynamic imports for heavy screens
  ```typescript
  const HeavyScreen = lazy(() => import('./HeavyScreen'));
  ```
- [ ] Enable Hermes engine (if not already)
- [ ] Measure bundle size before/after

---

## Phase 3: Advanced TypeScript 🎯

> **Why This Matters**: Better types = fewer bugs, better autocomplete, and more maintainable code.

### Week 7: Type System Mastery

#### 3.1 Discriminated Unions for State
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Refactor stores to use discriminated unions

**What You'll Learn**:
- Discriminated unions
- Type narrowing
- Exhaustive type checking

**Tasks**:
- [ ] Create `FetchState` type
  ```typescript
  type FetchState<T> = 
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: T }
    | { status: 'error'; error: Error };
  ```
- [ ] Refactor `foodLogStore` to use `FetchState`
- [ ] Update components to handle all states
  ```typescript
  if (state.status === 'success') {
    // TypeScript knows state.data exists here
    return <FoodList data={state.data} />;
  }
  ```
- [ ] Add exhaustive checks
  ```typescript
  const exhaustiveCheck = (x: never): never => {
    throw new Error(`Unhandled case: ${x}`);
  };
  ```

**Resources**:
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

---

#### 3.2 Generic Hooks
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Create reusable, type-safe hooks

**Tasks**:
- [ ] Create `useAsync` hook
  ```typescript
  function useAsync<T>(
    asyncFunction: () => Promise<T>,
    immediate = true
  ): FetchState<T> & { execute: () => Promise<void> } {
    const [state, setState] = useState<FetchState<T>>({ status: 'idle' });

    const execute = useCallback(async () => {
      setState({ status: 'loading' });
      try {
        const data = await asyncFunction();
        setState({ status: 'success', data });
      } catch (error) {
        setState({ status: 'error', error: error as Error });
      }
    }, [asyncFunction]);

    useEffect(() => {
      if (immediate) execute();
    }, [execute, immediate]);

    return { ...state, execute };
  }
  ```
- [ ] Create `useSupabaseQuery` hook
- [ ] Create `useSupabaseMutation` hook
- [ ] Use in components

---

#### 3.3 Branded Types for IDs
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Prevent mixing up different ID types

**Tasks**:
- [ ] Create branded types
  ```typescript
  type UserId = string & { readonly __brand: 'UserId' };
  type FoodItemId = string & { readonly __brand: 'FoodItemId' };
  type FoodLogId = string & { readonly __brand: 'FoodLogId' };

  function createUserId(id: string): UserId {
    return id as UserId;
  }
  ```
- [ ] Update interfaces to use branded types
- [ ] Fix type errors throughout codebase

---

#### 3.4 Template Literal Types
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Type-safe routes and keys

**Tasks**:
- [ ] Create route types
  ```typescript
  type Route = 
    | '/'
    | '/dashboard'
    | '/onboarding'
    | `/profile/${string}`;
  ```
- [ ] Create storage key types
  ```typescript
  type StorageKey = 
    | 'leanfuel-onboarding'
    | 'leanfuel-user'
    | `leanfuel-cache-${string}`;
  ```
- [ ] Use in navigation and storage

---

#### 3.5 Utility Types
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Master TypeScript utility types

**Tasks**:
- [ ] Use `Pick` to create subset types
  ```typescript
  type UserBasicInfo = Pick<UserProfile, 'id' | 'display_name' | 'avatar_url'>;
  ```
- [ ] Use `Omit` to exclude fields
  ```typescript
  type CreateUserInput = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
  ```
- [ ] Use `Partial` for updates
  ```typescript
  type UpdateUserInput = Partial<UserProfile>;
  ```
- [ ] Use `Required` to make fields mandatory
- [ ] Use `Record` for key-value types
  ```typescript
  type ErrorMessages = Record<string, string>;
  ```

---

## Phase 4: Data Visualization 📊

> **Why This Matters**: Users want to see their progress visually. Charts and graphs make data meaningful.

### Week 8-9: Charts & Graphs

#### 4.1 Setup Victory Native
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Install and configure charting library

**Tasks**:
- [ ] Install: `npm install victory-native react-native-svg`
- [ ] Test basic chart rendering
- [ ] Create chart theme matching your app

---

#### 4.2 Weekly Calorie Trend Chart
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Show calorie intake over the past week

**Tasks**:
- [ ] Create `CalorieTrendChart` component
- [ ] Fetch last 7 days of data
- [ ] Implement line chart with Victory
  ```typescript
  <VictoryChart>
    <VictoryLine
      data={weekData}
      x="date"
      y="calories"
      style={{ data: { stroke: "#4CAF50" } }}
    />
    <VictoryAxis />
  </VictoryChart>
  ```
- [ ] Add goal line overlay
- [ ] Add tooltips on data points
- [ ] Make it responsive

---

#### 4.3 Macro Distribution Pie Chart
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Visualize protein/carbs/fat breakdown

**Tasks**:
- [ ] Create `MacroPieChart` component
- [ ] Calculate macro percentages
- [ ] Implement pie chart
  ```typescript
  <VictoryPie
    data={[
      { x: "Protein", y: proteinCals },
      { x: "Carbs", y: carbsCals },
      { x: "Fat", y: fatCals },
    ]}
    colorScale={["#FF6384", "#36A2EB", "#FFCE56"]}
  />
  ```
- [ ] Add legend
- [ ] Add percentage labels

---

#### 4.4 Weight Progress Graph
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Track weight loss/gain over time

**Tasks**:
- [ ] Create `WeightProgressChart` component
- [ ] Fetch weight logs from database
- [ ] Implement area chart
- [ ] Add target weight line
- [ ] Calculate trend line
- [ ] Show progress percentage

---

#### 4.5 Streak Tracking
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Gamify daily logging with streaks

**Tasks**:
- [ ] Create `StreakCard` component
- [ ] Calculate current streak
- [ ] Calculate longest streak
- [ ] Add visual calendar heatmap
- [ ] Add streak milestones (7 days, 30 days, etc.)

---

#### 4.6 Progress Dashboard
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Create a comprehensive progress screen

**Tasks**:
- [ ] Create new `ProgressScreen`
- [ ] Add all charts to screen
- [ ] Add date range selector
- [ ] Add export data feature
- [ ] Make it shareable (screenshot)

---

## Phase 5: Offline-First Architecture 🔌

> **Why This Matters**: Users don't always have internet. Your app should work offline and sync when back online.

### Week 10-11: Offline Support

#### 5.1 NetInfo Integration
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Detect online/offline status

**Tasks**:
- [ ] Install: `npx expo install @react-native-community/netinfo`
- [ ] Create `useNetworkStatus` hook
  ```typescript
  import NetInfo from '@react-native-community/netinfo';

  function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsOnline(state.isConnected ?? false);
      });

      return () => unsubscribe();
    }, []);

    return isOnline;
  }
  ```
- [ ] Show offline banner when disconnected
- [ ] Disable sync-dependent features when offline

---

#### 5.2 Optimistic Updates
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Update UI immediately, sync later

**What You'll Learn**:
- Optimistic UI patterns
- Rollback strategies
- Conflict resolution

**Tasks**:
- [ ] Refactor `addLog` with optimistic update
  ```typescript
  addLog: async (input) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticLog = { ...input, id: tempId, synced: false };

    // 1. Update UI immediately
    set(state => ({
      todaysLogs: [optimisticLog, ...state.todaysLogs]
    }));

    try {
      // 2. Save to server
      const { data, error } = await supabase
        .from('food_logs')
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      // 3. Replace temp with real
      set(state => ({
        todaysLogs: state.todaysLogs.map(log =>
          log.id === tempId ? { ...data, synced: true } : log
        )
      }));
    } catch (error) {
      // 4. Mark as failed, don't remove (will retry later)
      set(state => ({
        todaysLogs: state.todaysLogs.map(log =>
          log.id === tempId ? { ...log, syncFailed: true } : log
        )
      }));
    }
  }
  ```
- [ ] Add visual indicator for unsynced items
- [ ] Implement retry on reconnect

---

#### 5.3 Offline Queue System
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Queue failed operations and retry when online

**Tasks**:
- [ ] Create `offlineQueue` store
  ```typescript
  interface QueuedOperation {
    id: string;
    type: 'add' | 'update' | 'delete';
    table: string;
    data: any;
    timestamp: number;
    retries: number;
  }
  ```
- [ ] Store failed operations in queue
- [ ] Process queue when back online
- [ ] Handle conflicts (server data changed)
- [ ] Persist queue to AsyncStorage

---

#### 5.4 Conflict Resolution
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Handle data conflicts intelligently

**Tasks**:
- [ ] Implement "last write wins" strategy
- [ ] Add conflict detection
- [ ] Show conflict resolution UI to user
- [ ] Test with multiple devices

---

#### 5.5 Offline Data Caching
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Cache data for offline access

**Tasks**:
- [ ] Cache food items database
- [ ] Cache user profile
- [ ] Cache recent food logs
- [ ] Implement cache invalidation
- [ ] Set cache expiration times

---

## Phase 6: Advanced React Patterns 🎨

> **Why This Matters**: These patterns make your code more reusable, testable, and maintainable.

### Week 12: Component Patterns

#### 6.1 Compound Components
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Create flexible, composable components

**What You'll Learn**:
- Compound component pattern
- React Context for component communication
- Flexible APIs

**Tasks**:
- [ ] Create `Card` compound component
  ```typescript
  const Card = ({ children }) => {
    return <View>{children}</View>;
  };

  Card.Header = ({ children }) => {
    return <View>{children}</View>;
  };

  Card.Body = ({ children }) => {
    return <View>{children}</View>;
  };

  Card.Footer = ({ children }) => {
    return <View>{children}</View>;
  };

  // Usage:
  <Card>
    <Card.Header>Title</Card.Header>
    <Card.Body>Content</Card.Body>
    <Card.Footer>Actions</Card.Footer>
  </Card>
  ```
- [ ] Create `Form` compound component
- [ ] Refactor existing components to use pattern

---

#### 6.2 Render Props
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Share code between components using render props

**Tasks**:
- [ ] Create `DataFetcher` component with render prop
  ```typescript
  function DataFetcher({ url, children }) {
    const [state, setState] = useState({ status: 'loading' });

    useEffect(() => {
      fetch(url)
        .then(data => setState({ status: 'success', data }))
        .catch(error => setState({ status: 'error', error }));
    }, [url]);

    return children(state);
  }

  // Usage:
  <DataFetcher url="/api/logs">
    {({ status, data, error }) => {
      if (status === 'loading') return <Loading />;
      if (status === 'error') return <Error error={error} />;
      return <LogList data={data} />;
    }}
  </DataFetcher>
  ```
- [ ] Create `Toggle` component with render prop
- [ ] Create `Mouse` tracker with render prop

---

#### 6.3 Custom Hooks Library
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Build a library of reusable hooks

**Tasks**:
- [ ] Create `hooks/` directory structure
- [ ] Implement `useDebounce` hook
  ```typescript
  function useDebounce<T>(value: T, delay: number): T {
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
- [ ] Implement `useLocalStorage` hook
- [ ] Implement `usePrevious` hook
- [ ] Implement `useToggle` hook
- [ ] Implement `useInterval` hook
- [ ] Document all hooks with examples

---

#### 6.4 Error Boundaries
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Gracefully handle errors in UI

**Tasks**:
- [ ] Create `ErrorBoundary` component
  ```typescript
  class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error caught:', error, errorInfo);
      // Log to error reporting service
    }

    render() {
      if (this.state.hasError) {
        return <ErrorFallback error={this.state.error} />;
      }

      return this.props.children;
    }
  }
  ```
- [ ] Wrap app in ErrorBoundary
- [ ] Create error fallback UI
- [ ] Add error reporting (Sentry)
- [ ] Test error boundaries

---

#### 6.5 Higher-Order Components (HOCs)
**Status**: [ ] Not Started | [ ] In Progress | [ ] Done

**Goal**: Enhance components with additional functionality

**Tasks**:
- [ ] Create `withAuth` HOC
  ```typescript
  function withAuth<P>(Component: React.ComponentType<P>) {
    return (props: P) => {
      const { user } = useUserStore();

      if (!user) {
        return <Redirect to="/login" />;
      }

      return <Component {...props} />;
    };
  }

  // Usage:
  export default withAuth(DashboardScreen);
  ```
- [ ] Create `withLoading` HOC
- [ ] Create `withErrorHandling` HOC

---

## Bonus: Production Readiness 🚢

### Security
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Set up environment variables properly
- [ ] Add API key rotation
- [ ] Implement CSRF protection

### Monitoring & Analytics
- [ ] Set up Sentry for error tracking
- [ ] Add analytics (Mixpanel/Amplitude)
- [ ] Implement performance monitoring
- [ ] Add user session recording
- [ ] Set up crash reporting

### Accessibility
- [ ] Add screen reader support
- [ ] Test with VoiceOver/TalkBack
- [ ] Add proper ARIA labels
- [ ] Ensure color contrast ratios
- [ ] Add keyboard navigation

### Documentation
- [ ] Write comprehensive README
- [ ] Document API endpoints
- [ ] Create component storybook
- [ ] Write contribution guidelines
- [ ] Add inline code documentation

### CI/CD
- [ ] Set up GitHub Actions
- [ ] Automate testing
- [ ] Automate builds
- [ ] Set up staging environment
- [ ] Implement blue-green deployments

---

## Resources 📚

### Testing
- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing JavaScript by Kent C. Dodds](https://testingjavascript.com/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Total TypeScript](https://www.totaltypescript.com/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

### React Native
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [William Candillon YouTube](https://www.youtube.com/c/wcandillon)

### Performance
- [React Performance](https://react.dev/learn/render-and-commit)
- [React Native Performance](https://reactnative.dev/docs/performance)

### Patterns
- [React Patterns](https://reactpatterns.com/)
- [Advanced React Patterns](https://kentcdodds.com/blog/advanced-react-component-patterns)

---

## Notes & Learnings 📝

> Use this section to document your learnings, challenges, and solutions as you progress through the roadmap.

### Date: [Add date]
**What I learned**:
- 

**Challenges faced**:
- 

**Solutions**:
- 

**Resources that helped**:
- 

---

## Progress Tracking

**Started**: December 3, 2025  
**Current Phase**: Phase 1 - Testing Mastery  
**Completion**: 0%

**Weekly Goals**:
- Week 1: [ ] Complete error handling tests
- Week 2: [ ] Complete store tests
- Week 3: [ ] Complete component tests
- Week 4: [ ] Complete integration tests

---

*Remember: Learning is a journey, not a race. Take your time, understand each concept deeply, and don't hesitate to revisit topics. Good luck! 🚀*
