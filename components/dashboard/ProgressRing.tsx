import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRef, useEffect } from 'react';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
    /** Progress percentage (0-100) */
    progress: number;
    /** Ring size in pixels */
    size?: number;
    /** Ring stroke width */
    strokeWidth?: number;
    /** Gradient colors [light, base, dark] */
    gradientColors: [string, string, string];
    /** Center content to display inside the ring */
    children?: React.ReactNode;
}

export const ProgressRing = ({
    progress,
    size = 180,
    strokeWidth = 16,
    gradientColors,
    children,
}: ProgressRingProps) => {
    // Ring progress animation
    const ringProgress = useRef(new Animated.Value(0)).current;

    // Animate ring when progress changes
    useEffect(() => {
        Animated.timing(ringProgress, {
            toValue: progress,
            duration: 2000,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: false, // SVG animations don't support native driver
        }).start();
    }, [progress, ringProgress]);

    // Calculate ring geometry
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Interpolate stroke offset for animation
    const strokeDashoffset = ringProgress.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.ring}>
                <Defs>
                    <SvgLinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={gradientColors[0]} stopOpacity="1" />
                        <Stop offset="50%" stopColor={gradientColors[1]} stopOpacity="1" />
                        <Stop offset="100%" stopColor={gradientColors[2]} stopOpacity="1" />
                    </SvgLinearGradient>
                </Defs>

                {/* Background ring */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(0,0,0,0.08)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress ring with gradient */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#ringGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            {/* Center content */}
            {children && <View style={styles.centerContent}>{children}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    ring: {
        transform: [{ rotate: '0deg' }],
    },

    centerContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
