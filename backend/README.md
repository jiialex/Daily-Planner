# Planwise Backend

Express + TypeScript + MySQL + Prisma backend for the Daily Planner app.

## Requirements

- Node.js 20 or newer
- MySQL 8 or newer installed locally or a MySQL connection URL

## Setup

1. Open a terminal in this folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and set `DATABASE_URL` and a long random `JWT_SECRET`.
4. Create a MySQL database named `planwise` (or change the database name in `DATABASE_URL`).
5. Generate the Prisma client and apply the committed migrations:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

API base URL: `http://localhost:4000`

Health check: `GET /api/health`

## Endpoints

### Public
- `POST /api/auth/register` — `{ "name": "Example User", "email": "user@example.com", "password": "at-least-8-chars", "planningMode": "student", "calendarPref": "gregorian" }`
- `POST /api/auth/login` — `{ "email": "user@example.com", "password": "at-least-8-chars", "remember": false }`
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`

### Authenticated (all require `Authorization: Bearer <token>`)
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/goals`
- `POST /api/goals`
- `PATCH /api/goals/:id`
- `DELETE /api/goals/:id`
- `GET /api/schedule?start=2026-10-14T00:00:00.000Z&end=2026-10-21T00:00:00.000Z`
- `POST /api/schedule`
- `DELETE /api/schedule/:id`
- `POST /api/planner/day` — returns rule-based suggestions without saving them
- `POST /api/planner/day/save` — saves reviewed suggestions as schedule blocks

### Example task

```json
{
  "title": "Study database systems",
  "description": "Review normalization",
  "priority": "HIGH",
  "dueAt": "2026-10-16T12:00:00.000Z",
  "estimatedMinutes": 60,
  "scheduledDate": "2026-10-16",
  "scheduledTime": "09:00",
  "dependencyId": null
}
```

Tasks also support the frontend statuses `PENDING`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `MISSED`, `RESCHEDULED`, and `UPCOMING`. Goals have a `category` field.

### Example planner request

```json
{
  "date": "2026-10-14",
  "dayStartHour": 9,
  "dayEndHour": 17,
  "breakMinutes": 10
}
```

## Frontend integration

Set the server-side backend URL in the Next.js project:

```env
API_URL=http://localhost:4000/api
```

The Next.js app proxies its API requests to this URL and stores the backend JWT in an HttpOnly, SameSite cookie. Browser JavaScript does not receive the token.

## Important notes

- All task, goal, and schedule routes are protected by bearer-token authentication.
- Queries are scoped to the authenticated user.
- The planner generates suggestions and does not save them until `/api/planner/day/save` is called.
- This is a development starter. Before production, add rate limiting, stronger auth/session handling, password reset/email verification, logging, and automated tests.
