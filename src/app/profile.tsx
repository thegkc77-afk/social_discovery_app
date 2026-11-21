import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/theme';
import BottomNavBar from '../components/ui/BottomNavBar';
import Avatar from '../components/ui/Avatar';
import { Settings, Camera, Plus, Edit2, LogOut, Check, X, Image as ImageIcon } from 'lucide-react-native';
import { ACTIVE_USER, updateActiveUser } from '../data/mockData';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import { getUserCache, saveUserCache } from '../utils/storage';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80'
];

export default function ProfileScreen() {
  const router = useRouter();

  const [isAvailable, setIsAvailable] = useState(ACTIVE_USER.isAvailable);
  const [profileAvatar, setProfileAvatar] = useState(ACTIVE_USER.avatar);
  const [chosenPhotos, setChosenPhotos] = useState<string[]>(() => {
    return ACTIVE_USER.profilePhotos && ACTIVE_USER.profilePhotos.length > 0
      ? ACTIVE_USER.profilePhotos
      : AVATAR_OPTIONS.slice(0, 4);
  });
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const bio = ACTIVE_USER.bio;

  useEffect(() => {
    let isMounted = true;
    const loadCachedUser = async () => {
      const cached = await getUserCache();
      if (cached && isMounted) {
        const chosen = cached.avatar || (cached.profilePhotos && cached.profilePhotos[0]) || ACTIVE_USER.avatar;
        if (chosen) setProfileAvatar(chosen);
        if (cached.profilePhotos && cached.profilePhotos.length > 0) {
          setChosenPhotos(cached.profilePhotos);
        }
      } else if (ACTIVE_USER.profilePhotos && ACTIVE_USER.profilePhotos.length > 0) {
        setProfileAvatar(ACTIVE_USER.profilePhotos[0]);
        setChosenPhotos(ACTIVE_USER.profilePhotos);
      }
    };
    loadCachedUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePickPhotoFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
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
    updateActiveUser({ avatar: photoUrl });

    let updatedList = [...chosenPhotos];
    if (!updatedList.includes(photoUrl)) {
      updatedList = [photoUrl, ...updatedList];
      setChosenPhotos(updatedList);
    }

    const cached = (await getUserCache()) || {};
    await saveUserCache({
      ...cached,
      ...ACTIVE_USER,
      avatar: photoUrl,
      profilePhotos: updatedList,
    });

    setPhotoModalVisible(false);
  };

  const handleLogout = () => {
    router.replace('/login');
  };

  const handleAddVibe = () => {
    router.push('/onboarding/interests');
  };

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
        {/* Profile Card Summary - Main Avatar with chosen profile photo */}
        <View style={styles.profileSummary}>
          <TouchableOpacity onPress={() => setPhotoModalVisible(true)} activeOpacity={0.85} style={styles.avatarWrapper}>
            <Avatar source={profileAvatar} size={110} border borderColor={Colors.pink} />
            <TouchableOpacity onPress={() => setPhotoModalVisible(true)} style={styles.editAvatarBtn} activeOpacity={0.8}>
              <Camera size={16} color={Colors.white} />
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.nameRow}>
            <Text style={styles.nameText}>
              {ACTIVE_USER.name}, {ACTIVE_USER.age}
            </Text>
            {ACTIVE_USER.verificationStatus === 'verified' && <VerifiedBadge size={18} />}
          </View>
          <Text style={styles.usernameText}>{ACTIVE_USER.username}</Text>

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
            {ACTIVE_USER.interests.map((v) => (
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
            {(ACTIVE_USER.connectionIntents.length > 0 ? ACTIVE_USER.connectionIntents : [ACTIVE_USER.intent]).map((goal) => (
              <View key={goal} style={styles.intentCard}>
                <Text style={styles.intentCardText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Photo Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={photoModalVisible}
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Profile Photo</Text>
              <TouchableOpacity onPress={() => setPhotoModalVisible(false)}>
                <X size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handlePickPhotoFromGallery}
              activeOpacity={0.8}
              style={styles.uploadNewBtn}
            >
              <ImageIcon size={20} color={Colors.pink} />
              <Text style={styles.uploadNewBtnText}>Upload New Photo from Gallery</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.pickerGrid}>
              {AVATAR_OPTIONS.map((url, idx) => {
                const isSelected = profileAvatar === url;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectPhoto(url)}
                    style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  >
                    <Image source={{ uri: url }} style={styles.pickerImage} />
                    {isSelected && (
                      <View style={styles.pickerCheck}>
                        <Check size={14} color={Colors.white} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sticky Bottom Bar */}
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100, // Safe padding for BottomNavBar
  },
  profileSummary: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.pink,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  usernameText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    marginTop: 20,
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
  },
  vibesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibePill: {
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1,
    borderColor: Colors.lightPink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  vibePillText: {
    color: Colors.pink,
    fontSize: 13,
    fontWeight: '700',
  },
  addVibePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.pink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addVibePillText: {
    color: Colors.pink,
    fontSize: 13,
    fontWeight: '700',
  },
  intentCard: {
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1,
    borderColor: Colors.lightPink,
    borderRadius: 14,
    padding: 12,
    alignSelf: 'flex-start',
  },
  intentCardText: {
    color: Colors.pink,
    fontWeight: '700',
    fontSize: 14,
  },
  changePhotoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.pink,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  photoItemContainer: {
    position: 'relative',
  },
  photoItem: {
    width: 70,
    height: 70,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  photoItemSelected: {
    borderColor: Colors.pink,
  },
  selectedPhotoBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  uploadNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1.5,
    borderColor: Colors.lightPink,
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  uploadNewBtnText: {
    color: Colors.pink,
    fontWeight: '700',
    fontSize: 14,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  pickerItem: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.border,
  },
  pickerItemSelected: {
    borderColor: Colors.pink,
  },
  pickerImage: {
    width: 90,
    height: 90,
  },
  pickerCheck: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
