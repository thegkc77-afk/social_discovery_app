import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView } from 'expo-camera';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import VerificationFrame from '../../components/onboarding/VerificationFrame';
import { useOnboarding } from '../../context/OnboardingContext';
import { startVerificationSession, toClientVerificationStatus } from '../../services/verification';
import { updateActiveUser } from '../../data/mockData';

const INSTRUCTIONS = [
  'Look straight at the camera',
  'Turn your head slightly left',
  'Turn your head slightly right',
  'Smile',
];

const STEP_DURATION_MS = 1600;

const readSessionId = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

export default function VerificationCameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const onboarding = useOnboarding();
  const [stepIndex, setStepIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | undefined>(readSessionId(params.sessionId));

  useEffect(() => {
    if (sessionId) return;

    const createSession = async () => {
      try {
        const session = await startVerificationSession();
        const clientStatus = toClientVerificationStatus(session.status);
        onboarding.setVerificationStatus(clientStatus);
        updateActiveUser({
          verificationStatus: clientStatus,
          profileVerified: session.verified,
        } as any);
        setSessionId(session.sessionId);
      } catch (error: any) {
        Alert.alert('Verification unavailable', error.message || 'Please try again in a moment.', [
          { text: 'OK', onPress: () => router.replace('/onboarding/verification-intro') },
        ]);
      }
    };

    createSession();
  }, [sessionId, router, onboarding]);

  useEffect(() => {
    if (!sessionId) return;

    if (stepIndex >= INSTRUCTIONS.length) {
      onboarding.setVerificationStatus('processing');
      router.replace(`/onboarding/verification-processing?sessionId=${encodeURIComponent(sessionId)}`);
      return;
    }

    const timer = setTimeout(() => setStepIndex((i) => i + 1), STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [sessionId, stepIndex, onboarding, router]);

  return (
    <View style={styles.container}>
      <VerificationFrame
        stepIndex={Math.min(stepIndex, INSTRUCTIONS.length - 1)}
        totalSteps={INSTRUCTIONS.length}
        instruction={INSTRUCTIONS[Math.min(stepIndex, INSTRUCTIONS.length - 1)]}
      >
        <CameraView style={StyleSheet.absoluteFill} facing="front" />
      </VerificationFrame>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
          <ArrowLeft size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Verify yourself</Text>
        <View style={styles.backButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.text,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
