import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/theme';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { Sparkles, ArrowLeft } from 'lucide-react-native';
import { findVibeMatch } from '../services/matching';
import { User, ACTIVE_USER } from '../data/mockData';
import VerifiedBadge from '../components/ui/VerifiedBadge';

import { connectSocket, getSocket } from '../services/socket';

export default function MatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const topic = (params.topic as string) || 'Gaming';

  const matchId = (params.matchId as string) || '';
  const matchedUserIdParam = (params.userId as string) || '';

  const [status, setStatus] = useState<'searching' | 'matched'>(matchId ? 'matched' : 'searching');
  const [matchedUser, setMatchedUser] = useState<User | null>(() => {
    if (matchId) {
      return {
        id: matchedUserIdParam || 'tanya',
        name: 'Tanya',
        age: 22,
        bio: `Gamer girl matched on ${topic}! 🎮`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
        distance: '0.8 km away',
        location: 'Patna, India',
        online: true,
        vibes: [topic],
        likes: 15,
        commentsCount: 4,
        hasLiked: false,
        verificationStatus: 'verified',
        verified: true,
        messages: []
      };
    }
    return null;
  });

  // Animation values
  const [radarScale1] = useState(() => new Animated.Value(0.5));
  const [radarOpacity1] = useState(() => new Animated.Value(0.8));
  const [radarScale2] = useState(() => new Animated.Value(0.5));
  const [radarOpacity2] = useState(() => new Animated.Value(0.8));

  const [matchedOpacity] = useState(() => new Animated.Value(0));
  const [matchedScale] = useState(() => new Animated.Value(0.9));

  useEffect(() => {
    let animations: Animated.CompositeAnimation[] = [];

    if (status === 'matched') {
      Animated.parallel([
        Animated.timing(matchedOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(matchedScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      const a1 = Animated.loop(
        Animated.parallel([
          Animated.timing(radarScale1, {
            toValue: 2.2,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(radarOpacity1, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      );

      const a2 = Animated.loop(
        Animated.sequence([
          Animated.delay(900),
          Animated.parallel([
            Animated.timing(radarScale2, {
              toValue: 2.2,
              duration: 1800,
              useNativeDriver: true,
            }),
            Animated.timing(radarOpacity2, {
              toValue: 0,
              duration: 1800,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      animations = [a1, a2];
      animations.forEach((a) => a.start());

      const setupSocketMatch = async () => {
        const socket = await connectSocket();
        if (socket) {
          socket.on('talk:matched', (data: any) => {
            if (data?.matchId) {
              setMatchedUser({
                id: data.userId || 'partner',
                name: 'Vibe Match Partner',
                age: 23,
                bio: `Matched on ${topic}!`,
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                distance: '0.8 km away',
                location: 'Patna, India',
                online: true,
                vibes: [topic],
                likes: 15,
                commentsCount: 4,
                hasLiked: false,
                verificationStatus: 'verified',
                verified: true,
                messages: []
              });
              setStatus('matched');
            }
          });
        }

        const result = await findVibeMatch('me', topic);
        if (result) {
          setTimeout(() => {
            setMatchedUser(result);
            setStatus('matched');
          }, 1200);
        }
      };

      setupSocketMatch();
    }

    return () => {
      animations.forEach((a) => a.stop());
      const socket = getSocket();
      if (socket) {
        socket.off('match:found');
        socket.off('talk:matched');
      }
    };
  }, [matchId, matchedUserIdParam, status, topic, radarScale1, radarOpacity1, radarScale2, radarOpacity2, matchedOpacity, matchedScale]);

  const handleStartChat = () => {
    const targetId = matchedUser?.id || matchedUserIdParam || 'partner';
    router.replace({
      pathname: '/chats/[id]',
      params: { id: targetId, topic },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {status === 'searching' ? (
        <View style={styles.searchingContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>

          {/* Radar Circles */}
          <View style={styles.radarContainer}>
            <Animated.View
              style={[
                styles.radarCircle,
                { transform: [{ scale: radarScale1 }], opacity: radarOpacity1 },
              ]}
            />
            <Animated.View
              style={[
                styles.radarCircle,
                { transform: [{ scale: radarScale2 }], opacity: radarOpacity2 },
              ]}
            />
            <View style={styles.radarCenter}>
              <Sparkles size={36} color={Colors.white} fill={Colors.white} />
            </View>
          </View>

          <View style={styles.textSection}>
            <Text style={styles.searchTitle}>Finding your vibe...</Text>
            <Text style={styles.searchSubtitle}>Looking for people who want to talk about {topic}</Text>
          </View>
        </View>
      ) : (
        <Animated.View style={[styles.matchedContent, { opacity: matchedOpacity, transform: [{ scale: matchedScale }] }]}>
          <Text style={styles.congratsTitle}>You found a vibe!</Text>
          <Text style={styles.congratsSubtitle}>A new connection has been created.</Text>

          {/* Avatar split layout */}
          <View style={styles.avatarsRow}>
            <Avatar source={ACTIVE_USER.avatar} size={100} border borderColor={Colors.pink} />
            <View style={styles.sparkleConnector}>
              <Sparkles size={24} color={Colors.pink} fill={Colors.pink} />
            </View>
            <Avatar source={matchedUser?.avatar || ''} size={100} border borderColor={Colors.pink} />
          </View>

          {matchedUser && (
            <View style={styles.matchedNameRow}>
              <Text style={styles.matchedNameText}>
                {matchedUser.name}, {matchedUser.age}
              </Text>
              {matchedUser.verificationStatus === 'verified' && <VerifiedBadge size={16} />}
            </View>
          )}

          {/* Interests Card summary */}
          <View style={styles.interestCard}>
            <Text style={styles.interestCardLabel}>SHARED INTERESTS</Text>
            <Text style={styles.interestCardText}>
              You both want to talk about <Text style={styles.highlightText}>{topic}</Text>
            </Text>
            {matchedUser?.bio && (
              <Text style={styles.matchBio}>&quot;{matchedUser.bio}&quot;</Text>
            )}
          </View>

          {/* Action CTAs */}
          <View style={styles.actions}>
            <Button onPress={handleStartChat} title="START CHAT" style={styles.chatBtn} />
            <TouchableOpacity onPress={() => router.replace('/talk-now')} style={styles.laterBtn} activeOpacity={0.6}>
              <Text style={styles.laterBtnText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 10,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  radarContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 40,
  },
  radarCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(244, 95, 122, 0.18)',
  },
  radarCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
  textSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  searchSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  matchedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  congratsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  congratsSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 40,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  },
  sparkleConnector: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1.5,
    borderColor: Colors.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  matchedNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  interestCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  interestCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  interestCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  highlightText: {
    color: Colors.pink,
    fontWeight: '800',
  },
  matchBio: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 16,
  },
  chatBtn: {
    width: '100%',
  },
  laterBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  laterBtnText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
});
