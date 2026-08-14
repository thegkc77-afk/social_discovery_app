import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import { sendOTP } from '../../services/auth';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = phone.length === 10 && /^\d+$/.test(phone);

  const handleSendCode = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await sendOTP(`+91${phone}`);
      router.push({
        pathname: '/onboarding/otp',
        params: { phone },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPhone(cleaned);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={0.25} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerTextSection}>
            <Text style={styles.title}>Let's verify your number</Text>
            <Text style={styles.description}>
              We'll send a 6-digit verification code to check if your account is secure.
            </Text>
          </View>

          {/* Phone Input Box */}
          <View style={styles.inputContainer}>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.flagText}>🇮🇳</Text>
              <Text style={styles.codeText}>+91</Text>
            </View>
            <View style={styles.divider} />
            <TextInput
              placeholder="Enter mobile number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={handlePhoneChange}
              style={styles.textInput}
              autoFocus
            />
          </View>

          <Text style={styles.privacyText}>
            By continuing, you agree to receive an SMS code for authentication. Message & data rates may apply.
          </Text>

          <Button
            onPress={handleSendCode}
            title="SEND CODE"
            disabled={!isValid}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1.5,
    borderColor: Colors.lightPink,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagText: {
    fontSize: 20,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  divider: {
    width: 1.5,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    height: '100%',
  },
  privacyText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 16,
    width: '100%',
  },
  submitBtn: {
    width: '100%',
    marginTop: 40,
  },
});
