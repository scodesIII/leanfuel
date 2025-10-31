import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, Plus, Clock, Camera, Barcode, BookOpen } from 'lucide-react-native';

const FoodLoggingScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [dailyCalories] = useState({ consumed: 1250, goal: 2000 });

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;

  const loggedFoods = {
    'Breakfast': [
      { id: 1, name: 'Oatmeal with Almond Milk', calories: 285, carbs: 45, protein: 12, fat: 8, time: '8:30 AM' },
      { id: 2, name: 'Banana', calories: 105, carbs: 27, protein: 1, fat: 0, time: '8:35 AM' }
    ],
    'Lunch': [
      { id: 3, name: 'Chicken Caesar Salad', calories: 420, carbs: 15, protein: 35, fat: 28, time: '12:45 PM' },
      { id: 4, name: 'Whole Wheat Roll', calories: 150, carbs: 28, protein: 5, fat: 3, time: '12:45 PM' }
    ],
    'Dinner': [],
    'Snacks': [
      { id: 5, name: 'Greek Yogurt', calories: 150, carbs: 12, protein: 20, fat: 6, time: '3:20 PM' }
    ]
  };

  const recentFoods = [
    { id: 1, name: 'Greek Yogurt, Plain', calories: 150, brand: 'Chobani' },
    { id: 2, name: 'Chicken Breast, Grilled', calories: 231, brand: 'Generic' },
    { id: 3, name: 'Avocado Toast', calories: 320, brand: 'Homemade' },
    { id: 4, name: 'Apple, Medium', calories: 95, brand: 'Generic' },
    { id: 5, name: 'Almonds, Raw', calories: 162, brand: 'Blue Diamond' }
  ];

  const quickAddItems = [
    { id: 1, name: 'Water Glass', icon: '💧', action: 'water' },
    { id: 2, name: 'Coffee', icon: '☕', calories: 5 },
    { id: 3, name: 'Apple', icon: '🍎', calories: 95 },
    { id: 4, name: 'Banana', icon: '🍌', calories: 105 }
  ];

  const DailyProgress = () => {
    const percentage = (dailyCalories.consumed / dailyCalories.goal) * 100;
    return (
      <View className="bg-green-50 rounded-xl p-4 mx-6 mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-semibold text-gray-800">Daily Intake</Text>
          <Text className="text-2xl font-bold text-green-600">{percentage.toFixed(1)}%</Text>
        </View>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm text-gray-600">{dailyCalories.consumed} of {dailyCalories.goal} calories</Text>
          <Text className="text-sm font-medium text-green-600">{dailyCalories.goal - dailyCalories.consumed} remaining</Text>
        </View>
        <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <View 
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </View>
      </View>
    );
  };

  const MealSection = ({ mealType }: { mealType: keyof typeof loggedFoods }) => {
    const foods = loggedFoods[mealType] || [];
    const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);

    return (
      <View className="bg-white rounded-xl shadow-sm mx-6 mb-4 overflow-hidden">
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-lg font-semibold text-gray-800">{mealType}</Text>
              {totalCalories > 0 && (
                <Text className="ml-3 text-sm text-gray-500">
                  {totalCalories} cal
                </Text>
              )}
            </View>
            <TouchableOpacity 
              className="bg-green-500 rounded-full p-2"
              onPress={() => setSelectedMeal(mealType)}
            >
              <Plus size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {foods.length > 0 ? (
          foods.map((food) => (
            <View key={food.id} className="p-4 border-b border-gray-50 last:border-b-0">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">{food.name}</Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    C: {food.carbs}g • P: {food.protein}g • F: {food.fat}g
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">{food.time}</Text>
                </View>
                <Text className="font-semibold text-gray-800">{food.calories} cal</Text>
              </View>
            </View>
          ))
        ) : (
          <View className="p-4">
            <Text className="text-gray-400 text-center">No items logged yet</Text>
          </View>
        )}
      </View>
    );
  };

  const QuickAddSection = () => (
    <View className="px-6 mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Quick Add</Text>
      <View className="flex-row flex-wrap gap-3">
        {quickAddItems.map((item) => (
          <TouchableOpacity 
            key={item.id}
            className="bg-white rounded-xl p-3 shadow-sm items-center min-w-[80px]"
          >
            <Text className="text-2xl mb-1">{item.icon}</Text>
            <Text className="text-xs font-medium text-gray-700 text-center">{item.name}</Text>
            {item.calories && (
              <Text className="text-xs text-gray-500">{item.calories} cal</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const SearchSection = () => (
    <View className="px-6 mb-6">
      <View className="bg-white rounded-xl shadow-sm overflow-hidden">
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2">
            <Search size={20} color="#6B7280" />
            <TextInput
              placeholder="Search foods..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-gray-800"
            />
          </View>
        </View>
        
        <View className="flex-row">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center p-4 border-r border-gray-100">
            <Camera size={20} color="#6B7280" />
            <Text className="ml-2 text-gray-700 font-medium">Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 flex-row items-center justify-center p-4 border-r border-gray-100">
            <Barcode size={20} color="#6B7280" />
            <Text className="ml-2 text-gray-700 font-medium">Barcode</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 flex-row items-center justify-center p-4">
            <BookOpen size={20} color="#6B7280" />
            <Text className="ml-2 text-gray-700 font-medium">Recipes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const RecentFoodsSection = () => (
    <View className="px-6 mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-800">Recent Foods</Text>
        <TouchableOpacity>
          <Text className="text-green-500 font-medium">View All</Text>
        </TouchableOpacity>
      </View>
      
      <View className="bg-white rounded-xl shadow-sm overflow-hidden">
        {recentFoods.slice(0, 5).map((food, index) => (
          <TouchableOpacity 
            key={food.id}
            className={`p-4 flex-row justify-between items-center ${
              index !== recentFoods.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <View className="flex-1">
              <Text className="font-medium text-gray-800">{food.name}</Text>
              <Text className="text-sm text-gray-500 mt-1">{food.brand}</Text>
            </View>
            <View className="items-end">
              <Text className="font-semibold text-gray-800">{food.calories} cal</Text>
              <Plus size={16} color="#10B981" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-2xl font-bold text-gray-800">Food Diary</Text>
          <Text className="text-gray-500 mt-1">Track your meals for today</Text>
        </View>

        {/* Daily Progress */}
        <DailyProgress />

        {/* Search Section */}
        <SearchSection />

        {/* Quick Add */}
        <QuickAddSection />

        {/* Meal Sections */}
        <View className="mb-6">
          <View className="px-6 mb-4">
            <Text className="text-lg font-semibold text-gray-800">Today's Meals</Text>
          </View>
          {mealTypes.map((mealType) => (
            <MealSection key={mealType} mealType={mealType} />
          ))}
        </View>

        {/* Recent Foods */}
        <RecentFoodsSection />

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity className="absolute bottom-6 right-6 bg-green-500 rounded-full p-4 shadow-lg">
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default FoodLoggingScreen;