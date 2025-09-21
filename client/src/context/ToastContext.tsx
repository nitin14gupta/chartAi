import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

type ToastType = "success" | "error" | "info";

type ToastContextValue = {
    showToast: (message: string, type?: ToastType, durationMs?: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Dark mode colors
const darkColors = {
    background: "#0F0F0F",
    surface: "#1A1A1A",
    surfaceElevated: "#262626",
    primary: "#6366F1", // Indigo
    success: "#10B981", // Emerald
    error: "#EF4444", // Red
    textPrimary: "#FFFFFF",
    textSecondary: "#A1A1AA", // Zinc 400
    border: "#27272A", // Zinc 800
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [message, setMessage] = useState<string>("");
    const [type, setType] = useState<ToastType>("info");
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.8)).current;

    const showToast = useCallback((msg: string, t: ToastType = "info", durationMs = 2200) => {
        setMessage(msg);
        setType(t);
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
        ]).start(() => {
            Animated.sequence([
                Animated.delay(durationMs),
                Animated.parallel([
                    Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
                    Animated.timing(scale, { toValue: 0.8, duration: 250, useNativeDriver: true }),
                ]),
            ]).start();
        });
    }, [opacity, scale]);

    const value = useMemo(() => ({ showToast }), [showToast]);

    const getToastStyle = () => {
        switch (type) {
            case "success":
                return {
                    backgroundColor: darkColors.success,
                    borderColor: "#059669",
                    icon: "✓"
                };
            case "error":
                return {
                    backgroundColor: darkColors.error,
                    borderColor: "#DC2626",
                    icon: "✕"
                };
            default:
                return {
                    backgroundColor: darkColors.surfaceElevated,
                    borderColor: darkColors.border,
                    icon: "ℹ"
                };
        }
    };

    const toastStyle = getToastStyle();

    return (
        <ToastContext.Provider value={value}>
            {children}
            <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 40, alignItems: 'center', zIndex: 9999 }}>
                <Animated.View style={{
                    opacity,
                    transform: [
                        { translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                        { scale }
                    ],
                    backgroundColor: toastStyle.backgroundColor,
                    borderWidth: 1,
                    borderColor: toastStyle.borderColor,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 16,
                    maxWidth: '90%',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <Text style={{
                        fontSize: 16,
                        color: darkColors.textPrimary,
                        fontWeight: '600'
                    }}>
                        {toastStyle.icon}
                    </Text>
                    <Text style={{
                        color: darkColors.textPrimary,
                        fontFamily: 'Poppins_500Medium',
                        fontSize: 14,
                        flex: 1
                    }}>
                        {message}
                    </Text>
                </Animated.View>
            </View>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
};


