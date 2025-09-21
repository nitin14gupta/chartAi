import React, { useEffect, useRef } from "react";
import { Pressable, Text, View, ViewProps, Animated, TextInput, Image, Dimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const darkColors = {
    // Dark theme colors
    background: "#0F0F0F",
    surface: "#1A1A1A",
    surfaceElevated: "#262626",
    primary: "#6366F1", // Indigo
    primaryLight: "#818CF8",
    secondary: "#EC4899", // Pink
    accent: "#F59E0B", // Amber
    success: "#10B981", // Emerald
    warning: "#F59E0B", // Amber
    error: "#EF4444", // Red

    // Text colors
    textPrimary: "#FFFFFF",
    textSecondary: "#A1A1AA", // Zinc 400
    textTertiary: "#71717A", // Zinc 500

    // Border colors
    border: "#27272A", // Zinc 800
    borderLight: "#3F3F46", // Zinc 700

    // Gradient colors
    gradientStart: "#0F0F0F",
    gradientEnd: "#1A1A1A",
    gradientAccent: "#6366F1",
};

export const DarkScreenContainer: React.FC<{ children: React.ReactNode; style?: ViewProps["style"] }> = ({ children, style }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 100 }),
        ]).start();
    }, [opacity, translateY]);

    return (
        <LinearGradient
            colors={[darkColors.gradientStart, darkColors.gradientEnd]}
            style={{ flex: 1 }}
        >
            <Animated.View
                style={[
                    {
                        flex: 1,
                        paddingHorizontal: 24,
                        paddingTop: 60,
                        paddingBottom: 32,
                        opacity,
                        transform: [{ translateY }]
                    },
                    style
                ]}
            >
                {children}
            </Animated.View>
        </LinearGradient>
    );
};

type DarkButtonProps = {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: "primary" | "secondary" | "outline";
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
};

export const DarkButton: React.FC<DarkButtonProps> = ({
    children,
    onPress,
    variant = "primary",
    disabled = false,
    size = "md"
}) => {
    const scale = useRef(new Animated.Value(1)).current;
    const glow = useRef(new Animated.Value(0)).current;

    const getButtonStyle = () => {
        const baseStyle = {
            borderRadius: 16,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowColor: darkColors.primary,
            shadowOffset: { width: 0, height: 6 },
        };

        const sizeStyles: Record<string, { paddingVertical: number; paddingHorizontal: number }> = {
            sm: { paddingVertical: 12, paddingHorizontal: 20 },
            md: { paddingVertical: 16, paddingHorizontal: 24 },
            lg: { paddingVertical: 20, paddingHorizontal: 32 },
        };

        switch (variant) {
            case "primary":
                return {
                    ...baseStyle,
                    ...sizeStyles[size],
                    backgroundColor: darkColors.primary,
                };
            case "secondary":
                return {
                    ...baseStyle,
                    ...sizeStyles[size],
                    backgroundColor: darkColors.surfaceElevated,
                    borderWidth: 1,
                    borderColor: darkColors.border,
                };
            case "outline":
                return {
                    ...baseStyle,
                    ...sizeStyles[size],
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: darkColors.primary,
                };
            default:
                return { ...baseStyle, ...sizeStyles[size], backgroundColor: darkColors.primary };
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case "outline":
                return darkColors.primary;
            default:
                return darkColors.textPrimary;
        }
    };

    const press = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
    };

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={press}
            disabled={disabled}
        >
            <Animated.View
                style={[
                    getButtonStyle(),
                    {
                        transform: [{ scale }],
                        opacity: disabled ? 0.5 : 1,
                    }
                ]}
            >
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 16,
                        backgroundColor: darkColors.primaryLight,
                        opacity: glow,
                    }}
                />
                <Text
                    style={{
                        color: getTextColor(),
                        textAlign: "center",
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: size === "sm" ? 14 : size === "lg" ? 18 : 16,
                        zIndex: 1,
                    }}
                >
                    {children}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

type DarkCardOptionProps = {
    label: string;
    description?: string;
    selected?: boolean;
    onPress?: () => void;
    emoji?: string;
    variant?: "default" | "large";
};

