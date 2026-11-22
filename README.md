# VibeMatch

Social discovery app: an Expo / React Native client and an Express + Socket.IO backend with SQLite storage (optional Supabase sync).

## Project layout

- `client/` - Expo app (SDK 58, expo-router, TypeScript)
- `server/` - Express + Socket.IO API (TypeScript, `node:sqlite`)

## Prerequisites

- Node.js 22.5 or newer (the server uses the built-in `node:sqlite` module)
- npm
- Expo Go (SDK 58) on your phone, or an emulator

## Backend (`server/`)

```bash
cd server
npm install
npm run dev
```

- The API listens on `http://localhost:5000`. `GET /api/health` returns `{"status":"ok"}`.
- Local development works with no environment variables: a random JWT secret is generated on each boot and a warning is logged. Note that this forgets existing login sessions on every restart - set `JWT_SECRET` in `server/.env` (see `.env.example`) to keep sessions valid across restarts.
- OTP in development: without SMS provider keys (Twilio or Fast2SMS in `.env`), the server generates the OTP itself and, outside production, includes it in the `/api/auth/otp/send` response so you can sign in during development.
- Production (`NODE_ENV=production`): `JWT_SECRET` and an explicit `CLIENT_ORIGIN` are required (the server refuses to boot with a wildcard origin), and TLS must be terminated in front of the server.

### First-boot security migration

On startup the server resets the password of any account whose stored password still matches one of the previously hardcoded development backdoor passwords, replacing it with a random secret (one `[SECURITY]` log line per affected account). Those accounts can no longer sign in with a password; they sign in via OTP instead.

## Client (`client/`)

```bash
cd client
npm install
npx expo start
```

- Open the app in Expo Go (SDK 58) on the same Wi-Fi network as your computer.
- The app auto-detects your computer's IP from Expo Go and calls the API at `http://<computer-ip>:5000/api`, so the backend must be running and reachable on your network.
- To override the API address, set `EXPO_PUBLIC_API_URL` before starting Expo.

## Checks run on this branch

- Client: `npx expo install --check`, `npx tsc --noEmit`, `npx expo export --platform android`
- Server: `npx tsc --noEmit`, plus boot and API smoke tests against `npm run dev`
