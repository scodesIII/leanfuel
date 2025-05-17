import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the store state type
interface CounterState {
  count: number;
}

// Define the store actions type
interface CounterActions {
  increment: (amount?: number) => void;
  decrement: (amount?: number) => void;
  reset: () => void;
}

// Combine state and actions for the complete store type
type CounterStore = CounterState & CounterActions;

// Initial state in a separate constant for better testing and reusability
const initialState: CounterState = {
  count: 0,
};

// Create the store with middleware and improved typings
export const useCounterStore = create<CounterStore>()(
  devtools(
    persist(
      (set) => ({
        // State
        ...initialState,
        
        // Actions
        increment: (amount = 1) => 
          set(
            (state) => ({ count: state.count + amount }),
            false,
            'counter/increment'
          ),
        
        decrement: (amount = 1) => 
          set(
            (state) => ({ count: state.count - amount }),
            false,
            'counter/decrement'
          ),
        
        reset: () => 
          set(
            initialState,
            false,
            'counter/reset'
          ),
      }),
      {
        name: 'counter-storage',
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    { name: 'CounterStore' }
  )
);