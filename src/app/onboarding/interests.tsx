import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import Pill from '../../components/ui/Pill';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';

export default function InterestsScreen() {
  const router = useRouter();
  const interestCategories = [
    'Gaming',
    'Music',
    'Travel',
    'Hobbies',
    'Sports',
    'Movies & Shows',
    'Technology',
    'Anime',
    'Coding',
    'Foodie',
    'Fashion',
    'Fitness',
    'Reading',
    'Photography',
  ];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleToggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const isValid = selectedInterests.length >= 1;

  const handleContinue = () => {
    if (!isValid) return;
    router.push('/onboarding/intent');
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={0.88} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerTextSection}>
          <Text style={styles.title}>What interests you?</Text>
          <Text style={styles.description}>
            Select your interests to help us match your vibe with like-minded local people.
          </Text>
        </View>

        {/* Dynamic Counter */}
        <Text style={styles.counterText}>
          {selectedInterests.length > 0 ? (
            <Text style={styles.activeText}>{selectedInterests.length} selected</Text>
          ) : (
            <Text style={styles.inactiveText}>Choose at least 1 interest</Text>
          )}
        </Text>

        {/* Interests Grid */}
        <View style={styles.grid}>
          {interestCategories.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <Pill
                key={interest}
                label={interest}
                selected={isSelected}
                onPress={() => handleToggleInterest(interest)}
              />
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
    marginBottom: 16,
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
  counterText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  activeText: {
    color: Colors.success,
  },
  inactiveText: {
    color: Colors.pink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 40,
  },
  submitBtn: {
    width: '100%',
  },
});
