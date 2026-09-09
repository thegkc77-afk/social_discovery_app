# Social Discovery Backend 🚀

Modular monolith backend built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM** for the Social Discovery mobile application.

---

## 🏗️ Architecture

- **Framework**: [NestJS 11](https://nestjs.com)
- **Database & ORM**: PostgreSQL with [Prisma ORM](https://www.prisma.io)
- **Authentication**: JWT Access Token + Refresh Token Rotation + Phone OTP Verification
- **API Documentation**: [Swagger / OpenAPI](http://localhost:3001/docs)
- **Validation**: `class-validator` & `class-transformer`
- **Error Handling**: Standardized global exception filter and uniform JSON response envelopes

---

## 🚀 Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client & Seed Data

```bash
npm run prisma:generate
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run start:dev
```

The backend server starts on port `3001` (default):
- **Health Check**: `http://localhost:3001/health`
- **Swagger Docs**: `http://localhost:3001/docs`
- **API Prefix**: `http://localhost:3001/api/v1`

---

## 🗺️ Geospatial & PostGIS Setup (Optional Production Enhancement)

The application computes safe geodesic distances using standard spherical trigonometry (Haversine formula).

For large-scale production geospatial index acceleration with PostgreSQL **PostGIS**:

1. Install PostGIS in your PostgreSQL database:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
2. Convert coordinates into PostGIS geography points:
   ```sql
   ALTER TABLE locations ADD COLUMN geom geography(Point, 4326);
   UPDATE locations SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
   CREATE INDEX idx_locations_geom ON locations USING GIST (geom);
   ```
3. Use PostGIS spatial query functions:
   ```sql
   SELECT user_id, ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) / 1000 AS distance_km
   FROM locations
   WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3 * 1000);
   ```

---

## 📁 Directory Layout

```text
backend/
├── src/
│   ├── auth/          # OTP, JWT strategy, token rotation, logout, /auth/me
│   ├── users/         # User identity & query services
│   ├── profiles/      # Profile details, bio, avatar, and completeOnboarding
│   ├── interests/     # Global interests catalog & user selected vibes
│   ├── photos/        # User gallery photos & avatar ordering
│   ├── preferences/   # Discovery age, distance, and intent filters
│   ├── verification/  # Face liveness verification & liveness logs
│   ├── locations/     # GPS coordinates & location tracking
│   ├── discovery/     # Nearby user feed, distance calculations & likes/matches
│   ├── common/        # Guards (JwtAuthGuard), Filters, Interceptors, Decorators
│   ├── config/        # Env schema & validation
│   ├── health/        # Health check module & controller
│   ├── prisma/        # Prisma client service & lifecycle
│   ├── app.module.ts  # Root application module
│   └── main.ts        # Bootstrap entry point
├── prisma/
│   ├── schema.prisma  # Prisma schema definition
│   └── seed.ts        # Seed default interests and demo users
├── .env.example
├── package.json
└── tsconfig.json
```
