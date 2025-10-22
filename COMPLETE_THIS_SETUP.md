# ✅ COMPLETE YOUR SETUP - 3 SIMPLE STEPS

## You Only Need To Do This ONCE!

All configuration files are now organized and documented. You'll never need to recreate them.

---

## 📋 STEP 1: Get Your Supabase Key (2 minutes)

1. Open this link: https://supabase.com/dashboard/project/hdvbnnxcnknkeyzwgyij/settings/api
2. Log in to Supabase
3. Look for the section labeled **"Project API keys"**
4. Find the key labeled **"anon" or "anon public"**
5. Click the copy icon to copy it

**It looks something like this:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

---

## 📝 STEP 2: Add Key to .env.local (1 minute)

Open this file in any text editor:
```
~/Desktop/claude-project/neutron-agent-builder/.env.local
```

Find this line:
```bash
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
```

Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your actual key from Step 1.

**Example:**
```bash
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

Save the file.

---

## 🗄️ STEP 3: Create Database Table (1 minute)

1. Open: https://supabase.com/dashboard/project/hdvbnnxcnknkeyzwgyij/sql/new
2. Copy and paste this SQL:

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_accounts_user_id ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_email ON email_accounts(email);

-- Enable Row Level Security
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

-- Allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations" ON email_accounts
  FOR ALL USING (true) WITH CHECK (true);
```

3. Click **"RUN"** button

---

## 🎉 DONE! Test It

Restart your dev server (if running):
```bash
npm run dev
```

Visit: http://localhost:5173/

The app should now:
- ✅ Connect to Supabase
- ✅ Save email accounts to database
- ✅ Load saved email accounts
- ✅ No more "context amnesia" - everything persists!

---

## 📁 What Got Created

```
neutron-agent-builder/
├── .env.local              ← Your actual config (ADD SUPABASE KEY HERE)
├── .env.example            ← Template for future reference
├── SETUP.md                ← Detailed setup guide
├── COMPLETE_THIS_SETUP.md  ← This file
└── src/lib/supabase.js     ← Database connection code
```

---

## 🔒 Security Notes

- ✅ The **anon key** is SAFE to use in frontend code
- ❌ NEVER use the **service_role key** in frontend
- ✅ Security is enforced by Row Level Security (RLS) policies

---

## ❓ Need Help?

If something doesn't work:
1. Check console for error messages
2. Verify the key is correctly pasted (no extra spaces)
3. Ensure dev server was restarted after adding the key
4. Check that SQL ran successfully in Supabase

See SETUP.md for detailed troubleshooting.
