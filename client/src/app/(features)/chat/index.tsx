import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, StatusBar, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { darkColors } from '../../../components/ui'
import { SafeAreaView } from 'react-native-safe-area-context'
import apiService from '../../../api/apiService'
import { useAuth } from '../../../context/AuthContext'

interface Message {
    id: string
    text: string
    isUser: boolean
    timestamp: Date
}

function renderBold(text: string) {
    // Replace **bold** with styled Text, strip **
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            const inner = part.slice(2, -2)
            return (
                <Text key={idx} style={{ fontFamily: 'Poppins_700Bold', color: darkColors.textPrimary }}>{inner}</Text>
            )
        }
        return (
            <Text key={idx} style={{ fontFamily: 'Poppins_400Regular', color: darkColors.textPrimary }}>{part}</Text>
        )
    })
}

export default function Chat() {
    const { isAuthenticated } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [inputText, setInputText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [sessions, setSessions] = useState<any[]>([])
    const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined)
    const [recent, setRecent] = useState<Message[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    const getWelcomeMessage = (): Message => ({
        id: 'welcome',
        text: 'Hello! I\'m your AI trading assistant. Ask about stocks, Indian markets, or technical analysis.',
        isUser: false,
        timestamp: new Date(),
    })

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([getWelcomeMessage()])
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated) return
        const load = async () => {
            try {
                setLoadingHistory(true)
                const sessRes = await apiService.listSessions(50, 0)
                if (sessRes.success && sessRes.data?.items) setSessions(sessRes.data.items)
                if (activeSessionId) {
                    const res = await apiService.getChatHistory(200, 0, activeSessionId)
                    if (res.success && res.data?.items) {
                        const rows = [...res.data.items].reverse()
                        const mapped: Message[] = rows.map((r: any, idx: number) => ({
                            id: r.id || String(idx),
                            text: r.message,
                            isUser: r.role === 'user',
                            timestamp: new Date(r.created_at || Date.now()),
                        }))
                        setMessages(mapped.length ? mapped : [])
                        setRecent(mapped)
                    } else {
                        setMessages([])
                        setRecent([])
                    }
                } else {
                    setRecent([])
                }
            } finally {
                setLoadingHistory(false)
            }
        }
        load()
    }, [isAuthenticated, activeSessionId])

    const sendMessage = async () => {
        if (!inputText.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage as Message])
        setInputText('')
        setIsTyping(true)

        // Streaming backend
        const assistantId = (Date.now() + 1).toString()
        // Seed empty assistant message to fill progressively
        setMessages(prev => [...prev, { id: assistantId, text: '', isUser: false, timestamp: new Date() }])

        const metaHandler = (meta: { session_id?: string; title?: string }) => {
            if (!activeSessionId && meta.session_id) {
                setActiveSessionId(meta.session_id)
            }
        }

        const chunkHandler = (chunk: string) => {
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: (m.text || '') + chunk } : m))
        }

        const res = await apiService.askBotStream(userMessage.text, { market: 'IN', source: 'mobile-app' }, activeSessionId, metaHandler, chunkHandler)
        if (!res.success) {
            // Replace assistant message with error if streaming failed and nothing came
            setMessages(prev => prev.map(m => m.id === assistantId && (!m.text || m.text.length === 0)
                ? { ...m, text: res.error || 'Sorry, I could not process that right now.' }
                : m))
        }
        setIsTyping(false)
    }

    const quickQuestions = [
        'What are the best technical indicators for day trading?',
        'How do I identify support and resistance levels?',
        'What\'s the current market sentiment?',
        'Explain RSI and MACD indicators'
    ]

    const MessageBubble = ({ message }: { message: Message }) => (
        <View style={{
            marginBottom: 16,
            alignItems: message.isUser ? 'flex-end' : 'flex-start'
        }}>
            <View style={{
                backgroundColor: message.isUser ? darkColors.primary : darkColors.surface,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                maxWidth: '80%',
                borderWidth: 1,
                borderColor: message.isUser ? darkColors.primary : darkColors.border,
            }}>
                <Text style={{
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 16,
                    color: darkColors.textPrimary,
                    lineHeight: 22
                }}>
                    {renderBold(message.text)}
                </Text>
            </View>
            <Text style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: 12,
                color: darkColors.textTertiary,
                marginTop: 4
            }}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    )

    const QuickQuestionButton = ({ question }: { question: string }) => (
        <Pressable
            onPress={() => setInputText(question)}
            style={{
                backgroundColor: darkColors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginRight: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: darkColors.border,
            }}
        >
            <Text style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: 14,
                color: darkColors.textSecondary
            }}>
                {question}
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

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={{ flex: 1 }}>
                        {/* Header */}
                        <View style={{
                            // paddingTop: 16,
                            paddingHorizontal: 24,
                            borderBottomWidth: 1,
                            borderBottomColor: darkColors.border
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{
                                    fontFamily: 'Poppins_700Bold',
                                    fontSize: 24,
                                    color: darkColors.textPrimary,
                                }}>
                                    Trading Bot
                                </Text>
                                <Pressable onPress={() => setIsDrawerOpen(v => !v)} style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name={isDrawerOpen ? 'close' : 'menu'} size={22} color={darkColors.textPrimary} />
                                </Pressable>
                            </View>
                            <Text style={{
                                fontFamily: 'Poppins_400Regular',
                                fontSize: 16,
                                color: darkColors.textSecondary
                            }}>
                                Your AI trading assistant
                            </Text>
                        </View>

                        {/* Drawer overlay */}
                        {isDrawerOpen && (
                            <Pressable onPress={() => setIsDrawerOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10 }} />
                        )}

                        {/* Slide drawer */}
                        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '78%', maxWidth: 360, transform: [{ translateX: isDrawerOpen ? 0 : -9999 }], backgroundColor: '#000000', borderRightWidth: 1, borderRightColor: darkColors.border, zIndex: 10, }}>
                            <ScrollView contentContainerStyle={{ padding: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: darkColors.textPrimary }}>Sessions</Text>
                                    <Pressable onPress={() => { setActiveSessionId(undefined); setMessages([getWelcomeMessage()]); }} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: darkColors.border }}>
                                        <Text style={{ fontFamily: 'Poppins_600SemiBold', color: darkColors.textPrimary }}>+ New</Text>
                                    </Pressable>
                                </View>
                                {sessions.length === 0 && (
                                    <Text style={{ fontFamily: 'Poppins_400Regular', color: darkColors.textSecondary, marginBottom: 12 }}>No sessions yet.</Text>
                                )}
                                {sessions.map((s: any) => (
                                    <Pressable key={s.id} onPress={() => { setActiveSessionId(s.id); setMessages([]); setIsDrawerOpen(false); }} style={{ paddingVertical: 10 }}>
                                        <Text numberOfLines={1} style={{ fontFamily: 'Poppins_400Regular', color: s.id === activeSessionId ? darkColors.textPrimary : darkColors.textSecondary }}>{s.title || 'Untitled chat'}</Text>
                                    </Pressable>
                                ))}
                                {/* <View style={{ height: 1, backgroundColor: darkColors.border, marginVertical: 12 }} /> */}
                                {/* <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: darkColors.textPrimary, marginBottom: 8 }}>Recent</Text> */}
                                {/* {loadingHistory && (
                                    <Text style={{ fontFamily: 'Poppins_400Regular', color: darkColors.textSecondary }}>Loading...</Text>
                                )} */}
                                {/* {!loadingHistory && recent.length === 0 && (
                                    <Text style={{ fontFamily: 'Poppins_400Regular', color: darkColors.textSecondary }}>No messages.</Text>
                                )} */}
                                {/* {!loadingHistory && recent.length > 0 && (
                                    <View>
                                        {recent.slice(-20).reverse().map((m, idx) => (
                                            <Pressable key={m.id || String(idx)} onPress={() => { setInputText(m.text); setIsDrawerOpen(false); }} style={{ paddingVertical: 8 }}>
                                                <Text numberOfLines={2} style={{ fontFamily: 'Poppins_400Regular', color: m.isUser ? darkColors.textPrimary : darkColors.textSecondary }}>
                                                    {m.isUser ? 'You: ' : 'Bot: '}{m.text}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )} */}
                            </ScrollView>
                        </View>

                        {/* Messages */}
                        <ScrollView
                            style={{ flex: 1, paddingHorizontal: 24 }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 20, paddingBottom: 24 }}
                        >
                            {messages.map((message: Message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}

                            {isTyping && (
                                <View style={{
                                    marginBottom: 16,
                                    alignItems: 'flex-start'
                                }}>
                                    <View style={{
                                        backgroundColor: darkColors.surface,
                                        borderRadius: 20,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: darkColors.border,
                                    }}>
                                        <Text style={{
                                            fontFamily: 'Poppins_400Regular',
                                            fontSize: 16,
                                            color: darkColors.textSecondary,
                                            fontStyle: 'italic'
                                        }}>
                                            AI is typing...
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Quick Questions */}
                            {messages.length === 1 && (
                                <View style={{ marginTop: 20 }}>
                                    <Text style={{
                                        fontFamily: 'Poppins_600SemiBold',
                                        fontSize: 16,
                                        color: darkColors.textPrimary,
                                        marginBottom: 12
                                    }}>
                                        Quick Questions
                                    </Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {quickQuestions.map((question, index) => (
                                            <QuickQuestionButton key={index} question={question} />
                                        ))}
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Input */}
                        <View style={{
                            paddingHorizontal: 24,
                            paddingVertical: 16,
                            zIndex: 11,
                            borderTopWidth: 1,
                            borderTopColor: darkColors.border,
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: darkColors.surface,
                                borderRadius: 24,
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderWidth: 1,
                                borderColor: darkColors.border,
                            }}>
                                <TextInput
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder="Ask about trading, charts, or market analysis..."
                                    placeholderTextColor={darkColors.textTertiary}
                                    style={{
                                        flex: 1,
                                        fontFamily: 'Poppins_400Regular',
                                        fontSize: 16,
                                        color: darkColors.textPrimary,
                                        paddingVertical: 8,
                                    }}
                                    multiline
                                    maxLength={500}
                                />
                                <Pressable
                                    onPress={sendMessage}
                                    disabled={!inputText.trim() || isTyping}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: inputText.trim() && !isTyping ? darkColors.primary : darkColors.border,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 8
                                    }}
                                >
                                    <Ionicons
                                        name="send"
                                        size={20}
                                        color={inputText.trim() && !isTyping ? darkColors.textPrimary : darkColors.textTertiary}
                                    />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    )
}
