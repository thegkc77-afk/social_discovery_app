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
import { useRouter } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import Button from '../components/ui/Button';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

export default function LoginScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    Alert.alert(
      isSignUp ? 'Sign Up Success' : 'Login Success',
      isSignUp ? `Successfully signed up as ${name || email}!` : `Successfully logged in as ${email}!`,
      [
        {
          text: 'Continue',
          onPress: () => router.replace('/onboarding'),
        },
      ]
    );
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
            <Svg viewBox="0 0 100 100" width={60} height={60}>
              <Defs>
                <SvgGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#A855F7" />
                  <Stop offset="100%" stopColor="#F45F7A" />
                </SvgGradient>
              </Defs>
              <Path
                d="M50,90 C30,72 12,50 12,32 C12,16 28,8 50,26 C72,8 88,16 88,32 C88,50 70,72 50,90 Z"
                stroke="url(#logo-grad)"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M50,60 C43,53 35,43 35,34 C35,27 40,22 50,30 C60,22 65,27 65,34 C65,43 57,53 50,60 Z"
                fill="url(#logo-grad)"
              />
            </Svg>
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
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
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
