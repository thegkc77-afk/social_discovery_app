import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import BottomNavBar from '../../components/ui/BottomNavBar';
import Avatar from '../../components/ui/Avatar';
import { Search, MessageSquare } from 'lucide-react-native';
import { fetchConversations, ChatConversation } from '../../services/chat';
import { ensureAuthenticated } from '../../services/auth';

export default function ChatsIndexScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadConversations = async () => {
      try {
        await ensureAuthenticated();
        const data = await fetchConversations();
        if (isMounted) {
          setConversations(data);
        }
      } catch (error) {
        console.error('[ChatsIndex] Error loading conversations:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadConversations();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredConversations = conversations.filter((c) =>
    c.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderChatItem = ({ item }: { item: ChatConversation }) => {
    const user = item.otherUser;

    return (
      <Pressable
        onPress={() => router.push(`/chats/${item.id}`)}
        style={({ pressed }) => [styles.chatRow, pressed && styles.chatRowPressed]}
      >
        <Avatar
          source={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'}
          size={56}
          showOnlineStatus
          online={true}
        />
        <View style={styles.chatDetails}>
          <View style={styles.chatHeaderRow}>
            <Text style={styles.chatName}>{user?.name || 'VibeMatch User'}</Text>
            <Text style={styles.chatTime}>
              {formatTime((typeof item.lastMessage === 'object' ? item.lastMessage?.createdAt : item.lastMessageTime) || item.updatedAt)}
            </Text>
          </View>
          <View style={styles.chatMsgRow}>
            <Text style={styles.chatMsgText} numberOfLines={1}>
              {(typeof item.lastMessage === 'object' ? item.lastMessage?.content : item.lastMessage) || 'Say hello to start the conversation! 👋'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Chats</Text>
        <Text style={styles.subtitle}>
          Continue the conversations that started from a vibe.
        </Text>
      </View>

      {/* Search Bar */}
      {conversations.length > 0 && (
        <View style={styles.searchSection}>
          <Search size={18} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search conversations"
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      )}

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.pink} />
        </View>
      ) : filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MessageSquare size={36} color={Colors.pink} />
          </View>
          <Text style={styles.emptyTitle}>No active chats</Text>
          <Text style={styles.emptyDescription}>
            Start a &quot;Talk Now&quot; session or match on Discovery to start talking.
          </Text>
        </View>
      )}

      {/* Sticky Navigation Overlay */}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1,
    borderColor: Colors.lightPink,
    borderRadius: 14,
    height: 44,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  chatRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  chatRowPressed: {
    backgroundColor: Colors.veryLightPink,
  },
  chatDetails: {
    flex: 1,
    marginLeft: 14,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  chatMsgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMsgText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1.5,
    borderColor: Colors.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});
