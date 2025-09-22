import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Pressable, StatusBar, ActivityIndicator, ScrollView, Dimensions } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { darkColors } from '../../../components/ui'

type YahooCandle = { date: number; open: number; high: number; low: number; close: number; volume: number }

export default function StockDetail() {
    const router = useRouter()
    const { symbol } = useLocalSearchParams<{ symbol: string }>()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [quote, setQuote] = useState<any>(null)
    const [candles, setCandles] = useState<YahooCandle[]>([])

    const BASE_STOCK_API = 'http://localhost:3000'

    const fetchQuote = async () => {
        const url = `${BASE_STOCK_API}/nse/get_quote_info?companyName=${encodeURIComponent(String(symbol))}`
        const resp = await fetch(url)
        if (!resp.ok) throw new Error('Quote fetch failed')
        const data = await resp.json()
        return data
    }

    const fetchHistorical = async () => {
        // Optional: Try to fetch chart data; if fails, return empty
        try {
            const url = `${BASE_STOCK_API}/nse/get_chart_data_new?companyName=${encodeURIComponent(String(symbol))}&time=month`
            const resp = await fetch(url)
            if (!resp.ok) throw new Error('History fetch failed')
            const data = await resp.json()
            // Best-effort parse; if not an array of points, return empty
            const series: YahooCandle[] = Array.isArray(data)
                ? data.map((p: any) => ({
                    date: Number(p?.date || p?.t || Date.now()),
                    open: Number(p?.open || p?.o || 0),
                    high: Number(p?.high || p?.h || 0),
                    low: Number(p?.low || p?.l || 0),
                    close: Number(p?.close || p?.c || 0),
                    volume: Number(p?.volume || p?.v || 0)
                }))
                : []
            return series
        } catch {
            return []
        }
    }

    const load = async () => {
        try {
            setError(null)
            setIsLoading(true)
            const [q, h] = await Promise.all([fetchQuote(), fetchHistorical()])
            setQuote(q)
            setCandles(h)
        } catch (e: any) {
            setError(e?.message || 'Failed to load stock data')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [symbol])

    const latest = useMemo(() => candles[candles.length - 1], [candles])

    return (
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
            <LinearGradient colors={[darkColors.gradientStart, darkColors.gradientEnd, darkColors.background]} style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                {/* Header */}
                <View style={{ paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: darkColors.surfaceElevated, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Ionicons name="chevron-back-outline" size={20} color={darkColors.textSecondary} />
                    </Pressable>
                    <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 20, color: darkColors.textPrimary }}>{symbol}</Text>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                    {isLoading && (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <ActivityIndicator color={darkColors.primary} />
                            <Text style={{ color: darkColors.textSecondary, marginTop: 12, fontFamily: 'Poppins_400Regular' }}>Loading…</Text>
                        </View>
                    )}

                    {error && (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ color: darkColors.error, fontFamily: 'Poppins_600SemiBold' }}>{error}</Text>
                            <Pressable onPress={load} style={{ marginTop: 12, backgroundColor: darkColors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 }}>
                                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>Retry</Text>
                            </Pressable>
                        </View>
                    )}

                    {!isLoading && !error && (
                        <>
                            {/* Quote summary */}
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: darkColors.textPrimary }}>{quote?.companyName || quote?.symbol || symbol}</Text>
                                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 28, color: darkColors.textPrimary, marginTop: 6 }}>
                                    ₹{Number(quote?.lastPrice || latest?.close || 0).toFixed(2)}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                    <Text style={{ color: (Number(quote?.change || 0)) >= 0 ? '#10B981' : '#EF4444', fontFamily: 'Poppins_500Medium' }}>
                                        {Number(quote?.change || 0).toFixed(2)} ({Number(quote?.pChange || 0).toFixed(2)}%)
                                    </Text>
                                </View>
                            </View>

                            {/* Simple chart placeholder using last closes */}
                            <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: darkColors.border, marginBottom: 16 }}>
                                <Text style={{ color: darkColors.textSecondary, fontFamily: 'Poppins_500Medium', marginBottom: 8 }}>Last 1M Close</Text>
                                <View style={{ height: 140, flexDirection: 'row', alignItems: 'flex-end' }}>
                                    {candles.map((c, i) => {
                                        const maxClose = Math.max(...candles.map(x => x.close || 0)) || 1
                                        const h = Math.max(2, Math.round((c.close / maxClose) * 120))
                                        return <View key={i} style={{ width: 4, height: h, backgroundColor: darkColors.primary, marginRight: 2, borderRadius: 2 }} />
                                    })}
                                </View>
                            </View>

                            {/* High / Low */}
                            <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: darkColors.border, marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View>
                                        <Text style={{ color: darkColors.textSecondary, fontFamily: 'Poppins_400Regular' }}>Day High</Text>
                                        <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginTop: 4 }}>₹{Number(quote?.dayHigh || latest?.high || 0).toFixed(2)}</Text>
                                    </View>
                                    <View>
                                        <Text style={{ color: darkColors.textSecondary, fontFamily: 'Poppins_400Regular' }}>Day Low</Text>
                                        <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginTop: 4 }}>₹{Number(quote?.dayLow || latest?.low || 0).toFixed(2)}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Technical indicators (Alpha Vantage optional) */}
                            <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: darkColors.border }}>
                                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 }}>Technical Indicators</Text>
                                <Text style={{ color: darkColors.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                                    You can integrate Alpha Vantage indicators by adding your API key and calling their endpoints
                                    like SMA/RSI. Placeholder shown here to keep app fully client-only.
                                </Text>
                            </View>
                        </>
                    )}
                </ScrollView>
            </LinearGradient>
        </View>
    )
}


