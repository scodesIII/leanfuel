import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity} from 'react-native';
import { Plus, Droplets, Activity, Target, TrendingUp } from 'lucide-react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUserStore } from '@/stores/userStore';

const Dashboard = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'border');

  const [caloriesConsumed, setCaloriesConsumed] = useState(1250);
  const [caloriesGoal] = useState(2000);
  const [waterIntake, setWaterIntake] = useState(6);
  const [steps] = useState(7495);
  const [weight] = useState(68.5);

  const caloriesRemaining = caloriesGoal - caloriesConsumed;
  const calorieProgress = (caloriesConsumed / caloriesGoal) * 100;

  const profile = useUserStore((state) => state.profile);
  const user = useUserStore((state) => state.user);

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
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>Hi, { displayName }! 👋</ThemedText>
          <ThemedText style={{ opacity: 0.7, marginTop: 4 }}>Let's crush your goals today</ThemedText>
        </ThemedView>

        {/* Main Calorie Card */}
        <ThemedView style={{ marginHorizontal: 24, marginBottom: 24 }}>
          <ThemedView style={{ backgroundColor: cardBackground, borderRadius: 16, padding: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>Today's Calories</ThemedText>
              <TouchableOpacity style={{ backgroundColor: primaryColor, borderRadius: 20, padding: 8 }}>
                <Plus size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <CircularProgress progress={calorieProgress} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>{caloriesConsumed}</ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Consumed</ThemedText>
              </View>
              <View style={{ alignItems: 'center' }}>
                <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>{caloriesGoal}</ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Goal</ThemedText>
              </View>
            </View>
          </ThemedView>
        </ThemedView>

        {/* Macros Grid */}
        <ThemedView style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Macronutrients</ThemedText>
          <View style={{ flexDirection: 'row' }}>
            <MacroCard macro={macros.carbs} label="CARBS" color={macros.carbs.color} />
            <MacroCard macro={macros.protein} label="PROTEIN" color={macros.protein.color} />
            <MacroCard macro={macros.fat} label="FAT" color={macros.fat.color} />
          </View>
        </ThemedView>

        {/* Stats Row */}
        <ThemedView style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row' }}>
            <StatCard 
              icon={Activity}
              title="STEPS"
              value={steps.toLocaleString()}
              subtitle="of 10,000 goal"
              iconColor="#8B5CF6"
            />
            <StatCard 
              icon={Droplets}
              title="WATER"
              value={`${waterIntake}/8`}
              subtitle="glasses today"
              iconColor="#3B82F6"
            />
          </View>
        </ThemedView>

        {/* Recent Foods */}
        <ThemedView style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>Recent Foods</ThemedText>
            <TouchableOpacity>
              <ThemedText style={{ color: primaryColor, fontWeight: '500' }}>View All</ThemedText>
            </TouchableOpacity>
          </View>
          
          <ThemedView style={{ backgroundColor: cardBackground, borderRadius: 12, overflow: 'hidden' }}>
            {recentFoods.map((food, index) => (
              <ThemedView key={index} style={{
                padding: 16,
                borderBottomWidth: index !== recentFoods.length - 1 ? 1 : 0,
                borderBottomColor: borderColor
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontWeight: '500' }}>{food.name}</ThemedText>
                    <ThemedText style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>{food.meal} • {food.time}</ThemedText>
                  </View>
                  <ThemedText style={{ fontWeight: '600' }}>{food.calories} cal</ThemedText>
                </View>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Quick Actions</ThemedText>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: '#10b981', borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 4 }}>
              <Plus size={24} color="white" />
              <ThemedText style={{ color: 'white', fontWeight: '500', marginTop: 8 }}>Log Food</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: '#3b82f6', borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 4 }}>
              <Droplets size={24} color="white" />
              <ThemedText style={{ color: 'white', fontWeight: '500', marginTop: 8 }}>Add Water</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: '#8b5cf6', borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 4 }}>
              <TrendingUp size={24} color="white" />
              <ThemedText style={{ color: 'white', fontWeight: '500', marginTop: 8 }}>Progress</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;