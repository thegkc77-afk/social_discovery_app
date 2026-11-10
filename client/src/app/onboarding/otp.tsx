import React, { useState, useRef, useEffect } from 'react';
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
import { ArrowRight } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import { verifyOTP, sendOTP } from '../../services/auth';
import { useOnboarding } from '../../context/OnboardingContext';

const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const onboarding = useOnboarding();
  const phone = (params.phone as string) || '';
  const dialCode = (params.dialCode as string) || onboarding.countryCode || '+91';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const ref0 = useRef<TextInput>(null);
  const ref1 = useRef<TextInput>(null);
  const ref2 = useRef<TextInput>(null);
  const ref3 = useRef<TextInput>(null);
  const ref4 = useRef<TextInput>(null);
  const ref5 = useRef<TextInput>(null);
  const inputRefs = [ref0, ref1, ref2, ref3, ref4, ref5];

  const applyDigits = (digits: string) => {
    const chars = digits.replace(/[^0-9]/g, '').slice(0, 6).split('');
    const newOtp = ['', '', '', '', '', ''];
    chars.forEach((c, i) => (newOtp[i] = c));
    setOtp(newOtp);
    const nextEmptyIndex = chars.length < 6 ? chars.length : 5;
    inputRefs[nextEmptyIndex].current?.focus();
  };

  const handleTextChange = (text: string, index: number) => {
    if (text.length > 1) {
      applyDigits(text);
      return;
    }
    const digit = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
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
      const success = await verifyOTP(`${dialCode}${phone}`, enteredOtp);
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
    if (secondsLeft > 0) return;
    setResending(true);
    try {
      await sendOTP(`${dialCode}${phone}`);
      setSecondsLeft(RESEND_SECONDS);
      Alert.alert('Code Sent', 'A new 6-digit OTP code has been sent to your number.');
    } catch (e) {
      console.error(e);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={2 / 7} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerTextSection}>
            <Text style={styles.title}>Enter your verification code</Text>
            <Text style={styles.description}>
              We sent a 6-digit code to{' '}
              <Text style={styles.phoneHighlight}>{dialCode} {phone || 'XXXXX XXXXX'}</Text>.
            </Text>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.editBtn}>
              <Text style={styles.editPhoneText}>Edit phone number</Text>
            </TouchableOpacity>
          </View>

          {/* 6 OTP Digit Boxes */}
          <View style={styles.otpGrid}>
            {otp.map((value, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                keyboardType="number-pad"
                maxLength={6}
                value={value}
                onChangeText={(text) => handleTextChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                style={[
                  styles.otpInput,
                  value ? styles.otpInputFilled : styles.otpInputEmpty,
                  focusedIndex === index && styles.otpInputFocused,
                ]}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend actions */}
          <View style={styles.resendSection}>
            {secondsLeft > 0 ? (
              <Text style={styles.resendText}>
                Resend code in 0:{secondsLeft.toString().padStart(2, '0')}
              </Text>
            ) : (
              <View style={styles.resendRow}>
                <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
                <TouchableOpacity onPress={handleResendCode} disabled={resending} activeOpacity={0.7}>
                  <Text style={styles.resendHighlight}>{resending ? 'Sending...' : 'Resend'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Primary CTA */}
          <Button
            onPress={handleVerify}
            title="Verify"
            disabled={!isOtpComplete}
            loading={loading}
            rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
            style={[styles.submitBtn, isOtpComplete ? styles.activeSubmitBtn : undefined]}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  headerTextSection: {
    width: '100%',
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#151922',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: '#687080',
    lineHeight: 22,
    marginBottom: 8,
  },
  phoneHighlight: {
    fontWeight: '600',
    color: '#151922',
  },
  editBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  editPhoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5537A',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    marginVertical: 12,
  },
  otpInput: {
    flex: 1,
    maxWidth: 60,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#151922',
  },
  otpInputEmpty: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F8DCE5',
  },
  otpInputFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F5537A',
  },
  otpInputFocused: {
    backgroundColor: '#FFF7F9',
    borderColor: '#F5537A',
    borderWidth: 2,
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  resendSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 36,
    width: '100%',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#687080',
    fontWeight: '500',
  },
  resendHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F5537A',
  },
  submitBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
  },
  activeSubmitBtn: {
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
});
