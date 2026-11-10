import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/theme';
import BottomNavBar from '../components/ui/BottomNavBar';
import Avatar from '../components/ui/Avatar';
import { Settings, Camera, Plus, Edit2, LogOut, Check, X, Image as ImageIcon } from 'lucide-react-native';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import { fetchUserProfile, saveUserPhotos } from '../services/users';
import { logoutUser } from '../services/auth';
import { getUserCache } from '../utils/storage';
import { User } from '../data/mockData';

const AVATAR_OPTIONS: string[] = [];

export default function ProfileScreen() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [profileAvatar, setProfileAvatar] = useState('');
  const [chosenPhotos, setChosenPhotos] = useState<string[]>([]);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      const cached = await getUserCache();
      if (cached && isMounted) {
        setCurrentUser(cached);
        if (cached.avatar) setProfileAvatar(cached.avatar);
        if (cached.profilePhotos) setChosenPhotos(cached.profilePhotos);
      }

      const remote = await fetchUserProfile();
      if (remote && isMounted) {
        setCurrentUser(remote);
        if (remote.avatar) setProfileAvatar(remote.avatar);
        if (remote.profilePhotos && remote.profilePhotos.length > 0) {
          setChosenPhotos(remote.profilePhotos);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePickPhotoFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll access needed.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        handleSelectPhoto(uri);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPhoto = async (photoUrl: string) => {
    setProfileAvatar(photoUrl);
    let updatedList = [...chosenPhotos];
    if (!updatedList.includes(photoUrl)) {
      updatedList = [photoUrl, ...updatedList];
      setChosenPhotos(updatedList);
    }

    await saveUserPhotos(updatedList);
    setPhotoModalVisible(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  const handleAddVibe = () => {
    router.push('/onboarding/interests');
  };

  const name = currentUser?.name || 'Vibe User';
  const age = currentUser?.age || 23;
  const bio = currentUser?.bio || 'Living life with good vibes ✨';
  const vibes = currentUser?.vibes && currentUser.vibes.length > 0 ? currentUser.vibes : ['Gaming', 'Music'];
  const intents = currentUser?.connectionIntents && currentUser.connectionIntents.length > 0
    ? currentUser.connectionIntents
    : [currentUser?.intent || 'Dating'];
  const isVerified = Boolean(currentUser?.profileVerified || currentUser?.verificationStatus === 'verified');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerBtn} activeOpacity={0.7}>
            <Settings size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerBtn} activeOpacity={0.7}>
            <LogOut size={22} color={Colors.pink} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Summary */}
        <View style={styles.profileSummary}>
          <TouchableOpacity onPress={() => setPhotoModalVisible(true)} activeOpacity={0.85} style={styles.avatarWrapper}>
            <Avatar source={profileAvatar} size={110} border borderColor={Colors.pink} />
            <TouchableOpacity onPress={() => setPhotoModalVisible(true)} style={styles.editAvatarBtn} activeOpacity={0.8}>
              <Camera size={16} color={Colors.white} />
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.nameRow}>
            <Text style={styles.nameText}>
              {name}, {age}
            </Text>
            {isVerified && <VerifiedBadge size={18} />}
          </View>
          <Text style={styles.usernameText}>@{name.toLowerCase().replace(/\s+/g, '_')}</Text>

          {/* Availability Switch */}
          <View style={styles.statusCard}>
            <View style={styles.statusLabelContainer}>
              <View style={[styles.statusDot, { backgroundColor: isAvailable ? Colors.success : Colors.textMuted }]} />
              <Text style={styles.statusLabelText}>
                {isAvailable ? 'Available to Talk Now' : 'Offline / Invisible'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: Colors.border, true: Colors.lightPink }}
              thumbColor={isAvailable ? Colors.pink : Colors.textMuted}
            />
          </View>
        </View>

        {/* Bio segment */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Bio</Text>
            <Edit2 size={16} color={Colors.pink} />
          </View>
          <Text style={styles.bioText}>{bio}</Text>
        </View>

        {/* My Vibes tags */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>My Vibes</Text>
          </View>
          <View style={styles.vibesGrid}>
            {vibes.map((v) => (
              <View key={v} style={styles.vibePill}>
                <Text style={styles.vibePillText}>{v}</Text>
              </View>
            ))}
            <TouchableOpacity onPress={handleAddVibe} style={styles.addVibePill} activeOpacity={0.7}>
              <Plus size={14} color={Colors.pink} style={{ marginRight: 4 }} />
              <Text style={styles.addVibePillText}>Add more</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Looking For goals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Looking For</Text>
          <View style={styles.vibesGrid}>
            {intents.map((goal) => (
              <View key={goal} style={styles.intentCard}>
                <Text style={styles.intentCardText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Photo Picker Modal */}
      <Modal animationType="slide" transparent={true} visible={photoModalVisible} onRequestClose={() => setPhotoModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar / Photo</Text>
              <TouchableOpacity onPress={() => setPhotoModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handlePickPhotoFromGallery} style={styles.galleryButton} activeOpacity={0.8}>
              <ImageIcon size={20} color={Colors.pink} style={{ marginRight: 8 }} />
              <Text style={styles.galleryButtonText}>Upload from Phone Gallery</Text>
            </TouchableOpacity>

            {AVATAR_OPTIONS.length > 0 && (
              <>
                <Text style={styles.sectionSubtitle}>Or choose from presets:</Text>
                <View style={styles.avatarsGrid}>
                  {AVATAR_OPTIONS.map((uri, idx) => (
                    <TouchableOpacity key={idx} onPress={() => handleSelectPhoto(uri)} style={styles.avatarThumbnailWrapper}>
                      <Image source={{ uri }} style={styles.avatarThumbnail} />
                      {profileAvatar === uri && (
                        <View style={styles.activeCheckBadge}>
                          <Check size={14} color={Colors.white} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 6,
    marginLeft: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  profileSummary: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.pink,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 6,
  },
  usernameText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.lightPink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    width: '100%',
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  vibesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibePill: {
    backgroundColor: Colors.lightPink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  vibePillText: {
    fontSize: 13,
    color: Colors.pink,
    fontWeight: '600',
  },
  addVibePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.pink,
    borderStyle: 'dashed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addVibePillText: {
    fontSize: 13,
    color: Colors.pink,
    fontWeight: '600',
  },
  intentCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  intentCardText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightPink,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  galleryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.pink,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  avatarThumbnailWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  avatarThumbnail: {
    width: '100%',
    height: '100%',
  },
  activeCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.pink,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
