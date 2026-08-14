import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import BottomNavBar from '../components/ui/BottomNavBar';
import { Zap, Bell, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TalkNowScreen() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState('Gaming');

  const topics = [
    { id: 'gaming', label: 'Gaming' },
    { id: 'music', label: 'Music' },
    { id: 'travel', label: 'Travel' },
    { id: 'sports', label: 'Sports' },
    { id: 'movies', label: 'Movies & Shows' },
    { id: 'tech', label: 'Technology' },
    { id: 'hobbies', label: 'Hobbies' },
    { id: 'study', label: 'Study' },
    { id: 'general', label: 'General Interests' },
  ];

  // Animated values for pulsing waves
  const pulse1 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;
  
  const pulse2 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Wave 1 animation
    Animated.loop(
      Animated.parallel([
        Animated.timing(pulse1, {
          toValue: 1.55,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity1, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Wave 2 animation (offset by 1 second)
    const delayTimer = setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(pulse2, {
            toValue: 1.55,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity2, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1000);

    return () => clearTimeout(delayTimer);
  }, []);

  const handleStartTalk = () => {
    router.push({
      pathname: '/match',
      params: { topic: selectedTopic },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Zap size={16} color={Colors.white} fill={Colors.white} />
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.vibeText}>Vibe</Text>
            <Text style={styles.matchText}>Match</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
          <Bell size={20} color={Colors.text} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Animated Connect Pulse Area */}
        <View style={styles.pulseArea}>
          {/* Animated Pulsing Wave Rings */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulse1 }],
                opacity: opacity1,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulse2 }],
                opacity: opacity2,
              },
            ]}
          />

          {/* Main TALK NOW Trigger */}
          <Pressable onPress={handleStartTalk} style={styles.talkNowBtn}>
            <LinearGradient
              colors={[Colors.pink, Colors.darkPink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.talkNowGradient}
            >
              <Zap size={36} color={Colors.white} fill={Colors.white} />
              <Text style={styles.talkNowBtnText}>TALK NOW</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Selected Highlight Label */}
        <View style={styles.topicSelectedSection}>
          <Text style={styles.talkingAboutLabel}>Talking about...</Text>
          <View style={styles.selectedPillContainer}>
            <Text style={styles.selectedPillText}>{selectedTopic}</Text>
          </View>
        </View>

        {/* Categories list */}
        <View style={styles.promptSection}>
          <Text style={styles.promptTitle}>What do you want to talk about?</Text>
          <Text style={styles.promptSubtitle}>Choose topics to start the conversation.</Text>
        </View>

        <View style={styles.topicsGrid}>
          {topics.map((t) => {
            const isSelected = selectedTopic === t.label;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setSelectedTopic(t.label)}
                activeOpacity={0.8}
                style={[
                  styles.topicCard,
                  isSelected ? styles.topicCardActive : styles.topicCardInactive,
                ]}
              >
                <Text style={[styles.topicLabel, isSelected ? styles.topicLabelActive : styles.topicLabelInactive]}>
                  {t.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Check size={10} color={Colors.white} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vibeText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  matchText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.pink,
    fontStyle: 'italic',
  },
  notificationBtn: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.pink,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100, // Safe padding for BottomNavBar
    alignItems: 'center',
  },
  pulseArea: {
    position: 'relative',
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(244, 95, 122, 0.2)',
  },
  talkNowBtn: {
    width: 170,
    height: 170,
    borderRadius: 85,
    overflow: 'hidden',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    zIndex: 5,
  },
  talkNowGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  talkNowBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topicSelectedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  talkingAboutLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  selectedPillContainer: {
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1,
    borderColor: Colors.lightPink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  selectedPillText: {
    color: Colors.pink,
    fontWeight: '700',
    fontSize: 14,
  },
  promptSection: {
    width: '100%',
    marginBottom: 20,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'left',
    marginBottom: 4,
  },
  promptSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  topicCard: {
    width: '48%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topicCardActive: {
    backgroundColor: Colors.pink,
    borderColor: Colors.pink,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicCardInactive: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  topicLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  topicLabelActive: {
    color: Colors.white,
  },
  topicLabelInactive: {
    color: Colors.text,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
