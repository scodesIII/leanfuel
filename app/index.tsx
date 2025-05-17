import { View, Text, TouchableOpacity } from 'react-native';
import { useCounterStore } from '../store';

import { useRouter } from 'expo-router';
import { Button } from 'react-native';

import { Alert, AlertText, AlertIcon } from "@/components/ui/alert"
import { InfoIcon } from "../components/ui/icon/index";

export default function Home() {
  const router = useRouter();

  // Only re-render when count changes
  const count = useCounterStore(state => state.count);
  const increment = useCounterStore(state => state.increment);
  const decrement = useCounterStore(state => state.decrement);

  // NOT this (causes re-renders on any state change)
  // const { count, increment, decrement } = useStore();

  // Create handler functions that match the expected GestureResponderEvent type ERROR
  const handleIncrement = () => increment();
  const handleDecrement = () => decrement();
  // Alternative solutions
  // <TouchableOpacity onPress={increment as any}>

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Welcome to Your App</Text>

      <Text className="text-lg mb-4">Count: {count}</Text>

      <View className="flex-row space-x-4">
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg mr-4"
          onPress={handleIncrement}
        >
          <Text className="text-white font-semibold">Increment (+)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-500 px-6 py-3 rounded-lg"
          onPress={handleDecrement}
        >
          <Text className="text-white font-semibold">Decrement (-)</Text>
        </TouchableOpacity>
      </View>

    
    
    <View className='mt-8'>
      <Alert action="muted" variant="solid">
        <AlertIcon as={InfoIcon} />
        <AlertText>This is an alert!</AlertText>
      </Alert>
    </View>

    </View>
  );
}