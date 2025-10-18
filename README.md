# Neutron Agent Builder

AI-Powered Agent Creation Platform built with React, Vite, Node.js, Express, Supabase, and n8n.

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
- n8n Webhooks (Agent Deployment & Lead Intake)
- body-parser, node-fetch, CORS & dotenv

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` in the root directory and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (required for admin operations)
- `N8N_DEPLOY_WEBHOOK_URL` - Your n8n webhook URL for agent deployment
- `N8N_LEAD_INTAKE_WEBHOOK_URL` - Your n8n webhook URL for lead intake
- `PORT` - Server port (default: 8787)

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

**Quick Start (recommended):**
```bash
npm start
```
This will run both frontend and backend concurrently:
- Frontend: http://localhost:3000
- Backend: http://localhost:8787

**Or run separately:**

Terminal 1 - Frontend (Vite dev server):
```bash
npm run dev
```
Frontend will run on http://localhost:3000

Terminal 2 - Backend (Express server):
```bash
npm run server
```
Backend will run on http://localhost:8787

**Or use nodemon for auto-reload:**
```bash
npm run server:dev
```

## Available Scripts

### Combined
- `npm start` - Run both frontend and backend concurrently (recommended for development)

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run server` - Start Express server
- `npm run server:dev` - Start server with nodemon (auto-reload)

## API Endpoints

### POST /api/agents
Create and deploy a new AI agent.

**Request Body:**
```json
{
  "name": "Lead Follow-Up Agent",
  "config": {
    "greeting": "Hi! How can I help you today?",
    "model": "gpt-4"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "agentId": "uuid",
  "status": "active"
}
```

### GET /api/agents/:id/status
Get the latest execution runs for a specific agent.

**Response:**
```json
{
  "ok": true,
  "runs": [
    {
      "id": "uuid",
      "agent_id": "uuid",
      "status": "success",
      "created_at": "2025-10-18T12:00:00Z"
    }
  ]
}
```

## Architecture

1. **Agent Creation Flow:**
   - Frontend sends agent configuration to `/api/agents`
   - Backend saves agent to Supabase with status "deploying"
   - Backend triggers n8n webhook with agent configuration
   - n8n sets up the agent workflow
   - Backend updates agent status to "active"

2. **Agent Execution:**
   - Leads come in via n8n webhook
   - n8n processes the lead and executes agent logic
   - Results are stored in `agent_runs` table
   - Frontend can query `/api/agents/:id/status` for execution history

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
- node-fetch
- body-parser
- cors
- dotenv
- nodemon (dev)

## License

MIT
