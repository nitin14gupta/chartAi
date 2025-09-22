import React, { useMemo, useState } from 'react'
import { View, Text, Image, Pressable, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImageManipulator from 'expo-image-manipulator'
import { darkColors } from '../../../components/ui'
import apiService from '../../../api/apiService'

export default function ChartPreview() {
    const params = useLocalSearchParams<{ image?: string }>()
    const [imageUri, setImageUri] = useState<string | undefined>(params.image)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const rotate = async () => {
        if (!imageUri) return
        const result = await ImageManipulator.manipulateAsync(imageUri, [{ rotate: 90 }], { compress: 1, format: ImageManipulator.SaveFormat.PNG })
        setImageUri(result.uri)
    }

    const analyze = async () => {
        if (!imageUri) return
        setIsAnalyzing(true)
        const res = await apiService.analyzeChart(imageUri)
        setIsAnalyzing(false)
        if (!res.success || !res.data) {
            Alert.alert('Analysis failed', res.error || 'Unexpected error')
            return
        }
        router.push({ pathname: '/(features)/chart/results', params: { data: JSON.stringify(res.data) } })
    }

    const reupload = () => {
        router.back()
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000000', padding: 16 }}>
            <View style={{ marginBottom: 16 }}>
                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_700Bold', fontSize: 20 }}>Preview & Confirm</Text>
                <Text style={{ color: darkColors.textSecondary, fontFamily: 'Poppins_400Regular', marginTop: 4 }}>Rotate or re-upload if needed, then analyze.</Text>
            </View>

            <View style={{ flex: 1, backgroundColor: darkColors.surface, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                ) : (
                    <Text style={{ color: darkColors.textSecondary }}>No image</Text>
                )}
            </View>

            <View style={{ marginTop: 16, flexDirection: 'row', gap: 12 }}>
                <Pressable onPress={rotate} style={{ flex: 1, backgroundColor: darkColors.surface, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, alignItems: 'center' }}>
                    <Ionicons name="refresh" size={18} color={darkColors.textSecondary} />
                    <Text style={{ color: darkColors.textSecondary, marginTop: 6, fontFamily: 'Poppins_500Medium' }}>Rotate</Text>
                </Pressable>
                <Pressable onPress={reupload} style={{ flex: 1, backgroundColor: darkColors.surface, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, alignItems: 'center' }}>
                    <Ionicons name="cloud-upload-outline" size={18} color={darkColors.textSecondary} />
                    <Text style={{ color: darkColors.textSecondary, marginTop: 6, fontFamily: 'Poppins_500Medium' }}>Re-upload</Text>
                </Pressable>
            </View>

            <Pressable onPress={analyze} disabled={isAnalyzing} style={{ marginTop: 16, backgroundColor: darkColors.primary, padding: 16, borderRadius: 12, alignItems: 'center', opacity: isAnalyzing ? 0.7 : 1 }}>
                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>{isAnalyzing ? 'Analyzing…' : 'Confirm & Analyze'}</Text>
            </Pressable>
        </View>
    )
}


