import { v4 as uuidv4 } from 'uuid';
import { sqlite } from './sqlite.js';
import { supabase, isSupabaseConfigured } from './supabase.js';

export interface User {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  passwordHash: string;
  dateOfBirth?: string | null;
  gender?: string;
  bio?: string;
  occupation?: string;
  education?: string;
  relationshipGoal?: string;
  avatar?: string;
  photos: string[];
  interests: string[];
  intents: string[];
  isVerified: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  accountStatus: 'active' | 'suspended' | 'deleted';
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TalkNowSession {
  id: string;
  userId: string;
  topic: string;
  status: 'searching' | 'matched' | 'cancelled' | 'expired';
  latitude?: number;
  longitude?: number;
  startedAt: string;
  expiresAt: string;
  matchedAt?: string;
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  topic: string;
  status: 'active' | 'ended';
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface MeetProposal {
  id: string;
  matchId: string;
  proposedBy: string;
  recipientId: string;
  place: string;
  date: string;
  time: string;
  note?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export interface FeedPost {
  id: string;
  userId: string;
  caption?: string;
  visibility: string;
  createdAt: string;
  media: { id: string; url: string; position: number }[];
  user: {
    id: string;
    name: string;
    age: number;
    avatar: string;
    bio?: string;
    verificationStatus?: string;
    isVerified?: boolean;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

const DEFAULT_INTERESTS = [
  { id: 'gaming', name: 'Gaming' },
  { id: 'dancing', name: 'Dancing' },
  { id: 'music', name: 'Music' },
  { id: 'movies', name: 'Movies' },
  { id: 'photography', name: 'Photography' },
  { id: 'books', name: 'Books' },
  { id: 'traveling', name: 'Traveling' },
  { id: 'gym_fitness', name: 'Gym & Fitness' },
];

const DEFAULT_INTENTS = [
  { id: 'dating', name: 'Dating' },
  { id: 'friendship', name: 'Friendship' },
  { id: 'networking', name: 'Networking' },
  { id: 'just_talking', name: 'Just Talking' },
];

function calculateAge(dob?: string | null): number {
  if (!dob) return 23;
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(age) || age < 18 ? 23 : age;
}

class DatabaseStore {
  public getInterests() {
    return DEFAULT_INTERESTS;
  }

  public getIntents() {
    return DEFAULT_INTENTS;
  }

  public createOtp(phone: string, otp: string): { id: string; expiresAt: string } {
    const id = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();

    sqlite.prepare('DELETE FROM otps WHERE phone = ?').run(phone);
    sqlite
      .prepare('INSERT INTO otps (id, phone, otp, expires_at, verified, created_at) VALUES (?, ?, ?, ?, 0, ?)')
      .run(id, phone, otp, expiresAt, now.toISOString());

    return { id, expiresAt };
  }

  public verifyOtp(phone: string, inputOtp: string): boolean {
    const row = sqlite
      .prepare('SELECT * FROM otps WHERE phone = ? AND otp = ? AND verified = 0 ORDER BY created_at DESC LIMIT 1')
      .get(phone, inputOtp) as any;

    if (!row) return false;

    if (new Date(row.expires_at).getTime() < Date.now()) {
      return false;
    }

    sqlite.prepare('UPDATE otps SET verified = 1 WHERE id = ?').run(row.id);
    return true;
  }

  public async createUser(user: User): Promise<User> {
    const stmt = sqlite.prepare(`
      INSERT INTO users (
        id, name, email, phone, password_hash, date_of_birth, gender, bio,
        occupation, education, relationship_goal, avatar, is_verified, account_status,
        two_factor_enabled, phone_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.name,
      user.email || null,
      user.phone || null,
      user.passwordHash,
      user.dateOfBirth || null,
      user.gender || '',
      user.bio || '',
      user.occupation || '',
      user.education || '',
      user.relationshipGoal || '',
      user.avatar || '',
      user.isVerified ? 1 : 0,
      user.accountStatus || 'active',
      user.twoFactorEnabled ? 1 : 0,
      user.phoneVerified ? 1 : 0,
      user.createdAt,
      user.updatedAt
    );

    if (user.photos && user.photos.length > 0) {
      this.setUserPhotos(user.id, user.photos);
    }
    if (user.interests && user.interests.length > 0) {
      this.setUserInterests(user.id, user.interests);
    }
    if (user.intents && user.intents.length > 0) {
      this.setUserIntents(user.id, user.intents);
    }
    if (user.location) {
      this.setUserLocation(user.id, user.location.name, user.location.latitude, user.location.longitude);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          display_name: user.name,
          phone: user.phone || null,
          email: user.email || null,
          date_of_birth: user.dateOfBirth || '2000-01-01',
          gender: user.gender || '',
          bio: user.bio || '',
          occupation: user.occupation || '',
          education: user.education || '',
          relationship_goal: user.relationshipGoal || '',
          avatar_path: user.avatar || '',
          account_status: user.accountStatus || 'active',
          two_factor_enabled: Boolean(user.twoFactorEnabled),
          phone_verified: Boolean(user.phoneVerified),
          onboarding_completed: user.isVerified,
        });
      } catch (e) {
        console.warn('[Supabase Sync Warning]', e);
      }
    }

    return user;
  }

  public findUserById(id: string): User | undefined {
    const row = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return this.hydrateUser(row);
  }

  public findUserByEmail(email: string): User | undefined {
    const row = sqlite.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
    if (!row) return undefined;
    return this.hydrateUser(row);
  }

  public findUserByPhone(phone: string): User | undefined {
    const row = sqlite.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any;
    if (!row) return undefined;
    return this.hydrateUser(row);
  }

  private hydrateUser(row: any): User {
    const photos = (
      sqlite
        .prepare('SELECT url FROM profile_photos WHERE user_id = ? ORDER BY display_order ASC')
        .all(row.id) as any[]
    ).map((p) => p.url);

    const interests = (
      sqlite.prepare('SELECT interest FROM user_interests WHERE user_id = ?').all(row.id) as any[]
    ).map((i) => i.interest);

    const intents = (
      sqlite.prepare('SELECT intent FROM user_intents WHERE user_id = ?').all(row.id) as any[]
    ).map((i) => i.intent);

    const loc = sqlite.prepare('SELECT * FROM user_locations WHERE user_id = ?').get(row.id) as any;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      passwordHash: row.password_hash,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      bio: row.bio,
      occupation: row.occupation,
      education: row.education,
      relationshipGoal: row.relationship_goal,
      avatar: row.avatar || (photos.length > 0 ? photos[0] : ''),
      photos,
      interests,
      intents,
      isVerified: Boolean(row.is_verified),
      phoneVerified: Boolean(row.phone_verified),
      twoFactorEnabled: Boolean(row.two_factor_enabled),
      accountStatus: row.account_status,
      location: loc
        ? {
            name: loc.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
            updatedAt: loc.updated_at,
          }
        : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const existing = this.findUserById(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    sqlite
      .prepare(`
      UPDATE users SET
        name = ?, email = ?, phone = ?, date_of_birth = ?, gender = ?,
        bio = ?, occupation = ?, education = ?, relationship_goal = ?,
        avatar = ?, is_verified = ?, account_status = ?, two_factor_enabled = ?,
        phone_verified = ?, updated_at = ?
      WHERE id = ?
    `)
      .run(
        updated.name,
        updated.email || null,
        updated.phone || null,
        updated.dateOfBirth || null,
        updated.gender || '',
        updated.bio || '',
        updated.occupation || '',
        updated.education || '',
        updated.relationshipGoal || '',
        updated.avatar || '',
        updated.isVerified ? 1 : 0,
        updated.accountStatus || 'active',
        updated.twoFactorEnabled ? 1 : 0,
        updated.phoneVerified ? 1 : 0,
        updated.updatedAt,
        id
      );

    if (updates.photos !== undefined) {
      this.setUserPhotos(id, updates.photos);
    }
    if (updates.interests !== undefined) {
      this.setUserInterests(id, updates.interests);
    }
    if (updates.intents !== undefined) {
      this.setUserIntents(id, updates.intents);
    }
    if (updates.location) {
      this.setUserLocation(id, updates.location.name, updates.location.latitude, updates.location.longitude);
    }

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('profiles')
        .update({
          display_name: updated.name,
          phone: updated.phone || null,
          email: updated.email || null,
          date_of_birth: updated.dateOfBirth,
          gender: updated.gender,
          bio: updated.bio,
          occupation: updated.occupation,
          education: updated.education,
          relationship_goal: updated.relationshipGoal,
          avatar_path: updated.avatar,
          two_factor_enabled: updated.twoFactorEnabled,
          phone_verified: updated.phoneVerified,
          onboarding_completed: updated.isVerified,
          updated_at: updated.updatedAt,
        })
        .eq('id', id)
        .then(() => {});
    }

    return this.findUserById(id) || null;
  }

  public setUserPhotos(userId: string, photoUrls: string[]) {
    sqlite.prepare('DELETE FROM profile_photos WHERE user_id = ?').run(userId);
    const stmt = sqlite.prepare(
      'INSERT INTO profile_photos (id, user_id, url, display_order, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    const now = new Date().toISOString();
    photoUrls.forEach((url, idx) => {
      stmt.run(uuidv4(), userId, url, idx, now);
    });

    if (photoUrls.length > 0) {
      sqlite.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(photoUrls[0], userId);
    }

    if (isSupabaseConfigured() && supabase) {
      supabase.from('profile_photos').delete().eq('user_id', userId).then(() => {
        const records = photoUrls.map((url, idx) => ({
          user_id: userId,
          storage_path: url,
          display_order: idx,
          is_primary: idx === 0,
        }));
        if (records.length > 0 && supabase) supabase.from('profile_photos').insert(records);
      });
    }
  }

  public setUserInterests(userId: string, interests: string[]) {
    sqlite.prepare('DELETE FROM user_interests WHERE user_id = ?').run(userId);
    const stmt = sqlite.prepare('INSERT INTO user_interests (user_id, interest) VALUES (?, ?)');
    interests.forEach((item) => {
      stmt.run(userId, item);
    });
  }

  public setUserIntents(userId: string, intents: string[]) {
    sqlite.prepare('DELETE FROM user_intents WHERE user_id = ?').run(userId);
    const stmt = sqlite.prepare('INSERT INTO user_intents (user_id, intent) VALUES (?, ?)');
    intents.forEach((item) => {
      stmt.run(userId, item);
    });
  }

  public setUserLocation(userId: string, name: string, lat?: number, lng?: number) {
    const now = new Date().toISOString();
    sqlite.prepare('DELETE FROM user_locations WHERE user_id = ?').run(userId);
    sqlite
      .prepare('INSERT INTO user_locations (user_id, name, latitude, longitude, updated_at) VALUES (?, ?, ?, ?, ?)')
      .run(userId, name, lat || null, lng || null, now);
  }

  public getAllActiveUsers(excludeId?: string): User[] {
    let query = "SELECT id FROM users WHERE account_status = 'active'";
    const params: any[] = [];
    if (excludeId) {
      query += ` AND id != ? AND id NOT IN (
        SELECT blocked_id FROM blocks WHERE blocker_id = ?
        UNION
        SELECT blocker_id FROM blocks WHERE blocked_id = ?
      )`;
      params.push(excludeId, excludeId, excludeId);
    }
    const rows = sqlite.prepare(query).all(...params) as any[];
    return rows.map((r) => this.findUserById(r.id)!).filter(Boolean);
  }

  public createTalkNowSession(session: TalkNowSession): TalkNowSession {
    sqlite
      .prepare("UPDATE talk_now_sessions SET status = 'cancelled' WHERE user_id = ? AND status = 'searching'")
      .run(session.userId);

    sqlite
      .prepare(`
      INSERT INTO talk_now_sessions (id, user_id, topic, status, latitude, longitude, started_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .run(
        session.id,
        session.userId,
        session.topic,
        session.status,
        session.latitude || null,
        session.longitude || null,
        session.startedAt,
        session.expiresAt
      );

    if (isSupabaseConfigured() && supabase) {
      supabase.from('talk_now_sessions').insert({
        id: session.id,
        user_id: session.userId,
        intent: 'General',
        topic: session.topic,
        status: session.status,
        started_at: session.startedAt,
        expires_at: session.expiresAt,
      }).then(() => {});
    }

    return session;
  }

  public getActiveSession(userId: string): TalkNowSession | undefined {
    const row = sqlite
      .prepare(`
      SELECT * FROM talk_now_sessions
      WHERE user_id = ? AND status = 'searching' AND expires_at > datetime('now')
      ORDER BY started_at DESC LIMIT 1
    `)
      .get(userId) as any;

    if (!row) return undefined;
    return {
      id: row.id,
      userId: row.user_id,
      topic: row.topic,
      status: row.status,
      latitude: row.latitude,
      longitude: row.longitude,
      startedAt: row.started_at,
      expiresAt: row.expires_at,
      matchedAt: row.matched_at,
    };
  }

  public cancelTalkNowSession(userId: string): boolean {
    const info = sqlite
      .prepare("UPDATE talk_now_sessions SET status = 'cancelled' WHERE user_id = ? AND status = 'searching'")
      .run(userId);
    return info.changes > 0;
  }

  public findTalkNowMatch(userId: string, topic: string): { candidate: User; candidateSessionId?: string } | null {
    const now = new Date().toISOString();
    const normalizedTopic = topic.toLowerCase();

    const otherSessions = sqlite
      .prepare(`
      SELECT s.id, s.user_id, s.topic FROM talk_now_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id != ?
        AND s.status = 'searching'
        AND s.expires_at > ?
        AND u.account_status = 'active'
        AND s.user_id NOT IN (
          SELECT blocked_id FROM blocks WHERE blocker_id = ?
          UNION
          SELECT blocker_id FROM blocks WHERE blocked_id = ?
        )
      ORDER BY s.started_at ASC
    `)
      .all(userId, now, userId, userId) as any[];

    for (const s of otherSessions) {
      const sTopic = s.topic.toLowerCase();
      if (normalizedTopic === 'general' || sTopic === 'general' || sTopic === normalizedTopic) {
        const candidate = this.findUserById(s.user_id);
        if (candidate) return { candidate, candidateSessionId: s.id };
      }
    }

    return null;
  }

  public createMatch(userAId: string, userBId: string, topic: string): Match {
    const existing = sqlite
      .prepare(`
      SELECT * FROM matches
      WHERE status = 'active'
        AND ((user_a_id = ? AND user_b_id = ?) OR (user_a_id = ? AND user_b_id = ?))
      LIMIT 1
    `)
      .get(userAId, userBId, userBId, userAId) as any;

    if (existing) {
      return {
        id: existing.id,
        userAId: existing.user_a_id,
        userBId: existing.user_b_id,
        topic: existing.topic,
        status: existing.status,
        createdAt: existing.created_at,
      };
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    sqlite
      .prepare('INSERT INTO matches (id, user_a_id, user_b_id, topic, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, userAId, userBId, topic, 'active', now);

    if (isSupabaseConfigured() && supabase) {
      const uA = userAId < userBId ? userAId : userBId;
      const uB = userAId < userBId ? userBId : userAId;
      supabase.from('matches').insert({
        id,
        user_a_id: uA,
        user_b_id: uB,
        topic,
        status: 'active',
        created_at: now,
      }).then(() => {
        if (supabase) {
          supabase.from('conversations').insert({
            id: uuidv4(),
            match_id: id,
            created_at: now,
          }).then(() => {});
        }
      });
    }

    return { id, userAId, userBId, topic, status: 'active', createdAt: now };
  }

  public getMatchesForUser(userId: string): Match[] {
    const rows = sqlite
      .prepare("SELECT * FROM matches WHERE status = 'active' AND (user_a_id = ? OR user_b_id = ?) ORDER BY created_at DESC")
      .all(userId, userId) as any[];

    return rows.map((r) => ({
      id: r.id,
      userAId: r.user_a_id,
      userBId: r.user_b_id,
      topic: r.topic,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  public findMatchById(matchId: string): Match | undefined {
    const r = sqlite.prepare('SELECT * FROM matches WHERE id = ?').get(matchId) as any;
    if (!r) return undefined;
    return {
      id: r.id,
      userAId: r.user_a_id,
      userBId: r.user_b_id,
      topic: r.topic,
      status: r.status,
      createdAt: r.created_at,
    };
  }

  public endMatch(matchId: string): boolean {
    const info = sqlite.prepare("UPDATE matches SET status = 'ended' WHERE id = ?").run(matchId);
    return info.changes > 0;
  }

  public createMessage(matchId: string, senderId: string, content: string): Message {
    const id = uuidv4();
    const now = new Date().toISOString();
    sqlite
      .prepare('INSERT INTO messages (id, match_id, sender_id, content, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(id, matchId, senderId, content, now);

    if (isSupabaseConfigured() && supabase) {
      supabase.from('conversations').select('id').eq('match_id', matchId).limit(1).then(({ data }) => {
        const conversationId = data && data[0] ? data[0].id : matchId;
        if (supabase) {
          supabase.from('messages').insert({
            id,
            conversation_id: conversationId,
            sender_id: senderId,
            body: content,
            created_at: now,
          }).then(() => {});
        }
      });
    }

    return { id, matchId, senderId, content, createdAt: now };
  }

  public getMessagesForMatch(matchId: string, limit = 50): Message[] {
    const rows = sqlite
      .prepare('SELECT * FROM messages WHERE match_id = ? ORDER BY created_at ASC LIMIT ?')
      .all(matchId, limit) as any[];

    return rows.map((r) => ({
      id: r.id,
      matchId: r.match_id,
      senderId: r.sender_id,
      content: r.content,
      createdAt: r.created_at,
    }));
  }

  public getLastMessageForMatch(matchId: string): Message | undefined {
    const r = sqlite
      .prepare('SELECT * FROM messages WHERE match_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(matchId) as any;

    if (!r) return undefined;
    return {
      id: r.id,
      matchId: r.match_id,
      senderId: r.sender_id,
      content: r.content,
      createdAt: r.created_at,
    };
  }

  public createMeetProposal(proposal: MeetProposal): MeetProposal {
    sqlite
      .prepare(`
      INSERT INTO meet_proposals (id, match_id, proposed_by, recipient_id, place, date, time, note, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .run(
        proposal.id,
        proposal.matchId,
        proposal.proposedBy,
        proposal.recipientId,
        proposal.place,
        proposal.date,
        proposal.time,
        proposal.note || '',
        proposal.status || 'PENDING',
        proposal.createdAt
      );

    return proposal;
  }

  public getMeetProposalsForMatch(matchId: string): MeetProposal[] {
    const rows = sqlite.prepare('SELECT * FROM meet_proposals WHERE match_id = ? ORDER BY created_at DESC').all(matchId) as any[];
    return rows.map((r) => ({
      id: r.id,
      matchId: r.match_id,
      proposedBy: r.proposed_by,
      recipientId: r.recipient_id,
      place: r.place,
      date: r.date,
      time: r.time,
      note: r.note,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  public blockUser(blockerId: string, blockedId: string) {
    const id = `blk_${Date.now()}`;
    const now = new Date().toISOString();
    sqlite.prepare('INSERT OR IGNORE INTO blocks (id, blocker_id, blocked_id, created_at) VALUES (?, ?, ?, ?)').run(
      id,
      blockerId,
      blockedId,
      now
    );
  }

  public createPost(userId: string, caption: string, mediaUrl: string) {
    const id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    sqlite.prepare('INSERT INTO posts (id, user_id, caption, media_url, likes_count, created_at) VALUES (?, ?, ?, ?, 0, ?)').run(
      id,
      userId,
      caption,
      mediaUrl,
      now
    );
    return id;
  }

  public toggleLike(postId: string, userId: string): boolean {
    const exists = sqlite.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(postId, userId);
    if (exists) {
      sqlite.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(postId, userId);
      sqlite.prepare('UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(postId);
      return false;
    } else {
      sqlite.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
      sqlite.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
      return true;
    }
  }

  public getFeed(currentUserId?: string): FeedPost[] {
    const rows = sqlite
      .prepare('SELECT p.*, u.name, u.avatar, u.date_of_birth, u.bio, u.is_verified FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 30')
      .all() as any[];

    return rows.map((r) => {
      let likedByMe = false;
      if (currentUserId) {
        likedByMe = Boolean(
          sqlite.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(r.id, currentUserId)
        );
      }

      return {
        id: r.id,
        userId: r.user_id,
        caption: r.caption,
        visibility: 'PUBLIC',
        createdAt: r.created_at,
        media: [{ id: `m_${r.id}`, url: r.media_url, position: 1 }],
        user: {
          id: r.user_id,
          name: r.name,
          age: calculateAge(r.date_of_birth),
          avatar: r.avatar,
          bio: r.bio,
          verificationStatus: r.is_verified ? 'verified' : 'not_started',
          isVerified: Boolean(r.is_verified),
        },
        likeCount: r.likes_count,
        commentCount: 0,
        likedByMe,
      };
    });
  }

  public createStory(userId: string, mediaUrl: string) {
    const id = `story_${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    sqlite.prepare('INSERT INTO stories (id, user_id, media_url, expires_at, created_at) VALUES (?, ?, ?, ?, ?)').run(
      id,
      userId,
      mediaUrl,
      expiresAt,
      now.toISOString()
    );
  }

  public getStories() {
    const rows = sqlite
      .prepare(`
      SELECT s.*, u.name, u.avatar, u.is_verified
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.expires_at > datetime('now')
      ORDER BY s.created_at DESC
    `)
      .all() as any[];

    const groups = new Map<string, any>();
    for (const r of rows) {
      if (!groups.has(r.user_id)) {
        groups.set(r.user_id, {
          user: {
            id: r.user_id,
            name: r.name,
            avatar: r.avatar,
            isVerified: Boolean(r.is_verified),
          },
          stories: [],
        });
      }
      groups.get(r.user_id).stories.push({
        id: r.id,
        mediaUrl: r.media_url,
        createdAt: r.created_at,
        expiresAt: r.expires_at,
        viewCount: 1,
        viewedByMe: false,
      });
    }

    return Array.from(groups.values());
  }
}

export const db = new DatabaseStore();
