import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/superbase';

interface WaterSummary {
  total_ml: number;
  total_glasses: number;
  entries_count: number;
  goal_ml: number;
  percentage: number;
  remaining_ml: number;
  first_log_time?: string;
  last_log_time?: string;
}


interface LogWaterResponse {
  success: boolean;
  water_log_id: string;
  amount_ml: number;
  total_ml: number;
  goal_ml: number;
  percentage: number;
}

export const WaterTracker = () => {
    const [waterData, setWaterData] = useState<WaterSummary>({
        total_ml: 0,
        total_glasses: 0,
        entries_count: 0,
        goal_ml: 2000,
        percentage: 0,
        remaining_ml: 2000,
    })

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWaterData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: rpcError } = await supabase.rpc('get_todays_water');

            if (rpcError) throw rpcError;

            const summary = data as WaterSummary;
            setWaterData(summary);
            
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load water data');
            console.error('Water fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const addWater = async(amount_ml: number, container_type: string) => {
        try {
            const { data, error: rpcError } = await supabase.rpc('log_water', {
                p_amount_ml: amount_ml,
                p_container_type: container_type,
            });

            if (rpcError) throw rpcError;
            
            const response = data as LogWaterResponse;

            setWaterData((prevWaterData) => ({
                ...prevWaterData,
                total_ml: response.total_ml,
                total_glasses: Math.round(response.total_ml / 250),
                percentage: response.percentage,
                remaining_ml: response.goal_ml - response.total_ml,
                entries_count: prevWaterData.entries_count + 1,
            }));
            
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to log water');
            console.error('Water log error:', error);
        }
    }

    useEffect(() => {
        fetchWaterData();
    }, []);
    
    return (
        <View>
            
        </View>             
    );
};

