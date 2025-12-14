import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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

    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');

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

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={{ color: mutedColor }}>Loading water data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchWaterData}>
                    <Text style={{ color: textColor }}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }
    
    return (
        <View style={[styles.container, { backgroundColor: cardColor }]}>
            <View style={styles.quickAddContainer}>
                <TouchableOpacity 
                    style={styles.quickAddButton}
                    onPress={() => addWater(250, 'glass')}
                >
                    <Text style={styles.quickAddIcon}>🥤</Text>
                    <Text style={[styles.quickAddLabel, { color: textColor }]}>Glass</Text>
                    <Text style={[styles.quickAddAmount, { color: mutedColor }]}>250ml</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.quickAddButton}
                    onPress={() => addWater(500, 'bottle')}
                >
                    <Text style={styles.quickAddIcon}>💧</Text>
                    <Text style={[styles.quickAddLabel, { color: textColor }]}>Bottle</Text>
                    <Text style={[styles.quickAddAmount, { color: mutedColor }]}>500ml</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.quickAddButton}
                    onPress={() => addWater(1000, 'liter')}
                >
                    <Text style={styles.quickAddIcon}>🚰</Text>
                    <Text style={[styles.quickAddLabel, { color: textColor }]}>Liter</Text>
                    <Text style={[styles.quickAddAmount, { color: mutedColor }]}>1000ml</Text>
                </TouchableOpacity>
            </View>  
    </View>
                  
    );
};


const styles = StyleSheet.create({
  container: {
    padding: 28,
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  
  quickAddContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  
  quickAddButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },

  quickAddIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  quickAddLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },

  quickAddAmount: {
      fontSize: 11,
    opacity: 0.6,
  },

  errorText: {
    color: '#FF4757',
    fontSize: 14,
    marginBottom: 12,
  },
  
  // .. add more styles matching CalorieCard patterns
});
