import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gamepad2,
  Music,
  Film,
  Camera,
  Palette,
  BookOpen,
  Plane,
  Trees,
  Paintbrush,
  Utensils,
  PawPrint,
  Dumbbell,
  Coffee,
  Compass,
  Globe,
  Sparkles,
  Shirt,
  Trophy,
} from 'lucide-react-native';

import { useOnboarding } from '../../context/OnboardingContext';
import { saveUserInterests } from '../../services/users';

interface InterestChipItem {
  id: string;
  name: string;
  renderIcon: (color: string, size: number) => React.ReactNode;
}

const INTERESTS: InterestChipItem[] = [
  {
    id: 'gaming',
    name: 'Gaming',
    renderIcon: (color, size) => <Gamepad2 size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'dancing',
    name: 'Dancing',
    renderIcon: (color, size) => <Sparkles size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'language',
    name: 'Language',
    renderIcon: (color, size) => <Globe size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'music',
    name: 'Music',
    renderIcon: (color, size) => <Music size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'movies',
    name: 'Movies',
    renderIcon: (color, size) => <Film size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'photography',
    name: 'Photography',
    renderIcon: (color, size) => <Camera size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'art-culture',
    name: 'Art & Culture',
    renderIcon: (color, size) => <Palette size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'fashion',
    name: 'Fashion',
    renderIcon: (color, size) => <Shirt size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'books',
    name: 'Books',
    renderIcon: (color, size) => <BookOpen size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'traveling',
    name: 'Traveling',
    renderIcon: (color, size) => <Plane size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'nature',
    name: 'Nature',
    renderIcon: (color, size) => <Trees size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'painting',
    name: 'Painting',
    renderIcon: (color, size) => <Paintbrush size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'football',
    name: 'Football',
    renderIcon: (color, size) => <Trophy size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'foodie',
    name: 'Foodie',
    renderIcon: (color, size) => <Utensils size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'animals',
    name: 'Animals',
    renderIcon: (color, size) => <PawPrint size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'gym-fitness',
    name: 'Gym & Fitness',
    renderIcon: (color, size) => <Dumbbell size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'food-drink',
    name: 'Food & Drink',
    renderIcon: (color, size) => <Coffee size={size} color={color} strokeWidth={2} />,
  },
  {
    id: 'travel-places',
    name: 'Travel & Places',
    renderIcon: (color, size) => <Compass size={size} color={color} strokeWidth={2} />,
  },
];

