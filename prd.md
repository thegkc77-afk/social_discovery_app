# VibeMatch Backend PRD

> Product requirements document for the VibeMatch MVP backend.
> Platform: Supabase (PostgreSQL, Auth, Storage, Realtime, RPC/Edge Functions).

VibeMatch — Backend Development

MVP architecture and implementation specification | Supabase

## 1. Purpose and backend responsibilities

This document defines the backend for VibeMatch, a hyperlocal social discovery and dating platform for adults. Supabase is the primary backend platform. It provides authentication, PostgreSQL, Storage, and Realtime. The backend is responsible for identity, profile data, discovery eligibility, atomic Talk Now matching, chat authorization, safety, and privacy.

## 2. Recommended architecture

| Component | Responsibility |
| --- | --- |
| Supabase Auth | Sign up, login, identity, session and verification |
| PostgreSQL | Profiles, interests, preferences, locations, sessions, matches, chats, safety records |
| Supabase Storage | Profile photo objects and controlled access |
| Supabase Realtime | Authorized message and conversation updates |
| Postgres RPC / functions | Atomic matching, secure nearby discovery, state transitions |
| Supabase Edge Functions | Trusted workflows, external integrations, notifications, moderation integrations when needed |

The mobile app uses the client-safe publishable/anon key with RLS. Never bundle the service_role key in the frontend. Privileged operations must execute in a trusted server-side context.

## 3. MVP backend scope

- Authentication and adult eligibility checks.

- Profile and profile-photo metadata management.

- Interests and discovery preferences.

- Secure location updates and radius-based discovery.

- Talk Now availability sessions with expiry.

- Intent- and topic-based matching with explicit General fallback.

- Atomic match and conversation creation.

- One-to-one message persistence and realtime authorization.

- Block, report, account status, and meet proposal records.

## 4. Database schema

Use UUID primary keys, foreign keys, timestamps, indexes, and database constraints.

### 4.1 profiles

| Column | Description |
| --- | --- |
| id UUID PK | References auth.users.id; one profile per account |
| display_name TEXT | Public display name |
| date_of_birth DATE | Used for server-side 18+ eligibility |
| gender TEXT | User-provided gender value |
| bio TEXT | Short public description |
| occupation TEXT | Optional |
| education TEXT | Optional |
| relationship_goal TEXT | Primary connection goal |
| avatar_path TEXT | Optional primary photo storage path |
| onboarding_completed BOOLEAN | Onboarding completion state |
| account_status TEXT | Active, suspended, or deleted |
| created_at / updated_at TIMESTAMPTZ | Audit timestamps |

### 4.2 profile_photos

| Column | Description |
| --- | --- |
| id UUID PK | Photo record identifier |
| user_id UUID FK | Photo owner |
| storage_path TEXT | Supabase Storage object path |
| display_order INT | Photo ordering |
| is_primary BOOLEAN | Primary profile photo |
| created_at TIMESTAMPTZ | Upload timestamp |

### 4.3 interests and user_interests

| Table | Columns / purpose |
| --- | --- |
| interests | id, name, is_active — selectable topic catalog |
| user_interests | user_id, interest_id — profile-to-interest relation; unique pair constraint |

### 4.4 discovery_preferences

| Column | Description |
| --- | --- |
| user_id UUID PK/FK | Preference owner |
| preferred_genders | Allowed gender values, with validated representation |
| min_age INT | Minimum preferred age |
| max_age INT | Maximum preferred age |
| max_distance_km NUMERIC | Radius within product limits |
| updated_at TIMESTAMPTZ | Last update |

### 4.5 user_locations

| Column | Description |
| --- | --- |
| user_id UUID PK/FK | Location owner |
| location GEOGRAPHY(Point, 4326) | Spatial point if PostGIS is enabled |
| updated_at TIMESTAMPTZ | Last location update |
| location_expires_at TIMESTAMPTZ | Expiry for stale location |

