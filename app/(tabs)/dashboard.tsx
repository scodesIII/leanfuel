import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Plus, Droplets, Activity, Target, TrendingUp } from 'lucide-react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUserStore } from '@/stores/userStore';
import { CalorieCard } from '@/components/dashboard/CalorieCard';

const Dashboard = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'border');

  const [caloriesConsumed, setCaloriesConsumed] = useState(1699);
  const [waterIntake, setWaterIntake] = useState(6);
  const [steps] = useState(7495);
  const [weight] = useState(68.5);

  const { profile, isLoading } = useUserStore();
  const user = useUserStore((state) => state.user);

  // console.log('Profile data:', profile);
  // console.log('Calorie goal:', profile?.daily_calorie_goal);

  const caloriesGoal = profile?.daily_calorie_goal ?? 0;
  const caloriesRemaining = caloriesGoal - caloriesConsumed;
  const calorieProgress = (caloriesConsumed / caloriesGoal) * 100;

  // Prefer display_name from profile, fallback to email
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  const macros = {
    carbs: { consumed: 125, goal: 250, color: '#fb923c' },
    protein: { consumed: 85, goal: 150, color: '#60a5fa' },
    fat: { consumed: 45, goal: 67, color: '#4ade80' }
  };

  const recentFoods = [
    { name: 'Oatmeal with Almonds', calories: 285, time: '8:30 AM', meal: 'Breakfast' },
    { name: 'Chicken Caesar Salad', calories: 420, time: '12:45 PM', meal: 'Lunch' },
    { name: 'Greek Yogurt', calories: 150, time: '3:20 PM', meal: 'Snack' }
  ];

  const CircularProgress = ({ progress, size = 140, strokeWidth = 12, color = '#4CAF50' }: { progress: number; size?: number; strokeWidth?: number; color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
        {/* Note: For React Native, you'll need react-native-svg for actual SVG rendering */}
        {/* This is a placeholder - replace with react-native-svg implementation */}
        <ThemedView style={{ alignItems: 'center' }}>
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>{caloriesRemaining}</ThemedText>
          <ThemedText style={{ fontSize: 14, opacity: 0.7 }}>calories left</ThemedText>
        </ThemedView>
      </View>
    );
  };

  const MacroCard = ({ macro, label, color }: { macro: { consumed: number; goal: number }; label: string; color: string }) => {
    const progress = (macro.consumed / macro.goal) * 100;
    return (
      <ThemedView style={{ backgroundColor: cardBackground, borderRadius: 12, padding: 16, flex: 1, marginHorizontal: 4 }}>
        <ThemedText style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</ThemedText>
        <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
          {macro.consumed}g
        </ThemedText>
        <ThemedText style={{ fontSize: 12, opacity: 0.6, marginBottom: 12 }}>of {macro.goal}g</ThemedText>
        <View style={{ height: 8, backgroundColor: borderColor, borderRadius: 4, overflow: 'hidden' }}>
          <View
            style={{
              height: '100%',
              backgroundColor: color,
              borderRadius: 4,
              width: `${Math.min(progress, 100)}%`
            }}
          />
        </View>
      </ThemedView>
    );
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, iconColor = "#3B82F6" }: { icon: any, title: string, value: string | number, subtitle: string, iconColor?: string }) => (
    <ThemedView style={{ backgroundColor: cardBackground, borderRadius: 12, padding: 16, flex: 1, marginHorizontal: 4 }}>
      <Icon size={24} color={iconColor} style={{ marginBottom: 8 }} />
      <ThemedText style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{title}</ThemedText>
      <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>{value}</ThemedText>
      <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>{subtitle}</ThemedText>
    </ThemedView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Hi, {displayName}! 👋</ThemedText>
          <ThemedText style={{ opacity: 0.7, marginTop: 4 }}>Let's crush your goals today</ThemedText>
        </ThemedView>

        {/* Main Calorie Card */}
        <ThemedView style={{ marginHorizontal: 24, marginBottom: 24 }}>
          <CalorieCard
            consumed={caloriesConsumed}
            goal={caloriesGoal}
          />
        </ThemedView>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;