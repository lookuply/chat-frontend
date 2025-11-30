# Lookuply Chat Frontend

Privacy-first AI-powered search chat interface built with React + TypeScript + Vite.

## Features

- Clean, modern chat interface
- Real-time AI-powered search responses
- Source citations with URLs and snippets
- Privacy-first design (no tracking, no cookies)
- Responsive layout
- Error handling and loading states

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling (no UI libraries, pure CSS)

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/lookuply/chat-frontend.git
cd chat-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and set VITE_API_URL to your search-api backend
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Environment Variables

- `VITE_API_URL` - URL of the search-api backend (default: `http://localhost:8002`)

## Architecture

### Components

- **ChatInterface** (`src/components/ChatInterface.tsx`) - Main chat component with message history, input form, and state management
- **App** (`src/App.tsx`) - Root component that renders ChatInterface

### API Client

- **searchApi** (`src/api/searchApi.ts`) - TypeScript client for search-api backend with types for requests/responses

### Data Flow

1. User submits question via input form
2. ChatInterface calls `searchApi.chat()` with query
3. API client sends POST request to `/chat` endpoint
4. Response with answer and sources is added to message history
5. Sources are displayed with clickable links

## Privacy

This application follows privacy-first principles:

- No user tracking or analytics
- No cookies
- No query logging (queries are sent to backend but not persisted by default)
- All communication with backend via API, no third-party services

## Deployment

Deployment is automated via GitHub Actions:

- **Build Workflow** - Runs on push to main, builds and tests the app
- **Deploy Workflow** - Deploys to production server via Docker

See `.github/workflows/` for CI/CD configuration.

## Project Structure

```
chat-frontend/
├── src/
│   ├── api/
│   │   └── searchApi.ts        # API client
│   ├── components/
│   │   ├── ChatInterface.tsx   # Main chat component
│   │   └── ChatInterface.css   # Chat styling
│   ├── App.tsx                 # Root component
│   ├── App.css                 # Global styles
│   └── main.tsx                # Entry point
├── public/                     # Static assets
├── .env.example                # Environment template
├── Dockerfile                  # Production build
├── package.json                # Dependencies
└── vite.config.ts              # Vite configuration
```

## Contributing

See the main [project-docs](https://github.com/lookuply/project-docs) repository for:

- Development standards (TDD, SOLID, Clean Code)
- Git workflow and conventional commits
- Architecture documentation

## License

MIT