Keep raw coordinates separate from public profile data. Use PostGIS and a spatial index for radius queries. Raw coordinates should be accessible only to the owner and trusted backend functions. Return approximate distance or a coarse distance band to other users.

### 4.6 talk_now_sessions

| Column | Description |
| --- | --- |
| id UUID PK | Availability session identifier |
| user_id UUID FK | Session owner |
| intent TEXT | Dating, Friendship, or Conversation |
| topic_id UUID/FK | Selected topic, including General |
| status TEXT | Searching, matched, cancelled, expired |
| started_at TIMESTAMPTZ | Session start |
| expires_at TIMESTAMPTZ | Automatic expiry |
| matched_at TIMESTAMPTZ | Match time, nullable |

Enforce at most one active searching session per user using an appropriate partial unique index or equivalent transactional rule.

### 4.7 matches, conversations, and messages

| Table | Important columns |
| --- | --- |
| matches | id, user_a_id, user_b_id, intent, topic_id, status, created_at |
| conversations | id, match_id, created_at, last_message_at |
| messages | id, conversation_id, sender_id, body, created_at, optional message_status |

Use canonical participant ordering or a pair key to prevent duplicate active matches. Add indexes for conversation_id and message chronology. Validate message length and rate-limit sending.

### 4.8 safety and meet planning

| Table | Important columns |
| --- | --- |
| blocks | id, blocker_id, blocked_id, created_at; unique blocker/blocked pair |
| reports | id, reporter_id, reported_user_id, reason, details, status, created_at |
| meet_proposals | id, conversation_id, proposed_by, place_name, proposed_at, note, status, created_at |

## 5. Authentication and account lifecycle

- Use Supabase Auth for credentials and sessions; never store plaintext passwords in profiles.

- Create a profile row after account creation using a trusted trigger or authenticated application workflow.

- Verify age from date_of_birth on the backend; do not trust a client-calculated age.

- Deny access to core social/dating features for accounts under 18.

- Support account suspension/deletion and ensure suspended users cannot discover, match, or message.

- Rate-limit OTP requests and authentication-sensitive endpoints.

## 6. Nearby discovery

1. Receive an authenticated request for discovery; derive the user identity from auth.uid().

1. Read the user's current location and discovery preferences from protected tables.

1. Reject or return a clear state if location is missing or stale.

1. Query eligible profiles within the configured radius using PostGIS distance operations.

1. Apply age/gender preferences, account status, blocks, and other visibility rules.

1. Return only approved public profile fields and approximate distance; never return raw coordinates.

The initial product radius target is approximately 1–5 km. Enforce reasonable product limits on the server even if the client sends a radius value.

## 7. Talk Now matching engine

Talk Now is the core MVP feature. Matching must be server-authoritative and concurrency-safe. Implement the operation as a Postgres RPC/function or trusted backend transaction. A client-side candidate query followed by an unprotected insert is not sufficient.

### 7.1 Matching eligibility

- Both accounts are active and at least 18 years old.

- Both Talk Now sessions are in Searching state and have not expired.

- The users are different accounts and are within the permitted radius.

- Their intents are compatible.

- Their age and gender preferences are mutually compatible.

- The selected topics match, or the user has explicitly chosen the General fallback behavior.

- Neither user has blocked the other.

- Neither user is already assigned to an incompatible active match.

### 7.2 Matching flow

start_talk_now(authenticated_user, intent, topic):
    verify authenticated identity
    verify active account and 18+ eligibility
    validate profile, preferences, and fresh location
    create or update the user's active Talk Now session

    find eligible candidate:
        another user with active, unexpired Searching session
        compatible intent and mutual preferences
        within permitted distance
        matching topic
        no block in either direction
        no conflicting active match

    atomically claim both sessions
    create one match and one conversation in the same transaction
    mark both sessions as matched

    return MATCH_CREATED or a clear no-match result

