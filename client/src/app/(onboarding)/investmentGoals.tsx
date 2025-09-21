import React, { useState } from 'react'
import { View, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '../../context/OnboardingContext'
import {
    DarkScreenContainer,
    DarkHeader,
    DarkMultiSelectOption,
    DarkButton
} from '../../components/darkUI'

const investmentGoals = [
    {
        id: 'retirement',
        label: 'Retirement Planning',
        description: 'Building long-term wealth for retirement',
        emoji: '🏖️'
    },
    {
        id: 'wealth_building',
        label: 'Wealth Building',
        description: 'Growing your net worth over time',
        emoji: '💰'
    },
    {
        id: 'passive_income',
        label: 'Passive Income',
        description: 'Generating regular income from investments',
        emoji: '💸'
    },
    {
        id: 'education',
        label: 'Education Fund',
        description: 'Saving for education expenses',
        emoji: '🎓'
    },
    {
        id: 'home_purchase',
        label: 'Home Purchase',
        description: 'Saving for a down payment or home',
        emoji: '🏠'
    },
    {
        id: 'emergency_fund',
        label: 'Emergency Fund',
        description: 'Building a safety net for unexpected expenses',
        emoji: '🚨'
    },
    {
        id: 'travel',
        label: 'Travel & Lifestyle',
        description: 'Funding travel and lifestyle goals',
        emoji: '✈️'
    },
    {
        id: 'business',
        label: 'Business Investment',
        description: 'Investing in business opportunities',
        emoji: '🏢'
    }
]

export default function InvestmentGoals() {
    const router = useRouter()
    const { answers, setAnswer } = useOnboarding()
    const [selectedGoals, setSelectedGoals] = useState<string[]>(answers.investmentGoals || [])

    const handleToggleGoal = (goalId: string) => {
        setSelectedGoals(prev => {
            const newGoals = prev.includes(goalId)
                ? prev.filter(id => id !== goalId)
                : [...prev, goalId]

            setAnswer('investmentGoals', newGoals)
            return newGoals
        })
    }

    const handleContinue = () => {
        if (selectedGoals.length > 0) {
            router.push('/(auth)/register')
        }
    }

    const handleBack = () => {
        router.back()
    }

    const handleSkip = () => {
        router.push('/(auth)/register')
    }

    return (
        <DarkScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <DarkHeader
                    title="What are your investment goals?"
                    subtitle="Select all that apply - you can always update these later"
                    progress={4}
                    total={4}
                />

                <View style={{ marginBottom: 32 }}>
                    {investmentGoals.map((goal) => (
                        <DarkMultiSelectOption
                            key={goal.id}
                            label={goal.label}
                            description={goal.description}
                            emoji={goal.emoji}
                            selected={selectedGoals.includes(goal.id)}
                            onPress={() => handleToggleGoal(goal.id)}
                        />
                    ))}
                </View>

                <View style={{ gap: 16 }}>
                    <DarkButton
                        onPress={handleContinue}
                        disabled={selectedGoals.length === 0}
                        size="lg"
                    >
                        Continue to Registration
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
