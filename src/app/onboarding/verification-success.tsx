import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeCheck } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';

export default function VerificationSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <BadgeCheck size={56} color={Colors.success} strokeWidth={1.8} />
        </View>

        <Text style={styles.title}>You&apos;re verified!</Text>
        <Text style={styles.description}>
          Your profile has passed the live verification check.
        </Text>

        <View style={styles.badgePreview}>
          <BadgeCheck size={16} color={Colors.success} strokeWidth={2.2} />
          <Text style={styles.badgeText}>Verified</Text>
        </View>

        <Button
          onPress={() => router.replace('/onboarding/profile-complete')}
          title="CONTINUE"
          style={styles.continueBtn}
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
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
  badgePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 40,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.success,
  },
  continueBtn: {
    width: '100%',
  },
});
