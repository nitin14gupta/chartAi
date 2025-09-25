import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import { usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

export default function TabsLayout() {
    const pathname = usePathname();
    const hideTabs = pathname?.includes('/chat');
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top']}>
            <View style={{ flex: 1 }}>
                <NativeTabs>
                    <NativeTabs.Trigger name="index">
                        <Label>Upload</Label>
                        <Icon
                            sf={{ default: "chart.line.uptrend.xyaxis", selected: "chart.line.uptrend.xyaxis" }}
                            drawable="stat_sys_upload"
                        />
                        <Badge>1</Badge>
                    </NativeTabs.Trigger>

                    <NativeTabs.Trigger name="chat">
                        <Label>Chat</Label>
                        <Icon
                            sf={{ default: "message", selected: "message.fill" }}
                            drawable="sym_action_chat"
                        />
                    </NativeTabs.Trigger>

                    <NativeTabs.Trigger name="stocks">
                        <Label>Stocks</Label>
                        <Icon
                            sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
                            drawable="stat_sys_download_done"
                        />
                    </NativeTabs.Trigger>

                    <NativeTabs.Trigger name="profile">
                        <Label>Profile</Label>
                        <Icon
                            sf={{ default: "person", selected: "person.fill" }}
                            drawable="sym_contact_card"
                        />
                    </NativeTabs.Trigger>
                </NativeTabs>
                {hideTabs && (
                    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, backgroundColor: '#000000' }} />
                )}
            </View>
        </SafeAreaView>
    );
}