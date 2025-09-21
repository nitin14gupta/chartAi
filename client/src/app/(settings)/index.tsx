import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StatusBar } from 'react-native';
import { darkColors } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Settings() {
    const { logout } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [showAccountModal, setShowAccountModal] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    const SettingItem = ({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) => (
        <Pressable
            onPress={onPress}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 18,
                paddingHorizontal: 20,
                backgroundColor: darkColors.surface,
                borderRadius: 16,
                marginBottom: 12,
                shadowColor: darkColors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 1,
                borderColor: darkColors.border
            }}
        >
            <View style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: darkColors.background,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16
            }}>
                <Text style={{ fontSize: 20, color: darkColors.textSecondary }}>{icon}</Text>
            </View>
            <Text style={{
                fontFamily: 'Poppins_500Medium',
                fontSize: 16,
                color: darkColors.textPrimary,
                flex: 1
            }}>
                {title}
            </Text>
            <Ionicons name="chevron-forward-outline" size={20} color={darkColors.textSecondary} />
        </Pressable>
    );

    return (
        <LinearGradient
            colors={[darkColors.gradientStart, darkColors.gradientEnd, darkColors.background]}
            style={{ flex: 1 }}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={{
                paddingTop: 60,
                paddingHorizontal: 24,
                paddingBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: darkColors.border
            }}>
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: darkColors.surface,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                        shadowColor: darkColors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                    }}
                >
                    <Ionicons name="arrow-back-outline" size={20} color={darkColors.textSecondary} />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontFamily: 'Poppins_700Bold',
                        fontSize: 28,
                        color: darkColors.textPrimary,
                    }}>
                        Settings
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 12,
                        color: darkColors.textSecondary
                    }}>
                        Manage your account and preferences
                    </Text>
                </View>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
                {/* Account Settings Section */}
                <View style={{ marginTop: 10, marginBottom: 12 }}>
                    <Text style={{
                        fontFamily: 'Poppins_700Bold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 16
                    }}>
                        Account
                    </Text>

                    <SettingItem
                        icon="👤"
                        title="Account"
                        onPress={() => setShowAccountModal(true)}
                    />
                    <SettingItem
                        icon="📄"
                        title="Subscription"
                        onPress={() => router.push('/(settings)/subscription')}
                    />
                </View>

                {/* User Support Section */}
                <View style={{ marginBottom: 32 }}>
                    <Text style={{
                        fontFamily: 'Poppins_700Bold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 16
                    }}>
                        Support & Legal
                    </Text>

                    <SettingItem
                        icon="📋"
                        title="Terms & Conditions"
                        onPress={() => router.push('/(settings)/terms')}
                    />
                    <SettingItem
                        icon="🛡️"
                        title="Privacy Policy"
                        onPress={() => router.push('/(settings)/privacy')}
                    />
                    <SettingItem
                        icon="❓"
                        title="Help Center"
                        onPress={() => router.push('/(settings)/help')}
                    />
                </View>

                {/* Logout Button */}
                <Pressable
                    onPress={handleLogout}
                    style={{
                        backgroundColor: darkColors.surface,
                        borderRadius: 16,
                        paddingVertical: 18,
                        alignItems: 'center',
                        marginBottom: 40,
                        shadowColor: darkColors.error,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 4,
                        borderWidth: 1,
                        borderColor: darkColors.error + '40'
                    }}
                >
                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 16,
                        color: darkColors.error
                    }}>
                        Sign Out
                    </Text>
                </Pressable>
            </ScrollView>

            {/* Account Modal */}
            {showAccountModal && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    justifyContent: 'flex-end'
                }}>
                    <Pressable style={{ flex: 1 }} onPress={() => setShowAccountModal(false)} />
                    <View style={{
                        backgroundColor: darkColors.surface,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: darkColors.border,
                    }}>
                        <View style={{ width: 40, height: 4, backgroundColor: darkColors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

                        <Pressable
                            onPress={() => { setShowAccountModal(false); router.push('/(auth)/forgot'); }}
                            style={{
                                backgroundColor: darkColors.background,
                                borderWidth: 1,
                                borderColor: darkColors.border,
                                borderRadius: 24,
                                paddingVertical: 16,
                                alignItems: 'center',
                                marginBottom: 16
                            }}
                        >
                            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 16, color: darkColors.textPrimary }}>Change Password</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => { setShowAccountModal(false); }}
                            style={{
                                backgroundColor: darkColors.background,
                                borderWidth: 1,
                                borderColor: darkColors.border,
                                borderRadius: 24,
                                paddingVertical: 16,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 16, color: darkColors.textPrimary }}>Request Account Deletion</Text>
                        </Pressable>

                        <Text style={{ textAlign: 'center', color: darkColors.textTertiary, marginTop: 16, fontFamily: 'Poppins_400Regular', fontSize: 12 }}>Version 2.0.31444{"\n"}User settings</Text>
                    </View>
                </View>
            )}
        </LinearGradient>
    );
}
