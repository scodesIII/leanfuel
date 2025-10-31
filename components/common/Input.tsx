import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  touched?: boolean;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  touched = false,
  isPassword = false,
  secureTextEntry,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  
  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur(e);
    }
  };

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  // Create an array of styles for the TextInput
  const inputStyles: StyleProp<TextStyle>[] = [
    styles.input,
    { color: textColor }
  ];
  
  // Only add paddingLeft style if there's a leftIcon
  if (leftIcon) {
    inputStyles.push({ paddingLeft: 0 });
  }
  
  // Add any custom styles
  if (inputStyle) {
    inputStyles.push(inputStyle);
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text 
          style={[
            styles.label, 
            { color: textColor }, 
            labelStyle
          ]}
        >
          {label}
        </Text>
      )}
      
      <View 
        style={[
          styles.inputContainer,
          {
            borderColor: isFocused 
              ? primaryColor 
              : (error && touched) 
                ? errorColor 
                : borderColor,
            backgroundColor: backgroundColor
          },
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        
        <TextInput
          placeholderTextColor="#94a3b8"
          style={inputStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          {...rest}
        />
        
        {isPassword ? (
          <TouchableOpacity 
            style={styles.iconContainer} 
            onPress={toggleShowPassword}
          >
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color="#94a3b8" 
            />
          </TouchableOpacity>
        ) : rightIcon && (
          <View style={styles.iconContainer}>{rightIcon}</View>
        )}
      </View>
      
      {error && touched && (
        <Text style={[styles.error, { color: errorColor }, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    height: 46, // Fixed height for consistent look
  },
  iconContainer: {
    padding: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 8, // Reduced vertical padding
    paddingHorizontal: 12, // Reduced horizontal padding
    fontSize: 15, // Slightly smaller font
  },
  error: {
    marginTop: 4,
    fontSize: 12,
  },
});