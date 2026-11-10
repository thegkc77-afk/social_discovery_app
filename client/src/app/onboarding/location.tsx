import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { MapPin, Navigation, Target, ShieldCheck, Zap, Lock, Shield } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import LocationIllustration from '../../components/onboarding/LocationIllustration';
import { useOnboarding } from '../../context/OnboardingContext';
import { saveUserLocation } from '../../services/users';

const TOTAL_SEGMENTS = 6;
const CURRENT_SEGMENT = 1;

export default function LocationOnboardingScreen() {
  const router = useRouter();
  const onboarding = useOnboarding();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSkip = () => {
    router.push('/onboarding/verification-intro');
  };

  const handleAllowLocation = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Request foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMessage('Location access was denied. You can set your location manually.');
        setLoading(false);
        return;
      }

      // 2. Get current GPS position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      let cityString = 'Patna, Bihar';

      try {
        // Reverse geocode coordinates to get city name
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const cityName = place.city || place.subregion || place.region || 'Nearby';
          const regionName = place.region || place.country || '';
          cityString = `${cityName}, ${regionName}`;
        }
      } catch (e) {
        console.warn('[LocationScreen] Reverse geocoding fallback:', e);
      }

      // 3. Store location in context & backend service
      onboarding.setLocation(cityString, { latitude, longitude });
      await saveUserLocation(cityString, latitude, longitude);

      // 4. Continue to next onboarding step
      setLoading(false);
      router.push('/onboarding/verification-intro');
    } catch (error: any) {
      console.error('[LocationScreen] Error requesting location:', error);
      setErrorMessage('Unable to retrieve location. Please set location manually.');
      setLoading(false);
    }
  };

  const handleManualLocation = () => {
    router.push('/onboarding/manual-location');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Header: Progress Segments & Skip */}
        <View style={styles.topHeaderRow}>
          <View style={styles.segmentsContainer}>
            {Array.from({ length: TOTAL_SEGMENTS }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.segment,
                  index < CURRENT_SEGMENT ? styles.segmentActive : styles.segmentInactive,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Circular Pin Container */}
        <View style={styles.headerIconWrapper}>
          <View style={styles.iconCircle}>
            <MapPin size={24} color={Colors.pink} fill={Colors.pink} />
          </View>
        </View>

        {/* Title & Subtitle */}
        <View style={styles.textHeaderSection}>
          <Text style={styles.headingText}>
            Share Your <Text style={styles.highlightText}>Location</Text>
          </Text>
          <Text style={styles.supportingText}>
            Help <Text style={styles.vibeBrandText}>VibeMatch</Text> find people near you{'\n'}and
            connect you with real, nearby vibes.
          </Text>
        </View>

        {/* Premium Location Illustration */}
        <LocationIllustration />

        {/* Inline Error Message Banner (if permission denied) */}
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          {/* Row 1 */}
          <View style={styles.benefitRow}>
            <View style={styles.benefitIconCircle}>
              <Target size={20} color={Colors.pink} />
            </View>
            <View style={styles.benefitTextGroup}>
              <Text style={styles.benefitTitle}>Find People Near You</Text>
              <Text style={styles.benefitSubtitle}>Discover like-minded people in your area.</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.benefitRow}>
            <View style={styles.benefitIconCircle}>
              <ShieldCheck size={20} color={Colors.pink} />
            </View>
            <View style={styles.benefitTextGroup}>
              <Text style={styles.benefitTitle}>Your Privacy is Safe</Text>
              <Text style={styles.benefitSubtitle}>We never share your exact location.</Text>
            </View>
          </View>

          {/* Row 3 */}
          <View style={styles.benefitRow}>
            <View style={styles.benefitIconCircle}>
              <Zap size={20} color={Colors.pink} />
            </View>
            <View style={styles.benefitTextGroup}>
              <Text style={styles.benefitTitle}>Real-time Connections</Text>
              <Text style={styles.benefitSubtitle}>See who&apos;s available to talk right now.</Text>
            </View>
          </View>

          {/* Row 4 */}
          <View style={[styles.benefitRow, { marginBottom: 0 }]}>
            <View style={styles.benefitIconCircle}>
              <Lock size={20} color={Colors.pink} />
            </View>
            <View style={styles.benefitTextGroup}>
              <Text style={styles.benefitTitle}>You&apos;re in Control</Text>
              <Text style={styles.benefitSubtitle}>Change or hide your location anytime.</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionsSection}>
          {/* Primary Action Button: Allow Location Access */}
          <TouchableOpacity
            onPress={handleAllowLocation}
            disabled={loading}
            activeOpacity={0.85}
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
          >
            {loading ? (
              <View style={styles.btnRow}>
                <ActivityIndicator color={Colors.white} size="small" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Getting Location...</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Navigation size={18} color={Colors.white} fill={Colors.white} style={styles.btnIcon} />
                <Text style={styles.primaryBtnText}>Allow Location Access</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Secondary Action Button: Set Location Manually */}
          <TouchableOpacity
            onPress={handleManualLocation}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryBtnText}>Set Location Manually</Text>
          </TouchableOpacity>

          {/* Privacy Message Footer */}
          <View style={styles.privacyFooter}>
            <Shield size={14} color={Colors.pink} style={{ marginRight: 6 }} />
            <Text style={styles.privacyText}>
              Your location is only used to enhance your experience.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8FA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  topHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  segmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  segment: {
    height: 4,
    width: 24,
    borderRadius: 2,
  },
  segmentActive: {
    backgroundColor: Colors.pink,
  },
  segmentInactive: {
    backgroundColor: '#FCE3EA',
  },
  skipButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipText: {
    fontFamily: 'Outfit',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.pink,
  },
  headerIconWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF1F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textHeaderSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  headingText: {
    fontFamily: 'Outfit',
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  highlightText: {
    color: Colors.pink,
  },
  supportingText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  vibeBrandText: {
    color: Colors.pink,
    fontWeight: '600',
  },
  errorBanner: {
    width: '100%',
    backgroundColor: '#FFF0F0',
    borderColor: '#FFCACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#D32F2F',
    textAlign: 'center',
    fontWeight: '500',
  },
  benefitsCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F8DCE5',
    padding: 18,
    marginVertical: 14,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  benefitTextGroup: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: 'Outfit',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  benefitSubtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionsSection: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 8,
    transform: [{ rotate: '45deg' }],
  },
  primaryBtnText: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  secondaryBtnText: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.pink,
  },
  privacyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: Colors.textMuted,
  },
});