export default function InterestsScreen() {
  const router = useRouter();
  const onboarding = useOnboarding();

  // Initial selected items (5 selected by default as per UX counter spec)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Gaming',
    'Music',
    'Photography',
    'Traveling',
    'Foodie',
  ]);
  const [loading, setLoading] = useState(false);

  const handleToggleInterest = (interestName: string) => {
    if (selectedInterests.includes(interestName)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interestName));
    } else {
      setSelectedInterests([...selectedInterests, interestName]);
    }
  };

  const isMinRequirementMet = selectedInterests.length >= 3;

  const handleContinue = async () => {
    if (!isMinRequirementMet || loading) return;
    setLoading(true);
    try {
      if (onboarding?.setInterests) {
        onboarding.setInterests(selectedInterests);
      }
      await saveUserInterests(selectedInterests);
      router.push('/onboarding/intent');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9FB" />

      {/* Top Header Row with Small Circular Back Button */}
      <View style={styles.topNavigation}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color="#171717" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Heading & Subtitle */}
        <View style={styles.headerSection}>
          <Text style={styles.heading}>
            Select Your <Text style={styles.headingPink}>Interests</Text>
          </Text>
          <Text style={styles.subheading}>
            Choose your interests to find people who share your vibe.
          </Text>
        </View>

        {/* Counter Badge */}
        <View style={styles.counterRow}>
          <View
            style={[
              styles.counterPill,
              isMinRequirementMet ? styles.counterPillActive : styles.counterPillWarning,
            ]}
          >
            <Sparkles
              size={14}
              color={isMinRequirementMet ? '#F5537A' : '#6B7280'}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.counterText,
                isMinRequirementMet ? styles.counterTextActive : styles.counterTextMuted,
              ]}
            >
              {selectedInterests.length} {selectedInterests.length === 1 ? 'interest' : 'interests'} selected
              {!isMinRequirementMet && ` (${3 - selectedInterests.length} more needed)`}
            </Text>
          </View>
        </View>

        {/* Responsive Wrapping Pill Chips Grid */}
        <View style={styles.chipGrid}>
          {INTERESTS.map((chip) => {
            const isSelected = selectedInterests.includes(chip.name);
            return (
              <Pressable
                key={chip.id}
                onPress={() => handleToggleInterest(chip.name)}
                style={({ pressed }) => [pressed && styles.chipPressed]}
              >
                {isSelected ? (
                  /* Selected Pill Chip with Vibrant Coral/Pink Gradient */
                  <LinearGradient
                    colors={['#F5537A', '#FF6B8B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.chip, styles.chipSelected]}
                  >
                    <View style={styles.chipIconWrap}>
                      {chip.renderIcon('#FFFFFF', 18)}
                    </View>
                    <Text style={styles.chipTextSelected}>{chip.name}</Text>
                    <View style={styles.checkCircle}>
                      <Check size={12} color="#F5537A" strokeWidth={3} />
                    </View>
                  </LinearGradient>
                ) : (
                  /* Unselected Pill Chip */
                  <View style={[styles.chip, styles.chipUnselected]}>
                    <View style={styles.chipIconWrap}>
                      {chip.renderIcon('#171717', 18)}
                    </View>
                    <Text style={styles.chipTextUnselected}>{chip.name}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Action Area */}
      <View style={styles.bottomActionContainer}>
        {/* Main CTA Continue Button */}
        {isMinRequirementMet ? (
          <TouchableOpacity
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.88}
            style={styles.continueTouch}
          >
            <LinearGradient
              colors={['#F5537A', '#FF6B8B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.continueButton, styles.continueButtonActive]}
            >
              <Text style={styles.continueTextActive}>Continue</Text>
              <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 6 }} />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={[styles.continueButton, styles.continueButtonDisabled]}>
            <Text style={styles.continueTextDisabled}>Continue (Select 3+)</Text>
            <ArrowRight size={20} color="#FFB5C7" strokeWidth={2.5} style={{ marginLeft: 6 }} />
          </View>
        )}

        {/* Minimal Progress Indicator Dots: ● ━ ━ ━ ━ */}
        <View style={styles.progressIndicatorRow}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotInactive]} />
          <View style={[styles.progressDot, styles.progressDotInactive]} />
          <View style={[styles.progressDot, styles.progressDotInactive]} />
          <View style={[styles.progressDot, styles.progressDotInactive]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9FB',
  },
  topNavigation: {
    height: 56,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3DCE3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerSection: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 32,
    fontWeight: '900',
    color: '#171717',
    letterSpacing: -0.6,
    lineHeight: 40,
    marginBottom: 8,
  },
  headingPink: {
    color: '#F5537A',
  },
  subheading: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 23,
  },
  counterRow: {
    marginBottom: 20,
    flexDirection: 'row',
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  counterPillActive: {
    backgroundColor: '#FFF1F5',
    borderWidth: 1,
    borderColor: '#F8DCE5',
  },
  counterPillWarning: {
    backgroundColor: '#F3F4F6',
  },
  counterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  counterTextActive: {
    color: '#F5537A',
  },
  counterTextMuted: {
    color: '#6B7280',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    minHeight: 46,
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F3DCE3',
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1.5,
  },
  chipSelected: {
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  chipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  chipIconWrap: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipTextUnselected: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171717',
  },
  chipTextSelected: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF9FB',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(243, 220, 227, 0.4)',
  },
  continueTouch: {
    width: '100%',
  },
  continueButton: {
    width: '100%',
    height: 58,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  continueButtonActive: {
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: '#FCE3EA',
  },
  continueTextActive: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  continueTextDisabled: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFB5C7',
    letterSpacing: 0.3,
  },
  progressIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    height: 6,
    borderRadius: 3,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#F5537A',
  },
  progressDotInactive: {
    width: 8,
    backgroundColor: '#F3DCE3',
  },
});


