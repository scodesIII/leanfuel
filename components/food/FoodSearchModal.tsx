import { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Modal,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useFoodSearchStore } from '@/stores/foodSearchStore';
import { useDebounce } from '@/hooks/useDebounce';
import { FoodSearchResults } from './FoodSearchResults';
import { FoodSearchResult, MealType } from '@/types/food';

interface FoodSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectFood: (item: FoodSearchResult, mealType: MealType) => void;
    mealType?: MealType;
}

export function FoodSearchModal({
    visible,
    onClose,
    onSelectFood,
    mealType = 'breakfast',
}: FoodSearchModalProps) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<TextInput>(null);

    // Theme colors
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    // Store
    const { query, results, isSearching, search, clearSearch } = useFoodSearchStore();

    // Debounced search
    const debouncedSearch = useDebounce(search, 300);

    // Handle input change
    const handleChangeText = (text: string) => {
        setInputValue(text);
        debouncedSearch(text);
    };

    // Handle food selection
    const handleSelectFood = (item: FoodSearchResult) => {
        onSelectFood(item, mealType);
    };

    // Reset state and focus input when modal opens
    useEffect(() => {
        if (visible) {
            // Clear previous state
            setInputValue('');
            clearSearch();

            // Focus input after modal animation
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    // Format meal type for display
    const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: borderColor }]}>
                        <Pressable
                            onPress={onClose}
                            style={styles.closeButton}
                            hitSlop={8}
                        >
                            <X size={24} color={textColor} />
                        </Pressable>
                        <Text style={[styles.title, { color: textColor }]}>
                            {mealLabel}
                        </Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Search Input */}
                    <View style={[styles.searchContainer, { borderBottomColor: borderColor }]}>
                        <View style={[styles.searchInput, { backgroundColor: borderColor + '50' }]}>
                            <Search size={20} color={mutedColor} />
                            <TextInput
                                ref={inputRef}
                                value={inputValue}
                                onChangeText={handleChangeText}
                                placeholder="Search foods..."
                                placeholderTextColor={mutedColor}
                                style={[styles.input, { color: textColor }]}
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="search"
                            />
                            {inputValue.length > 0 && (
                                <Pressable
                                    onPress={() => handleChangeText('')}
                                    hitSlop={8}
                                >
                                    <X size={18} color={mutedColor} />
                                </Pressable>
                            )}
                        </View>
                    </View>

                    {/* Results */}
                    <FoodSearchResults
                        results={results}
                        query={query}
                        isSearching={isSearching}
                        onSelectFood={handleSelectFood}
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    placeholder: {
        width: 32,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
});