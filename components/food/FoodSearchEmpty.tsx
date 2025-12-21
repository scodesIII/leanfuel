import { View, Text, StyleSheet } from 'react-native';
import { Search, FileQuestion } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface FoodSearchEmptyProps {
    query: string;
}


export function FoodSearchEmpty({ query }: FoodSearchEmptyProps) {
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    

    // Determine which state we are in
    const hasSearched = query.length > 2;



    return (
        <View style={styles.container}>
            {hasSearched ? (
                // No results found
                <>
                    <FileQuestion size={48} color={mutedColor} />
                    <Text style={[styles.title, { color: textColor }]}>
                        No results found
                    </Text>
                    <Text style={[styles.message, { color: mutedColor }]}>
                        No foods match "{query}"
                    </Text>
                    <Text style={[styles.hint, { color: mutedColor }]}>
                        Try a different search term or check spelling
                    </Text>
                </>
            ) : (
                // Initial state - prompt to search
                <>
                    <Search size={48} color={mutedColor} />
                    <Text style={[styles.title, { color: textColor }]}>
                        Search for foods
                    </Text>
                    <Text style={[styles.message, { color: mutedColor }]}>
                        Type at least 2 characters to search
                    </Text>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 64,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    hint: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
});
