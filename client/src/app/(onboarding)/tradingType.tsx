import React from 'react'
import { View, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '../../context/OnboardingContext'
import {
    DarkScreenContainer,
    DarkHeader,
    DarkCardOption,
    DarkButton
} from '../../components/darkUI'

const tradingTypes = [
    {
        id: 'day' as const,
        label: 'Day Trading',
        description: 'Buy and sell within the same day, capitalizing on short-term price movements',
        emoji: '⚡'
    },
    {
        id: 'swing' as const,
        label: 'Swing Trading',
        description: 'Hold positions for several days to weeks, capturing medium-term trends',
        emoji: '📈'
    },
    {
        id: 'longterm' as const,
        label: 'Long-term Investment',
        description: 'Buy and hold for months or years, focusing on fundamental value',
        emoji: '🏛️'
    }
]

export default function TradingType() {
    const router = useRouter()
    const { answers, setAnswer } = useOnboarding()

    const handleSelect = (type: 'day' | 'swing' | 'longterm') => {
        setAnswer('tradingType', type)
    }

    const handleContinue = () => {
        if (answers.tradingType) {
            router.push('/(onboarding)/riskTolerance')
        }
    }

    const handleLogin = () => {
        router.push('/(auth)/login')
    }

    return (
        <DarkScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <DarkHeader
                    title="What's your trading style?"
                    subtitle="Choose the approach that best matches your investment strategy"
                    progress={1}
                    total={4}
                />

                <View style={{ marginBottom: 32 }}>
                    {tradingTypes.map((type) => (
                        <DarkCardOption
                            key={type.id}
                            label={type.label}
                            description={type.description}
                            emoji={type.emoji}
                            selected={answers.tradingType === type.id}
                            onPress={() => handleSelect(type.id)}
                            variant="large"
                        />
                    ))}
                </View>

                <View style={{ gap: 16 }}>
                    <DarkButton
                        onPress={handleContinue}
                        disabled={!answers.tradingType}
                        size="lg"
                    >
                        Continue
                    </DarkButton>

                    <DarkButton
                        onPress={handleLogin}
                        variant="outline"
                        size="md"
                    >
                        Already have an account? Login
                    </DarkButton>
                </View>
            </ScrollView>
        </DarkScreenContainer>
    )
}