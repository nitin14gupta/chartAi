import { View, Text } from 'react-native'
import { Redirect } from 'expo-router'

export default function chat() {
    return (
        <View>
            <Redirect href={'/(features)/chat'} />
        </View>
    )
}