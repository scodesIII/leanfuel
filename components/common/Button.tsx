import React, { forwardRef } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...rest
}, ref) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  // Get styles based on variant
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: disabled ? theme.tabIconDefault : theme.primary,
          },
          text: {
            color: '#ffffff',
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: disabled ? theme.tabIconDefault : theme.secondary,
          },
          text: {
            color: '#ffffff',
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: disabled ? theme.tabIconDefault : theme.primary,
          },
          text: {
            color: disabled ? theme.tabIconDefault : theme.primary,
          },
        };
      case 'text':
        return {
          container: {
            backgroundColor: 'transparent',
            paddingHorizontal: 0,
            paddingVertical: 4,
          },
          text: {
            color: disabled ? theme.tabIconDefault : theme.primary,
          },
        };
      default:
        return {
          container: {
            backgroundColor: disabled ? theme.tabIconDefault : theme.primary,
          },
          text: {
            color: '#ffffff',
          },
        };
    }
  };

  // Get styles based on size
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 6,
          },
          text: {
            fontSize: 14,
          },
        };
      case 'medium':
        return {
          container: {
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
          },
          text: {
            fontSize: 16,
          },
        };
      case 'large':
        return {
          container: {
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 10,
          },
          text: {
            fontSize: 18,
          },
        };
      default:
        return {
          container: {
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
          },
          text: {
            fontSize: 16,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      ref={ref}
      style={[
        styles.button,
        variantStyles.container,
        sizeStyles.container,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? '#ffffff' : theme.primary} 
        />
      ) : (
        <Text
          style={[
            styles.text,
            variantStyles.text,
            sizeStyles.text,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
});