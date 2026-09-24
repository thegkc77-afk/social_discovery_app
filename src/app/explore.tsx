import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors } from '../constants/theme';
import Avatar from '../components/ui/Avatar';
import VerifiedBadge from '../components/ui/VerifiedBadge';
import { Heart, MessageCircle, Share2, Sparkles, Plus, Compass } from 'lucide-react-native';
import { fetchFeed, fetchStories, likePost, unlikePost, FeedPost, UserStoryGroup } from '../services/social';

export default function SocialDiscoveryScreen() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [stories, setStories] = useState<UserStoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSocialData = useCallback(async () => {
    try {
      const [feedData, storyData] = await Promise.all([
        fetchFeed(20),
        fetchStories(),
      ]);

      setPosts(feedData.posts);
      setStories(storyData);
    } catch (error) {
      console.error('[Explore] Error loading social data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchFeed(20), fetchStories()]).then(([feedData, storyData]) => {
      if (isMounted) {
        setPosts(feedData.posts);
        setStories(storyData);
        setLoading(false);
        setRefreshing(false);
      }
    }).catch((err) => {
      console.error('[Explore] Error loading social data:', err);
      if (isMounted) {
        setLoading(false);
        setRefreshing(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSocialData();
  };

  const handleToggleLike = async (postId: string, currentlyLiked: boolean) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likedByMe: !currentlyLiked,
            likeCount: currentlyLiked ? p.likeCount - 1 : p.likeCount + 1,
          };
        }
        return p;
      })
    );

    if (currentlyLiked) {
      await unlikePost(postId);
    } else {
      await likePost(postId);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Compass size={24} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>Vibe Discovery</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => {}}>
          <Plus size={20} color="#FFF" />
          <Text style={styles.createBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      >
        {/* Stories Bar */}
        <View style={styles.storiesContainer}>
          <Text style={styles.sectionTitle}>Vibe Stories (24h)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
            {/* User Create Story Item */}
            <TouchableOpacity style={styles.storyItem}>
              <View style={[styles.storyRing, { borderColor: Colors.surface }]}>
                <Avatar uri="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80" size={56} />
                <View style={styles.addStoryPlus}>
                  <Plus size={12} color="#FFF" />
                </View>
              </View>
              <Text style={styles.storyName} numberOfLines={1}>Your Story</Text>
            </TouchableOpacity>

            {/* Other User Stories */}
            {stories.map((group) => (
              <TouchableOpacity key={group.user.id} style={styles.storyItem}>
                <View style={[styles.storyRing, { borderColor: group.stories.some((s) => !s.viewedByMe) ? Colors.primary : Colors.textMuted }]}>
                  <Avatar uri={group.user.avatar} size={56} />
                </View>
                <Text style={styles.storyName} numberOfLines={1}>{group.user.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Feed Posts */}
        <View style={styles.feedContainer}>
          <Text style={styles.sectionTitle}>Community Vibe Feed</Text>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : posts.length === 0 ? (
            <View style={styles.emptyState}>
              <Sparkles size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No posts yet. Be the first to share your vibe!</Text>
            </View>
          ) : (
            posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                {/* Post User Header */}
                <View style={styles.postHeader}>
                  <Avatar uri={post.user.avatar} size={44} />
                  <View style={styles.postUserInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.postUserName}>{post.user.name}, {post.user.age}</Text>
                      {post.user.isVerified && <VerifiedBadge size={14} style={{ marginLeft: 4 }} />}
                    </View>
                    <Text style={styles.postTime}>
                      {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>

                {/* Post Caption */}
                {post.caption && <Text style={styles.postCaption}>{post.caption}</Text>}

                {/* Post Images */}
                {post.media && post.media.length > 0 && (
                  <Image source={{ uri: post.media[0].url }} style={styles.postImage} resizeMode="cover" />
                )}

                {/* Post Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleLike(post.id, post.likedByMe)}>
                    <Heart size={22} color={post.likedByMe ? Colors.primary : Colors.textMuted} fill={post.likedByMe ? Colors.primary : 'transparent'} />
                    <Text style={[styles.actionText, post.likedByMe && { color: Colors.primary }]}>
                      {post.likeCount}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn}>
                    <MessageCircle size={22} color={Colors.textMuted} />
                    <Text style={styles.actionText}>{post.commentCount}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn}>
                    <Share2 size={22} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  createBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  storiesContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  storiesScroll: {
    paddingHorizontal: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 68,
  },
  storyRing: {
    padding: 2,
    borderRadius: 34,
    borderWidth: 2,
    position: 'relative',
  },
  addStoryPlus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  storyName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  feedContainer: {
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: Colors.textMuted,
    marginTop: 12,
    fontSize: 14,
  },
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUserInfo: {
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  postTime: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  postCaption: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
});
