import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/superbase';



export const WaterTracker = () => {
    const [waterData, setWaterData] = useState({
        goal_ml: 0,
        total_ml: 0,
        total_glasses: 0,
        percentage: 0,
    });

    const fetchWaterData = async () => {
        try {
            const { data, error } = await supabase.rpc('get_todays_water')

            if ( error) throw error;

            if (data) {
                setWaterData(data);
            }

        } catch (error) {
            console.log('Error: ', error);
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

