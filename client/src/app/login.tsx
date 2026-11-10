import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import Button from '../components/ui/Button';
import VibeMatchLogo from '../components/ui/VibeMatchLogo';

import { registerUser, loginUser } from '../services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const targetEmail = email.trim();
    const targetPassword = password.trim();
    const targetName = name.trim();

    if (!targetEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    if (!targetPassword) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    if (isSignUp && !targetName) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await registerUser(targetName, targetEmail, targetPassword, '2000-01-01');
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await loginUser(targetEmail, targetPassword);
        Alert.alert('Success', 'Logged in successfully!');
      }
      router.replace('/onboarding/phone');
    } catch (error: any) {
      Alert.alert('Authentication Failed', error?.message || 'Unable to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Branding header */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <VibeMatchLogo size={60} color="#FF2B38" />
            <View style={styles.logoTextContainer}>
              <Text style={styles.vibeText}>Vibe</Text>
              <Text style={styles.matchText}>Match</Text>
            </View>
          </View>
          <Text style={styles.tagline}>Hyperlocal vibes for the next generation.</Text>
        </View>

        {/* Auth form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isSignUp ? 'Get Early Access' : 'Welcome Back'}</Text>
          <Text style={styles.cardSubtitle}>
            {isSignUp ? 'Be the first to know when we launch.' : 'Find your vibe, meet your tribe.'}
          </Text>

          {/* Sign In vs Sign Up Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, !isSignUp && styles.activeTabButton]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, isSignUp && styles.activeTabButton]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Form Inputs */}
          <View style={styles.inputsContainer}>
            {isSignUp && (
              <View style={styles.inputWrapper}>
                <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Your Name"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  style={styles.textInput}
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder="hello@vibematch.social"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.textInput}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                style={styles.textInput}
              />
            </View>

            {!isSignUp && (
              <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.6}>
                <Text style={styles.forgotBtnText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <Button
              onPress={handleSubmit}
              loading={loading}
              title={isSignUp ? 'Create Account' : 'Signin to Vibe'}
              style={styles.submitBtn}
            />

            {/* OR Continue Label */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Authentication */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => router.replace('/onboarding/phone')}
              >
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => router.replace('/onboarding/phone')}
              >
                <Text style={styles.socialBtnText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Link at bottom */}
            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              style={styles.cardFooter}
              activeOpacity={0.6}
            >
              <Text style={styles.footerText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.footerHighlight}>{isSignUp ? 'Signin' : 'Sign Up'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vibeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  matchText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.pink,
    fontStyle: 'italic',
  },
  tagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 6,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.veryLightPink,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: Colors.white,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.pink,
  },
  inputsContainer: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1,
    borderColor: Colors.lightPink,
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    height: '100%',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 8,
  },
  forgotBtnText: {
    color: Colors.pink,
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginHorizontal: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  cardFooter: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  footerHighlight: {
    color: Colors.pink,
    fontWeight: '700',
  },
});
