import React from 'react'
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { darkColors } from '../../components/ui'

export default function Dashboard() {
  const router = useRouter()

  const QuickActionCard = ({ icon, title, subtitle, onPress, color }: {
    icon: string
    title: string
    subtitle: string
    onPress: () => void
    color: string
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: darkColors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: darkColors.border,
        shadowColor: darkColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: color + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16
        }}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontFamily: 'Poppins_600SemiBold',
            fontSize: 18,
            color: darkColors.textPrimary,
            marginBottom: 4
          }}>
            {title}
          </Text>
          <Text style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: 14,
            color: darkColors.textSecondary
          }}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color={darkColors.textSecondary} />
      </View>
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
              Welcome to ChartAi
            </Text>
            <Text style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: 16,
              color: darkColors.textSecondary,
              lineHeight: 24
            }}>
              Your AI-powered trading companion. Analyze charts, get insights, and trade smarter.
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 20,
              color: darkColors.textPrimary,
              marginBottom: 20
            }}>
              Quick Actions
            </Text>

            <QuickActionCard
              icon="cloud-upload-outline"
              title="Upload Chart Analysis"
              subtitle="Upload your charts for AI analysis and insights"
              onPress={() => router.push('/(tabs)/upload')}
              color={darkColors.primary}
            />

            <QuickActionCard
              icon="chatbubble-outline"
              title="Chat with Trading Bot"
              subtitle="Get instant answers to your trading questions"
              onPress={() => router.push('/(tabs)/chat')}
              color="#10B981"
            />

            <QuickActionCard
              icon="trending-up-outline"
              title="Browse Indian Stocks"
              subtitle="Explore and analyze Indian stock markets"
              onPress={() => router.push('/(tabs)/stocks')}
              color="#F59E0B"
            />

            <QuickActionCard
              icon="settings-outline"
              title="Settings & Profile"
              subtitle="Manage your account and preferences"
              onPress={() => router.push('/(settings)')}
              color="#EC4899"
            />
          </View>

          {/* Recent Activity */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 20,
              color: darkColors.textPrimary,
              marginBottom: 20
            }}>
              Recent Activity
            </Text>

            <View style={{
              backgroundColor: darkColors.surface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: darkColors.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: darkColors.primary + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Ionicons name="analytics-outline" size={20} color={darkColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 16,
                    color: darkColors.textPrimary,
                    marginBottom: 2
                  }}>
                    No recent activity
                  </Text>
                  <Text style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 14,
                    color: darkColors.textSecondary
                  }}>
                    Start by uploading a chart or chatting with our AI
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}