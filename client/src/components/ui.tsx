import React, { PropsWithChildren, useEffect, useRef } from "react";
import { Pressable, Text, View, ViewProps, Animated, TextInput, Image } from "react-native";
import * as Haptics from "expo-haptics";

export const colors = {
    primary: "#E8E4F3",
    coral: "#FFB5A7",
    mint: "#A8E6CF",
    blue: "#B8D8E7",
    cream: "#FFF9F0",
    purple: "#6B46C1",
    orange: "#FF8A65",
};

// Dark mode colors
export const darkColors = {
    background: "#000000",
    surface: "#111111",
    surfaceElevated: "#1A1A1A",
    surfaceSecondary: "#262626",
    primary: "#8B5CF6", // Purple
    primaryLight: "#A78BFA",
    primaryDark: "#7C3AED",
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
    border: "#1F1F1F",
    borderLight: "#2A2A2A",
    borderAccent: "#8B5CF6",

    // Gradient colors
    gradientStart: "#000000",
    gradientEnd: "#111111",
    gradientAccent: "#8B5CF6",
    gradientSecondary: "#EC4899",
};

export const ScreenContainer: React.FC<PropsWithChildren<{ style?: ViewProps["style"]; dark?: boolean }>> = ({ children, style, dark = false }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 6 }),
        ]).start();
    }, [opacity, translateY]);

    return (
        <Animated.View style={[{
            flex: 1,
            backgroundColor: dark ? darkColors.background : colors.cream,
            paddingHorizontal: 20,
            paddingTop: 48,
            paddingBottom: 24,
            opacity,
            transform: [{ translateY }]
        }, style]}>
            {children}
        </Animated.View>
    );
};

type ButtonProps = PropsWithChildren<{ onPress?: () => void; variant?: "primary" | "secondary"; disabled?: boolean; dark?: boolean; }>
export const Button: React.FC<ButtonProps> = ({ children, onPress, variant = "primary", disabled, dark = false }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const bg = dark
        ? (variant === "primary" ? darkColors.primary : darkColors.surfaceElevated)
        : (variant === "primary" ? colors.purple : colors.blue);
    const text = dark ? darkColors.textPrimary : "#fff";
    const press = () => {
        Haptics.selectionAsync();
        onPress?.();
    };
    return (
        <Pressable
            onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start()}
            onPress={press}
            disabled={disabled}
        >
            <Animated.View style={{
                transform: [{ scale }],
                backgroundColor: bg,
                paddingVertical: 14,
                borderRadius: 12,
                shadowOpacity: dark ? 0.3 : 0.15,
                shadowRadius: dark ? 12 : 8,
                shadowColor: dark ? darkColors.primary : "#000",
                shadowOffset: { width: 0, height: 4 },
                borderWidth: dark && variant === "secondary" ? 1 : 0,
                borderColor: dark ? darkColors.border : 'transparent'
            }}>
                <Text style={{ color: text, textAlign: "center", fontFamily: "Poppins_600SemiBold", fontSize: 16 }}>{children}</Text>
            </Animated.View>
        </Pressable>
    );
};

type CardOptionProps = { label: string; selected?: boolean; onPress?: () => void; emoji?: string };
export const CardOption: React.FC<CardOptionProps> = ({ label, selected, onPress, emoji }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const bg = selected ? colors.mint : colors.primary;
    const border = selected ? colors.purple : "transparent";
    return (
        <Pressable
            onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
            onPress={() => { Haptics.selectionAsync(); onPress?.(); }}
            style={{ marginVertical: 8 }}
        >
            <Animated.View style={{ transform: [{ scale }], backgroundColor: bg, borderRadius: 12, padding: 16, borderWidth: 2, borderColor: border }}>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 16 }}>{emoji ? `${emoji} ${label}` : label}</Text>
            </Animated.View>
        </Pressable>
    );
};

export const Title: React.FC<PropsWithChildren<{ dark?: boolean }>> = ({ children, dark = false }) => (
    <Text style={{
        fontFamily: "Poppins_700Bold",
        fontSize: 24,
        marginBottom: 8,
        color: dark ? darkColors.textPrimary : "#111827"
    }}>{children}</Text>
);

export const Subtitle: React.FC<PropsWithChildren<{ dark?: boolean }>> = ({ children, dark = false }) => (
    <Text style={{
        fontFamily: "Poppins_400Regular",
        fontSize: 16,
        color: dark ? darkColors.textSecondary : "#374151"
    }}>{children}</Text>
);

export const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    const pct = Math.max(0, Math.min(1, progress));
    return (
        <View style={{ height: 8, backgroundColor: "#E5E7EB", borderRadius: 999, overflow: "hidden", marginBottom: 24 }}>
            <View style={{ width: `${pct * 100}%`, backgroundColor: colors.purple, height: 8 }} />
        </View>
    );
};


