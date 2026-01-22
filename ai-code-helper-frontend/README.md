# AI Code Helper - Frontend

React + Vite frontend for the AI Code Helper application.

## Features

- 🤖 Real-time chat via SSE (Server-Sent Events)
- 💬 Modern chat UI with user/AI message separation
- 📱 Responsive design for desktop and mobile
- ⚡ Streaming AI responses
- 📝 Markdown rendering for AI replies

## Tech Stack

- **React**
- **Vite**
- **Axios**
- **SSE (Server-Sent Events)**
- **Marked**
- **CSS3**

## Project Structure

```
ai-code-helper-frontend/
├── src/
│   ├── api/            # API client
│   ├── components/     # React components
│   ├── utils/          # Utilities
│   ├── App.jsx         # Main app
│   └── main.jsx        # Entry
├── index.html
├── vite.config.js
└── package.json
```

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Backend API

- Base URL: `http://localhost:8081/api`
- Chat endpoint: `GET /ai/chat`
  - `memoryId` (number)
  - `message` (string)
  - Response: SSE stream

## License

MIT License