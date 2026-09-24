import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { WelcomeToSlide } from './WelcomeTo';
import { FindVibeSlide } from './FindVibeSlide';
import { StartLoveSlide } from './StartLoveSlide';
import { TalkNowSlide } from './TalkNowSlide';
import { PeopleSlide } from './PeopleSlide';

const { width } = Dimensions.get('window');

// ---- Slide data ---------------------------------------------------------

const slides = [
  {
    key: 'welcome-to',
    Component: WelcomeToSlide,
  },
  {
    key: 'find-vibe',
    Component: FindVibeSlide,
  },
  {
    key: 'start-love',
    Component: StartLoveSlide,
  },
  {
    key: 'talk-now',
    Component: TalkNowSlide,
  },
  {
    key: 'people-out-there',
    Component: PeopleSlide,
  },
];

// ---- Screen -----------------------------------------------------------

export default function IntroScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [scrollX] = useState(() => new Animated.Value(0));
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const goToIndex = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveIndex(index);
  };

  const handleSkip = () => router.replace('/login');
  const handleGetStarted = () => router.push({ pathname: '/login', params: { mode: 'signup' } });
  const handleContinue = () => {
    if (activeIndex < slides.length - 1) {
      goToIndex(activeIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const isLast = activeIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Skip Bar */}
      <View style={styles.skipRow}>
        {!isLast ? (
          <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Slides Horizontal Carousel */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {slides.map(({ key, Component }) => (
          <Component key={key} />
        ))}
      </Animated.ScrollView>

      {/* Footer Section */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [7, 24, 7],
              extrapolate: 'clamp',
            });
            const dotColor = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: ['#FCE7F3', '#F43F5E', '#FCE7F3'],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]}
              />
            );
          })}
        </View>

        {/* Continue / Get Started Button */}
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          style={styles.continueBtn}
        >
          <View style={styles.btnContentRow}>
            {isLast && (
              <Heart size={18} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.continueBtnText}>
              {isLast ? 'Get Started' : 'Continue'}
            </Text>
          </View>
        </TouchableOpacity>

        {isLast && (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.6} style={styles.loginLink}>
            <View style={styles.loginLinkRow}>
              <Text style={styles.loginLinkText}>I already have an account</Text>
              <Text style={styles.loginLinkArrow}> ›</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8FA',
  },
  skipRow: {
    height: 52,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  skipRowSpacer: {
    height: 52,
  },
  skipText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#F43F5E',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 26,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
  },
  continueBtn: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 8,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  loginLink: {
    marginTop: 16,
    paddingVertical: 4,
  },
  loginLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F43F5E',
  },
  loginLinkArrow: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F43F5E',
    marginLeft: 2,
  },
});
