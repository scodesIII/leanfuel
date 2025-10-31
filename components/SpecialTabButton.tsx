import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";


export const SpecialTabButton = () => {
    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert
    }


    return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.85}
      
    >
      <Ionicons name="add-circle" size={30} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: -20,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: "#4F46E5",
    borderRadius: 24,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    // elevation: 5,
    zIndex: 1000,
  }
});
