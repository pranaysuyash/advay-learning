# Advay Vision Learning 🎨👋

AI-powered interactive learning platform for young children (2-8 years) using computer vision for hand tracking, drawing, and language recognition.

## 🌟 Features

- **Hand & Face Tracking**: Real-time gesture recognition for drawing and interaction
- **Multi-language Support**: English, Hindi, Kannada (expandable)
- **Interactive Drawing**: Draw letters, shapes, and objects using hand gestures
- **Object Recognition**: Identify and learn objects through camera
- **Gamified Learning**: Progress tracking, rewards, and achievements
- **Parent Dashboard**: Monitor learning progress and customize content

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- uv (Python package manager)

### Setup

```bash
# 1. Backend setup
cd src/backend
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -e ".[dev]"
cp .env.example .env
# Edit .env with your settings

# 2. Frontend setup
cd ../frontend
npm install
cp .env.example .env.local

# 3. Run development servers
# Terminal 1 - Backend
cd src/backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd src/frontend
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy
- **CV Engine**: MediaPipe, TensorFlow.js, OpenCV
- **Database**: PostgreSQL (production), SQLite (dev)
- **Storage**: AWS S3 / Local filesystem
- **Auth**: JWT-based authentication

## 📚 Documentation

- [AGENTS.md](AGENTS.md) - AI agent coordination guide
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
- [docs/SETUP.md](docs/SETUP.md) - Detailed setup
- [docs/SECURITY.md](docs/SECURITY.md) - Security guidelines
- [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) - Git process

## 🤖 AI Agent System

This project uses a comprehensive AI agent coordination system:

- **AGENTS.md**: Central coordination guide
- **prompts/**: Reusable AI prompts for all development phases
- **docs/WORKLOG_TICKETS.md**: Single source of truth for work tracking
- **docs/audit/**: Audit artifacts for code review

See [AGENTS.md](AGENTS.md) for detailed workflow.

## 🔒 Privacy & Security

- Camera access is **local-first** with optional cloud processing
- No video storage - only processed data/frames
- Parental consent required
- COPPA compliant design considerations

## 📝 License

Private - For Advay's Learning Journey ❤️

## 👥 Team

Built with ❤️ for Advay and young learners everywhere.
