import { Stack } from "expo-router";

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen name="tradingType" />
            <Stack.Screen name="riskTolerance" />
            <Stack.Screen name="experienceLevel" />
            <Stack.Screen name="investmentGoals" />
        </Stack>
    )
}