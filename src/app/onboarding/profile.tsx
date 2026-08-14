import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';

export default function ProfileInfoScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  
  // Date of birth
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Gender selection
  const genders = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];
  const [selectedGender, setSelectedGender] = useState('');

  const isDateValid = () => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    return (
      d > 0 && d <= 31 &&
      m > 0 && m <= 12 &&
      y > 1920 && y <= new Date().getFullYear() - 12
    );
  };

  const isValid = name.trim().length >= 2 && isDateValid() && selectedGender !== '';

  const handleContinue = () => {
    if (!isValid) return;
    router.push('/onboarding/photos');
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={0.5} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerTextSection}>
            <Text style={styles.title}>Tell us about you</Text>
            <Text style={styles.description}>
              Share your details to customize your profile card.
            </Text>
          </View>

          {/* Name Field */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FIRST NAME</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="What should we call you?"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Date of Birth Field */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DATE OF BIRTH</Text>
            <View style={styles.dobContainer}>
              <View style={[styles.inputWrapper, styles.dobWrapper]}>
                <TextInput
                  placeholder="DD"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={day}
                  onChangeText={(val) => setDay(val.replace(/[^0-9]/g, ''))}
                  style={styles.textInputCentered}
                />
              </View>
              <View style={[styles.inputWrapper, styles.dobWrapper]}>
                <TextInput
                  placeholder="MM"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={month}
                  onChangeText={(val) => setMonth(val.replace(/[^0-9]/g, ''))}
                  style={styles.textInputCentered}
                />
              </View>
              <View style={[styles.inputWrapper, styles.dobYearWrapper]}>
                <TextInput
                  placeholder="YYYY"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={year}
                  onChangeText={(val) => setYear(val.replace(/[^0-9]/g, ''))}
                  style={styles.textInputCentered}
                />
              </View>
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
                    <Text style={[
                      styles.genderText,
                      isSelected ? styles.genderTextActive : styles.genderTextInactive,
                    ]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Button
            onPress={handleContinue}
            title="CONTINUE"
            disabled={!isValid}
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTextSection: {
    width: '100%',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 22,
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  inputWrapper: {
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1.5,
    borderColor: Colors.lightPink,
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    height: '100%',
  },
  dobContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dobWrapper: {
    flex: 1.2,
    paddingHorizontal: 0,
  },
  dobYearWrapper: {
    flex: 1.6,
    paddingHorizontal: 0,
  },
  textInputCentered: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    height: '100%',
  },
  genderGrid: {
    gap: 10,
  },
  genderButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  genderButtonActive: {
    backgroundColor: Colors.pink,
    borderColor: Colors.pink,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  genderButtonInactive: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
  },
  genderTextActive: {
    color: Colors.white,
  },
  genderTextInactive: {
    color: Colors.text,
  },
  submitBtn: {
    marginTop: 24,
  },
});