### 7.3 General fallback

- If the selected topic has no candidate, return NO_MATCH_FOR_TOPIC.

- The frontend asks whether the user wants to broaden the search to General.

- If accepted, the backend performs a new search under explicit General fallback rules.

- General must not bypass intent compatibility, mutual preferences, radius, age eligibility, or blocks.

- If no candidate exists, return NO_MATCH_AVAILABLE and allow the user to wait or cancel.

### 7.4 Atomicity and race conditions

- Use a database transaction and row locking or an equivalent atomic claim mechanism.

- Ensure one user/session cannot be claimed by two concurrent matching requests.

- Create the match and conversation in the same transaction.

- Use uniqueness constraints or idempotency protections to prevent duplicate matches.

- Recheck session expiry, blocks, account status, and preferences inside the transaction.

### 7.5 Suggested result codes

| Result code | Meaning |
| --- | --- |
| MATCH_CREATED | Match and conversation created |
| NO_MATCH_FOR_TOPIC | No candidate for selected topic; offer General |
| NO_MATCH_AVAILABLE | No eligible candidate currently available |
| PROFILE_INCOMPLETE | Required profile setup is incomplete |
| LOCATION_REQUIRED | Fresh location is required |
| SESSION_EXPIRED | Availability session expired |
| ALREADY_IN_ACTIVE_MATCH | User already has a conflicting active match |
| PREFERENCES_INVALID | Preference values failed validation |

## 8. Realtime chat backend

1. The client loads message history from Postgres for a conversation.

1. The client subscribes to message inserts for that conversation.

1. A message insert is accepted only when auth.uid() is a conversation participant and equals sender_id.

1. RLS authorizes reads and writes; realtime publication does not replace database authorization.

1. The client handles reconnects by reloading message history and deduplicating events.

Only participants may read a conversation or its messages. Validate message body length, content type, and rate limits. Consider moderation/reporting workflows as the product grows.

## 9. Supabase Storage

- Create a profile-photos bucket with a deliberate public/private access policy.

- Use user-scoped object paths such as user_id/photo_id.jpg.

- Allow authenticated users to upload/delete only their own objects.

- Validate file size and MIME type; do not rely only on the client.

- Use signed URLs or a controlled read policy for approved profile images.

- Delete orphaned objects when a photo is removed or an account is deleted.

- Keep private verification media separate from public profile photos.

## 10. Row Level Security (RLS)

Enable RLS on every table exposed through the Supabase API. Use auth.uid() and participant relationships in policies.

| Resource | Minimum access policy |
| --- | --- |
| Profiles | Read approved public fields; owner updates own profile |
| Preferences | Owner-only read/write |
| User locations | Owner-only raw coordinate access; discovery via controlled function |
| Talk Now sessions | Owner manages own session; candidate selection through trusted operation |
| Matches | Only participants can read |
| Conversations | Only participants can read |
| Messages | Only participants read; sender_id must equal auth.uid() |
| Photos | Owner uploads/deletes own files; approved photos shown by bucket policy |
| Blocks | Owner manages own blocks; block affects discovery and chat |
| Reports | Reporter submits; sensitive moderation data restricted to trusted moderators |
| Meet proposals | Only conversation participants can read/respond |

## 11. Privacy, safety, and abuse prevention

- Never expose exact coordinates or location history to other users.

- Expire stale location and Talk Now session data according to a documented retention policy.

- Rate-limit matching, messages, reports, uploads, and OTP requests.

- Prevent clients from modifying protected fields such as account_status or moderation status.

- Block must prevent future matching and messaging according to product rules.

- Store reports privately and restrict access to authorized moderation workflows.

- Avoid logging passwords, OTPs, access tokens, or precise coordinates.

- Provide clear community guidelines and privacy policy before public launch.

Live video verification was discussed as a possible future anti-bot measure. Keep it outside the initial backend scope unless a secure provider, consent flow, access controls, and retention policy are selected. Never put sensitive verification recordings in a public bucket.

