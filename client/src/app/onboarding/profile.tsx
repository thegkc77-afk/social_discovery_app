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
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import { useOnboarding } from '../../context/OnboardingContext';
import { updateBasicProfile } from '../../services/users';

const MIN_AGE = 18;

export default function ProfileInfoScreen() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Date of birth
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Gender selection
  const genders = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];
  const [selectedGender, setSelectedGender] = useState('');

  // Focus states for micro-interactions
  const [focusedField, setFocusedField] = useState<'name' | 'day' | 'month' | 'year' | null>(null);

  // Input refs for tap-anywhere focus and auto-advance
  const nameRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const isDateValid = () => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
    return (
      d > 0 && d <= 31 &&
      m > 0 && m <= 12 &&
      y > 1920 && y <= new Date().getFullYear() - MIN_AGE
    );
  };

  const isValid = name.trim().length >= 2 && isDateValid() && selectedGender !== '';

  const handleContinue = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      onboarding.setBasicProfile({ name: name.trim(), day, month, year, gender: selectedGender });
      const formattedDob = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      await updateBasicProfile({
        name: name.trim(),
        dateOfBirth: formattedDob,
        gender: selectedGender,
      });
      router.push('/onboarding/photos');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setDay(cleaned);
    if (cleaned.length === 2) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setMonth(cleaned);
    if (cleaned.length === 2) {
      yearRef.current?.focus();
    }
  };

  const handleYearChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setYear(cleaned);
  };

  const handleMonthKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Backspace' && month === '') {
      dayRef.current?.focus();
    }
  };

  const handleYearKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Backspace' && year === '') {
      monthRef.current?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={3 / 7} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerTextSection}>
            <Text style={styles.title}>Tell us about you</Text>
            <Text style={styles.description}>
              Share your details to customize your profile card.
            </Text>
          </View>

          {/* First Name Field */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FIRST NAME</Text>
            <Pressable
              onPress={() => nameRef.current?.focus()}
              style={[
                styles.inputWrapper,
                focusedField === 'name' && styles.inputWrapperFocused,
              ]}
            >
              <TextInput
                ref={nameRef}
                placeholder="What should we call you?"
                placeholderTextColor="#A0A6B2"
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                style={styles.textInput}
                editable={true}
              />
            </Pressable>
          </View>

          {/* Date of Birth Field */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DATE OF BIRTH</Text>
            <View style={styles.dobContainer}>
              <Pressable
                onPress={() => dayRef.current?.focus()}
                style={[
                  styles.inputWrapper,
                  styles.dobWrapper,
                  focusedField === 'day' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  ref={dayRef}
                  placeholder="DD"
                  placeholderTextColor="#A0A6B2"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={day}
                  onChangeText={handleDayChange}
                  onFocus={() => setFocusedField('day')}
                  onBlur={() => setFocusedField(null)}
                  style={styles.textInputCentered}
                  editable={true}
                />
              </Pressable>

              <Pressable
                onPress={() => monthRef.current?.focus()}
                style={[
                  styles.inputWrapper,
                  styles.dobWrapper,
                  focusedField === 'month' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  ref={monthRef}
                  placeholder="MM"
                  placeholderTextColor="#A0A6B2"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={month}
                  onChangeText={handleMonthChange}
                  onKeyPress={handleMonthKeyPress}
                  onFocus={() => setFocusedField('month')}
                  onBlur={() => setFocusedField(null)}
                  style={styles.textInputCentered}
                  editable={true}
                />
              </Pressable>

              <Pressable
                onPress={() => yearRef.current?.focus()}
                style={[
                  styles.inputWrapper,
                  styles.dobYearWrapper,
                  focusedField === 'year' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  ref={yearRef}
                  placeholder="YYYY"
                  placeholderTextColor="#A0A6B2"
                  keyboardType="number-pad"
                  maxLength={4}
                  value={year}
                  onChangeText={handleYearChange}
                  onKeyPress={handleYearKeyPress}
                  onFocus={() => setFocusedField('year')}
                  onBlur={() => setFocusedField(null)}
                  style={styles.textInputCentered}
                  editable={true}
                />
              </Pressable>
            </View>
          </View>

          {/* Gender selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>GENDER IDENTITY</Text>
            <View style={styles.genderGrid}>
              {genders.map((g) => {
                const isSelected = selectedGender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setSelectedGender(g)}
                    activeOpacity={0.8}
                    style={[
                      styles.genderButton,
                      isSelected ? styles.genderButtonActive : styles.genderButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        isSelected ? styles.genderTextActive : styles.genderTextInactive,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Primary CTA */}
          <Button
            onPress={handleContinue}
            title="Continue"
            disabled={!isValid || loading}
            rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
            style={[styles.submitBtn, isValid ? styles.activeSubmitBtn : undefined]}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#151922',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: '#687080',
    lineHeight: 22,
  },
  section: {
    width: '100%',
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#687080',
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  inputWrapper: {
    backgroundColor: '#FFF7F9',
    borderWidth: 1.5,
    borderColor: '#F8DCE5',
    borderRadius: 20,
    height: 56,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F5537A',
    borderWidth: 2,
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#151922',
    height: 48,
    width: '100%',
  },
  dobContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dobWrapper: {
    flex: 1,
    paddingHorizontal: 0,
  },
  dobYearWrapper: {
    flex: 1.4,
    paddingHorizontal: 0,
  },
  textInputCentered: {
    fontSize: 17,
    fontWeight: '700',
    color: '#151922',
    textAlign: 'center',
    height: 48,
    width: '100%',
  },
  genderGrid: {
    gap: 10,
  },
  genderButton: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  genderButtonActive: {
    backgroundColor: '#F5537A',
    borderColor: '#F5537A',
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  genderButtonInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F8DCE5',
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  genderTextInactive: {
    color: '#151922',
  },
  submitBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    marginTop: 28,
  },
  activeSubmitBtn: {
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
});
