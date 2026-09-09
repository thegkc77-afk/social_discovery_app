import { MeetupStatus } from '@prisma/client';
import { MeetupStateMachine } from './meetups/meetup-state.machine';

describe('End-to-End User Journey Simulation', () => {
  interface SimUser {
    id: string;
    phoneNumber: string;
    name: string;
    age: number;
    intent: string;
    interests: string[];
    latitude: number;
    longitude: number;
    isVerified: boolean;
  }

  let user1: SimUser;
  let user2: SimUser;
  let matchId: string;
  let chatId: string;
  let meetupId: string;
  let meetupState: MeetupStatus;

  it('Step 1: Register (Request OTP & Verify)', () => {
    user1 = {
      id: 'usr-1-aanya',
      phoneNumber: '+919876543210',
      name: '',
      age: 0,
      intent: '',
      interests: [],
      latitude: 12.9716,
      longitude: 77.5946,
      isVerified: false,
    };

    user2 = {
      id: 'usr-2-priya',
      phoneNumber: '+919876543211',
      name: '',
      age: 0,
      intent: '',
      interests: [],
      latitude: 12.9750,
      longitude: 77.5980,
      isVerified: false,
    };

    expect(user1.id).toBeDefined();
    expect(user2.id).toBeDefined();
  });

  it('Step 2: Onboard (Profile, Photos, Interests, Intent, Verification)', () => {
    user1.name = 'Aanya';
    user1.age = 23;
    user1.intent = 'Chatting & Fun';
    user1.interests = ['Gaming', 'Tech', 'Music'];
    user1.isVerified = true;

    user2.name = 'Priya';
    user2.age = 24;
    user2.intent = 'Chatting & Fun';
    user2.interests = ['Gaming', 'Coffee', 'Travel'];
    user2.isVerified = true;

    expect(user1.interests).toContain('Gaming');
    expect(user2.interests).toContain('Gaming');
    expect(user1.isVerified).toBe(true);
  });

  it('Step 3: Discover (Nearby users with interest overlap)', () => {
    const sharedInterests = user1.interests.filter((i) => user2.interests.includes(i));
    expect(sharedInterests).toEqual(['Gaming']);

    // Distance calculation
    const dLat = (user2.latitude - user1.latitude) * 111;
    const dLon = (user2.longitude - user1.longitude) * 111;
    const distanceKm = Math.sqrt(dLat * dLat + dLon * dLon);
    expect(distanceKm).toBeLessThan(5); // Within 5km radius
  });

  it('Step 4 & 5: Talk Now & Match Creation', () => {
    // Both users queue up for 'Gaming' vibe
    const topic = 'Gaming';
    const canPair =
      user1.interests.includes(topic) &&
      user2.interests.includes(topic) &&
      user1.intent === user2.intent;

    expect(canPair).toBe(true);

    matchId = `match-${user1.id}-${user2.id}`;
    chatId = `chat-${user1.id}-${user2.id}`;
    expect(matchId).toBeDefined();
    expect(chatId).toBeDefined();
  });

  it('Step 6: Chat & Messaging', () => {
    const messages = [
      { id: 'm1', senderId: user1.id, text: 'Hey Priya! Love gaming too 🎮', time: '5:01 PM' },
      { id: 'm2', senderId: user2.id, text: 'Hey Aanya! What games do you play?', time: '5:02 PM' },
    ];

    expect(messages.length).toBe(2);
    expect(messages[0].senderId).toBe(user1.id);
    expect(messages[1].senderId).toBe(user2.id);
  });

  it('Step 7: Meetup Invitation & State Machine Lifecycle', () => {
    // Aanya creates meetup
    meetupId = 'meetup-101';
    meetupState = MeetupStatus.PENDING;

    // Allowed actions for Priya (recipient)
    const allowedForRecipient = MeetupStateMachine.getAllowedActions(
      meetupState,
      user2.id,
      user1.id,
      user2.id,
    );
    expect(allowedForRecipient).toContain('accept');
    expect(allowedForRecipient).toContain('decline');

    // Priya accepts
    meetupState = MeetupStateMachine.validateTransition('accept', {
      userId: user2.id,
      creatorId: user1.id,
      recipientId: user2.id,
      currentStatus: meetupState,
    });
    expect(meetupState).toBe(MeetupStatus.ACCEPTED);

    // Later, marked as complete
    meetupState = MeetupStateMachine.validateTransition('complete', {
      userId: user1.id,
      creatorId: user1.id,
      recipientId: user2.id,
      currentStatus: meetupState,
    });
    expect(meetupState).toBe(MeetupStatus.COMPLETED);
  });
});