## 12. Environment and secrets

# Mobile app: client-safe values only
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Trusted server environment only — never bundle in the app
SUPABASE_SERVICE_ROLE_KEY=

The service-role key is shown only to identify a server-side secret; store it in the trusted deployment environment or Supabase secret manager. Never commit it or expose it to the mobile app.

## 13. Backend implementation milestones

1. Foundation: create Supabase project, configure Auth, extensions, schema migrations, and RLS.

1. Profiles: implement profile CRUD, interests, preferences, and Storage policies.

1. Location/discovery: implement secure location updates and nearby discovery function.

1. Talk Now: implement availability lifecycle, expiry, atomic matching RPC, and General fallback.

1. Chat: implement conversations, message authorization, realtime publication, and history queries.

1. Safety: implement block/report, account status enforcement, and meet proposal access rules.

1. QA/deployment: test concurrent matching, RLS, two-account flows, logs, backups, and production secrets.

## 14. Backend test matrix

| Scenario | Expected backend behavior |
| --- | --- |
| Two compatible users choose Gaming | One match and one conversation created |
| Different selected topics | No same-topic match; return fallback-eligible result |
| No topic candidate; user accepts General | Search again under General rules |
| Incompatible intent or preferences | Reject candidate |
| Outside radius or stale location | Reject candidate |
| Talk Now disabled or expired | Session cannot be matched |
| One user already matched | Prevent conflicting match |
| Two simultaneous claims for same candidate | Only one transaction succeeds |
| Blocked user pair | No match and no message access |
| Non-participant reads messages | RLS denies access |
| User uploads to another user's storage path | Storage policy denies access |
| Underage account attempts core feature | Backend denies access |

## 15. Deployment checklist

- Use separate development and production Supabase projects.

- Track schema changes as SQL migrations in version control.

- Enable required extensions such as PostGIS if geography queries are used.

- Enable RLS and verify policies on every exposed table.

- Configure Auth providers, redirect URLs, and email/phone templates.

- Create Storage buckets and test upload/read/delete policies.

- Enable Realtime only for required tables and verify participant authorization.

- Deploy RPCs/Edge Functions and configure secrets securely.

- Configure backups, monitoring, and usage alerts appropriate to the project plan.

## 16. Backend acceptance criteria

- Authentication identity is enforced through Supabase Auth.

- Under-18 accounts cannot use core dating/social functionality.

- Users can manage only their own private profile data and photos.

- Nearby discovery applies server-side radius, preference, status, and block filters.

- Raw coordinates are never returned to other users.

- Talk Now matching is atomic and prevents double assignment.

- Same-topic matching works and General fallback is explicit.

- Match and conversation creation are transactionally consistent.

- Only conversation participants can read/send messages.

- Blocking and reporting are enforced server-side.

- RLS is tested using ordinary accounts, not only an administrator account.

## 17. Instructions for AI coding tools and contributors

- Inspect the current Supabase project and repository before making changes.

- Write versioned SQL migrations for schema, indexes, constraints, and RLS policies.

- Do not place privileged matching logic in the client.

- Do not disable RLS to make a feature work; fix the policy or use a trusted function.

- Never expose service-role credentials or private verification data.

- Use transactions, locking, and constraints to make matching concurrency-safe.

- Document RPC signatures, return codes, table changes, and required secrets.

- Test with at least two ordinary user accounts and include negative authorization tests.

VibeMatch Backend MVP — Securely connect compatible adults nearby, one conversation at a time.

## PRD implementation rules

- Treat age eligibility, location privacy, RLS, and concurrency-safe matching as release-blocking requirements.
- Implement schema changes as version-controlled SQL migrations.
- Keep privileged operations server-side; never expose the Supabase service-role key in the mobile app.
- Test all authorization policies with at least two ordinary user accounts.
