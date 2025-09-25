import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeaturesLayout() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top']}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="stock/[symbol]" options={{ headerShown: false }} />
                <Stack.Screen name="chart/preview" options={{ headerShown: false }} />
                <Stack.Screen name="chart/results" options={{ headerShown: false }} />
                <Stack.Screen name="chat/index" options={{ headerShown: false }} />
            </Stack>
        </SafeAreaView>
    );
}