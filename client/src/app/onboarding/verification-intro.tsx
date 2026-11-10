import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import { ShieldCheck, User } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import WhyVerifySheet from '../../components/onboarding/WhyVerifySheet';
import { useOnboarding } from '../../context/OnboardingContext';
import { updateActiveUser } from '../../data/mockData';
import { startVerificationSession, toClientVerificationStatus } from '../../services/verification';

type Stage = 'intro' | 'permission';

export default function VerificationIntroScreen() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>('intro');
  const [whyVisible, setWhyVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const openVerificationSession = async () => {
    setLoading(true);
    try {
      const session = await startVerificationSession();
      const clientStatus = toClientVerificationStatus(session.status);
      onboarding.setVerificationStatus(clientStatus);
      updateActiveUser({
        verificationStatus: clientStatus,
        profileVerified: session.verified,
      } as any);
      router.push(`/onboarding/verification-camera?sessionId=${encodeURIComponent(session.sessionId)}`);
    } catch (error: any) {
      Alert.alert('Verification unavailable', error.message || 'Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (permission?.granted) {
      openVerificationSession();
      return;
    }
    setStage('permission');
  };

  const handleAllowCamera = async () => {
    const result = await requestPermission();
    if (result.granted) {
      await openVerificationSession();
    } else {
      Alert.alert(
        'Camera access needed',
        'We need camera access for a short live verification check. You can try again anytime.'
      );
    }
  };

  if (stage === 'permission') {
    return (
      <SafeAreaView style={styles.container}>
        <OnboardingHeader progress={1} onBackPress={() => setStage('intro')} />
        <View style={styles.permissionContent}>
          <View style={styles.permissionIconWrapper}>
            <User size={40} color={Colors.pink} />
          </View>
          <Text style={styles.title}>Camera access</Text>
          <Text style={styles.description}>
            We need camera access for a short live verification check.
          </Text>

          <View style={styles.permissionActions}>
            <Button onPress={handleAllowCamera} title="ALLOW CAMERA" style={styles.allowBtn} loading={loading} />
            <TouchableOpacity onPress={() => setStage('intro')} activeOpacity={0.6} disabled={loading}>
              <Text style={styles.notNowText}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={1} />
      <View style={styles.content}>
        <View style={styles.illustrationWrapper}>
          <View style={styles.circleFrame}>
            <User size={64} color={Colors.pink} strokeWidth={1.5} />
          </View>
        </View>

        <View style={styles.headerTextSection}>
          <Text style={styles.title}>Verify you&apos;re really you</Text>
          <Text style={styles.description}>
            A quick live video check helps us reduce bots and fake accounts and keeps
            conversations safer.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button onPress={handleStart} title="START VERIFICATION" style={styles.startBtn} loading={loading} />
          <TouchableOpacity
            onPress={() => setWhyVisible(true)}
            style={styles.whyBtn}
            activeOpacity={0.6}
            disabled={loading}
          >
            <ShieldCheck size={14} color={Colors.pink} />
            <Text style={styles.whyText}>Why do I need this?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <WhyVerifySheet visible={whyVisible} onClose={() => setWhyVisible(false)} />
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
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationWrapper: {
    marginBottom: 32,
  },
  circleFrame: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: Colors.pink,
    borderStyle: 'dashed',
    backgroundColor: Colors.veryLightPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextSection: {
    alignItems: 'center',
    marginBottom: 40,
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
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  startBtn: {
    width: '100%',
  },
  whyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  whyText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.pink,
  },
  permissionContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.veryLightPink,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionActions: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    marginTop: 32,
  },
  allowBtn: {
    width: '100%',
  },
  notNowText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
