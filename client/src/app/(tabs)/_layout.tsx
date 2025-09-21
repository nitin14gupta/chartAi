import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

export default function TabsLayout() {
    return (
        <NativeTabs
            style={{
                // Dark mode styling
                backgroundColor: '#0F0F0F',
                color: '#FFFFFF',
                tintColor: '#6366F1', // Indigo for selected state
            }}
        >
            <NativeTabs.Trigger name="index">
                <Label>Dashboard</Label>
                <Icon
                    sf={{ default: "chart.line.uptrend.xyaxis", selected: "chart.line.uptrend.xyaxis" }}
                    drawable="dashboard_icon"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="upload">
                <Label>Upload</Label>
                <Icon
                    sf={{ default: "square.and.arrow.up", selected: "square.and.arrow.up.fill" }}
                    drawable="upload_icon"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="chat">
                <Label>Chat</Label>
                <Icon
                    sf={{ default: "message", selected: "message.fill" }}
                    drawable="chat_icon"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="stocks">
                <Label>Stocks</Label>
                <Icon
                    sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
                    drawable="stocks_icon"
                />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}