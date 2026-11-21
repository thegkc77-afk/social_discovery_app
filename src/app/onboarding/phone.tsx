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
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, Shield, ShieldCheck, ArrowRight } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import CountryPicker, { COUNTRIES, Country } from '../../components/onboarding/CountryPicker';
import { sendOTP } from '../../services/auth';
import { useOnboarding } from '../../context/OnboardingContext';

export default function PhoneScreen() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const phoneInputRef = useRef<TextInput>(null);

  const isValid = phone.length === country.digits && /^\d+$/.test(phone);

  const handleSendCode = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await sendOTP(`${country.dialCode}${phone}`);
      onboarding.setPhone(phone, country.dialCode);
      router.push({
        pathname: '/onboarding/otp',
        params: { phone, dialCode: country.dialCode },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= country.digits) {
      setPhone(cleaned);
    }
  };

  const handleCountryChange = (c: Country) => {
    setCountry(c);
    setPhone('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={1 / 7} onBackPress={() => router.replace('/login')} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerTextSection}>
            <Text style={styles.title}>Let&apos;s verify your number</Text>
            <Text style={styles.description}>
              We&apos;ll use your phone number to help keep VibeMatch{' '}
              <Text style={styles.highlightText}>safe and authentic.</Text>
            </Text>
          </View>

          {/* Phone Input Box */}
          <Pressable
            onPress={() => phoneInputRef.current?.focus()}
            style={[
              styles.inputContainer,
              isFocused && styles.inputContainerFocused,
            ]}
          >
            <CountryPicker selected={country} onSelect={handleCountryChange} />
            <View style={styles.divider} />
            <Phone size={18} color="#F88EA8" style={styles.phoneIcon} />
            <TextInput
              ref={phoneInputRef}
              placeholder="Enter mobile number"
              placeholderTextColor="#A0A6B2"
              keyboardType="number-pad"
              maxLength={country.digits}
              value={phone}
              onChangeText={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={styles.textInput}
              autoFocus
              editable={true}
            />
          </Pressable>

          {/* Privacy Message */}
          <View style={styles.privacyContainer}>
            <Shield size={18} color="#F5537A" style={styles.privacyIcon} />
            <Text style={styles.privacyText}>
              Your phone number won&apos;t be shown publicly on your profile.
            </Text>
          </View>

          {/* CTA Button */}
          <Button
            onPress={handleSendCode}
            title="Send Code"
            disabled={!isValid}
            loading={loading}
            rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
            style={[styles.submitBtn, isValid ? styles.activeSubmitBtn : undefined]}
          />

          {/* Bottom Trust Note */}
          <View style={styles.trustNoteContainer}>
            <ShieldCheck size={16} color="#F5537A" style={{ marginRight: 6 }} />
            <Text style={styles.trustNoteText}>
              We never share your number with anyone.
            </Text>
          </View>
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
    fontSize: 32,
    fontWeight: '800',
    color: '#151922',
    letterSpacing: -0.6,
    lineHeight: 40,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: '#687080',
    lineHeight: 22,
  },
  highlightText: {
    color: '#F5537A',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFF7F9',
    borderWidth: 1.5,
    borderColor: '#F8DCE5',
    borderRadius: 22,
    height: 64,
    paddingHorizontal: 16,
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  inputContainerFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F5537A',
    borderWidth: 2,
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#F8DCE5',
    marginHorizontal: 14,
  },
  phoneIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#151922',
    height: 48,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  privacyIcon: {
    marginRight: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: '#687080',
    fontWeight: '400',
    lineHeight: 18,
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
  trustNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  trustNoteText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#687080',
  },
});
