import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable, StatusBar, TextInput } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { darkColors } from '../../components/ui'

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
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    // Mock data for Indian stocks
    const stocks: Stock[] = [
        {
            symbol: 'RELIANCE',
            name: 'Reliance Industries',
            price: 2456.80,
            change: 12.50,
            changePercent: 0.51,
            volume: '2.5M',
            marketCap: '16.5L Cr'
        },
        {
            symbol: 'TCS',
            name: 'Tata Consultancy Services',
            price: 3845.20,
            change: -25.30,
            changePercent: -0.65,
            volume: '1.8M',
            marketCap: '14.2L Cr'
        },
        {
            symbol: 'HDFCBANK',
            name: 'HDFC Bank',
            price: 1654.90,
            change: 8.75,
            changePercent: 0.53,
            volume: '3.2M',
            marketCap: '12.8L Cr'
        },
        {
            symbol: 'INFY',
            name: 'Infosys',
            price: 1523.45,
            change: -15.20,
            changePercent: -0.99,
            volume: '2.1M',
            marketCap: '6.3L Cr'
        },
        {
            symbol: 'ICICIBANK',
            name: 'ICICI Bank',
            price: 987.65,
            change: 5.40,
            changePercent: 0.55,
            volume: '4.5M',
            marketCap: '6.8L Cr'
        },
        {
            symbol: 'SBIN',
            name: 'State Bank of India',
            price: 543.20,
            change: -2.10,
            changePercent: -0.39,
            volume: '5.2M',
            marketCap: '4.8L Cr'
        }
    ]

    const categories = [
        { id: 'all', name: 'All Stocks' },
        { id: 'nifty50', name: 'Nifty 50' },
        { id: 'banking', name: 'Banking' },
        { id: 'it', name: 'IT' },
        { id: 'energy', name: 'Energy' }
    ]

    const filteredStocks = stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const StockCard = ({ stock }: { stock: Stock }) => (
        <Pressable
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
        <LinearGradient
            colors={[darkColors.gradientStart, darkColors.gradientEnd, darkColors.background]}
            style={{ flex: 1 }}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={{ paddingTop: 20, paddingHorizontal: 24, paddingBottom: 32 }}>
                    {/* Header */}
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{
                            fontFamily: 'Poppins_700Bold',
                            fontSize: 32,
                            color: darkColors.textPrimary,
                            marginBottom: 8
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
                                placeholder="Search stocks by symbol or name..."
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

                    {/* Market Overview */}
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
    )
}
