import { FlatList, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FoodSearchResult } from '@/types/food';
import { FoodSearchItem } from './FoodSearchItem';
import { FoodSearchEmpty } from './FoodSearchEmpty';

interface FoodSearchResultsProps {
    results: FoodSearchResult[];
    query: string;
    isSearching: boolean;
    onSelectFood: (item: FoodSearchResult) => void;
}

export function FoodSearchResults({
    results,
    query,
    isSearching,
    onSelectFood,
}: FoodSearchResultsProps) {
    const primaryColor = useThemeColor({}, 'primary');

    // Loading state
    if (isSearching) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
            </View>
        );
    }

    // Empty state (no query or no results)
    if (results.length === 0) {
        return <FoodSearchEmpty query={query} />;
    }

    // Results list
    return (
        <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <FoodSearchItem item={item} onPress={onSelectFood} />
            )}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
        />
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    listContent: {
        flexGrow: 1,
    },
});