import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useOnboarding } from '../../context/OnboardingContext';
import { updateActiveUser } from '../../data/mockData';
import { checkVerificationStatus, toClientVerificationStatus } from '../../services/verification';

const CHECKS = [
  { id: 'presence', label: 'Checking live presence' },
  { id: 'face', label: 'Checking face visibility' },
  { id: 'requirements', label: 'Checking verification requirements' },
];

const POLL_INTERVAL_MS = 4000;
const TERMINAL_FAILED_STATUSES = ['failed', 'expired', 'cancelled'];

export default function VerificationProcessingScreen() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const [completedChecks, setCompletedChecks] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    const tick1 = setTimeout(() => setCompletedChecks(1), 700);
    const tick2 = setTimeout(() => setCompletedChecks(2), 1400);
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let isMounted = true;

    const pollStatus = async () => {
      try {
        const status = await checkVerificationStatus();
        if (!isMounted) return;

        const clientStatus = toClientVerificationStatus(status.status);
        onboarding.setVerificationStatus(clientStatus);
        updateActiveUser({
          verificationStatus: clientStatus,
          profileVerified: status.verified,
        } as any);
        setStatusMessage(status.message || '');

        if (clientStatus === 'verified') {
          setCompletedChecks(3);
          router.replace('/onboarding/verification-success');
          return;
        }

        if (TERMINAL_FAILED_STATUSES.includes(clientStatus)) {
          setCompletedChecks(3);
          router.replace('/onboarding/verification-failed');
          return;
        }

        if (clientStatus === 'manual_review') {
          setCompletedChecks(3);
        }
      } catch (error: any) {
        if (isMounted) {
          setStatusMessage(error.message || 'Waiting for verification status...');
        }
      }

      if (isMounted) {
        pollTimer = setTimeout(pollStatus, POLL_INTERVAL_MS);
      }
    };

    pollStatus();

    return () => {
      isMounted = false;
      animation.stop();
      clearTimeout(tick1);
      clearTimeout(tick2);
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [spin, onboarding, router]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.spinnerRing, { transform: [{ rotate }] }]} />
        <Text style={styles.title}>Verifying...</Text>
        {!!statusMessage && <Text style={styles.statusMessage}>{statusMessage}</Text>}

        <View style={styles.checklist}>
          {CHECKS.map((check, index) => {
            const isDone = completedChecks > index;
            const isActive = completedChecks === index;
            return (
              <View key={check.id} style={styles.checkRow}>
                <Text style={[styles.checkLabel, isDone && styles.checkLabelDone]}>{check.label}</Text>
                {isDone ? (
                  <View style={styles.checkMark}>
                    <Check size={14} color={Colors.white} strokeWidth={3} />
                  </View>
                ) : isActive ? (
                  <ActivityIndicator size="small" color={Colors.pink} />
                ) : (
                  <Text style={styles.checkPending}>...</Text>
                )}
              </View>
            );
          })}
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  spinnerRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: Colors.lightPink,
    borderTopColor: Colors.pink,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 32,
  },
  statusMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: -20,
    marginBottom: 24,
  },
  checklist: {
    width: '100%',
    gap: 16,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  checkLabelDone: {
    color: Colors.text,
  },
  checkMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkPending: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});

