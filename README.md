# Daily Planner MVP

Ellie-like Daily Planner - A minimalist daily planning web application.

## Tech Stack

- **Backend**: NestJS (Node.js, TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Frontend**: React (Vite) with TypeScript
- **Styling**: Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### 1. Start Database

```bash
docker-compose up -d
```

### 2. Start Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend runs on http://localhost:3000

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Features

- Brain Dump (Inbox) - Quick capture unscheduled tasks
- Daily Planner - View and manage tasks by date
- Task CRUD - Create, read, update, delete tasks
- Task completion toggle
- Date navigation (Previous/Today/Next)
- Move tasks from Brain Dump to Daily Planner

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | Get all tasks (optional query: ?date=YYYY-MM-DD) |
| GET | /tasks/brain-dump | Get unscheduled tasks |
| GET | /tasks/:id | Get single task by ID |
| POST | /tasks | Create new task |
| PATCH | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |

## Environment Variables

### Backend (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=daily_planner_db
PORT=3000
```
