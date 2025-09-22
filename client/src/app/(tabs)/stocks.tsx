import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, StatusBar, TextInput, RefreshControl, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { darkColors } from '../../components/ui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

interface Stock {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    volume: string
    marketCap: string
}

export default function Stocks() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [liveStocks, setLiveStocks] = useState<Stock[]>([])

    const categories = [
        { id: 'all', name: 'All Stocks' },
    ]

    const defaultSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN']

    const BASE_STOCK_API = 'http://localhost:3000'

    const fetchLocalNSEQuotes = async (symbols: string[]) => {
        const url = `${BASE_STOCK_API}/nse/get_multiple_quote_info?companyNames=${encodeURIComponent(symbols.join(','))}`
        const resp = await fetch(url)
        if (!resp.ok) throw new Error(`NSE quotes failed: ${resp.status}`)
        const json = await resp.json()
        const mapped: Stock[] = (json || []).map((r: any) => ({
            symbol: String(r?.symbol || r?.data?.symbol || ''),
            name: String(r?.companyName || r?.data?.companyName || r?.symbol || ''),
            price: Number(r?.lastPrice || r?.data?.lastPrice || 0),
            change: Number((r?.change || r?.data?.change) ?? 0),
            changePercent: Number((r?.pChange || r?.data?.pChange) ?? 0),
            volume: String(r?.totalTradedVolume || r?.data?.totalTradedVolume || '-'),
            marketCap: String(r?.totalMarketCap || r?.data?.totalMarketCap || '-')
        })).filter((s: Stock) => s.symbol)
        return mapped
    }

    const filteredStocks = useMemo(() => {
        const base = liveStocks
        return base.filter(stock =>
            stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stock.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [liveStocks, searchQuery])

    const loadData = async (isPull = false) => {
        try {
            setError(null)
            isPull ? setIsRefreshing(true) : setIsLoading(true)
            const live = await fetchLocalNSEQuotes(defaultSymbols)
            setLiveStocks(live)
        } catch (e: any) {
            setError(e?.message || 'Failed to load stocks')
        } finally {
            isPull ? setIsRefreshing(false) : setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
        const id = setInterval(() => loadData(true), 30000)
        return () => clearInterval(id)
    }, [])

    const StockCard = ({ stock }: { stock: Stock }) => (
        <Pressable
            onPress={() => router.push({ pathname: '/(features)/stock/[symbol]', params: { symbol: stock.symbol } })}
            style={{
                backgroundColor: darkColors.surface,
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: darkColors.border,
                shadowColor: darkColors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 4
                    }}>
                        {stock.symbol}
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 14,
                        color: darkColors.textSecondary,
                        marginBottom: 8
                    }}>
                        {stock.name}
                    </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{
                        fontFamily: 'Poppins_600SemiBold',
                        fontSize: 18,
                        color: darkColors.textPrimary,
                        marginBottom: 4
                    }}>
                        ₹{stock.price.toFixed(2)}
                    </Text>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: stock.change >= 0 ? '#10B981' + '20' : '#EF4444' + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8
                    }}>
                        <Ionicons
                            name={stock.change >= 0 ? 'trending-up' : 'trending-down'}
                            size={12}
                            color={stock.change >= 0 ? '#10B981' : '#EF4444'}
                        />
                        <Text style={{
                            fontFamily: 'Poppins_500Medium',
                            fontSize: 12,
                            color: stock.change >= 0 ? '#10B981' : '#EF4444',
                            marginLeft: 4
                        }}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                        </Text>
                    </View>
                </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 12,
                        color: darkColors.textTertiary,
                        marginBottom: 2
                    }}>
                        Volume
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_500Medium',
                        fontSize: 14,
                        color: darkColors.textSecondary
                    }}>
                        {stock.volume}
                    </Text>
                </View>
                <View>
                    <Text style={{
                        fontFamily: 'Poppins_400Regular',
                        fontSize: 12,
                        color: darkColors.textTertiary,
                        marginBottom: 2
                    }}>
                        Market Cap
                    </Text>
                    <Text style={{
                        fontFamily: 'Poppins_500Medium',
                        fontSize: 14,
                        color: darkColors.textSecondary
                    }}>
                        {stock.marketCap}
                    </Text>
                </View>
            </View>
        </Pressable>
    )

    const CategoryButton = ({ category }: { category: { id: string; name: string } }) => (
        <Pressable
            onPress={() => setSelectedCategory(category.id)}
            style={{
                backgroundColor: selectedCategory === category.id ? darkColors.primary : darkColors.surface,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
                borderWidth: 1,
                borderColor: selectedCategory === category.id ? darkColors.primary : darkColors.border,
            }}
        >
            <Text style={{
                fontFamily: 'Poppins_500Medium',
                fontSize: 14,
                color: selectedCategory === category.id ? darkColors.textPrimary : darkColors.textSecondary
            }}>
                {category.name}
            </Text>
        </Pressable>
    )

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['bottom']}>
            <LinearGradient
                colors={[darkColors.gradientStart, darkColors.gradientEnd, darkColors.background]}
                style={{ flex: 1 }}
            >
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadData(true)} tintColor={darkColors.textSecondary} />}
                >
                    <View style={{ paddingTop: 10, paddingHorizontal: 24, paddingBottom: 32 }}>
                        {/* Header */}
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{
                                fontFamily: 'Poppins_700Bold',
                                fontSize: 24,
                                color: darkColors.textPrimary,
                            }}>
                                Indian Stocks
                            </Text>
                            <Text style={{
                                fontFamily: 'Poppins_400Regular',
                                fontSize: 16,
                                color: darkColors.textSecondary,
                                lineHeight: 24
                            }}>
                                Explore and analyze Indian stock markets
                            </Text>
                        </View>

                        {/* Search */}
                        <View style={{ marginBottom: 24 }}>
                            <View style={{
                                backgroundColor: darkColors.surface,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: darkColors.border,
                            }}>
                                <Ionicons name="search-outline" size={20} color={darkColors.textSecondary} />
                                <TextInput
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder="Search stocks by name..."
                                    placeholderTextColor={darkColors.textTertiary}
                                    style={{
                                        flex: 1,
                                        fontFamily: 'Poppins_400Regular',
                                        fontSize: 16,
                                        color: darkColors.textPrimary,
                                        marginLeft: 12
                                    }}
                                />
                            </View>
                        </View>

                        {/* Categories */}
                        <View style={{ marginBottom: 24 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {categories.map((category) => (
                                    <CategoryButton key={category.id} category={category} />
                                ))}
                            </ScrollView>
                        </View>

                        {/* Loading / Error */}
                        {isLoading && (
                            <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                <ActivityIndicator color={darkColors.primary} />
                                <Text style={{ color: darkColors.textSecondary, marginTop: 8, fontFamily: 'Poppins_400Regular' }}>Loading live data…</Text>
                            </View>
                        )}
                        {error && (
                            <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                <Text style={{ color: darkColors.error, fontFamily: 'Poppins_500Medium' }}>{error}</Text>
                            </View>
                        )}

                        {/* Market Overview (static sample) */}
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{
                                fontFamily: 'Poppins_600SemiBold',
                                fontSize: 20,
                                color: darkColors.textPrimary,
                                marginBottom: 16
                            }}>
                                Market Overview
                            </Text>

                            <View style={{
                                backgroundColor: darkColors.surface,
                                borderRadius: 16,
                                padding: 20,
                                borderWidth: 1,
                                borderColor: darkColors.border,
                            }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <View>
                                        <Text style={{
                                            fontFamily: 'Poppins_400Regular',
                                            fontSize: 14,
                                            color: darkColors.textSecondary,
                                            marginBottom: 4
                                        }}>
                                            Nifty 50
                                        </Text>
                                        <Text style={{
                                            fontFamily: 'Poppins_700Bold',
                                            fontSize: 24,
                                            color: darkColors.textPrimary
                                        }}>
                                            19,245.30
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: '#10B981' + '20',
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 8
                                        }}>
                                            <Ionicons name="trending-up" size={12} color="#10B981" />
                                            <Text style={{
                                                fontFamily: 'Poppins_500Medium',
                                                fontSize: 12,
                                                color: '#10B981',
                                                marginLeft: 4
                                            }}>
                                                +125.50 (+0.66%)
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View>
                                        <Text style={{
                                            fontFamily: 'Poppins_400Regular',
                                            fontSize: 14,
                                            color: darkColors.textSecondary,
                                            marginBottom: 4
                                        }}>
                                            Sensex
                                        </Text>
                                        <Text style={{
                                            fontFamily: 'Poppins_600SemiBold',
                                            fontSize: 18,
                                            color: darkColors.textPrimary
                                        }}>
                                            64,718.56
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={{
                                            fontFamily: 'Poppins_400Regular',
                                            fontSize: 14,
                                            color: darkColors.textSecondary,
                                            marginBottom: 4
                                        }}>
                                            Bank Nifty
                                        </Text>
                                        <Text style={{
                                            fontFamily: 'Poppins_600SemiBold',
                                            fontSize: 18,
                                            color: darkColors.textPrimary
                                        }}>
                                            43,891.25
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Stocks List */}
                        <View>
                            <Text style={{
                                fontFamily: 'Poppins_600SemiBold',
                                fontSize: 20,
                                color: darkColors.textPrimary,
                                marginBottom: 16
                            }}>
                                Top Stocks
                            </Text>

                            {filteredStocks.map((stock) => (
                                <StockCard key={stock.symbol} stock={stock} />
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    )
}
