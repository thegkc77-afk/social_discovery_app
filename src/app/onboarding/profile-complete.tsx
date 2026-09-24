import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import VibeMatchLogo from '../../components/ui/VibeMatchLogo';
import { ACTIVE_USER } from '../../data/mockData';

export default function ProfileCompleteScreen() {
  const router = useRouter();

  const handleStartTalking = () => {
    router.replace('/talk-now');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <VibeMatchLogo size={100} color="#FF2B38" />
        </View>

        <Text style={styles.title}>You&apos;re ready to find your vibe.</Text>
        <Text style={styles.description}>
          Your profile is set up. Choose a topic and meet someone who&apos;s ready to talk.
        </Text>

        {ACTIVE_USER.verificationStatus === 'verified' && <VerifiedBadge variant="label" size={15} />}

        <Button onPress={handleStartTalking} title="START TALKING" style={styles.startBtn} />
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
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  startBtn: {
    width: '100%',
    marginTop: 40,
  },
});
