import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import { Users, MessageCircle, Gamepad2, BookOpen, Bike, Heart } from 'lucide-react-native';
import { useOnboarding } from '../../context/OnboardingContext';
import { updateActiveUser } from '../../data/mockData';
import { saveUserIntents, completeProfileOnboarding } from '../../services/users';

const INTENTS = [
  { id: 'friendship', label: 'Friendship', icon: Users },
  { id: 'talk', label: 'Someone to Talk To', icon: MessageCircle },
  { id: 'gaming', label: 'Gaming Partner', icon: Gamepad2 },
  { id: 'study', label: 'Study Partner', icon: BookOpen },
  { id: 'activity', label: 'Activity Partner', icon: Bike },
  { id: 'dating', label: 'Dating', icon: Heart },
];

const computeAge = (day: string, month: string, year: string) => {
  const dob = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
};

export default function IntentScreen() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const [selected, setSelected] = useState<string[]>([]);
  const [, setLoading] = useState(false);

  const handleToggle = (label: string) => {
    setSelected((prev) => (prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]));
  };

  const isValid = selected.length >= 1;

  const handleContinue = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      onboarding.setConnectionIntents(selected);
      await saveUserIntents(selected);
      await completeProfileOnboarding();

      // Persist everything collected so far onto the active user profile.
      updateActiveUser({
        name: onboarding.name || undefined,
        age: onboarding.day && onboarding.month && onboarding.year
          ? computeAge(onboarding.day, onboarding.month, onboarding.year)
          : undefined,
        avatar: onboarding.photos[0] || undefined,
        profilePhotos: onboarding.photos,
        interests: onboarding.interests,
        connectionIntents: selected,
        intent: selected[0],
        phoneVerified: true,
      } as any);

      router.push('/onboarding/location');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={6 / 7} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerTextSection}>
          <Text style={styles.title}>What kind of connection are you looking for?</Text>
          <Text style={styles.description}>
            We&apos;ll highlight profiles that have the same goal in mind to make connections smoother.
          </Text>
        </View>

        {/* Intent Cards */}
        <View style={styles.list}>
          {INTENTS.map((item) => {
            const isSelected = selected.includes(item.label);
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleToggle(item.label)}
                activeOpacity={0.8}
                style={[
                  styles.card,
                  isSelected ? styles.cardActive : styles.cardInactive,
                ]}
              >
                <View style={[styles.iconWrapper, isSelected ? styles.iconActive : styles.iconInactive]}>
                  <Icon size={20} color={isSelected ? Colors.white : Colors.pink} />
                </View>
                <Text style={[styles.cardLabel, isSelected && styles.textActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          onPress={handleContinue}
          title="CONTINUE"
          disabled={!isValid}
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
    fontSize: 26,
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
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    gap: 14,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    backgroundColor: Colors.pink,
  },
  iconInactive: {
    backgroundColor: Colors.veryLightPink,
  },
  cardLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  textActive: {
    color: Colors.pink,
  },
  submitBtn: {
    width: '100%',
  },
});
