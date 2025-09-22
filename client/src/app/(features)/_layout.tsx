import { Stack } from "expo-router";

export default function FeaturesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="stock/[symbol]" options={{ headerShown: false }} />
            <Stack.Screen name="chart/preview" options={{ headerShown: false }} />
            <Stack.Screen name="chart/results" options={{ headerShown: false }} />
        </Stack>
    );
}