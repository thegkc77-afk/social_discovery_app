import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import { MessageSquare, Heart, Sparkles, Users } from 'lucide-react-native';

export default function IntentScreen() {
  const router = useRouter();
  const [selectedIntent, setSelectedIntent] = useState('');

  const intents = [
    {
      id: 'chat',
      label: 'Chatting & Fun',
      description: 'Find people nearby to chat about anything, share a coffee, or just pass the time.',
      icon: MessageSquare,
    },
    {
      id: 'dating',
      label: 'Dating & Romance',
      description: 'Connect with people looking for sparks, dates, and partnerships.',
      icon: Heart,
    },
    {
      id: 'deep',
      label: 'Deep Conversations',
      description: 'Talk about philosophy, technology, life paths, and ideas that really matter.',
      icon: Sparkles,
    },
    {
      id: 'networking',
      label: 'Networking & Projects',
      description: 'Meet other creators, developers, designers, or hobbyists to build cool stuff.',
      icon: Users,
    },
  ];

  const handleFinish = () => {
    if (!selectedIntent) return;
    router.replace('/talk-now');
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={1.0} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerTextSection}>
          <Text style={styles.title}>What are you looking for?</Text>
          <Text style={styles.description}>
            We'll highlight profiles that have the same goal in mind to make connections smoother.
          </Text>
        </View>

        {/* Intent Cards */}
        <View style={styles.list}>
          {intents.map((item) => {
            const isSelected = selectedIntent === item.label;
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedIntent(item.label)}
                activeOpacity={0.8}
                style={[
                  styles.card,
                  isSelected ? styles.cardActive : styles.cardInactive,
                ]}
              >
                <View style={[styles.iconWrapper, isSelected ? styles.iconActive : styles.iconInactive]}>
                  <Icon size={22} color={isSelected ? Colors.white : Colors.pink} />
                </View>
                <View style={styles.cardDetails}>
                  <Text style={[styles.cardLabel, isSelected && styles.textActive]}>{item.label}</Text>
                  <Text style={styles.cardDesc}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          onPress={handleFinish}
          title="COMPLETE SETUP"
          disabled={!selectedIntent}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTextSection: {
    width: '100%',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 22,
  },
  list: {
    gap: 12,
    marginBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    gap: 16,
  },
  cardActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.pink,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardInactive: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    backgroundColor: Colors.pink,
  },
  iconInactive: {
    backgroundColor: Colors.veryLightPink,
  },
  cardDetails: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  textActive: {
    color: Colors.pink,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 16,
  },
  submitBtn: {
    width: '100%',
  },
});
