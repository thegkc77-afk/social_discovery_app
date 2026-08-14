import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import BottomNavBar from '../components/ui/BottomNavBar';
import Avatar from '../components/ui/Avatar';
import { Settings, Camera, Plus, Edit2, LogOut } from 'lucide-react-native';
import { ACTIVE_USER } from '../data/mockData';

export default function ProfileScreen() {
  const router = useRouter();
  
  const [isAvailable, setIsAvailable] = useState(ACTIVE_USER.isAvailable);
  const [bio, setBio] = useState(ACTIVE_USER.bio);
  
  const [posts, setPosts] = useState([
    { id: '1', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&h=400&q=80' },
    { id: '2', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&h=400&q=80' },
    { id: '3', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&h=400&q=80' },
  ]);

  const handleLogout = () => {
    router.replace('/login');
  };

  const handleAddVibe = () => {
    router.push('/onboarding/interests');
  };

  const screenWidth = Dimensions.get('window').width;
  const postSize = (screenWidth - 48) / 3;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
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
          <View style={styles.avatarWrapper}>
            <Avatar source={ACTIVE_USER.avatar} size={100} border borderColor={Colors.pink} />
            <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
              <Camera size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.nameText}>
            {ACTIVE_USER.name}, {ACTIVE_USER.age}
          </Text>
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
          <View style={styles.intentCard}>
            <Text style={styles.intentCardText}>{ACTIVE_USER.intent}</Text>
          </View>
        </View>

        {/* Photos grid */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Feed</Text>
          <View style={styles.postsGrid}>
            {posts.map((post) => (
              <Image
                key={post.id}
                source={{ uri: post.url }}
                style={[styles.postImage, { width: postSize, height: postSize }]}
                resizeMode="cover"
              />
            ))}
          </View>
        </View>
      </ScrollView>

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
  postsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  postImage: {
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
});
