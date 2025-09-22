import React from 'react';
import { View, Text, Pressable, ScrollView, StatusBar } from 'react-native';
import { darkColors } from '../../components/darkUI';
import { useRouter } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Terms() {
    const router = useRouter();

    return (
        <LinearGradient
            colors={[darkColors.gradientStart, darkColors.gradientEnd, darkColors.background]}
            style={{ flex: 1 }}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={{
                paddingTop: 25,
                paddingHorizontal: 20,
                paddingBottom: 20,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: darkColors.surfaceElevated,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                        shadowColor: darkColors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 4
                    }}
                >
                    <Ionicons name="chevron-back-outline" size={20} color={darkColors.textSecondary} />
                </Pressable>
                <Text style={{
                    fontFamily: 'Poppins_700Bold',
                    fontSize: 24,
                    color: darkColors.textPrimary,
                    flex: 1
                }}>
                    Terms & Conditions
                </Text>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
                <View style={{
                    backgroundColor: darkColors.surface,
                    borderRadius: 12,
                    padding: 24,
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: darkColors.border,
                    shadowColor: darkColors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4
                }}>
                    <Text style={{
                        fontFamily: 'Poppins_700Bold',
                        fontSize: 20,
                        color: darkColors.textPrimary,
                        marginBottom: 16
                    }}>
                        Last Updated: September 16, 2025
                    </Text>

                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 16,
                        color: darkColors.textSecondary,
                        lineHeight: 24,
                        marginBottom: 20
                    }}>
                        Welcome to ZenFlow! These Terms and Conditions ("Terms") govern your use of our mobile application and services.
                    </Text>

                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 12,
                        marginTop: 20
                    }}>
                        1. Acceptance of Terms
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 14,
                        color: darkColors.textTertiary,
                        lineHeight: 20,
                        marginBottom: 16
                    }}>
                        By downloading, installing, or using ZenFlow, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our app.
                    </Text>

                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 12,
                        marginTop: 20
                    }}>
                        2. Description of Service
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 14,
                        color: darkColors.textTertiary,
                        lineHeight: 20,
                        marginBottom: 16
                    }}>
                        ZenFlow is a personal growth and habit tracking application designed to help users build better habits, organize their daily activities, and achieve their personal goals.
                    </Text>

                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 12,
                        marginTop: 20
                    }}>
                        3. User Accounts
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 14,
                        color: darkColors.textTertiary,
                        lineHeight: 20,
                        marginBottom: 16
                    }}>
                        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                    </Text>

                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 12,
                        marginTop: 20
                    }}>
                        4. Privacy
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 14,
                        color: darkColors.textTertiary,
                        lineHeight: 20,
                        marginBottom: 16
                    }}>
                        Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the app.
                    </Text>

                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 12,
                        marginTop: 20
                    }}>
                        5. Contact Information
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 14,
                        color: darkColors.textTertiary,
                        lineHeight: 20,
                        marginBottom: 20
                    }}>
                        If you have any questions about these Terms, please contact us at support@zenflow.app
                    </Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}
