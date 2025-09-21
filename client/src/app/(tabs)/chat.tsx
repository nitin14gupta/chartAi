import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable, StatusBar, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { darkColors } from '../../components/ui'

interface Message {
    id: string
    text: string
    isUser: boolean
    timestamp: Date
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I\'m your AI trading assistant. I can help you with chart analysis, market insights, and trading strategies. What would you like to know?',
            isUser: false,
            timestamp: new Date()
        }
    ])
    const [inputText, setInputText] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    const sendMessage = async () => {
        if (!inputText.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputText('')
        setIsTyping(true)

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'I understand your question about trading. Let me provide you with some insights based on current market conditions and technical analysis patterns.',
                isUser: false,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])
            setIsTyping(false)
        }, 2000)
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
                    {message.text}
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
                        paddingTop: 60,
                        paddingHorizontal: 24,
                        paddingBottom: 20,
                        borderBottomWidth: 1,
                        borderBottomColor: darkColors.border
                    }}>
                        <Text style={{
                            fontFamily: 'Poppins_700Bold',
                            fontSize: 28,
                            color: darkColors.textPrimary,
                            marginBottom: 8
                        }}>
                            Trading Bot
                        </Text>
                        <Text style={{
                            fontFamily: 'Poppins_400Regular',
                            fontSize: 16,
                            color: darkColors.textSecondary
                        }}>
                            Your AI trading assistant
                        </Text>
                    </View>

                    {/* Messages */}
                    <ScrollView
                        style={{ flex: 1, paddingHorizontal: 24 }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 20 }}
                    >
                        {messages.map((message) => (
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
                        borderTopWidth: 1,
                        borderTopColor: darkColors.border,
                        backgroundColor: darkColors.background
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
                                disabled={!inputText.trim()}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: inputText.trim() ? darkColors.primary : darkColors.border,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginLeft: 8
                                }}
                            >
                                <Ionicons
                                    name="send"
                                    size={20}
                                    color={inputText.trim() ? darkColors.textPrimary : darkColors.textTertiary}
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    )
}
