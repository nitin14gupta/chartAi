import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

export default function TabsLayout() {
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
            </View>
        </SafeAreaView>
    );
}