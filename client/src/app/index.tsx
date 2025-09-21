import { View, Text, Image, Animated, Dimensions, StatusBar } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { colors, darkColors, ScreenContainer } from "../components/ui";
import { OnboardingProvider } from "../context/OnboardingContext";
import { ToastProvider } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function index() {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const floating1 = useRef(new Animated.Value(0)).current;
  const floating2 = useRef(new Animated.Value(0)).current;
  const floating3 = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const [displayText, setDisplayText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const appName = "ChartAi";
  const tagline = "It's time to trade like a pro";

  useEffect(() => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 1000, useNativeDriver: true }),
    ]).start();

    // Continuous floating animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(floating1, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(floating1, { toValue: 10, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floating2, { toValue: 15, duration: 2500, useNativeDriver: true }),
        Animated.timing(floating2, { toValue: -15, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floating3, { toValue: -8, duration: 1800, useNativeDriver: true }),
        Animated.timing(floating3, { toValue: 8, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 20000, useNativeDriver: true })
    ).start();

    // Typing effect for app name
    const typingInterval = setInterval(() => {
      if (currentCharIndex < appName.length) {
        setDisplayText(prev => prev + appName[currentCharIndex]);
        setCurrentCharIndex(prev => prev + 1);
      } else {
        clearInterval(typingInterval);
      }
    }, 150);

    const t = setTimeout(() => {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(onboarding)/tradingType");
      }
    }, 2000);

    return () => {
      clearTimeout(t);
      clearInterval(typingInterval);
    };
  }, [fade, scale, slideUp, floating1, floating2, floating3, pulse, rotate, currentCharIndex, router, isAuthenticated]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <OnboardingProvider>
      <ToastProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={[darkColors.gradientStart, darkColors.gradientEnd, darkColors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }} dark>
            {/* Floating background elements - Trading themed */}
            <Animated.View
              style={{
                position: 'absolute',
                top: height * 0.1,
                left: width * 0.1,
                transform: [{ translateY: floating1 }]
              }}
            >
              <Text style={{ fontSize: 30, opacity: 0.2 }}>📈</Text>
            </Animated.View>

            <Animated.View
              style={{
                position: 'absolute',
                top: height * 0.2,
                right: width * 0.15,
                transform: [{ translateY: floating2 }]
              }}
            >
              <Text style={{ fontSize: 25, opacity: 0.3 }}>💰</Text>
            </Animated.View>

            <Animated.View
              style={{
                position: 'absolute',
                bottom: height * 0.3,
                left: width * 0.2,
                transform: [{ translateY: floating3 }]
              }}
            >
              <Text style={{ fontSize: 35, opacity: 0.2 }}>⚡</Text>
            </Animated.View>

            <Animated.View
              style={{
                position: 'absolute',
                top: height * 0.4,
                right: width * 0.1,
                transform: [{ translateY: floating1 }, { rotate: spin }]
              }}
            >
              <Text style={{ fontSize: 20, opacity: 0.15 }}>🎯</Text>
            </Animated.View>

            {/* Additional floating elements */}
            <Animated.View
              style={{
                position: 'absolute',
                bottom: height * 0.2,
                right: width * 0.2,
                transform: [{ translateY: floating2 }]
              }}
            >
              <Text style={{ fontSize: 28, opacity: 0.25 }}>🚀</Text>
            </Animated.View>

            <Animated.View
              style={{
                position: 'absolute',
                top: height * 0.6,
                left: width * 0.05,
                transform: [{ translateY: floating3 }]
              }}
            >
              <Text style={{ fontSize: 22, opacity: 0.2 }}>💎</Text>
            </Animated.View>

            {/* Main content */}
            <Animated.View style={{
              opacity: fade,
              alignItems: 'center',
              transform: [
                { scale: scale },
                { translateY: slideUp }
              ]
            }}>
              <Animated.View style={{ transform: [{ scale: pulse }] }}>
                <View style={{
                  width: 140,
                  height: 140,
                  borderRadius: 35,
                  backgroundColor: darkColors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 32,
                  shadowColor: darkColors.primary,
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                }}>
                  <Image
                    source={require('../../assets/images/favicon.png')}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 25,
                    }}
                  />
                </View>
              </Animated.View>

              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text style={{
                  fontFamily: 'Poppins_700Bold',
                  fontSize: 42,
                  color: darkColors.textPrimary,
                  textAlign: 'center',
                  marginBottom: 12,
                  textShadowColor: 'rgba(99, 102, 241, 0.3)',
                  textShadowOffset: { width: 0, height: 4 },
                  textShadowRadius: 8
                }}>
                  {displayText}
                  <Text style={{ opacity: 0.6 }}>|</Text>
                </Text>

                <Animated.Text style={{
                  fontFamily: 'Poppins_400Regular',
                  fontSize: 18,
                  color: darkColors.textSecondary,
                  textAlign: 'center',
                  opacity: fade,
                  transform: [{ translateY: slideUp }],
                  lineHeight: 24
                }}>
                  {tagline}
                </Animated.Text>
              </View>

              {/* Loading dots with glow effect */}
              <Animated.View style={{
                flexDirection: 'row',
                opacity: fade,
                transform: [{ translateY: slideUp }]
              }}>
                {[0, 1, 2].map((index) => (
                  <Animated.View
                    key={index}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: darkColors.primary,
                      marginHorizontal: 6,
                      shadowColor: darkColors.primary,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 8,
                      transform: [{
                        scale: pulse.interpolate({
                          inputRange: [1, 1.1],
                          outputRange: [0.8, 1.2]
                        })
                      }]
                    }}
                  />
                ))}
              </Animated.View>

              {/* Subtle trading chart lines */}
              <Animated.View style={{
                position: 'absolute',
                bottom: height * 0.15,
                left: 0,
                right: 0,
                height: 2,
                opacity: 0.1,
                transform: [{ translateY: slideUp }]
              }}>
                <View style={{
                  height: 1,
                  backgroundColor: darkColors.primary,
                  width: '100%',
                  position: 'absolute',
                  top: 0,
                }} />
                <View style={{
                  height: 1,
                  backgroundColor: darkColors.primary,
                  width: '80%',
                  position: 'absolute',
                  top: 1,
                  left: '10%',
                }} />
                <View style={{
                  height: 1,
                  backgroundColor: darkColors.primary,
                  width: '60%',
                  position: 'absolute',
                  top: 2,
                  left: '20%',
                }} />
              </Animated.View>
            </Animated.View>
          </ScreenContainer>
        </LinearGradient>
      </ToastProvider>
    </OnboardingProvider>
  )
}