import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/theme';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { ArrowLeft, Send, Plus, MoreVertical, MapPin, Calendar, Clock, X } from 'lucide-react-native';
import { connectSocket } from '../../services/socket';
import { getStoredUsers, saveStoredUsers, Message, User } from '../../data/mockData';
import { fetchConversationMessages, saveMeetupInvite } from '../../services/chat';
import VerifiedBadge from '../../components/ui/VerifiedBadge';

import { getUserCache } from '../../utils/storage';

export default function ChatRoomScreen() {
  const router = useRouter();
  const { id, topic, matchId } = useLocalSearchParams();
  const activeTopic = (topic as string) || 'Gaming';
  const activeMatchId = (matchId as string) || '';

  const [users, setUsers] = useState<User[]>(getStoredUsers());
  const [recipient, setRecipient] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // Meetup modal states
  const [meetModalVisible, setMeetModalVisible] = useState(false);
  const [meetPlace, setMeetPlace] = useState('Third Wave Coffee');
  const [meetDate, setMeetDate] = useState('Sat, 25 May');
  const [meetTime, setMeetTime] = useState('5:00 PM');
  const [meetNote, setMeetNote] = useState('Looking forward to it! ☕');

  const getIcebreaker = (t: string) => {
    switch (t.toLowerCase()) {
      case 'gaming':
        return 'Hey! I see we both love gaming 🎮 What are you playing right now?';
      case 'music':
        return "Hey! I see we both love music 🎵 What's on your playlist right now?";
      case 'travel':
        return 'Hey! I see we are both into traveling ✈️ Where is your next destination?';
      case 'sports':
        return 'Hey! Fellow sports fan ⚽ Did you catch the recent match?';
      default:
        return `Hey! I noticed we both like ${t} ✨ How did you get into that?`;
    }
  };

  const icebreakerText = getIcebreaker(activeTopic);

  // Load recipient & current user profile
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      const cached = await getUserCache();
      if (!isMounted) return;
      if (cached?.id) {
        setCurrentUserId(cached.id);
      }

      const matched = users.find((u) => u.id === id);
      if (matched) {
        setRecipient(matched);
        setMessages(matched.messages);
      } else {
        const defaultGirl: User = {
          id: (id as string) || 'tanya',
          name: 'Tanya',
          age: 22,
          bio: `Matched on ${activeTopic}! 🎮`,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
          distance: '0.8 km away',
          location: 'Bangalore, India',
          online: true,
          vibes: [activeTopic],
          likes: 12,
          commentsCount: 3,
          hasLiked: false,
          verificationStatus: 'verified',
          verified: true,
          messages: [
            { id: 'init-1', sender: 'them', text: `Hey! I see we matched on ${activeTopic} 🎮 What are you playing right now?`, time: 'Just now' }
          ]
        };
        setRecipient(defaultGirl);
        setMessages(defaultGirl.messages);
        setUsers((prev) => {
          const updated = [...prev.filter((u) => u.id !== defaultGirl.id), defaultGirl];
          saveStoredUsers(updated);
          return updated;
        });
      }
    };
    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [id, users, activeTopic]);

  // Connect real Socket & fetch messages
  useEffect(() => {
    let isMounted = true;

    const initChatRoom = async () => {
      const cachedUser = await getUserCache();
      const myId = cachedUser?.id || '';

      if (activeMatchId) {
        // 1. Fetch message history from REST API
        const history = await fetchConversationMessages(activeMatchId);
        if (isMounted && history.messages.length > 0) {
          const formatted: Message[] = history.messages.map((m: any) => ({
            id: m._id || m.id,
            sender: m.senderId === myId ? 'me' : 'them',
            text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setMessages(formatted);
        }
      }

      // 2. Connect Socket & join room
      const socket = await connectSocket();
      if (socket && isMounted) {
        socketRef.current = socket;

        if (activeMatchId) {
          socket.emit('chat:join', { matchId: activeMatchId });
        }

        socket.off('chat:receive_message');
        socket.on('chat:receive_message', (data: any) => {
          if (isMounted) {
            const isSelf = data.senderId === myId || (currentUserId && data.senderId === currentUserId);
            const newMsg: Message = {
              id: data._id || data.id || `msg-${Date.now()}`,
              sender: isSelf ? 'me' : 'them',
              text: data.content,
              time: new Date(data.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id || (m.text === newMsg.text && m.sender === newMsg.sender))) {
                return prev;
              }
              const updated = [...prev, newMsg];
              // Persist to stored users
              setUsers((prevUsers) => {
                const uList = prevUsers.map((u) => (u.id === id ? { ...u, messages: updated } : u));
                saveStoredUsers(uList);
                return uList;
              });
              return updated;
            });
          }
        });
      }
    };

    initChatRoom();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.off('chat:receive_message');
      }
    };
  }, [activeMatchId, currentUserId, id]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !id) return;

    const trimmedText = text.trim();
    const clientMessageId = `msg-${Date.now()}-${Math.random()}`;

    // Optimistically update UI
    const localMsg: Message = {
      id: clientMessageId,
      sender: 'me',
      text: trimmedText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => {
      const updated = [...prev, localMsg];
      setUsers((prevUsers) => {
        const uList = prevUsers.map((u) => (u.id === id ? { ...u, messages: updated } : u));
        saveStoredUsers(uList);
        return uList;
      });
      return updated;
    });
    setInputVal('');

    // Emit chat:send_message socket event to backend
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat:send_message', {
        matchId: activeMatchId,
        receiverId: id,
        content: trimmedText,
      });
    }
  };

  const handleSendInvite = async () => {
    setMeetModalVisible(false);
    
    await saveMeetupInvite(activeMatchId || 'me', (id as string) || 'partner', {
      place: meetPlace,
      date: meetDate,
      time: meetTime,
      note: meetNote,
    });

    const localInviteMsg: Message = {
      id: `invite-${Date.now()}`,
      sender: 'me',
      text: `📍 Meetup Invite: ${meetPlace} on ${meetDate} at ${meetTime}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, localInviteMsg]);
  };

  const handleAcceptInvite = (msgId: string) => {
    const updated = messages.map((m) => {
      if (m.id === msgId && m.inviteDetails) {
        return {
          ...m,
          inviteDetails: {
            ...m.inviteDetails,
            status: 'accepted' as const,
          },
        };
      }
      return m;
    });
    setMessages(updated);

    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.map((u) => {
        if (u.id === id) {
          return { ...u, messages: updated };
        }
        return u;
      });
      saveStoredUsers(updatedUsers);
      return updatedUsers;
    });
  };

  const handleDeclineInvite = (msgId: string) => {
    const updated = messages.map((m) => {
      if (m.id === msgId && m.inviteDetails) {
        return {
          ...m,
          inviteDetails: {
            ...m.inviteDetails,
            status: 'declined' as const,
          },
        };
      }
      return m;
    });
    setMessages(updated);

    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.map((u) => {
        if (u.id === id) {
          return { ...u, messages: updated };
        }
        return u;
      });
      saveStoredUsers(updatedUsers);
      return updatedUsers;
    });
  };

  const renderMessageBubble = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    
    if (item.isInvite && item.inviteDetails) {
      const details = item.inviteDetails;
      return (
        <View style={[styles.bubbleWrapper, isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
          <View style={styles.inviteCard}>
            <View style={styles.inviteCardHeader}>
              <Calendar size={15} color={Colors.pink} />
              <Text style={styles.inviteCardTitle}>Meetup Invitation</Text>
            </View>
            
            <View style={styles.inviteDetailRow}>
              <MapPin size={13} color={Colors.textSecondary} />
              <Text style={styles.inviteDetailText}>{details.place}</Text>
            </View>
            <View style={styles.inviteDetailRow}>
              <Clock size={13} color={Colors.textSecondary} />
              <Text style={styles.inviteDetailText}>{details.date} at {details.time}</Text>
            </View>
            {details.note ? (
              <Text style={styles.inviteNote}>&quot;{details.note}&quot;</Text>
            ) : null}

            {details.status === 'pending' ? (
              isMe ? (
                <Text style={styles.statusPendingLabel}>Awaiting response</Text>
              ) : (
                <View style={styles.inviteActions}>
                  <TouchableOpacity
                    onPress={() => handleDeclineInvite(item.id)}
                    style={[styles.inviteActionBtn, styles.declineBtn]}
                  >
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleAcceptInvite(item.id)}
                    style={[styles.inviteActionBtn, styles.acceptBtn]}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <View style={[styles.inviteStatusBadge, details.status === 'accepted' ? styles.statusAccepted : styles.statusDeclined]}>
                <Text style={[styles.inviteStatusBadgeText, details.status === 'accepted' ? styles.statusAcceptedText : styles.statusDeclinedText]}>
                  {details.status === 'accepted' ? '✓ Invitation Accepted' : '✗ Invitation Declined'}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
        <View
          style={[
            styles.bubble,
            isMe ? styles.myBubble : styles.theirBubble,
          ]}
        >
          <Text style={[styles.bubbleText, isMe ? styles.myBubbleText : styles.theirBubbleText]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        
        {recipient && (
          <View style={styles.headerInfo}>
            <Avatar source={recipient.avatar} size={40} showOnlineStatus online={recipient.online} />
            <View style={styles.headerNameWrapper}>
              <View style={styles.headerNameRow}>
                <Text style={styles.headerName}>{recipient.name}</Text>
                {recipient.verificationStatus === 'verified' && <VerifiedBadge size={13} />}
              </View>
              <Text style={styles.headerStatus}>
                {recipient.online ? 'Online now' : 'Offline'}
              </Text>
            </View>
          </View>
        )}
        
        <TouchableOpacity style={styles.menuBtn}>
          <MoreVertical size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Shared Topic Banner */}
      <View style={styles.sharedTopicBanner}>
        <Text style={styles.sharedTopicText}>
          You matched from a vibe about <Text style={styles.bannerHighlight}>{activeTopic}</Text>
        </Text>
      </View>

      {/* Message List */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.chatContainer}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageBubble}
          contentContainerStyle={styles.listContent}
        />

        {/* Icebreaker suggest system */}
        {messages.length === 0 && (
          <View style={styles.icebreakerContainer}>
            <Text style={styles.icebreakerLabel}>💡 SUGGESTED ICEBREAKER</Text>
            <TouchableOpacity
              onPress={() => setInputVal(icebreakerText)}
              activeOpacity={0.8}
              style={styles.icebreakerBtn}
            >
              <Text style={styles.icebreakerText}>{icebreakerText}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input area */}
        <View style={styles.inputArea}>
          <TouchableOpacity
            onPress={() => setMeetModalVisible(true)}
            style={styles.plusBtn}
          >
            <Plus size={20} color={Colors.pink} strokeWidth={2.5} />
          </TouchableOpacity>
          
          <View style={styles.textInputWrapper}>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor={Colors.textMuted}
              value={inputVal}
              onChangeText={setInputVal}
              style={styles.chatInput}
              multiline
            />
          </View>

          <TouchableOpacity
            onPress={() => handleSendMessage(inputVal)}
            disabled={!inputVal.trim()}
            style={[styles.sendBtn, !inputVal.trim() && styles.sendBtnDisabled]}
          >
            <Send size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Plan Meetup Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={meetModalVisible}
        onRequestClose={() => setMeetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Plan a Meetup</Text>
              <TouchableOpacity onPress={() => setMeetModalVisible(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Place select */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>WHERE</Text>
                <View style={styles.formInputWrapper}>
                  <MapPin size={18} color={Colors.pink} />
                  <TextInput
                    value={meetPlace}
                    onChangeText={setMeetPlace}
                    style={styles.formInput}
                  />
                </View>
              </View>

              {/* Date select */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DATE</Text>
                <View style={styles.formInputWrapper}>
                  <Calendar size={18} color={Colors.pink} />
                  <TextInput
                    value={meetDate}
                    onChangeText={setMeetDate}
                    style={styles.formInput}
                  />
                </View>
              </View>

              {/* Time select */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>TIME</Text>
                <View style={styles.formInputWrapper}>
                  <Clock size={18} color={Colors.pink} />
                  <TextInput
                    value={meetTime}
                    onChangeText={setMeetTime}
                    style={styles.formInput}
                  />
                </View>
              </View>

              {/* Notes input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>NOTE (OPTIONAL)</Text>
                <View style={styles.formInputWrapper}>
                  <TextInput
                    value={meetNote}
                    onChangeText={setMeetNote}
                    placeholder="E.g. Let's grab coffee!"
                    placeholderTextColor={Colors.textMuted}
                    style={[styles.formInput, { paddingLeft: 0 }]}
                  />
                </View>
              </View>
            </ScrollView>

            <Button
              onPress={handleSendInvite}
              title="SEND MEETUP INVITATION"
              style={styles.modalSubmitBtn}
            />
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    gap: 10,
  },
  headerNameWrapper: {
    justifyContent: 'center',
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  headerStatus: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  menuBtn: {
    padding: 8,
  },
  sharedTopicBanner: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.veryLightPink,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  sharedTopicText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bannerHighlight: {
    color: Colors.pink,
    fontWeight: '800',
  },
  chatContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 2,
  },
  myBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  theirBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: Colors.pink,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  myBubbleText: {
    color: Colors.white,
  },
  theirBubbleText: {
    color: Colors.text,
  },
  timeText: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTimeText: {
    color: Colors.textMuted,
  },
  icebreakerContainer: {
    paddingHorizontal: 20,
    marginVertical: 12,
    alignItems: 'center',
  },
  icebreakerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  icebreakerBtn: {
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1.5,
    borderColor: Colors.lightPink,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  icebreakerText: {
    color: Colors.pink,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  plusBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1,
    borderColor: Colors.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1.5,
    borderColor: Colors.lightPink,
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginRight: 8,
  },
  chatInput: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
  inviteCard: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.pink,
    borderRadius: 20,
    padding: 16,
    width: 250,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  inviteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inviteCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  inviteDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  inviteDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  inviteNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 16,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  inviteActionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1,
    borderColor: Colors.lightPink,
  },
  declineText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  acceptBtn: {
    backgroundColor: Colors.pink,
  },
  acceptText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  statusPendingLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },
  inviteStatusBadge: {
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 14,
    alignItems: 'center',
  },
  statusAccepted: {
    backgroundColor: Colors.successLight,
  },
  statusAcceptedText: {
    color: Colors.success,
  },
  statusDeclined: {
    backgroundColor: Colors.veryLightPink,
  },
  statusDeclinedText: {
    color: Colors.textSecondary,
  },
  inviteStatusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  modalBody: {
    maxHeight: 280,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  formInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1.5,
    borderColor: Colors.lightPink,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 12,
    gap: 8,
  },
  formInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    height: '100%',
  },
  modalSubmitBtn: {
    marginTop: 10,
  },
});
