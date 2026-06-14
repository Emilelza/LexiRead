# LexiRead — AI-Powered Dyslexia & Reading Assistant

A professional, full-featured reading and study assistant built for accessibility and powered by OpenAI GPT-4o-mini.

---

## Features

- **10 AI processing modes** — Easy Reader, Child Friendly, Student Mode, Academic Simplifier, Exam Notes, Bullet Summary, Key Points, Vocabulary Builder, Quick Revision, Beginner Mode
- **Document upload** — PDF, TXT, DOCX extraction with drag-and-drop
- **Study tools** — MCQs, flashcards, viva questions, mind maps, cheat sheets
- **AI chat assistant** — Context-aware Q&A about your documents
- **Word explainer** — Click any word in output for definition, synonyms, pronunciation
- **Text-to-speech** — Play/pause/stop with speed control
- **Full accessibility bar** — Font toggle (OpenDyslexic / system), size control, comfort spacing, reading ruler, reading mask
- **6 themes** — Cream, Peach, Yellow, Blue, Dark, High Contrast
- **Export** — Copy or download results as TXT
- **Dashboard** — Session activity and statistics

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up your environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 3. Start the server
npm run dev      # development (nodemon)
npm start        # production
```

Open http://localhost:3000

---

## Project Structure

```
lexiread/
├── config/           # Centralized config & env validation
├── controllers/      # Request handlers (MVC controllers)
├── middleware/        # Error handler, rate limiter, file upload
├── routes/           # Express route definitions
├── services/         # AI service, document extraction service
├── utils/            # Response helpers, input sanitization
├── views/            # HTML views
├── public/
│   ├── css/          # Design system stylesheet
│   ├── js/           # Frontend application
│   └── fonts/        # OpenDyslexic font files
└── server.js         # Entry point
```

---

## Environment Variables

| Variable         | Required | Description                   |
|-----------------|----------|-------------------------------|
| `OPENAI_API_KEY` | ✅ Yes   | Your OpenAI API key           |
| `PORT`           | No       | Server port (default: 3000)   |
| `NODE_ENV`       | No       | `development` or `production` |

---

## API Endpoints

| Method | Endpoint           | Description                         |
|--------|--------------------|-------------------------------------|
| GET    | `/api/modes`       | List available AI modes             |
| POST   | `/api/simplify`    | Process text with chosen AI mode    |
| POST   | `/api/study`       | Generate study materials            |
| POST   | `/api/explain-word`| Explain a word                      |
| POST   | `/api/chat`        | Chat with AI about document         |
| POST   | `/api/upload`      | Upload and extract text from file   |

---

## Deployment

### Render / Railway
1. Push to GitHub
2. Create a new Web Service
3. Build command: `npm install`
4. Start command: `npm start`
5. Add `OPENAI_API_KEY` environment variable

### Vercel (serverless)
Not recommended — this project uses Express with file uploads. Use Render or Railway instead.

---

## Tech Stack

- **Backend** — Node.js, Express, OpenAI SDK
- **Frontend** — Vanilla JS (no framework), CSS custom properties
- **AI** — GPT-4o-mini (fast, cost-effective)
- **Fonts** — OpenDyslexic (open source)
