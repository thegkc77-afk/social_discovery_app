import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  User,
  Smartphone,
  Mail,
  MapPin,
  Target,
  Heart,
  Zap,
  Lock,
  Shield,
  UserX,
  Eye,
  Sparkles,
  MessageCircle,
  Bell,
  Moon,
  Globe,
  Volume2,
  Wifi,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  FileText,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();

  // Notification Toggles State
  const [newMatchesNotif, setNewMatchesNotif] = useState(true);
  const [newMessagesNotif, setNewMessagesNotif] = useState(true);
  const [talkNowNotif, setTalkNowNotif] = useState(true);
  const [appUpdatesNotif, setAppUpdatesNotif] = useState(false);

  // App Preferences Toggle State
  const [soundHaptics, setSoundHaptics] = useState(true);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out of VibeMatch?')) {
        router.replace('/login');
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out of VibeMatch?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => router.replace('/login'),
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9FA" />

      {/* Clean Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#111111" strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Account Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account</Text>

          <SettingRow
            icon={<User size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Edit Profile"
            subtitle="Update your photos, bio & personal details"
            onPress={() => router.push('/onboarding/profile')}
          />
          <SettingRow
            icon={<Smartphone size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Phone Number"
            subtitle="Manage your verified phone number"
            onPress={() => router.push('/onboarding/phone')}
          />
          <SettingRow
            icon={<Mail size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Email"
            subtitle="Manage your email address"
            isLast
          />
        </View>

        {/* 2. Discovery & Matching Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Discovery & Matching</Text>

          <SettingRow
            icon={<MapPin size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Discovery Distance"
            subtitle="People within 5 km"
          />
          <SettingRow
            icon={<Target size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Matching Preferences"
            subtitle="Age, interests & compatibility"
          />
          <SettingRow
            icon={<Heart size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Dating Preferences"
            subtitle="Control who you want to meet"
          />
          <SettingRow
            icon={<Zap size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Talk Now Preferences"
            subtitle="Manage your real-time availability"
            isLast
          />
        </View>

        {/* 3. Privacy & Safety Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Privacy & Safety</Text>

          <SettingRow
            icon={<Lock size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Privacy Settings"
            subtitle="Control who can see your profile"
          />
          <SettingRow
            icon={<Shield size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Safety Center"
            subtitle="Safety tools and community guidelines"
          />
          <SettingRow
            icon={<UserX size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Blocked Users"
            subtitle="Manage people you've blocked"
          />
          <SettingRow
            icon={<Eye size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Profile Visibility"
            subtitle="Control your discovery visibility"
            isLast
          />
        </View>

        {/* 4. Notifications Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <ToggleSettingRow
            icon={<Sparkles size={18} color="#F5537A" strokeWidth={2.2} />}
            title="New Matches"
            subtitle="Get notified when someone matches with you"
            value={newMatchesNotif}
            onValueChange={setNewMatchesNotif}
          />
          <ToggleSettingRow
            icon={<MessageCircle size={18} color="#F5537A" strokeWidth={2.2} />}
            title="New Messages"
            subtitle="Get notified when someone sends a message"
            value={newMessagesNotif}
            onValueChange={setNewMessagesNotif}
          />
          <ToggleSettingRow
            icon={<Zap size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Talk Now Requests"
            subtitle="Receive notifications for Talk Now"
            value={talkNowNotif}
            onValueChange={setTalkNowNotif}
          />
          <ToggleSettingRow
            icon={<Bell size={18} color="#F5537A" strokeWidth={2.2} />}
            title="App Notifications"
            subtitle="General VibeMatch updates"
            value={appUpdatesNotif}
            onValueChange={setAppUpdatesNotif}
            isLast
          />
        </View>

        {/* 5. App Preferences Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <SettingRow
            icon={<Moon size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Appearance"
            subtitle="Light / Dark / System"
          />
          <SettingRow
            icon={<Globe size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Language"
            subtitle="English"
          />
          <ToggleSettingRow
            icon={<Volume2 size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Sound & Haptics"
            subtitle="Sounds and vibration feedback"
            value={soundHaptics}
            onValueChange={setSoundHaptics}
          />
          <SettingRow
            icon={<Wifi size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Data Usage"
            subtitle="Media auto-download & quality"
            isLast
          />
        </View>

        {/* 6. Support Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Support</Text>

          <SettingRow
            icon={<HelpCircle size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Help Center"
          />
          <SettingRow
            icon={<MessageSquare size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Contact Support"
          />
          <SettingRow
            icon={<AlertTriangle size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Report a Problem"
          />
          <SettingRow
            icon={<FileText size={18} color="#F5537A" strokeWidth={2.2} />}
            title="Terms & Privacy"
            isLast
          />
        </View>

        {/* 7. Log Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Footer */}
        <Text style={styles.footerText}>
          VibeMatch • Dating × Social Discovery
        </Text>
        <Text style={styles.versionText}>Version 1.0.0 (Build 42)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Setting Row Component (Navigational with Chevron)
interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isLast?: boolean;
}

function SettingRow({ icon, title, subtitle, onPress, isLast }: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 0.9}
      style={[styles.row, !isLast && styles.rowBorder]}
    >
      <View style={styles.iconCircle}>{icon}</View>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
    </TouchableOpacity>
  );
}

// Reusable Toggle Setting Row Component (Switch)
interface ToggleSettingRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  isLast?: boolean;
}

function ToggleSettingRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  isLast,
}: ToggleSettingRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.iconCircle}>{icon}</View>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#FFF1F5' }}
        thumbColor={value ? '#F5537A' : '#9CA3AF'}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9FA',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#F3DCE3',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3DCE3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#F3DCE3',
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8ECF0',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF1F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 18,
  },
  logoutBtn: {
    height: 56,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F5537A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F5537A',
    letterSpacing: 0.3,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
    color: '#D1D5DB',
  },
});
