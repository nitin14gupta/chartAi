import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native'
import { darkColors } from '../../../components/ui'
import apiService from '../../../api/apiService'
import { router } from 'expo-router'

export default function ChartHistoryScreen() {
    const [items, setItems] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [offset, setOffset] = useState(0)
    const [limit, setLimit] = useState(15)
    const [hasMore, setHasMore] = useState(false)

    const loadPage = useCallback(async (newLimit: number, newOffset: number, replace: boolean = false) => {
        setIsLoading(true)
        const res = await apiService.getAnalysisHistory(newLimit, newOffset)
        if (res.success && res.data) {
            setHasMore(res.data.has_more)
            setOffset(res.data.offset + res.data.limit)
            if (replace) setItems(res.data.items)
            else setItems(prev => [...prev, ...res.data.items])
        }
        setIsLoading(false)
    }, [])

    useEffect(() => {
        loadPage(limit, 0, true)
    }, [])

    const onRefresh = async () => {
        setIsRefreshing(true)
        await loadPage(15, 0, true)
        setLimit(15)
        setIsRefreshing(false)
    }

    const loadMore = async () => {
        await loadPage(50, offset, false)
        setLimit(50)
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#000000' }} contentContainerStyle={{ padding: 16 }} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={darkColors.textSecondary} />}>
            <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_700Bold', fontSize: 20, marginBottom: 12 }}>History</Text>

            <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, padding: 12 }}>
                {items.length === 0 && !isLoading ? (
                    <Text style={{ color: darkColors.textSecondary }}>No history yet.</Text>
                ) : (
                    items.map((item, idx) => (
                        <Pressable key={item.id || idx} style={{ paddingVertical: 10, borderBottomWidth: idx < items.length - 1 ? 1 : 0, borderBottomColor: darkColors.border }} onPress={() => router.push({ pathname: '/(features)/chart/results', params: { data: JSON.stringify({ summary: item.summary, patterns_detected: item.patterns_detected, annotated_image: item.annotated_image, insights: item.insights }) } })}>
                            <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_500Medium' }}>{item.summary || 'Analysis'}</Text>
                            <Text style={{ color: darkColors.textSecondary, fontSize: 12 }}>{(item.created_at || '').replace('T', ' ').replace('Z', '')}</Text>
                        </Pressable>
                    ))
                )}
            </View>

            {hasMore && (
                <Pressable onPress={loadMore} disabled={isLoading} style={{ marginTop: 12, backgroundColor: darkColors.primary, padding: 12, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>{isLoading ? 'Loading…' : 'Load more'}</Text>
                </Pressable>
            )}
        </ScrollView>
    )
}


