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

    const nsSymbol = `${symbol}.NS`

    const fetchQuote = async () => {
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(nsSymbol)}`
        const resp = await fetch(url)
        if (!resp.ok) throw new Error('Quote fetch failed')
        const json = await resp.json()
        const res = json?.quoteResponse?.result?.[0]
        return res
    }

    const fetchHistorical = async () => {
        // Yahoo historical chart API
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(nsSymbol)}?range=1mo&interval=1d`
        const resp = await fetch(url)
        if (!resp.ok) throw new Error('History fetch failed')
        const json = await resp.json()
        const result = json?.chart?.result?.[0]
        const timestamps: number[] = result?.timestamp || []
        const ohlc = result?.indicators?.quote?.[0] || {}
        const mapped: YahooCandle[] = timestamps.map((t: number, i: number) => ({
            date: t * 1000,
            open: Number(ohlc.open?.[i] ?? 0),
            high: Number(ohlc.high?.[i] ?? 0),
            low: Number(ohlc.low?.[i] ?? 0),
            close: Number(ohlc.close?.[i] ?? 0),
            volume: Number(ohlc.volume?.[i] ?? 0),
        }))
        return mapped
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
                                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: darkColors.textPrimary }}>{quote?.shortName || quote?.longName || symbol}</Text>
                                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 28, color: darkColors.textPrimary, marginTop: 6 }}>
                                    ₹{Number(quote?.regularMarketPrice || latest?.close || 0).toFixed(2)}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                    <Text style={{ color: (quote?.regularMarketChange || 0) >= 0 ? '#10B981' : '#EF4444', fontFamily: 'Poppins_500Medium' }}>
                                        {Number(quote?.regularMarketChange || 0).toFixed(2)} ({Number(quote?.regularMarketChangePercent || 0).toFixed(2)}%)
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
                                        <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginTop: 4 }}>₹{Number(quote?.regularMarketDayHigh || latest?.high || 0).toFixed(2)}</Text>
                                    </View>
                                    <View>
                                        <Text style={{ color: darkColors.textSecondary, fontFamily: 'Poppins_400Regular' }}>Day Low</Text>
                                        <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginTop: 4 }}>₹{Number(quote?.regularMarketDayLow || latest?.low || 0).toFixed(2)}</Text>
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


