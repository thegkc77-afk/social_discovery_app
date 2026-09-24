export interface MeetupItem {
  id: string;
  matchId: string;
  conversationId: string;
  createdById: string;
  isCreator: boolean;
  date: string;
  startTime: string;
  endTime: string;
  place: {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  note?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface CreateMeetupPayload {
  matchId: string;
  date: string;
  startTime: string;
  endTime: string;
  placeName: string;
  placeAddress: string;
  note?: string;
}

export const createMeetup = async (payload: CreateMeetupPayload): Promise<MeetupItem | null> => {
  return {
    id: `meetup-${Date.now()}`,
    matchId: payload.matchId,
    conversationId: payload.matchId,
    createdById: 'me',
    isCreator: true,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    place: {
      name: payload.placeName,
      address: payload.placeAddress,
    },
    note: payload.note,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const respondToMeetup = async (meetupId: string, response: 'ACCEPT' | 'DECLINE'): Promise<MeetupItem | null> => {
  return null;
};

export const cancelMeetup = async (meetupId: string): Promise<MeetupItem | null> => {
  return null;
};

export const fetchMatchMeetups = async (matchId: string): Promise<MeetupItem[]> => {
  return [];
};
