import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import VibeMatchLogo from '../../components/ui/VibeMatchLogo';

const { width } = Dimensions.get('window');

// Header VibeMatch Logo
function HeaderHearts() {
  return (
    <View style={styles.heartContainer}>
      <VibeMatchLogo size={48} color="#FF2B38" />
    </View>
  );
}

export function WelcomeToSlide() {
  return (
    <View style={styles.slide}>
      <View style={styles.content}>
        {/* Double Heart Icon */}
        <HeaderHearts />

        {/* Heading */}
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.brandText}>VibeMatch</Text>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../../assets/images/welcome-illustration.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />

          {/* Decorative Sparkle Stars */}
          <Text style={[styles.decorItem, styles.decorStar1]}>✦</Text>
          <Text style={[styles.decorItem, styles.decorStar2]}>✦</Text>
          <Text style={[styles.decorItem, styles.decorHeart1]}>♥</Text>
          <Text style={[styles.decorItem, styles.decorHeart2]}>♡</Text>
        </View>

        {/* Description */}
        <View style={styles.textContainer}>
          <Text style={styles.mainDescription}>Let’s find your perfect match.</Text>
          <Text style={styles.subDescription}>A brief setup to understand you.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    height: 44,
    position: 'relative',
    width: 68,
  },
  solidHeartWrap: {
    position: 'absolute',
    left: 2,
    top: 4,
    transform: [{ rotate: '-14deg' }],
  },
  outlineHeartWrap: {
    position: 'absolute',
    right: 2,
    top: -2,
    transform: [{ rotate: '12deg' }],
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#18181B',
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  brandText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#F43F5E',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 44,
    marginTop: 2,
  },
  illustrationContainer: {
    width: width * 0.82,
    height: width * 0.72,
    maxHeight: 300,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  decorItem: {
    position: 'absolute',
    color: '#FB7185',
    fontWeight: '700',
  },
  decorStar1: {
    top: 15,
    right: 18,
    fontSize: 16,
    opacity: 0.85,
  },
  decorStar2: {
    top: 60,
    left: 10,
    fontSize: 14,
    opacity: 0.75,
  },
  decorHeart1: {
    top: 30,
    left: 28,
    fontSize: 16,
    opacity: 0.8,
  },
  decorHeart2: {
    bottom: 40,
    right: 15,
    fontSize: 16,
    opacity: 0.7,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  mainDescription: {
    fontSize: 18,
    fontWeight: '500',
    color: '#18181B',
    textAlign: 'center',
    lineHeight: 28,
  },
  subDescription: {
    fontSize: 17,
    fontWeight: '500',
    color: '#18181B',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 2,
  },
});

export default WelcomeToSlide;