export const formatTimeTo12h = (time?: string): string => {
    if (!time) return "--";
    // Accept formats like HH:MM or HH:MM:SS
    const parts = time.split(":");
    if (parts.length < 2) return time;
    let hour = parseInt(parts[0], 10);
    const minute = parts[1] ?? "00";
    if (isNaN(hour)) return time;
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute.padStart(2, "0")} ${ampm}`;
};

// Social Login Button Component
type SocialButtonProps = PropsWithChildren<{
    onPress?: () => void;
    disabled?: boolean;
    variant?: "google" | "apple";
    loading?: boolean;
}>;

export const SocialButton: React.FC<SocialButtonProps> = ({
    children,
    onPress,
    disabled,
    variant = "google",
    loading = false
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const getButtonStyle = () => {
        switch (variant) {
            case "google":
                return {
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                };
            case "apple":
                return {
                    backgroundColor: "#000000",
                };
            default:
                return {
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                };
        }
    };

    const getTextColor = () => {
        return variant === "apple" ? "#FFFFFF" : "#374151";
    };

    const getIcon = () => {
        if (loading) return "⏳";
        switch (variant) {
            case "google":
                return (
                    <Image
                        source={require("../../assets/images/google.png")}
                        style={{ width: 20, height: 20 }}
                        resizeMode="contain"
                    />
                );
            case "apple":
                return (
                    <Image
                        source={require("../../assets/images/apple.png")}
                        style={{ width: 20, height: 20 }}
                        resizeMode="contain"
                    />
                );
            default:
                return <Text>G</Text>;
        }
    };

    return (
        <Pressable
            onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start()}
            onPress={onPress}
            disabled={disabled || loading}
        >
            <Animated.View style={[
                {
                    transform: [{ scale }],
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    opacity: disabled || loading ? 0.6 : 1
                },
                getButtonStyle()
            ]}>
                <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: variant === "google" ? 10 : 0,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12
                }}>
                    <Text style={{
                        fontSize: variant === "google" ? 12 : 16,
                        fontWeight: "bold",
                        color: variant === "google" ? "white" : "black"
                    }}>
                        {getIcon()}
                    </Text>
                </View>
                <Text style={{
                    color: getTextColor(),
                    textAlign: "center",
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: 16
                }}>
                    {children}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

// Enhanced Input Component
type InputProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "number-pad" | "numbers-and-punctuation";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    maxLength?: number;
    error?: string;
    valid?: boolean;
    showPasswordToggle?: boolean;
    onTogglePassword?: () => void;
    style?: any;
    dark?: boolean;
};

export const Input: React.FC<InputProps> = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "sentences",
    maxLength,
    error,
    valid,
    showPasswordToggle = false,
    onTogglePassword,
    style,
    dark = false
}) => {
    return (
        <View style={style}>
            <View style={{
                backgroundColor: dark ? darkColors.surface : colors.primary,
                borderRadius: 12,
                padding: 16,
                borderWidth: valid ? 2 : (error ? 2 : 0),
                borderColor: valid
                    ? (dark ? darkColors.primary : colors.mint)
                    : (error ? '#EF4444' : 'transparent'),
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={dark ? darkColors.textTertiary : "#9CA3AF"}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    maxLength={maxLength}
                    style={{
                        flex: 1,
                        fontSize: 16,
                        fontFamily: 'Poppins_400Regular',
                        color: dark ? darkColors.textPrimary : '#111827'
                    }}
                />
                {showPasswordToggle && (
                    <Pressable onPress={onTogglePassword} style={{ padding: 4 }}>
                        <Text style={{
                            color: dark ? darkColors.primary : colors.purple,
                            fontFamily: 'Poppins_600SemiBold',
                            fontSize: 14
                        }}>
                            {secureTextEntry ? 'Show' : 'Hide'}
                        </Text>
                    </Pressable>
                )}
            </View>
            {error && (
                <Text style={{
                    color: '#EF4444',
                    fontSize: 14,
                    marginTop: 4,
                    fontFamily: 'Poppins_400Regular'
                }}>
                    {error}
                </Text>
            )}
        </View>
    );
};

// Premium Card Component
type PremiumCardProps = PropsWithChildren<{
    style?: ViewProps["style"];
    dark?: boolean;
    variant?: "default" | "elevated" | "outlined";
    onPress?: () => void;
}>;

export const PremiumCard: React.FC<PremiumCardProps> = ({
    children,
    style,
    dark = false,
    variant = "default",
    onPress
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const getCardStyle = () => {
        const baseStyle = {
            borderRadius: 16,
            padding: 20,
            shadowColor: dark ? darkColors.primary : "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: dark ? 0.15 : 0.1,
            shadowRadius: 12,
            elevation: 8,
        };

        switch (variant) {
            case "elevated":
                return {
                    ...baseStyle,
                    backgroundColor: dark ? darkColors.surfaceElevated : "#FFFFFF",
                    borderWidth: 0,
                };
            case "outlined":
                return {
                    ...baseStyle,
                    backgroundColor: dark ? darkColors.surface : "#FFFFFF",
                    borderWidth: 1,
                    borderColor: dark ? darkColors.border : "#E5E7EB",
                    shadowOpacity: 0,
                    elevation: 0,
                };
            default:
                return {
                    ...baseStyle,
                    backgroundColor: dark ? darkColors.surface : "#FFFFFF",
                    borderWidth: 1,
                    borderColor: dark ? darkColors.border : "#F3F4F6",
                };
        }
    };

    const handlePressIn = () => {
        if (onPress) {
            Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
        }
    };

    const CardContent = () => (
        <Animated.View style={[getCardStyle(), style, { transform: [{ scale }] }]}>
            {children}
        </Animated.View>
    );

    if (onPress) {
        return (
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <CardContent />
            </Pressable>
        );
    }

    return <CardContent />;
};

// Premium Button with enhanced styling
type PremiumButtonProps = PropsWithChildren<{
    onPress?: () => void;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    dark?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
}>;

export const PremiumButton: React.FC<PremiumButtonProps> = ({
    children,
    onPress,
    variant = "primary",
    size = "md",
    disabled = false,
    dark = false,
    loading = false,
    icon
}) => {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const getSizeStyle = () => {
        switch (size) {
            case "sm":
                return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 };
            case "lg":
                return { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 };
            default:
                return { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 };
        }
    };

    const getVariantStyle = () => {
        const sizeStyle = getSizeStyle();

        switch (variant) {
            case "primary":
                return {
                    backgroundColor: dark ? darkColors.primary : colors.purple,
                    borderWidth: 0,
                    shadowColor: dark ? darkColors.primary : colors.purple,
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                };
            case "secondary":
                return {
                    backgroundColor: dark ? darkColors.surfaceElevated : colors.blue,
                    borderWidth: 0,
                    shadowColor: dark ? darkColors.primary : colors.blue,
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 2,
                };
            case "outline":
                return {
                    backgroundColor: "transparent",
                    borderWidth: 2,
                    borderColor: dark ? darkColors.primary : colors.purple,
                };
            case "ghost":
                return {
                    backgroundColor: "transparent",
                    borderWidth: 0,
                };
            default:
                return {};
        }
    };

    const getTextColor = () => {
        if (variant === "outline" || variant === "ghost") {
            return dark ? darkColors.primary : colors.purple;
        }
        return dark ? darkColors.textPrimary : "#FFFFFF";
    };

    const handlePress = () => {
        if (!disabled && !loading && onPress) {
            Haptics.selectionAsync();
            onPress();
        }
    };

    const handlePressIn = () => {
        if (!disabled && !loading) {
            Animated.parallel([
                Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.8, duration: 100, useNativeDriver: true })
            ]).start();
        }
    };

    const handlePressOut = () => {
        if (!disabled && !loading) {
            Animated.parallel([
                Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true })
            ]).start();
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
        >
            <Animated.View style={[
                {
                    transform: [{ scale }],
                    opacity: disabled ? 0.5 : opacity,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                getVariantStyle(),
                getSizeStyle()
            ]}>
                {loading ? (
                    <Text style={{ color: getTextColor(), fontFamily: "Poppins_600SemiBold" }}>
                        Loading...
                    </Text>
                ) : (
                    <>
                        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
                        <Text style={{
                            color: getTextColor(),
                            fontFamily: "Poppins_600SemiBold",
                            fontSize: getSizeStyle().fontSize,
                            textAlign: "center"
                        }}>
                            {children}
                        </Text>
                    </>
                )}
            </Animated.View>
        </Pressable>
    );
};

// Glassmorphism effect component
type GlassCardProps = PropsWithChildren<{
    style?: ViewProps["style"];
    intensity?: "light" | "medium" | "strong";
}>;

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    intensity = "medium"
}) => {
    const getIntensity = () => {
        switch (intensity) {
            case "light":
                return { backgroundColor: "rgba(255, 255, 255, 0.05)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" };
            case "strong":
                return { backgroundColor: "rgba(255, 255, 255, 0.15)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.2)" };
            default:
                return { backgroundColor: "rgba(255, 255, 255, 0.1)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)" };
        }
    };

    return (
        <View style={[
            {
                borderRadius: 16,
                padding: 20,
                backdropFilter: "blur(10px)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
            },
            getIntensity(),
            style
        ]}>
            {children}
        </View>
    );
};

