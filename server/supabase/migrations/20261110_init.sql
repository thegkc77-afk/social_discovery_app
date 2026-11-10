-- VibeMatch Production Schema Migration (PostgreSQL / Supabase)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    bio TEXT,
    occupation TEXT,
    education TEXT,
    relationship_goal TEXT,
    avatar_path TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT adult_check CHECK (date_of_birth <= (CURRENT_DATE - INTERVAL '18 years'))
);

-- 2. Profile Photos
CREATE TABLE IF NOT EXISTS public.profile_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Interests & User Interests
CREATE TABLE IF NOT EXISTS public.interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.user_interests (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    interest_id UUID REFERENCES public.interests(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, interest_id)
);

-- 4. Discovery Preferences
CREATE TABLE IF NOT EXISTS public.discovery_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    preferred_genders TEXT[] DEFAULT ARRAY['Any'],
    min_age INT DEFAULT 18 CHECK (min_age >= 18),
    max_age INT DEFAULT 99 CHECK (max_age >= min_age),
    max_distance_km NUMERIC DEFAULT 5 CHECK (max_distance_km > 0 AND max_distance_km <= 50),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. User Locations
CREATE TABLE IF NOT EXISTS public.user_locations (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    location_expires_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW() + INTERVAL '12 hours')
);

CREATE INDEX IF NOT EXISTS idx_user_locations_spatial ON public.user_locations USING GIST (location);

-- 6. Talk Now Sessions
CREATE TABLE IF NOT EXISTS public.talk_now_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    intent TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT DEFAULT 'searching' CHECK (status IN ('searching', 'matched', 'cancelled', 'expired')),
    started_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW() + INTERVAL '15 minutes'),
    matched_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_active_searching_session ON public.talk_now_sessions (user_id) WHERE status = 'searching';

-- 7. Matches, Conversations & Messages
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_b_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT canonical_participants CHECK (user_a_id < user_b_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID UNIQUE NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    last_message_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);

-- 8. Safety & Meet Planning
CREATE TABLE IF NOT EXISTS public.blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.meet_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    proposed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    place_name TEXT NOT NULL,
    proposed_at TIMESTAMPTZ NOT NULL,
    note TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talk_now_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meet_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are readable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (account_status = 'active');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Users manage own photos" ON public.profile_photos FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users manage own preferences" ON public.discovery_preferences FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users manage own location" ON public.user_locations FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users manage own talk now session" ON public.talk_now_sessions FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Participants view match" ON public.matches FOR SELECT TO authenticated USING (auth.uid() IN (user_a_id, user_b_id));
CREATE POLICY "Participants view conversation" ON public.conversations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = conversations.match_id AND auth.uid() IN (m.user_a_id, m.user_b_id)));
CREATE POLICY "Participants read messages" ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations c JOIN public.matches m ON c.match_id = m.id WHERE c.id = messages.conversation_id AND auth.uid() IN (m.user_a_id, m.user_b_id)));
CREATE POLICY "Participants insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversations c JOIN public.matches m ON c.match_id = m.id WHERE c.id = messages.conversation_id AND auth.uid() IN (m.user_a_id, m.user_b_id)));

-- 10. Atomic Matching RPC Function
CREATE OR REPLACE FUNCTION public.start_talk_now(
    p_intent TEXT,
    p_topic TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_candidate_id UUID;
    v_candidate_session_id UUID;
    v_match_id UUID;
    v_conv_id UUID;
    v_user_a UUID;
    v_user_b UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNAUTHORIZED');
    END IF;

    -- Clean expired sessions
    UPDATE public.talk_now_sessions
    SET status = 'expired'
    WHERE status = 'searching' AND expires_at <= NOW();

    -- Find candidate session with row lock
    SELECT s.id, s.user_id
    INTO v_candidate_session_id, v_candidate_id
    FROM public.talk_now_sessions s
    JOIN public.profiles p ON p.id = s.user_id
    WHERE s.status = 'searching'
      AND s.expires_at > NOW()
      AND s.user_id != v_user_id
      AND (s.topic = p_topic OR p_topic = 'General' OR s.topic = 'General')
      AND NOT EXISTS (
          SELECT 1 FROM public.blocks b
          WHERE (b.blocker_id = v_user_id AND b.blocked_id = s.user_id)
             OR (b.blocker_id = s.user_id AND b.blocked_id = v_user_id)
      )
    FOR UPDATE SKIP LOCKED
    LIMIT 1;

    IF v_candidate_id IS NOT NULL THEN
        -- Order participant IDs canonically
        IF v_user_id < v_candidate_id THEN
            v_user_a := v_user_id;
            v_user_b := v_candidate_id;
        ELSE
            v_user_a := v_candidate_id;
            v_user_b := v_user_id;
        END IF;

        -- Create match
        INSERT INTO public.matches (user_a_id, user_b_id, topic, status)
        VALUES (v_user_a, v_user_b, p_topic, 'active')
        RETURNING id INTO v_match_id;

        -- Create conversation
        INSERT INTO public.conversations (match_id)
        VALUES (v_match_id)
        RETURNING id INTO v_conv_id;

        -- Mark candidate session as matched
        UPDATE public.talk_now_sessions
        SET status = 'matched', matched_at = NOW()
        WHERE id = v_candidate_session_id;

        -- Return match result
        RETURN jsonb_build_object(
            'success', true,
            'code', 'MATCH_CREATED',
            'match_id', v_match_id,
            'conversation_id', v_conv_id,
            'partner_id', v_candidate_id,
            'topic', p_topic
        );
    END IF;

    -- If no candidate, register/update current session
    INSERT INTO public.talk_now_sessions (user_id, intent, topic, status)
    VALUES (v_user_id, p_intent, p_topic, 'searching')
    ON CONFLICT (user_id) WHERE status = 'searching'
    DO UPDATE SET topic = EXCLUDED.topic, expires_at = NOW() + INTERVAL '15 minutes';

    RETURN jsonb_build_object(
        'success', true,
        'code', 'NO_MATCH_AVAILABLE',
        'message', 'Searching for nearby matches'
    );
END;
$$;

