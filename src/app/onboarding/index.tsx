import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';

export default function OnboardingIndex() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={0.12} onBackPress={() => router.replace('/login')} />
      <View style={styles.content}>
        {/* Decorative graphic matching vibe */}
        <View style={styles.illustrationContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&h=400&q=80' }}
            style={styles.illustration}
            resizeMode="cover"
          />
        </View>

        <View style={styles.textSection}>
          <Text style={styles.title}>Find your vibe, meet your tribe.</Text>
          <Text style={styles.description}>
            VibeMatch matches you with local people based on what you want to talk about right now. Let's get you set up!
          </Text>
        </View>

        <Button
          onPress={() => router.push('/onboarding/phone')}
          title="Get Started"
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  illustrationContainer: {
    width: '100%',
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 40,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  btn: {
    width: '100%',
    maxWidth: 320,
  },
});
