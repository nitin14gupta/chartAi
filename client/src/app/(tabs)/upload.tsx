import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable, StatusBar, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { darkColors } from '../../components/ui'
import * as ImagePicker from 'expo-image-picker'

export default function Upload() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        })

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri)
        }
    }

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        })

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri)
        }
    }

    const analyzeChart = async () => {
        if (!selectedImage) return

        setIsAnalyzing(true)
        // Simulate analysis
        setTimeout(() => {
            setIsAnalyzing(false)
            Alert.alert(
                'Analysis Complete!',
                'Your chart has been analyzed. Check the results in your dashboard.',
                [{ text: 'OK' }]
            )
        }, 3000)
    }

    const ActionButton = ({ icon, title, onPress, variant = 'primary' }: {
        icon: string
        title: string
        onPress: () => void
        variant?: 'primary' | 'secondary'
    }) => (
        <Pressable
            onPress={onPress}
            style={{
                backgroundColor: variant === 'primary' ? darkColors.primary : darkColors.surface,
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: variant === 'primary' ? darkColors.primary : darkColors.border,
                shadowColor: darkColors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: variant === 'primary' ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 4,
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: variant === 'primary' ? darkColors.primary + '20' : darkColors.border,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16
            }}>
                <Ionicons
                    name={icon as any}
                    size={24}
                    color={variant === 'primary' ? darkColors.primary : darkColors.textSecondary}
                />
            </View>
            <Text style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 16,
                color: variant === 'primary' ? darkColors.textPrimary : darkColors.textSecondary,
                flex: 1
            }}>
                {title}
            </Text>
            <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={variant === 'primary' ? darkColors.textPrimary : darkColors.textSecondary}
            />
        </Pressable>
    )

    return (
        <LinearGradient
            colors={[darkColors.gradientStart, darkColors.gradientEnd, darkColors.background]}
            style={{ flex: 1 }}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 32 }}>
                    {/* Header */}
                    <View style={{ marginBottom: 32 }}>
                        <Text style={{
                            fontFamily: 'Poppins_700Bold',
                            fontSize: 32,
                            color: darkColors.textPrimary,
                            marginBottom: 8
                        }}>
                            Upload Chart Analysis
                        </Text>
                        <Text style={{
                            fontFamily: 'Poppins_400Regular',
                            fontSize: 16,
                            color: darkColors.textSecondary,
                            lineHeight: 24
                        }}>
                            Upload your trading charts for AI-powered analysis and insights
                        </Text>
                    </View>

                    {/* Upload Options */}
                    <View style={{ marginBottom: 32 }}>
                        <Text style={{
                            fontFamily: 'Poppins_600SemiBold',
                            fontSize: 20,
                            color: darkColors.textPrimary,
                            marginBottom: 20
                        }}>
                            Choose Upload Method
                        </Text>

                        <ActionButton
                            icon="camera-outline"
                            title="Take Photo"
                            onPress={takePhoto}
                            variant="primary"
                        />

                        <ActionButton
                            icon="image-outline"
                            title="Choose from Gallery"
                            onPress={pickImage}
                            variant="secondary"
                        />
                    </View>

                    {/* Selected Image Preview */}
                    {selectedImage && (
                        <View style={{ marginBottom: 32 }}>
                            <Text style={{
                                fontFamily: 'Poppins_600SemiBold',
                                fontSize: 20,
                                color: darkColors.textPrimary,
                                marginBottom: 20
                            }}>
                                Selected Chart
                            </Text>

                            <View style={{
                                backgroundColor: darkColors.surface,
                                borderRadius: 16,
                                padding: 20,
                                borderWidth: 1,
                                borderColor: darkColors.border,
                                alignItems: 'center'
                            }}>
                                <View style={{
                                    width: '100%',
                                    height: 200,
                                    backgroundColor: darkColors.background,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 16
                                }}>
                                    <Ionicons name="image-outline" size={48} color={darkColors.textSecondary} />
                                    <Text style={{
                                        fontFamily: 'Poppins_400Regular',
                                        fontSize: 14,
                                        color: darkColors.textSecondary,
                                        marginTop: 8
                                    }}>
                                        Chart Preview
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={analyzeChart}
                                    disabled={isAnalyzing}
                                    style={{
                                        backgroundColor: darkColors.primary,
                                        borderRadius: 12,
                                        paddingVertical: 16,
                                        paddingHorizontal: 32,
                                        width: '100%',
                                        alignItems: 'center',
                                        opacity: isAnalyzing ? 0.7 : 1
                                    }}
                                >
                                    <Text style={{
                                        fontFamily: 'Poppins_600SemiBold',
                                        fontSize: 16,
                                        color: darkColors.textPrimary
                                    }}>
                                        {isAnalyzing ? 'Analyzing...' : 'Analyze Chart'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {/* Features */}
                    <View style={{ marginBottom: 32 }}>
                        <Text style={{
                            fontFamily: 'Poppins_600SemiBold',
                            fontSize: 20,
                            color: darkColors.textPrimary,
                            marginBottom: 20
                        }}>
                            What You'll Get
                        </Text>

                        <View style={{
                            backgroundColor: darkColors.surface,
                            borderRadius: 16,
                            padding: 20,
                            borderWidth: 1,
                            borderColor: darkColors.border,
                        }}>
                            {[
                                { icon: 'trending-up-outline', title: 'Trend Analysis', desc: 'Identify market trends and patterns' },
                                { icon: 'pulse-outline', title: 'Support & Resistance', desc: 'Find key price levels' },
                                { icon: 'analytics-outline', title: 'Technical Indicators', desc: 'RSI, MACD, Moving Averages' },
                                { icon: 'bulb-outline', title: 'AI Insights', desc: 'Get trading recommendations' },
                            ].map((feature, index) => (
                                <View key={index} style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: index < 3 ? 16 : 0
                                }}>
                                    <View style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: darkColors.primary + '20',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                    }}>
                                        <Ionicons name={feature.icon as any} size={20} color={darkColors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontFamily: 'Poppins_500Medium',
                                            fontSize: 16,
                                            color: darkColors.textPrimary,
                                            marginBottom: 2
                                        }}>
                                            {feature.title}
                                        </Text>
                                        <Text style={{
                                            fontFamily: 'Poppins_400Regular',
                                            fontSize: 14,
                                            color: darkColors.textSecondary
                                        }}>
                                            {feature.desc}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    )
}
