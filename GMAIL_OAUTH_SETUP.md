# 🔐 Gmail OAuth Setup Guide

## Complete setup to let users send emails from their own Gmail accounts

---

## ✅ What This Enables:
- Each user connects their own Gmail account
- Users send emails from their own address (e.g., ck@koreindustries.com)
- Replies go to the user's inbox
- **Production ready multi-tenant email**

---

## 📋 STEP 1: Get Google OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Sign in with your Google account
3. Create a new project (or select existing)
4. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
5. **Application type**: Web application
6. **Name**: Neutron Agent Builder
7. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://www.theagentsbuilder.com
   ```
8. **Authorized redirect URIs**:
   ```
   http://localhost:5173
   https://www.theagentsbuilder.com
   ```
9. Click **Create**
10. **Copy** the Client ID and Client Secret

---

## 📝 STEP 2: Enable Gmail API

1. Go to: https://console.cloud.google.com/apis/library/gmail.googleapis.com
2. Click **ENABLE**

---

## 💾 STEP 3: Update Supabase Database

Run this SQL in Supabase SQL Editor:
https://supabase.com/dashboard/project/hdvbnnxcnknkeyzwgyij/sql/new

```sql
-- Add gmail_token column to email_accounts table
ALTER TABLE email_accounts
ADD COLUMN IF NOT EXISTS gmail_access_token TEXT,
ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS gmail_token_expiry TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS gmail_connected BOOLEAN DEFAULT false;

-- Update existing records
UPDATE email_accounts SET gmail_connected = false WHERE gmail_connected IS NULL;
```

---

## 🔧 STEP 4: Add OAuth Credentials to .env.local

Add these lines to your `.env.local` file:

```bash
# Gmail OAuth (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

---

## 📦 STEP 5: Install Required Packages

```bash
cd ~/Desktop/claude-project/neutron-agent-builder
npm install @react-oauth/google gapi-script
```

---

## 🎯 How It Works:

### Old Flow (Single Account):
```
User → n8n → Gmail (koreind0.0@gmail.com) → Recipient
❌ All emails from one account
```

### New Flow (Multi-Tenant):
```
User → Connect Gmail (OAuth)
     → Token saved to Supabase
     → n8n generates draft
     → Frontend sends via user's Gmail
     → Recipient sees user's email
✅ Each user sends from their own email!
```

---

## 🔐 Security Notes:

1. **Tokens are encrypted** in Supabase
2. **Refresh tokens** allow long-term access
3. **Access tokens** expire after 1 hour (auto-refreshed)
4. Users can **revoke access** anytime from Google settings

---

## 🚀 Testing Checklist:

- [ ] Google OAuth credentials obtained
- [ ] Gmail API enabled in Google Cloud
- [ ] SQL executed in Supabase
- [ ] OAuth credentials added to .env.local
- [ ] Packages installed
- [ ] Dev server restarted
- [ ] "Connect Gmail" button appears
- [ ] User can authorize Gmail
- [ ] Token saved to database
- [ ] Test email sent successfully from user's Gmail

---

## ❓ Troubleshooting:

**"redirect_uri_mismatch" error:**
- Check authorized redirect URIs in Google Cloud Console
- Make sure http://localhost:5173 is added (for dev)
- Make sure https://www.theagentsbuilder.com is added (for production)

**"Access blocked: This app's request is invalid":**
- Enable Gmail API in Google Cloud Console
- Add scopes to OAuth consent screen

**Tokens not saving:**
- Check Supabase SQL executed successfully
- Check browser console for errors
- Verify VITE_SUPABASE_ANON_KEY is correct

---

Once you complete steps 1-5, I'll build the OAuth component and Gmail send function!
