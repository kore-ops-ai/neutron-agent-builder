# Multi-Tenant Gmail OAuth Architecture

## Current Architecture (What We Built)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                  (React + Vite + Vercel)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌─────────────────────────┐      │
│  │   User fills     │         │   Gmail OAuth           │      │
│  │   business       │         │   (Google)              │      │
│  │   context        │────────▶│                         │      │
│  │                  │         │   Returns:              │      │
│  │  - Email         │         │   - access_token        │      │
│  │  - Products      │         │   - refresh_token       │      │
│  │  - Description   │         │   - expires_in          │      │
│  └──────────────────┘         └─────────────────────────┘      │
│          │                              │                        │
│          │                              ▼                        │
│          │                    ┌──────────────────────┐          │
│          │                    │   Supabase DB        │          │
│          └───────────────────▶│   (email_accounts)   │          │
│                                │                      │          │
│                                │   Stores:            │          │
│                                │   - Gmail tokens     │          │
│                                │   - Business context │          │
│                                └──────────────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              When user clicks "Run Test"                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Step 1: Get AI Draft                                           │
│  ┌────────────┐          ┌───────────────────────┐             │
│  │  Frontend  │─────────▶│      n8n Webhook      │             │
│  │            │  POST    │                       │             │
│  │  Sends:    │          │  - Receives lead data │             │
│  │  - Lead    │          │  - Business context   │             │
│  │  - Context │          │  - Prompt template    │             │
│  └────────────┘          └───────────────────────┘             │
│                                     │                            │
│                                     ▼                            │
│                          ┌───────────────────────┐              │
│                          │    AI Agent (n8n)     │              │
│                          │                       │              │
│                          │  - Processes template │              │
│                          │  - Substitutes {{}}   │              │
│                          │  - Generates reply    │              │
│                          └───────────────────────┘              │
│                                     │                            │
│                                     ▼                            │
│                          ┌───────────────────────┐              │
│                          │   Returns JSON:       │              │
│                          │   {                   │              │
│                          │     "reply": "..."    │              │
│                          │   }                   │              │
│                          └───────────────────────┘              │
│                                     │                            │
│                                     ▼                            │
│  Step 2: Send via User's Gmail                                  │
│  ┌────────────────────────────────────────────┐                 │
│  │  Frontend fetches Gmail tokens from DB     │                 │
│  │  ↓                                          │                 │
│  │  Checks if token expired                   │                 │
│  │  ↓ (if expired)                             │                 │
│  │  Refreshes token using refresh_token       │                 │
│  │  ↓                                          │                 │
│  │  Calls Gmail API to send email             │                 │
│  │  ↓                                          │                 │
│  │  Email sent from: user's Gmail account     │                 │
│  └────────────────────────────────────────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Benefits

### 1. **Multi-Tenant**
- Each user connects their own Gmail
- No shared email account
- Scales to unlimited users

### 2. **n8n is Simple**
- Only handles AI prompt processing
- No email sending logic
- No OAuth management
- Just: Input → AI → Output

### 3. **Frontend is Smart**
- Manages user's Gmail OAuth
- Stores tokens securely in Supabase
- Handles token refresh automatically
- Sends emails via Gmail API

### 4. **Production Ready**
- Secure: Each user controls their own Gmail
- Compliant: Users authorize their own accounts
- Scalable: No rate limits from shared account

## Data Flow Example

### User: Spider Camera Holster

```javascript
// Step 1: User fills form
{
  email: "spidercamholster.store@gmail.com",
  businessDescription: "We sell premium camera holsters",
  productsServices: "Camera holsters, lens cases",
  valueProposition: "Fast-access holsters"
}

// Step 2: User clicks "Connect Gmail"
// → OAuth popup appears
// → User authorizes
// → Frontend saves tokens to Supabase:
{
  gmail_access_token: "ya29.a0...",
  gmail_refresh_token: "1//0g...",
  gmail_token_expiry: "2025-10-23T14:30:00Z",
  gmail_connected: true
}

// Step 3: User clicks "Run Test"
// → Frontend sends to n8n:
{
  leadEmail: "john@example.com",
  leadMessage: "I need a camera holster",
  systemPrompt: `
    You are a sales agent for Spider Camera Holster.
    Business: We sell premium camera holsters
    Products: Camera holsters, lens cases
    Value: Fast-access holsters
  `
}

// Step 4: n8n AI processes and returns:
{
  "reply": "Hi John,\n\nThank you for your interest in our camera holsters...\n\nBest regards,\nSpider Camera Holster Team"
}

// Step 5: Frontend sends email
// → Fetches tokens from Supabase
// → Calls Gmail API
// → Email sent from: spidercamholster.store@gmail.com ✅
```

## Why This Architecture?

### ❌ Old Approach (n8n sends email)
```
User → n8n → Gmail (koreops.ai@gmail.com) → Recipient
Problem: All emails from same account
```

### ✅ New Approach (Frontend sends email)
```
User → n8n (AI only) → Frontend → User's Gmail → Recipient
Benefit: Each user sends from their own account
```

## Files Involved

### Frontend
- `src/components/GmailConnect.jsx` - OAuth button
- `src/lib/gmail.js` - Gmail API functions
- `src/lib/supabase.js` - Token storage
- `src/App.jsx` - Main UI + runTest() logic

### Database
- `email_accounts` table with columns:
  - `gmail_access_token`
  - `gmail_refresh_token`
  - `gmail_token_expiry`
  - `gmail_connected`
  - `business_description`
  - `products_services`
  - `value_proposition`

### n8n Workflow
- Webhook receives lead data + business context
- AI Agent processes with template
- Returns JSON with email draft
- **Does NOT send any emails**

## Environment Variables

### Frontend (.env.local)
```bash
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_GOOGLE_CLIENT_SECRET=your-client-secret
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_N8N_LEAD_INTAKE_URL=your-n8n-webhook-url
```

### Production (Vercel)
Same variables must be set in Vercel dashboard.

## Next Steps

1. ✅ Frontend OAuth - DONE
2. ✅ Token storage - DONE
3. ✅ Gmail API sending - DONE
4. ✅ n8n integration - DONE
5. ⏳ Fix OAuth rejection - IN PROGRESS (need to add redirect URIs)
6. ⏳ Test end-to-end flow

## Current Issue

Google OAuth is rejecting because:
- Missing authorized redirect URIs in Google Cloud Console
- Need to add: `https://www.theagentsbuilder.com`

Once fixed, the entire flow will work perfectly!
