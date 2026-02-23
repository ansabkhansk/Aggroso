# Aggroso - Competitive Intelligence Tracker

A web application for tracking competitor website changes with AI-powered analysis. Monitor pricing pages, documentation, and changelogs to stay ahead of the competition.

## Features

### Implemented
- **Competitor Management**: Add up to 10 competitor URLs (pricing pages, docs, changelogs)
- **Content Fetching**: "Check Now" button to fetch and store page content
- **Change Detection**: Automatic diff generation when content changes
- **AI Summaries**: GPT-powered summaries of changes with citations
- **Change History**: View last 5 checks per competitor
- **Tags & Categories**: Organize competitors with custom tags
- **Severity Classification**: AI classifies changes as major/minor/cosmetic
- **"Important Changes" Filter**: Filter to see only significant changes
- **Status Page**: Monitor backend, database, and LLM health
- **Input Validation**: Handles empty/invalid URLs gracefully

### Not Implemented
- Email/Slack alerts for changes
- Scheduled automatic checking (cron jobs)
- User authentication/multi-tenancy
- Export functionality (PDF/CSV)
- Dark mode toggle (CSS variables ready but no toggle UI)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + TypeORM |
| AI | OpenAI API (GPT-4o-mini) |
| Containerization | Docker + Docker Compose |

## Quick Start

### Prerequisites
- Docker and Docker Compose
- OpenAI API key

### Run with Docker (Single Command)

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 2. Start everything
docker-compose up --build
```

Access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### Local Development (Without Docker Rebuild)

```bash
# Terminal 1: Database only
docker-compose up db

# Terminal 2: Backend
cd backend
npm install
npm run dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

**Note**: For local development, ensure `backend/.env` has `localhost` instead of `db` in the DATABASE_URL.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for AI summaries |
| `POSTGRES_USER` | Database username |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/competitors` | List competitors |
| POST | `/api/competitors` | Add competitor |
| DELETE | `/api/competitors/:id` | Delete competitor |
| POST | `/api/competitors/:id/check` | Check for changes |
| GET | `/api/competitors/:id/history` | Get history |
| GET | `/api/changes` | List all changes |

## Project Structure

```
├── docker-compose.yml
├── frontend/           # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   └── services/   # API client
│   └── Dockerfile
├── backend/            # Express + TypeORM
│   ├── src/
│   │   ├── entities/   # Database models
│   │   ├── routes/     # API routes
│   │   └── services/   # Business logic
│   └── Dockerfile
└── .env.example
```
