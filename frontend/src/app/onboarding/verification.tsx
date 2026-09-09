import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import { submitUserVerification } from '../../services/verification';

export default function VerificationScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'scanning' | 'success'>('idle');

  if (!permission) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.pink} /></View>;
  }

  const handleStartScan = async () => {
    setIsVerifying(true);
    setVerificationStep('scanning');
    
    try {
      await submitUserVerification({ userId: 'me', selfieUri: 'mock_selfie' });
      setVerificationStep('success');
    } catch (e) {
      console.error(e);
      Alert.alert('Verification Failed', 'Could not detect face. Please try again.');
      setVerificationStep('idle');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
    router.push('/onboarding/interests');
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={0.75} />
      <View style={styles.content}>
        <View style={styles.headerTextSection}>
          <Text style={styles.title}>Liveness Verification</Text>
          <Text style={styles.description}>
            VibeMatch requires face verification to prevent duplicate accounts and ensure real interactions.
          </Text>
        </View>

        {/* Camera block */}
        {!permission.granted ? (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>Camera permission is required for liveness verification.</Text>
            <Button onPress={requestPermission} title="Grant Permission" style={styles.permissionBtn} />
          </View>
        ) : (
          <View style={styles.cameraFrame}>
            {verificationStep === 'success' ? (
              <View style={styles.successOverlay}>
                <Text style={styles.successBadge}>✓ VERIFIED</Text>
                <Text style={styles.successDescription}>Your profile is verified and ready to match.</Text>
              </View>
            ) : (
              <CameraView style={styles.camera} facing="front">
                {/* Oval overlay guide */}
                <View style={styles.overlayContainer}>
                  <View style={styles.ovalGuide} />
                </View>
                
                {verificationStep === 'scanning' && (
                  <View style={styles.scanningOverlay}>
                    <ActivityIndicator size="large" color={Colors.white} />
                    <Text style={styles.scanningText}>Analyzing face patterns...</Text>
                  </View>
                )}
              </CameraView>
            )}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.guideContainer}>
          {verificationStep === 'success' ? (
            <Text style={styles.guideTextSuccess}>Liveness check successfully completed!</Text>
          ) : (
            <Text style={styles.guideText}>
              Ensure your face is well-lit and positioned inside the oval.
            </Text>
          )}
        </View>

        {verificationStep === 'success' ? (
          <Button onPress={handleContinue} title="CONTINUE" style={styles.actionBtn} />
        ) : (
          <Button
            onPress={handleStartScan}
            title={verificationStep === 'scanning' ? 'VERIFYING...' : 'START VERIFICATION'}
            disabled={!permission.granted || verificationStep === 'scanning'}
            style={styles.actionBtn}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  headerTextSection: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
  },
  cameraFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.lightPink,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ovalGuide: {
    width: '70%',
    height: '75%',
    borderRadius: 120,
    borderWidth: 2,
    borderColor: Colors.pink,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(244, 95, 122, 0.05)',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  scanningText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  successOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    backgroundColor: Colors.white,
  },
  successBadge: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.success,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  successDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  permissionBox: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.veryLightPink,
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  permissionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionBtn: {
    width: '80%',
  },
  guideContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  guideText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  guideTextSuccess: {
    fontSize: 14,
    color: Colors.success,
    textAlign: 'center',
    fontWeight: '700',
  },
  actionBtn: {
    width: '100%',
  },
});
