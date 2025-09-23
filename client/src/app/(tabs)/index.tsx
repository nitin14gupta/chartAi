import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, StatusBar, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { darkColors } from '../../components/ui'
import * as ImagePicker from 'expo-image-picker'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePushNotifications } from '../../constants/usePushNotifications'
import { router } from 'expo-router'
import { preloadBundledAssetsIfNeeded } from '../../constants/preloadAssets'
import { useAuth } from '../../context/AuthContext'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiService from '../../api/apiService'

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isPreloading, setIsPreloading] = useState(true)
  const { expoPushToken } = usePushNotifications()
  const { user } = useAuth()
  const [historyItems, setHistoryItems] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Preload assets
        await preloadBundledAssetsIfNeeded()
        setIsPreloading(false)

        // Check if user is coming from register screen
        const isFromRegister = await AsyncStorage.getItem('isFromRegister')
        if (isFromRegister === 'true') {
          // Clear the flag
          await AsyncStorage.removeItem('isFromRegister')

          // Request notification permission and send welcome notification
          await requestNotificationPermission()
        } else {
          // Check if we've already asked for notifications
          const hasAskedForNotifications = await AsyncStorage.getItem('hasAskedForNotifications')
          if (!hasAskedForNotifications) {
            await requestNotificationPermission()
          }
        }
      } catch (error) {
        console.log('App initialization error:', error)
        setIsPreloading(false)
      }
    }

    initializeApp()
  }, [])

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return
      try {
        setIsLoadingHistory(true)
        const res = await apiService.getAnalysisHistory(3, 0)
        if (res.success && res.data?.items) {
          setHistoryItems(res.data.items)
        } else {
          setHistoryItems([])
        }
      } catch (e) {
        setHistoryItems([])
      } finally {
        setIsLoadingHistory(false)
      }
    }
    loadHistory()
  }, [user])

  const requestNotificationPermission = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus === 'granted') {
        // Send welcome notification
        await sendWelcomeNotification()
        await AsyncStorage.setItem('hasAskedForNotifications', 'true')
      } else {
        // User declined, ask again next time
        await AsyncStorage.setItem('hasAskedForNotifications', 'false')
      }
    } catch (error) {
      console.log('Notification permission error:', error)
    }
  }

  const sendWelcomeNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Welcome to ChartAi! 🎉',
          body: 'Start analyzing your trading charts with AI-powered insights',
          sound: 'default',
        },
        trigger: null,
      })
    } catch (error) {
      console.log('Welcome notification error:', error)
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    })

    if (!result.canceled) {
      const uri = result.assets[0].uri
      setSelectedImage(uri)
      router.push({ pathname: '/(features)/chart/preview', params: { image: uri } })
    }
  }

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    })

    if (!result.canceled) {
      const uri = result.assets[0].uri
      setSelectedImage(uri)
      router.push({ pathname: '/(features)/chart/preview', params: { image: uri } })
    }
  }

  const analyzeChart = async () => {
    if (!selectedImage) return
    router.push({ pathname: '/(features)/chart/preview', params: { image: selectedImage } })
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

  if (isPreloading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['bottom']}>
        <LinearGradient
          colors={[darkColors.gradientStart, darkColors.gradientEnd, darkColors.background]}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 18,
              color: darkColors.textPrimary,
              marginBottom: 16
            }}>
              Loading ChartAi...
            </Text>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 3,
              borderColor: darkColors.border,
              borderTopColor: darkColors.primary,
              // animation: 'spin'
            }} />
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['bottom']}>
      <LinearGradient
        colors={[darkColors.gradientStart, darkColors.gradientEnd, darkColors.background]}
        style={{ flex: 1 }}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={{
            paddingTop: 16,
            paddingHorizontal: 24,
          }}>
            {/* Header */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontFamily: 'Poppins_700Bold',
                fontSize: 24,
                color: darkColors.textPrimary,
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

            {/* History Preview */}
            {user && (
              <View style={{ marginBottom: 32 }}>
                <Text style={{
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: 20,
                  color: darkColors.textPrimary,
                  marginBottom: 12
                }}>
                  Recent History
                </Text>

                <View style={{
                  backgroundColor: darkColors.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: darkColors.border,
                }}>
                  {isLoadingHistory ? (
                    <Text style={{ color: darkColors.textSecondary }}>Loading...</Text>
                  ) : historyItems.length === 0 ? (
                    <Text style={{ color: darkColors.textSecondary }}>No history yet.</Text>
                  ) : (
                    historyItems.map((item, idx) => (
                      <Pressable
                        key={item.id || idx}
                        onPress={() => router.push({ pathname: '/(features)/chart/results', params: { data: JSON.stringify({ summary: item.summary, patterns_detected: item.patterns_detected, annotated_image: item.annotated_image, insights: item.insights }) } })}
                        style={{ marginBottom: idx < historyItems.length - 1 ? 12 : 0 }}
                      >
                        <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_500Medium' }}>{item.summary || 'Analysis'}</Text>
                        <Text style={{ color: darkColors.textSecondary, fontSize: 12 }}>
                          {(item.created_at || '').replace('T', ' ').replace('Z', '')}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </View>

                {historyItems.length >= 3 && (
                  <Pressable
                    onPress={() => router.push('/(features)/chart')}
                    style={{ marginTop: 12, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: darkColors.border }}
                  >
                    <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_500Medium' }}>See more</Text>
                  </Pressable>
                )}
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
    </SafeAreaView>
  )
}
