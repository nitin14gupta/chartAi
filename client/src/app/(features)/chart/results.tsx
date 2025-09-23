import React, { useMemo, useRef, useState } from 'react'
import { View, Text, Image, ScrollView, Modal, Pressable, TextInput, Alert, LayoutChangeEvent } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import { useLocalSearchParams } from 'expo-router'
import { darkColors } from '../../../components/ui'

type AnalysisData = {
    patterns_detected: { pattern: string; confidence: number; bbox: number[]; historical_win_rate?: number; avg_move_post_breakdown?: string; animation_gif?: string }[]
    summary: string
    annotated_image: string
    insights?: {
        summary: string
        explanations: string[]
        entry_signals: string[]
        exit_signals: string[]
        risk_management: string[]
        confidence_notes: string[]
    }
    highlighted_image?: string
    pattern_focus_coordinates?: number[][]
    overlapping_patterns?: { pattern_a: string; pattern_b: string; conflict?: boolean }[]
    simulated_trade?: { entry_price: number; target_1?: number; target_2?: number; stop_loss?: number; risk_reward?: string }
    stats?: { total_patterns_detected?: number }
}

export default function ChartResults() {
    const params = useLocalSearchParams<{ data?: string }>()
    const data = useMemo<AnalysisData | null>(() => {
        try {
            return params.data ? JSON.parse(params.data) : null
        } catch {
            return null
        }
    }, [params.data])

    const [isModalVisible, setModalVisible] = useState(false)
    const [isFocusModalVisible, setFocusModalVisible] = useState(false)
    const [focusedBBox, setFocusedBBox] = useState<number[] | null>(null)
    const [imageLayout, setImageLayout] = useState<{ width: number; height: number } | null>(null)

    const [entryPrice, setEntryPrice] = useState<string>(data?.simulated_trade?.entry_price ? String(data.simulated_trade.entry_price) : '')
    const [target1, setTarget1] = useState<string>(data?.simulated_trade?.target_1 ? String(data.simulated_trade.target_1) : '')
    const [target2, setTarget2] = useState<string>(data?.simulated_trade?.target_2 ? String(data.simulated_trade.target_2) : '')
    const [stopLoss, setStopLoss] = useState<string>(data?.simulated_trade?.stop_loss ? String(data.simulated_trade.stop_loss) : '')

    const handleImageLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout
        setImageLayout({ width, height })
    }

    const openFocusOnBBox = (bbox: number[]) => {
        setFocusedBBox(bbox)
        setFocusModalVisible(true)
    }

    const bullishKeywords = ['inverse', 'cup', 'rounding bottom', 'double bottom', 'ascending', 'bull', 'bullish', 'falling wedge']
    const bearishKeywords = ['head and shoulders', 'double top', 'descending', 'bear', 'bearish', 'rising wedge']

    const detectedPatterns = data?.patterns_detected || []
    const hasBullish = detectedPatterns.some(p => bullishKeywords.some(k => p.pattern.toLowerCase().includes(k)))
    const hasBearish = detectedPatterns.some(p => bearishKeywords.some(k => p.pattern.toLowerCase().includes(k)))
    const heuristicConflict = hasBullish && hasBearish

    const conflictingPairs = data?.overlapping_patterns?.filter(op => op.conflict) || []

    const computePL = () => {
        const e = Number(entryPrice)
        const t = Number(target1 || target2)
        const s = Number(stopLoss)
        if (!e || (!t && !target2) || !s) return null
        const tp = t ? ((t - e) / e) * 100 : null
        const sl = ((s - e) / e) * 100
        return { takeProfitPct: tp, stopLossPct: sl }
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#000000' }} contentContainerStyle={{ padding: 16 }}>
            <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_700Bold', fontSize: 20, marginBottom: 12 }}>
                Results
            </Text>

            {data?.annotated_image && (
                <>
                    <Pressable
                        onPress={() => setModalVisible(true)}
                        style={{
                            backgroundColor: darkColors.surface,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: darkColors.border,
                            overflow: 'hidden',
                            marginBottom: 16,
                        }}
                        onLayout={handleImageLayout}
                    >
                        <Image
                            source={{ uri: data.annotated_image }}
                            style={{ width: '100%', height: 220, resizeMode: 'contain' }}
                        />

                        {!!focusedBBox && (
                            <View
                                pointerEvents="none"
                                style={{
                                    position: 'absolute', borderWidth: 2, borderColor: '#22c55e66', backgroundColor: '#22c55e22',
                                    left: focusedBBox[0], top: focusedBBox[1], width: Math.max(0, focusedBBox[2] - focusedBBox[0]), height: Math.max(0, focusedBBox[3] - focusedBBox[1])
                                }}
                            />
                        )}
                    </Pressable>

                    <Modal visible={isModalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                        <ImageViewer
                            imageUrls={[{ url: data.annotated_image }]}
                            enableSwipeDown={true}
                            onSwipeDown={() => setModalVisible(false)}
                            renderIndicator={() => <></>}
                            backgroundColor="black"
                        />
                    </Modal>

                    <Modal visible={isFocusModalVisible} transparent={false} onRequestClose={() => setFocusModalVisible(false)}>
                        <View style={{ flex: 1, backgroundColor: 'black' }}>
                            <ImageViewer
                                imageUrls={[{ url: data.annotated_image }]}
                                enableSwipeDown={true}
                                onSwipeDown={() => setFocusModalVisible(false)}
                                renderIndicator={() => <></>}
                                backgroundColor="black"
                                renderHeader={() => (
                                    <View style={{ position: 'absolute', top: 40, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold' }}>Focus on Pattern</Text>
                                        <Pressable onPress={() => setFocusModalVisible(false)}>
                                            <Text style={{ color: '#fff' }}>Close</Text>
                                        </Pressable>
                                    </View>
                                )}
                            />
                            {focusedBBox && (
                                <View style={{ position: 'absolute', left: focusedBBox[0], top: focusedBBox[1], width: Math.max(0, focusedBBox[2] - focusedBBox[0]), height: Math.max(0, focusedBBox[3] - focusedBBox[1]), borderColor: '#22c55e', borderWidth: 2, backgroundColor: '#22c55e22' }} />
                            )}
                        </View>
                    </Modal>
                </>
            )}

            {/* Conflict / Overlap warnings */}
            {(conflictingPairs.length > 0 || heuristicConflict) && (
                <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, borderWidth: 1, borderColor: '#ef4444', padding: 12, marginBottom: 16 }}>
                    <Text style={{ color: '#fecaca', fontFamily: 'Poppins_600SemiBold', marginBottom: 6 }}>Potential Conflict Detected</Text>
                    {conflictingPairs.map((op, idx) => (
                        <Text key={`conf-${idx}`} style={{ color: '#fecaca' }}>Overlap between {op.pattern_a} and {op.pattern_b}</Text>
                    ))}
                    {heuristicConflict && conflictingPairs.length === 0 && (
                        <Text style={{ color: '#fecaca' }}>Bullish and bearish patterns detected concurrently. Review signals carefully.</Text>
                    )}
                </View>
            )}

            <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 }}>Summary</Text>
                <Text style={{ color: darkColors.textSecondary }}>{data?.summary || 'No patterns detected.'}</Text>
            </View>

            <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 }}>Patterns</Text>
                {data?.patterns_detected?.length ? data.patterns_detected.map((p, i) => (
                    <Pressable key={i} onPress={() => p.bbox && openFocusOnBBox(p.bbox)} style={{ marginBottom: 12 }}>
                        <View>
                            <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_500Medium' }}>{p.pattern}</Text>
                            <Text style={{ color: darkColors.textSecondary }}>Confidence: {(p.confidence * 100).toFixed(1)}%</Text>
                            {typeof p.historical_win_rate === 'number' && (
                                <Text style={{ color: darkColors.textSecondary }}>Historic win rate: {(p.historical_win_rate * 100).toFixed(0)}%</Text>
                            )}
                            {!!p.avg_move_post_breakdown && (
                                <Text style={{ color: darkColors.textSecondary }}>Avg move post-signal: {p.avg_move_post_breakdown}</Text>
                            )}
                            <View style={{ marginTop: 6 }}>
                                <Pressable onPress={() => p.bbox ? openFocusOnBBox(p.bbox) : Alert.alert('No bbox provided')} style={{ backgroundColor: '#1f2937', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: darkColors.border }}>
                                    <Text style={{ color: '#fff' }}>Focus on Pattern</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                )) : (
                    <Text style={{ color: darkColors.textSecondary }}>No patterns found.</Text>
                )}
            </View>

            {/* Overall Stats */}
            {(data?.stats?.total_patterns_detected || 0) > 0 && (
                <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, padding: 16, marginBottom: 16 }}>
                    <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 }}>Statistics</Text>
                    <Text style={{ color: darkColors.textSecondary }}>Total patterns detected: {data?.stats?.total_patterns_detected}</Text>
                </View>
            )}

            {/* Simulated Trade Calculator */}
            <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 }}>Simulated Trade</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: darkColors.textSecondary, marginBottom: 4 }}>Entry</Text>
                        <TextInput value={entryPrice} onChangeText={setEntryPrice} keyboardType="numeric" placeholder="Entry" placeholderTextColor={darkColors.textSecondary} style={{ color: darkColors.textPrimary, borderWidth: 1, borderColor: darkColors.border, borderRadius: 8, paddingHorizontal: 10, height: 40 }} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: darkColors.textSecondary, marginBottom: 4 }}>Target 1</Text>
                        <TextInput value={target1} onChangeText={setTarget1} keyboardType="numeric" placeholder="Target 1" placeholderTextColor={darkColors.textSecondary} style={{ color: darkColors.textPrimary, borderWidth: 1, borderColor: darkColors.border, borderRadius: 8, paddingHorizontal: 10, height: 40 }} />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: darkColors.textSecondary, marginBottom: 4 }}>Target 2</Text>
                        <TextInput value={target2} onChangeText={setTarget2} keyboardType="numeric" placeholder="Target 2" placeholderTextColor={darkColors.textSecondary} style={{ color: darkColors.textPrimary, borderWidth: 1, borderColor: darkColors.border, borderRadius: 8, paddingHorizontal: 10, height: 40 }} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: darkColors.textSecondary, marginBottom: 4 }}>Stop</Text>
                        <TextInput value={stopLoss} onChangeText={setStopLoss} keyboardType="numeric" placeholder="Stop Loss" placeholderTextColor={darkColors.textSecondary} style={{ color: darkColors.textPrimary, borderWidth: 1, borderColor: darkColors.border, borderRadius: 8, paddingHorizontal: 10, height: 40 }} />
                    </View>
                </View>
                {(() => {
                    const pl = computePL()
                    if (!pl) return null
                    return (
                        <View style={{ marginTop: 6 }}>
                            {typeof pl.takeProfitPct === 'number' && (
                                <Text style={{ color: darkColors.textSecondary }}>Hypothetical move to Target: {pl.takeProfitPct.toFixed(2)}%</Text>
                            )}
                            <Text style={{ color: darkColors.textSecondary }}>Move to Stop: {pl.stopLossPct.toFixed(2)}%</Text>
                        </View>
                    )
                })()}
            </View>

            {/* Educational Tips & Projection */}
            <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 }}>Educational Tips</Text>
                {detectedPatterns.slice(0, 1).map((p, idx) => (
                    <View key={`tip-${idx}`} style={{ marginBottom: 6 }}>
                        <Text style={{ color: darkColors.textSecondary }}>• Definition: {p.pattern} is identified by characteristic swing points and neckline behavior.</Text>
                        <Text style={{ color: darkColors.textSecondary }}>• Typical playbook: entry on neckline break; invalidation above/below key pivot.</Text>
                        <Text style={{ color: darkColors.textSecondary }}>• Targets often measured by pattern height projected from breakout.</Text>
                    </View>
                ))}
                {!!focusedBBox && (
                    <View style={{ marginTop: 8 }}>
                        <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_500Medium', marginBottom: 6 }}>Projection (illustrative)</Text>
                        <Text style={{ color: darkColors.textSecondary }}>Shaded zones for stop/targets are approximated to the highlighted region.</Text>
                    </View>
                )}
            </View>

            <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, padding: 16 }}>
                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 }}>AI Insights</Text>
                {data?.insights ? (
                    <>
                        {!!data.insights.summary && (
                            <Text style={{ color: darkColors.textSecondary, marginBottom: 10 }}>{data.insights.summary}</Text>
                        )}
                        {data.insights.explanations?.length ? (
                            <>
                                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_500Medium', marginBottom: 6 }}>Explanations</Text>
                                {data.insights.explanations.map((t, i) => (
                                    <Text key={`exp-${i}`} style={{ color: darkColors.textSecondary, marginBottom: 6 }}>• {t}</Text>
                                ))}
                            </>
                        ) : null}
                        {data.insights.entry_signals?.length ? (
                            <>
                                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_500Medium', marginVertical: 6 }}>Entry Signals</Text>
                                {data.insights.entry_signals.map((t, i) => (
                                    <Text key={`en-${i}`} style={{ color: darkColors.textSecondary, marginBottom: 6 }}>• {t}</Text>
                                ))}
                            </>
                        ) : null}
                        {data.insights.exit_signals?.length ? (
                            <>
                                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_500Medium', marginVertical: 6 }}>Exit Signals</Text>
                                {data.insights.exit_signals.map((t, i) => (
                                    <Text key={`ex-${i}`} style={{ color: darkColors.textSecondary, marginBottom: 6 }}>• {t}</Text>
                                ))}
                            </>
                        ) : null}
                        {data.insights.risk_management?.length ? (
                            <>
                                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_500Medium', marginVertical: 6 }}>Risk Management</Text>
                                {data.insights.risk_management.map((t, i) => (
                                    <Text key={`rm-${i}`} style={{ color: darkColors.textSecondary, marginBottom: 6 }}>• {t}</Text>
                                ))}
                            </>
                        ) : null}
                        {data.insights.confidence_notes?.length ? (
                            <>
                                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_500Medium', marginVertical: 6 }}>Confidence Notes</Text>
                                {data.insights.confidence_notes.map((t, i) => (
                                    <Text key={`cn-${i}`} style={{ color: darkColors.textSecondary, marginBottom: 6 }}>• {t}</Text>
                                ))}
                            </>
                        ) : null}
                    </>
                ) : (
                    <Text style={{ color: darkColors.textSecondary }}>No AI insights available.</Text>
                )}
            </View>
        </ScrollView>
    )
}


