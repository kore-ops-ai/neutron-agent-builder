# Neutron Agent Builder

AI-Powered Agent Creation Platform built with React, Vite, Node.js, Express, Supabase, and OpenAI.

## Project Structure

```
neutron-agent-builder/
├── src/                 # React frontend source files
│   ├── App.jsx         # Main App component
│   ├── App.css         # App styles
│   ├── main.jsx        # React entry point
│   └── index.css       # Global styles
├── server/             # Node.js backend
│   ├── index.js        # Express server with API routes
│   └── package.json    # Server dependencies
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
└── package.json        # Frontend dependencies
```

## Tech Stack

### Frontend
- React 18.2
- Vite 5.0 (Build tool)
- Axios (HTTP client)

### Backend
- Node.js with Express
- Supabase (Database & Auth)
- OpenAI API (AI capabilities)
- CORS & dotenv

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` in the root directory and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Server port (default: 5000)

### 2. Install Dependencies

Dependencies are already installed, but if needed:

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Run the Application

**Development Mode:**

Terminal 1 - Frontend (Vite dev server):
```bash
npm run dev
```
Frontend will run on http://localhost:3000

Terminal 2 - Backend (Express server):
```bash
npm run server
```
Backend will run on http://localhost:5000

**Or use nodemon for auto-reload:**
```bash
npm run server:dev
```

## Available Scripts

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run server` - Start Express server
- `npm run server:dev` - Start server with nodemon (auto-reload)

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/agents` - Fetch all agents from Supabase
- `POST /api/chat` - Send a message to OpenAI

## Next Steps

1. Set up your Supabase database tables
2. Configure authentication
3. Build out your agent creation UI
4. Implement agent management features
5. Add more API endpoints as needed

## Dependencies

### Frontend Dependencies
- react & react-dom
- axios
- vite & @vitejs/plugin-react

### Backend Dependencies
- express
- @supabase/supabase-js
- openai
- axios
- cors
- dotenv
- nodemon (dev)

## License

MIT
