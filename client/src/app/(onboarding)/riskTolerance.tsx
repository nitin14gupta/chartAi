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

const riskLevels = [
    {
        id: 'low' as const,
        label: 'Low Risk',
        description: 'Conservative approach with stable, low-volatility investments',
        emoji: '🛡️',
        details: 'Focus on bonds, blue-chip stocks, and stable funds'
    },
    {
        id: 'medium' as const,
        label: 'Medium Risk',
        description: 'Balanced approach mixing stability with growth potential',
        emoji: '⚖️',
        details: 'Mix of stocks and bonds with moderate volatility'
    },
    {
        id: 'high' as const,
        label: 'High Risk',
        description: 'Aggressive approach seeking maximum growth potential',
        emoji: '🚀',
        details: 'Growth stocks, emerging markets, and high-volatility assets'
    }
]

export default function RiskTolerance() {
    const router = useRouter()
    const { answers, setAnswer } = useOnboarding()

    const handleSelect = (risk: 'low' | 'medium' | 'high') => {
        setAnswer('riskTolerance', risk)
    }

    const handleContinue = () => {
        if (answers.riskTolerance) {
            router.push('/(onboarding)/experienceLevel')
        }
    }

    const handleBack = () => {
        router.back()
    }

    return (
        <DarkScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <DarkHeader
                    title="What's your risk tolerance?"
                    subtitle="Understanding your comfort level with market volatility helps us tailor your experience"
                    progress={2}
                    total={4}
                />

                <View style={{ marginBottom: 32 }}>
                    {riskLevels.map((risk) => (
                        <DarkCardOption
                            key={risk.id}
                            label={risk.label}
                            description={risk.description}
                            emoji={risk.emoji}
                            selected={answers.riskTolerance === risk.id}
                            onPress={() => handleSelect(risk.id)}
                            variant="large"
                        />
                    ))}
                </View>

                <View style={{ gap: 16 }}>
                    <DarkButton
                        onPress={handleContinue}
                        disabled={!answers.riskTolerance}
                        size="lg"
                    >
                        Continue
                    </DarkButton>

                    <DarkButton
                        onPress={handleBack}
                        variant="outline"
                        size="md"
                    >
                        Back
                    </DarkButton>
                </View>
            </ScrollView>
        </DarkScreenContainer>
    )
}
