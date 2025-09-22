import { Stack } from "expo-router";

export default function FeaturesLayout() {
    return (
        <Stack>
            <Stack.Screen name="stock/[symbol]" options={{ headerShown: false }} />
        </Stack>
    );
}