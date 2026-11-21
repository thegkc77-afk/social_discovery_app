import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';
import { updateActiveUser } from '../../data/mockData';
import { retryVerification, toClientVerificationStatus } from '../../services/verification';

const REASONS = [
  'Face not clearly visible',
  'Poor lighting',
  'Camera issue',
  'Verification interrupted',
];

export default function VerificationFailedScreen() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const session = await retryVerification();
      const clientStatus = toClientVerificationStatus(session.status);
      onboarding.setVerificationStatus(clientStatus);
      updateActiveUser({
        verificationStatus: clientStatus,
        profileVerified: session.verified,
      } as any);
      router.replace(`/onboarding/verification-camera?sessionId=${encodeURIComponent(session.sessionId)}`);
    } catch (error: any) {
      Alert.alert('Retry unavailable', error.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <AlertCircle size={48} color={Colors.pink} strokeWidth={1.8} />
        </View>

        <Text style={styles.title}>We couldn&apos;t verify you yet</Text>
        <Text style={styles.description}>
          Make sure your face is clearly visible and follow the instructions carefully.
        </Text>

        <View style={styles.reasonsCard}>
          {REASONS.map((reason) => (
            <View key={reason} style={styles.reasonRow}>
              <View style={styles.bullet} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>

        <Button
          onPress={handleRetry}
          title="TRY AGAIN"
          style={styles.tryAgainBtn}
          loading={loading}
        />
        <TouchableOpacity
          onPress={() => Linking.openURL('mailto:support@vibematch.social')}
          activeOpacity={0.6}
          disabled={loading}
        >
          <Text style={styles.helpText}>Get Help</Text>
        </TouchableOpacity>
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
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.veryLightPink,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
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
    marginBottom: 24,
  },
  reasonsCard: {
    width: '100%',
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1,
    borderColor: Colors.lightPink,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginBottom: 32,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tryAgainBtn: {
    width: '100%',
    marginBottom: 16,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.pink,
  },
});
