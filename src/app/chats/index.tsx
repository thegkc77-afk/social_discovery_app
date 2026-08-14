import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import BottomNavBar from '../../components/ui/BottomNavBar';
import Avatar from '../../components/ui/Avatar';
import { Search, MessageSquare } from 'lucide-react-native';
import { getStoredUsers, User } from '../../data/mockData';

export default function ChatsIndexScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(getStoredUsers());
  const [searchQuery, setSearchQuery] = useState('');

  // Active chats are users that have message history
  const activeChats = users.filter((u) => u.messages.length > 0);

  const filteredChats = activeChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatItem = ({ item }: { item: User }) => {
    const lastMsg = item.messages[item.messages.length - 1];
    
    // Check for mock unread count (e.g. Aanya has 1 unread)
    const hasUnread = item.id === 'aanya';

    return (
      <Pressable
        onPress={() => router.push(`/chats/${item.id}`)}
        style={({ pressed }) => [styles.chatRow, pressed && styles.chatRowPressed]}
      >
        <Avatar
          source={item.avatar}
          size={56}
          showOnlineStatus
          online={item.online}
        />
        <View style={styles.chatDetails}>
          <View style={styles.chatHeaderRow}>
            <Text style={styles.chatName}>{item.name}</Text>
            <Text style={[styles.chatTime, hasUnread && styles.unreadChatTime]}>
              {lastMsg?.time || '5:00 PM'}
            </Text>
          </View>
          <View style={styles.chatMsgRow}>
            <Text
              style={[styles.chatMsgText, hasUnread && styles.unreadChatMsgText]}
              numberOfLines={1}
            >
              {lastMsg?.text || 'No messages yet'}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>1</Text>
              </View>
            )}
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
      {activeChats.length > 0 && (
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

      {/* Chat List or Empty State */}
      {filteredChats.length > 0 ? (
        <FlatList
          data={filteredChats}
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
            Start a "Talk Now" session and find someone who matches your vibe to start talking.
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
  listContent: {
    paddingBottom: 100, // Safe padding for BottomNavBar
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
  unreadChatTime: {
    color: Colors.pink,
    fontWeight: '700',
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
  unreadChatMsgText: {
    color: Colors.text,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: Colors.pink,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
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
