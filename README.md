# Devora — Learning Platform

Devora is an online learning platform designed to help students learn, practice, and build practical skills through structured courses and interactive learning experiences.

The project uses a separate frontend and backend architecture. The React application communicates with the Express REST API, which handles authentication, course management, enrollment, learning progress, quizzes, certificates, and other platform operations.

## Technology Stack

### Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS 4
- React Router
- TanStack Query

### Backend
- Node.js
- Express 5
- TypeScript
- Prisma ORM 7
- PostgreSQL 18
- JSON Web Tokens (JWT) authentication
- bcryptjs for password hashing
- REST API architecture

## Project Structure

The frontend and backend are maintained separately.

### Frontend

```text
src/
├── api/              # API types, HTTP client and resources
│   └── mock/         # Mock API implementation
├── components/       # Reusable UI components
├── context/          # Authentication context
├── hooks/            # React Query and application hooks
├── pages/            # Application pages
├── App.tsx           # Application routes
└── seed-data.ts      # Mock application data
```

### Backend

```text
backend/
├── prisma/
│   ├── schema.prisma # Database models and relationships
│   └── migrations/   # Database migrations
├── src/
│   ├── lib/          # Shared libraries and Prisma client
│   ├── middleware/   # Authentication and request middleware
│   ├── routes/       # REST API endpoints
│   └── server.ts     # Express application entry point
├── .env.example      # Environment configuration example
├── package.json
└── tsconfig.json
```

## Backend Overview

The backend provides the API and database functionality used by the Devora frontend.

It is built with Express and TypeScript, with Prisma ORM managing communication with PostgreSQL.

### Core Responsibilities

- **Authentication:** Student registration, login, JWT-based authentication, and profile management.
- **User Management:** User information, roles, account status, and profile preferences.
- **Course Management:** Course catalog, categories, course details, search, filtering, and featured or popular courses.
- **Enrollment:** Student course enrollment and enrollment status.
- **Learning Progress:** Lesson access, lesson completion, and course progress tracking.
- **Quizzes:** Quiz submissions, score calculation, pass status, and attempt history.
- **Bookmarks:** Saving and removing bookmarked courses.
- **Certificates:** Certificate generation, student certificate records, and public credential verification.
- **Notifications:** Retrieving, reading, and deleting student notifications.

### API Routes

The API is served under the `/api` prefix.

| Resource | Endpoint |
|---|---|
| Authentication | `/api/auth/*` |
| User profile | `/api/me` |
| Categories | `/api/categories` |
| Courses | `/api/courses` |
| Course details | `/api/courses/:courseId` |
| Course enrollment | `/api/courses/:courseId/enroll` |
| Lesson access | `/api/courses/:courseId/lessons/:lessonId` |
| Lesson completion | `/api/courses/:courseId/lessons/:lessonId/complete` |
| Quiz submission | `/api/courses/:courseId/lessons/:lessonId/quiz` |
| Bookmarks | `/api/me/bookmarks` |
| Enrollments | `/api/me/enrollments` |
| Certificates | `/api/me/certificates` |
| Certificate verification | `/api/certificates/verify/:credentialId` |
| Notifications | `/api/me/notifications` |

Authentication is required for protected student operations.

## Running the Project

### 1. Frontend Setup

```bash
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

For mock mode:

```env
VITE_USE_MOCK=true
```

Start the frontend:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Configure the required environment variables in `backend/.env`, including:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/devora"
JWT_SECRET="your-secure-secret"
PORT=4000
```

Use your actual PostgreSQL username, password, and database configuration.

Generate the Prisma client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate deploy
```

Build the backend:

```bash
npm run build
```

Start the development server using the configured development script:

```bash
npm run dev
```

Backend API: `http://localhost:4000`

### 3. Connect Frontend to Backend

In the frontend `.env` file, configure:

```env
VITE_USE_MOCK=false
VITE_PROXY_TARGET=http://localhost:4000
```

The frontend communicates with the backend through the `/api` route prefix.

The API responses must follow the contracts defined in:

- `docs/API_CONTRACT.md`
- `src/api/types.ts`

## Authentication and Security

The backend uses JWT-based authentication to protect private API operations.

Security-related functionality includes:

- Password hashing.
- Authentication middleware.
- Role-based access restrictions.
- Protected student operations.
- User-specific data access.
- Enrollment and course-access validation.

## Development Notes

- The frontend and backend are separate applications.
- PostgreSQL is the primary database.
- Prisma manages database models, migrations, and queries.
- The backend exposes REST API endpoints.
- The frontend uses React Query for server-state management.
- Mock mode is available for frontend development without a running backend.
- Payment integration and AI-powered learning features are separate development responsibilities.

## Project Status

Devora is under active development. Core backend functionality has been implemented, including authentication, course catalog operations, enrollment, lesson progress, quizzes, bookmarks, certificates, and notifications.

Frontend integration and remaining platform features are being developed and verified.

## Team Development

The project separates frontend and backend responsibilities to support independent development and integration.

**Devora — Learn. Practice. Build.**