export const DarkCardOption: React.FC<DarkCardOptionProps> = ({
    label,
    description,
    selected,
    onPress,
    emoji,
    variant = "default"
}) => {
    const scale = useRef(new Animated.Value(1)).current;
    const glow = useRef(new Animated.Value(0)).current;

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
    };

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start();
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={{ marginVertical: 6 }}
        >
            <Animated.View
                style={{
                    transform: [{ scale }],
                    backgroundColor: selected ? darkColors.surfaceElevated : darkColors.surface,
                    borderRadius: variant === "large" ? 20 : 16,
                    padding: variant === "large" ? 24 : 20,
                    borderWidth: 2,
                    borderColor: selected ? darkColors.primary : darkColors.border,
                    shadowOpacity: selected ? 0.2 : 0.1,
                    shadowRadius: selected ? 16 : 8,
                    shadowColor: selected ? darkColors.primary : '#000',
                    shadowOffset: { width: 0, height: selected ? 8 : 4 },
                }}
            >
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: variant === "large" ? 20 : 16,
                        backgroundColor: darkColors.primary,
                        opacity: glow.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.1]
                        }),
                    }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 1 }}>
                    {emoji && (
                        <Text style={{ fontSize: variant === "large" ? 32 : 24, marginRight: 16 }}>
                            {emoji}
                        </Text>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontFamily: "Poppins_600SemiBold",
                                fontSize: variant === "large" ? 18 : 16,
                                color: darkColors.textPrimary,
                                marginBottom: description ? 4 : 0,
                            }}
                        >
                            {label}
                        </Text>
                        {description && (
                            <Text
                                style={{
                                    fontFamily: "Poppins_400Regular",
                                    fontSize: 14,
                                    color: darkColors.textSecondary,
                                    lineHeight: 20,
                                }}
                            >
                                {description}
                            </Text>
                        )}
                    </View>
                    {selected && (
                        <View
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: darkColors.primary,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: darkColors.textPrimary, fontSize: 16 }}>✓</Text>
                        </View>
                    )}
                </View>
            </Animated.View>
        </Pressable>
    );
};

export const DarkTitle: React.FC<{ children: React.ReactNode; variant?: "h1" | "h2" | "h3" }> = ({
    children,
    variant = "h1"
}) => {
    const fontSize = variant === "h1" ? 32 : variant === "h2" ? 28 : 24;
    const fontFamily = variant === "h1" ? "Poppins_700Bold" : "Poppins_600SemiBold";

    return (
        <Text
            style={{
                fontFamily,
                fontSize,
                color: darkColors.textPrimary,
                marginBottom: 12,
                textAlign: 'center',
            }}
        >
            {children}
        </Text>
    );
};

export const DarkSubtitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Text
        style={{
            fontFamily: "Poppins_400Regular",
            fontSize: 16,
            color: darkColors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 32,
        }}
    >
        {children}
    </Text>
);

export const DarkProgressBar: React.FC<{ progress: number; total: number }> = ({ progress, total }) => {
    const pct = Math.max(0, Math.min(1, progress / total));
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: pct,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [pct, animatedWidth]);

    return (
        <View style={{ marginBottom: 32 }}>
            <View
                style={{
                    height: 6,
                    backgroundColor: darkColors.border,
                    borderRadius: 3,
                    overflow: "hidden",
                    marginBottom: 8,
                }}
            >
                <Animated.View
                    style={{
                        width: animatedWidth.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: darkColors.primary,
                        height: 6,
                        borderRadius: 3,
                    }}
                />
            </View>
            <Text
                style={{
                    textAlign: 'center',
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 14,
                    color: darkColors.textTertiary,
                }}
            >
                {progress} of {total}
            </Text>
        </View>
    );
};

export const DarkHeader: React.FC<{
    title: string;
    subtitle?: string;
    progress: number;
    total: number;
}> = ({ title, subtitle, progress, total }) => (
    <View style={{ marginBottom: 40 }}>
        <DarkProgressBar progress={progress} total={total} />
        <DarkTitle variant="h1">{title}</DarkTitle>
        {subtitle && <DarkSubtitle>{subtitle}</DarkSubtitle>}
    </View>
);

// Multi-select option component
type DarkMultiSelectOptionProps = {
    label: string;
    description?: string;
    selected?: boolean;
    onPress?: () => void;
    emoji?: string;
};

export const DarkMultiSelectOption: React.FC<DarkMultiSelectOptionProps> = ({
    label,
    description,
    selected,
    onPress,
    emoji,
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
    };

    const handlePressIn = () => {
        Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={{ marginVertical: 4 }}
        >
            <Animated.View
                style={{
                    transform: [{ scale }],
                    backgroundColor: selected ? darkColors.surfaceElevated : darkColors.surface,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: selected ? darkColors.primary : darkColors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: selected ? darkColors.primary : darkColors.border,
                        backgroundColor: selected ? darkColors.primary : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                    }}
                >
                    {selected && (
                        <Text style={{ color: darkColors.textPrimary, fontSize: 12, fontWeight: 'bold' }}>
                            ✓
                        </Text>
                    )}
                </View>

                {emoji && (
                    <Text style={{ fontSize: 20, marginRight: 12 }}>
                        {emoji}
                    </Text>
                )}

                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            fontFamily: "Poppins_500Medium",
                            fontSize: 16,
                            color: darkColors.textPrimary,
                            marginBottom: description ? 2 : 0,
                        }}
                    >
                        {label}
                    </Text>
                    {description && (
                        <Text
                            style={{
                                fontFamily: "Poppins_400Regular",
                                fontSize: 14,
                                color: darkColors.textSecondary,
                            }}
                        >
                            {description}
                        </Text>
                    )}
                </View>
            </Animated.View>
        </Pressable>
    );
};
