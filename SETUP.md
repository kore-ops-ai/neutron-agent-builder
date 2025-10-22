# Neutron Agent Builder - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Your `.env.local` file is already created with placeholders. You only need to add your **Supabase anon key**.

#### Get Your Supabase Anon Key:

1. Go to: https://supabase.com/dashboard/project/hdvbnnxcnknkeyzwgyij/settings/api
2. Log in to your Supabase account
3. Copy the **"anon public"** key (NOT the service_role key)
4. Open `.env.local` in your project root
5. Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your actual key

**File location:** `~/Desktop/claude-project/neutron-agent-builder/.env.local`

#### Your `.env.local` should look like this:
```bash
VITE_SUPABASE_URL=https://hdvbnnxcnknkeyzwgyij.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Your actual key here
```

### 3. Create Database Table

Run this SQL in your Supabase SQL Editor:
https://supabase.com/dashboard/project/hdvbnnxcnknkeyzwgyij/sql/new

```sql
-- Create email_accounts table
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  signature TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_accounts_user_id ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_email ON email_accounts(email);

-- Enable Row Level Security (RLS)
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on email_accounts" ON email_accounts
  FOR ALL USING (true) WITH CHECK (true);
```

### 4. Start Development Server
```bash
npm run dev
```

Open http://localhost:5173/

## 📁 Project Structure

```
neutron-agent-builder/
├── .env.local           # Your actual environment variables (DO NOT COMMIT)
├── .env.example         # Template for environment variables
├── SETUP.md            # This file
├── src/
│   ├── App.jsx         # Main application
│   └── lib/
│       └── supabase.js # Supabase client (will be created)
└── public/
```

## 🔧 Configuration Files

### `.env.local` (Private)
- Contains your actual API keys and secrets
- **Never commit this file to git**
- Already in `.gitignore`

### `.env.example` (Template)
- Public template showing what variables are needed
- Safe to commit to git
- Use as reference when setting up new environments

## 🔐 Security Notes

1. **Anon Key is Safe for Frontend**: The Supabase anon key is designed to be public. Security is enforced through Row Level Security (RLS) policies.

2. **Service Role Key**: NEVER use the service_role key in frontend code. It bypasses all RLS policies.

3. **Row Level Security**: Always configure RLS policies on your Supabase tables to control data access.

## ✅ Verification

After setup, verify everything works:

1. Dev server starts without errors
2. No console errors about missing env variables
3. Email account settings can be saved (once Supabase code is added)

## 🆘 Troubleshooting

### "VITE_SUPABASE_ANON_KEY is undefined"
- Check that you replaced `YOUR_SUPABASE_ANON_KEY_HERE` with your actual key
- Restart the dev server after changing `.env.local`

### Can't connect to Supabase
- Verify your project ID is correct: `hdvbnnxcnknkeyzwgyij`
- Check your internet connection
- Ensure Supabase project is not paused

### Database table not found
- Run the SQL script provided in step 3
- Check table was created in Supabase dashboard

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- N8N Docs: https://docs.n8n.io/
- Project Dashboard: https://supabase.com/dashboard/project/hdvbnnxcnknkeyzwgyij
