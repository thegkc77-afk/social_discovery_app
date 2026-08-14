// chat.ts stub
import { Message } from '../data/mockData';

export const sendChatMessage = async (
  senderId: string, 
  receiverId: string, 
  text: string
): Promise<Message> => {
  console.log(`[Chat Service] Message from ${senderId} to ${receiverId}: ${text}`);
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    id: Date.now().toString(),
    sender: 'me',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

export const saveMeetupInvite = async (
  senderId: string,
  receiverId: string,
  invite: { place: string; date: string; time: string; note: string }
): Promise<Message> => {
  console.log(`[Chat Service] Meetup planned by ${senderId} for ${receiverId}:`, invite);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    id: Date.now().toString(),
    sender: 'me',
    text: `Meetup Planned: ${invite.place} on ${invite.date} at ${invite.time}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isInvite: true,
    inviteDetails: {
      ...invite,
      status: 'pending'
    }
  };
};
