import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/superbase';


interface WaterTrackerProps {
    goal_ml: number;
    total_ml: number;
    total_glasses: number;
    percentage: number;
    isLoading: boolean;
}

export const WaterTracker = ({ goal_ml, total_ml, total_glasses, percentage, isLoading }: WaterTrackerProps) => {
    const [waterData, setWaterData] = useState({
        goal_ml: 0,
        total_ml: 0,
        total_glasses: 0,
        percentage: 0,
    });
    
    return (
        <View>
            
        </View>             
    );
};

