import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import { verifyOTP, sendOTP } from '../../services/auth';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // References for the TextInput fields
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleTextChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto focus next box
    if (digit && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace back tracking
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index] === '' && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs[index - 1].current?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const isOtpComplete = otp.every((val) => val.length === 1);
  const enteredOtp = otp.join('');

  const handleVerify = async () => {
    if (!isOtpComplete) return;
    setLoading(true);
    try {
      const success = await verifyOTP(`+91${phone}`, enteredOtp);
      if (success) {
        router.push('/onboarding/profile');
      } else {
        Alert.alert('Verification Failed', 'The OTP code is invalid. Please try again.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      await sendOTP(`+91${phone}`);
      Alert.alert('Code Sent', 'A new 6-digit OTP code has been sent to your number.');
    } catch (e) {
      console.error(e);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={0.38} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerTextSection}>
            <Text style={styles.title}>Enter OTP Code</Text>
            <Text style={styles.description}>
              We sent a 6-digit code to +91 {phone || 'XXXXX XXXXX'}. Enter it below.
            </Text>
          </View>

          {/* OTP Digit Boxes */}
          <View style={styles.otpGrid}>
            {otp.map((value, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                keyboardType="number-pad"
                maxLength={1}
                value={value}
                onChangeText={(text) => handleTextChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                style={[
                  styles.otpInput,
                  value ? styles.otpInputActive : styles.otpInputEmpty,
                ]}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend actions */}
          <View style={styles.resendSection}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={resending} activeOpacity={0.6}>
              <Text style={styles.resendHighlight}>{resending ? 'Sending...' : 'Resend Code'}</Text>
            </TouchableOpacity>
          </View>

          <Button
            onPress={handleVerify}
            title="VERIFY & CONTINUE"
            disabled={!isOtpComplete}
            loading={loading}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerTextSection: {
    width: '100%',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 22,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    marginVertical: 10,
  },
  otpInput: {
    width: '14%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.text,
  },
  otpInputEmpty: {
    backgroundColor: Colors.veryLightPink,
    borderColor: Colors.lightPink,
  },
  otpInputActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.pink,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
  },
  resendText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  resendHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.pink,
  },
  submitBtn: {
    width: '100%',
    marginTop: 40,
  },
});
