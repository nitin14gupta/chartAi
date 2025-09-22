import React, { useMemo } from 'react'
import { View, Text, Image, ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { darkColors } from '../../../components/ui'

type AnalysisData = {
    patterns_detected: { pattern: string; confidence: number; bbox: number[] }[]
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
}

export default function ChartResults() {
    const params = useLocalSearchParams<{ data?: string }>()
    const data = useMemo<AnalysisData | null>(() => {
        try { return params.data ? JSON.parse(params.data) : null } catch { return null }
    }, [params.data])

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#000000' }} contentContainerStyle={{ padding: 16 }}>
            <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_700Bold', fontSize: 20, marginBottom: 12 }}>Results</Text>

            {data?.annotated_image && (
                <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, overflow: 'hidden', marginBottom: 16 }}>
                    <Image source={{ uri: data.annotated_image }} style={{ width: '100%', height: 220, resizeMode: 'contain' }} />
                </View>
            )}

            <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 }}>Summary</Text>
                <Text style={{ color: darkColors.textSecondary }}>{data?.summary || 'No patterns detected.'}</Text>
            </View>

            <View style={{ backgroundColor: darkColors.surface, borderRadius: 12, borderWidth: 1, borderColor: darkColors.border, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 }}>Patterns</Text>
                {data?.patterns_detected?.length ? data.patterns_detected.map((p, i) => (
                    <View key={i} style={{ marginBottom: 8 }}>
                        <Text style={{ color: darkColors.textPrimary, fontFamily: 'Poppins_500Medium' }}>{p.pattern}</Text>
                        <Text style={{ color: darkColors.textSecondary }}>Confidence: {(p.confidence * 100).toFixed(1)}%</Text>
                    </View>
                )) : (
                    <Text style={{ color: darkColors.textSecondary }}>No patterns found.</Text>
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


