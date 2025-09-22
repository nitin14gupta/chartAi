import React from 'react';
import { View, Text, Pressable, ScrollView, StatusBar } from 'react-native';
import { darkColors } from '../../components/darkUI';
import { useRouter } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Privacy() {
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
                    Privacy Policy
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
                        At ZenFlow, we are committed to protecting your privacy and ensuring the security of your personal information.
                    </Text>

                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 12,
                        marginTop: 20
                    }}>
                        Information We Collect
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 14,
                        color: darkColors.textTertiary,
                        lineHeight: 20,
                        marginBottom: 16
                    }}>
                        • Account information (email address, password){'\n'}
                        • Onboarding data you provide during setup{'\n'}
                        • Usage data and app interactions{'\n'}
                        • Device information and technical data
                    </Text>

                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 12,
                        marginTop: 20
                    }}>
                        How We Use Your Information
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 14,
                        color: darkColors.textTertiary,
                        lineHeight: 20,
                        marginBottom: 16
                    }}>
                        • To provide and improve our services{'\n'}
                        • To personalize your experience{'\n'}
                        • To send you important updates and notifications{'\n'}
                        • To analyze app usage and performance
                    </Text>

                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 12,
                        marginTop: 20
                    }}>
                        Data Security
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 14,
                        color: darkColors.textTertiary,
                        lineHeight: 20,
                        marginBottom: 16
                    }}>
                        We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                    </Text>

                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 12,
                        marginTop: 20
                    }}>
                        Your Rights
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 14,
                        color: darkColors.textTertiary,
                        lineHeight: 20,
                        marginBottom: 16
                    }}>
                        You have the right to access, update, or delete your personal information. You can also opt out of certain communications from us.
                    </Text>

                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 12,
                        marginTop: 20
                    }}>
                        Contact Us
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 14,
                        color: darkColors.textTertiary,
                        lineHeight: 20,
                        marginBottom: 20
                    }}>
                        If you have any questions about this Privacy Policy, please contact us at privacy@zenflow.app
                    </Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}
