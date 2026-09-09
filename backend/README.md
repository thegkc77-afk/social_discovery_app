# Social Discovery Backend 🚀

Modular monolith backend built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM** for the Social Discovery mobile application.

---

## 🏗️ Architecture

- **Framework**: [NestJS 11](https://nestjs.com)
- **Database & ORM**: PostgreSQL with [Prisma ORM](https://www.prisma.io)
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

### 3. Generate Prisma Client

```bash
npm run prisma:generate
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

## 📁 Directory Layout

```text
backend/
├── src/
│   ├── common/
│   │   ├── filters/       # Global exception filters
│   │   ├── interceptors/  # Response formatting interceptors
│   │   ├── guards/        # Auth & Role guards (Phases 3+)
│   │   ├── middleware/    # Express middleware
│   │   ├── decorators/    # Custom parameter & route decorators
│   │   └── utils/         # Helper functions & utilities
│   ├── config/            # Env schema & validation
│   ├── health/            # Health check module & controller
│   ├── prisma/            # Prisma client service & lifecycle
│   ├── app.module.ts      # Root application module
│   └── main.ts            # Bootstrap entry point
├── prisma/
│   └── schema.prisma      # Prisma schema definition
├── .env.example           # Environment variables template
├── package.json
└── tsconfig.json
```
