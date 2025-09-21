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

const experienceLevels = [
    {
        id: 'beginner' as const,
        label: 'Beginner',
        description: 'New to trading and investing, looking to learn the basics',
        emoji: '🌱',
        details: 'We\'ll provide educational content and simple tools to get you started'
    },
    {
        id: 'intermediate' as const,
        label: 'Intermediate',
        description: 'Some experience with trading, comfortable with basic concepts',
        emoji: '📚',
        details: 'Access to advanced features while maintaining educational support'
    },
    {
        id: 'expert' as const,
        label: 'Expert',
        description: 'Experienced trader with deep market knowledge',
        emoji: '🎯',
        details: 'Full access to professional tools and advanced analytics'
    }
]

export default function ExperienceLevel() {
    const router = useRouter()
    const { answers, setAnswer } = useOnboarding()

    const handleSelect = (level: 'beginner' | 'intermediate' | 'expert') => {
        setAnswer('experienceLevel', level)
    }

    const handleContinue = () => {
        if (answers.experienceLevel) {
            router.push('/(onboarding)/investmentGoals')
        }
    }

    const handleBack = () => {
        router.back()
    }

    return (
        <DarkScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <DarkHeader
                    title="What's your experience level?"
                    subtitle="This helps us customize your dashboard and provide appropriate guidance"
                    progress={3}
                    total={4}
                />

                <View style={{ marginBottom: 32 }}>
                    {experienceLevels.map((level) => (
                        <DarkCardOption
                            key={level.id}
                            label={level.label}
                            description={level.description}
                            emoji={level.emoji}
                            selected={answers.experienceLevel === level.id}
                            onPress={() => handleSelect(level.id)}
                            variant="large"
                        />
                    ))}
                </View>

                <View style={{ gap: 16 }}>
                    <DarkButton
                        onPress={handleContinue}
                        disabled={!answers.experienceLevel}
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
