# The Agents Builder

**A ChatGPT Canvas App for Building AI Sales Agents**

[![Live Demo](https://img.shields.io/badge/demo-theagentsbuilder.com-blue)](https://theagentsbuilder.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/react-19.1.1-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/vite-7.1.7-646CFF?logo=vite)](https://vite.dev)

---

## Overview

**The Agents Builder** is a no-code AI agent builder designed as a **ChatGPT Canvas App** for the ChatGPT ecosystem. It enables users to quickly configure, test, and deploy AI sales qualification and response agents without writing any code.

### What is a ChatGPT Canvas App?

This application is built specifically for the ChatGPT Canvas environment, allowing users to:
- Interact with AI agents directly within ChatGPT
- Configure agent behavior through an intuitive visual interface
- Test agents with sample lead data in real-time
- Deploy agents that integrate with Gmail for automated email responses

---

## Key Features

### 🎯 No-Code Agent Configuration
- **Visual Builder**: Configure AI agents through an intuitive interface
- **Template Library**: Pre-built agent templates (Sales Assistant, Support Triage, Demo Scheduler, etc.)
- **Custom Prompts**: Define agent behavior with customizable system prompts

### 📧 Gmail Integration
- **OAuth Authentication**: Secure Gmail account connection
- **Automated Responses**: AI-generated email replies based on lead qualification
- **Multi-User Support**: Browser-based user isolation with Supabase backend

### 🧪 Real-Time Testing
- **Test Payloads**: Send sample lead data to test agent responses
- **Instant Feedback**: See AI-generated email drafts before sending
- **n8n Workflow Integration**: Backend AI processing via n8n webhooks

### 📊 Analytics & Tracking
- **Google Tag Manager**: GTM-WF34BV67 for conversion tracking
- **Google Analytics 4**: GA4 property (G-DTGR9JX70N) for performance monitoring
- **Event Tracking**: Lead form submissions, CTA clicks, and user interactions

---

## Architecture

### Tech Stack

**Frontend:**
- **React 19.1.1** - UI framework
- **Vite 7.1.7** - Build tool and dev server
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **Supabase** - Backend database for user data and Gmail tokens

**Backend:**
- **n8n** - Workflow automation for AI agent processing
- **Gmail API** - OAuth integration for sending emails
- **Supabase** - PostgreSQL database with Row-Level Security (RLS)

**Analytics:**
- **Google Tag Manager (GTM-WF34BV67)** - Tag management
- **Google Analytics 4 (G-DTGR9JX70N)** - User analytics

### System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   ChatGPT Canvas App                         │
│                  (React + Vite Frontend)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User configures AI agent                                │
│     ├─ Agent name, system prompt, email signature          │
│     └─ Select template or create custom                     │
│                                                              │
│  2. User connects Gmail (OAuth)                             │
│     ├─ Secure OAuth flow via Google                        │
│     └─ Tokens stored in Supabase (encrypted)               │
│                                                              │
│  3. User tests agent with sample lead                       │
│     ├─ Frontend sends lead data to n8n webhook             │
│     └─ n8n processes with AI (Claude/GPT)                  │
│                                                              │
│  4. AI generates email draft                                │
│     ├─ Personalizes based on lead context                  │
│     └─ Returns draft to frontend for review                │
│                                                              │
│  5. User sends email via Gmail API                          │
│     ├─ Uses OAuth tokens from Supabase                     │
│     └─ Email sent from user's Gmail account                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** or **pnpm**
- **Supabase account** (for backend database)
- **n8n instance** (for AI workflow processing)
- **Google OAuth credentials** (for Gmail integration)

### Installation

```bash
# Clone repository
git clone https://github.com/koreqclab-ai/neutron-agent-builder.git
cd neutron-agent-builder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# n8n Webhook
VITE_N8N_LEAD_INTAKE_URL=your_n8n_webhook_url

# Google OAuth (Gmail Integration)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment

### Vercel (Recommended)

This project is deployed on Vercel with automatic deployments from the `main` branch.

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

**Live URL**: https://theagentsbuilder.com

### Environment Variables on Vercel

Add the following environment variables in your Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_N8N_LEAD_INTAKE_URL`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_REDIRECT_URI`

---

## Project Structure

```
neutron-agent-builder/
├── public/
│   └── auth/
│       └── callback.html          # OAuth callback handler
├── src/
│   ├── components/
│   │   └── GmailConnect.jsx       # Gmail OAuth component
│   ├── lib/
│   │   ├── supabase.js            # Supabase client
│   │   ├── gmail.js               # Gmail API wrapper
│   │   └── emailAccountsAPI.js    # Email accounts API
│   ├── App.jsx                    # Main application component
│   └── main.jsx                   # Application entry point
├── api/
│   └── gmail-send.js              # Gmail send API endpoint
├── index.html                     # HTML entry point (with GTM)
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── README.md                      # This file
```

---

## Usage

### 1. Configure Your Agent

1. Open [theagentsbuilder.com](https://theagentsbuilder.com)
2. Select a template or create a custom agent
3. Fill in:
   - **Agent Name**: "Neutron Sales Agent"
   - **System Prompt**: Define agent behavior
   - **Value Proposition**: Your product's key benefits
   - **Email Signature**: Your email signature

### 2. Connect Gmail

1. Click "Connect Gmail" in Email Account Settings
2. Authenticate with Google OAuth
3. Grant permissions for Gmail sending
4. Your tokens are securely stored in Supabase

### 3. Test Your Agent

1. Fill in test payload:
   - **Lead Email**: john.doe@example.com
   - **Company**: Acme Corp
   - **Message**: "We are interested in deploying AI agents for sales automation."
2. Click "Run Test"
3. Review AI-generated email draft
4. Click "Send Test Email" to send via your Gmail

### 4. Deploy to Production

Once tested, your agent can be deployed via:
- **n8n workflow automation** (automatic lead processing)
- **API integration** (custom lead intake)
- **Zapier** (connect to CRM systems)

---

## Analytics & Tracking

### Google Tag Manager Setup

This project uses GTM for conversion tracking:

**Container ID**: `GTM-WF34BV67`

**Events Tracked:**
- `gtm.js` - GTM initialization
- `gtm.dom` - DOM ready
- `gtm.load` - Page fully loaded
- `lead_form_submit` - Lead form submission
- `cta_click` - CTA button clicks

### Google Analytics 4

**Property ID**: `G-DTGR9JX70N`

**Tracked Metrics:**
- Sessions and users
- Form submissions (conversions)
- CTA engagement
- Bounce rate and session duration

---

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Style

- **ESLint**: Configured with React hooks and React refresh rules
- **Prettier**: (Optional) Add `.prettierrc` for code formatting
- **TypeScript**: Not currently enabled (can be added via `@types/react` template)

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

## Support

For questions or issues:
- **GitHub Issues**: [github.com/koreqclab-ai/neutron-agent-builder/issues](https://github.com/koreqclab-ai/neutron-agent-builder/issues)
- **Email**: support@theagentsbuilder.com
- **Documentation**: [Full docs coming soon]

---

## Roadmap

### Q1 2026
- [ ] Multi-language support (localization)
- [ ] Advanced template library (10+ pre-built agents)
- [ ] A/B testing for agent prompts
- [ ] Integration with Slack, Intercom, HubSpot

### Q2 2026
- [ ] Custom webhook support
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] White-label deployment options

---

## Acknowledgments

Built with:
- [React](https://react.dev) - UI framework
- [Vite](https://vite.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Supabase](https://supabase.com) - Backend platform
- [n8n](https://n8n.io) - Workflow automation
- [Claude Code](https://claude.com/code) - AI development assistant

---

**Made with ❤️ for the ChatGPT Canvas ecosystem**
