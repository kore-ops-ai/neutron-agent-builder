# Google OAuth & Gmail API - Complete Explanation

## Table of Contents
1. [What is OAuth?](#what-is-oauth)
2. [The Problem OAuth Solves](#the-problem-oauth-solves)
3. [OAuth Flow Step-by-Step](#oauth-flow-step-by-step)
4. [Understanding Tokens](#understanding-tokens)
5. [How Our Frontend Handles OAuth](#how-our-frontend-handles-oauth)
6. [Gmail API Integration](#gmail-api-integration)
7. [Security & Best Practices](#security--best-practices)

---

## What is OAuth?

**OAuth 2.0** is an authorization framework that allows applications to access user resources (like Gmail) **without ever seeing the user's password**.

### Analogy:
Imagine a hotel:
- **You** = The Gmail account owner
- **Hotel Room** = Your Gmail account
- **Your Belongings** = Your emails
- **Valet** = Our web app
- **Hotel Key Card** = OAuth Token

Instead of giving the valet your room key (password), the hotel desk gives the valet a **temporary key card** that:
- ✅ Only works for specific areas (read emails, send emails)
- ✅ Expires after a certain time
- ✅ Can be revoked anytime
- ✅ Doesn't give access to everything in your room

That's OAuth!

---

## The Problem OAuth Solves

### ❌ Old Way (Before OAuth):
```
┌─────────────┐
│ Your App    │
│             │
│ "Give me    │
│ your Gmail  │──────┐
│ password!"  │      │
└─────────────┘      ▼
                ┌──────────────┐
                │ user@gmail   │
                │ password123  │← Stored in app database
                └──────────────┘
                      │
                      ▼
                ┌──────────────┐
                │ Gmail        │
                │ (logged in   │
                │  as user)    │
                └──────────────┘
```

**Problems:**
- App has your password (huge security risk!)
- App can do ANYTHING with your Gmail
- Can't revoke access without changing password
- Password stored in app's database

### ✅ New Way (With OAuth):
```
┌─────────────┐
│ Your App    │
│             │
│ "Let user   │
│ authorize"  │
└─────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ Google OAuth Consent Screen     │
│                                 │
│ "TheAgentsBuilder wants to:"    │
│ • Send emails as you            │
│ • Read your email messages      │
│                                 │
│ [Allow]  [Deny]                 │
└─────────────────────────────────┘
      │ User clicks "Allow"
      ▼
┌─────────────────────────────────┐
│ Google gives your app:          │
│ • access_token (short-lived)    │
│ • refresh_token (long-lived)    │
└─────────────────────────────────┘
      │
      ▼
┌─────────────┐
│ Your App    │
│ Uses tokens │
│ (not pwd!)  │
└─────────────┘
```

**Benefits:**
- ✅ App NEVER sees your password
- ✅ You control what app can access
- ✅ Revoke access anytime (no password change needed)
- ✅ Tokens expire automatically

---

## OAuth Flow Step-by-Step

### Our Implementation: Authorization Code Flow

```
┌──────────────┐                    ┌──────────────┐
│   Browser    │                    │   Google     │
│   (User)     │                    │   OAuth      │
└──────────────┘                    └──────────────┘
      │                                    │
      │ 1. User clicks "Connect Gmail"    │
      ├────────────────────────────────────▶
      │                                    │
      │ 2. Redirect to Google consent     │
      │    with parameters:               │
      │    - client_id                     │
      │    - redirect_uri                  │
      │    - scope                         │
      │    - response_type=code            │
      │    - access_type=offline           │
      │    - prompt=consent                │
      │◀───────────────────────────────────┤
      │                                    │
      │ 3. User authorizes                │
      ├────────────────────────────────────▶
      │                                    │
      │ 4. Google redirects back with     │
      │    authorization code             │
      │◀───────────────────────────────────┤
      │                                    │
      │ 5. Exchange code for tokens       │
      ├────────────────────────────────────▶
      │                                    │
      │ 6. Google returns tokens:         │
      │    {                               │
      │      access_token: "ya29...",      │
      │      refresh_token: "1//0g...",    │
      │      expires_in: 3600              │
      │    }                               │
      │◀───────────────────────────────────┤
      │                                    │
      ▼                                    ▼
```

### Detailed Explanation of Each Step:

#### **Step 1: User Clicks "Connect Gmail"**

**In our code** (`src/components/GmailConnect.jsx`):
```javascript
const login = useGoogleLogin({
  scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
  flow: 'auth-code',
  prompt: 'consent',
  access_type: 'offline',
  onSuccess: async (tokenResponse) => {
    // We'll get tokens here
  }
});

// When button clicked:
<button onClick={() => login()}>Connect Gmail</button>
```

**What happens:**
- `useGoogleLogin` is from `@react-oauth/google` library
- It constructs a URL to Google's OAuth server
- Opens popup window to that URL

#### **Step 2: Redirect to Google with Parameters**

**The URL looks like:**
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=14209320072-7eagr8v7k53f1nuapftl1ooejf43h57j.apps.googleusercontent.com
  &redirect_uri=https://www.theagentsbuilder.com
  &scope=https://www.googleapis.com/auth/gmail.send%20https://www.googleapis.com/auth/gmail.readonly
  &response_type=code
  &access_type=offline
  &prompt=consent
```

**Parameters explained:**
- `client_id`: Your app's unique identifier from Google Cloud Console
- `redirect_uri`: Where Google sends user after authorization (must match settings in Google Cloud Console!)
- `scope`: What permissions you're requesting
  - `gmail.send` = Send emails as the user
  - `gmail.readonly` = Read user's emails
- `response_type=code`: We want an authorization code (not token directly)
- `access_type=offline`: We want a refresh_token (to get new access_token when it expires)
- `prompt=consent`: Force consent screen even if user previously authorized (ensures we always get refresh_token)

#### **Step 3: User Authorizes**

**What user sees:**
```
┌─────────────────────────────────────────┐
│ TheAgentsBuilder wants to access your   │
│ Google Account                          │
│                                         │
│ spidercamholster.store@gmail.com        │
│                                         │
│ This will allow TheAgentsBuilder to:    │
│                                         │
│ ☑ Send email on your behalf            │
│ ☑ View your email messages              │
│                                         │
│ [Cancel]              [Allow]           │
└─────────────────────────────────────────┘
```

User clicks **"Allow"**.

#### **Step 4: Google Redirects Back with Code**

**Google redirects to:**
```
https://www.theagentsbuilder.com/?code=4/0AfJohXm...very-long-code...xyz&scope=https://www.googleapis.com/auth/gmail.send+https://www.googleapis.com/auth/gmail.readonly
```

**The `code` parameter** is the authorization code.
- **Temporary** - expires in ~10 minutes
- **One-time use** - can only be exchanged once
- **Not the actual access token** - needs to be exchanged

#### **Step 5: Exchange Code for Tokens**

**Our library (`@react-oauth/google`) automatically does this:**

```javascript
// Behind the scenes, the library makes this request:

POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&code=4/0AfJohXm...very-long-code...xyz
&grant_type=authorization_code
&redirect_uri=https://www.theagentsbuilder.com
```

**Important:**
- This happens **server-side** (not in browser)
- Requires `client_secret` (which should be kept private)
- Google verifies the code is valid and matches the client_id

#### **Step 6: Google Returns Tokens**

**Response from Google:**
```json
{
  "access_token": "ya29.a0AfB_byD8...",
  "refresh_token": "1//0gCmFjY...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly"
}
```

**Now our frontend receives this in the `onSuccess` callback!**

---

## Understanding Tokens

### 1. Access Token

```javascript
"access_token": "ya29.a0AfB_byD8XyZ123..."
```

**What is it?**
- A **short-lived** credential (typically 1 hour)
- Like a temporary security badge
- Used to make API calls to Gmail

**How to use it:**
```javascript
// Making a Gmail API request
fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,  // ← Here!
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ raw: encodedEmail })
})
```

**Properties:**
- ✅ Works for ~1 hour
- ✅ Safe to use in frontend (short-lived = less risk)
- ❌ Expires automatically
- ❌ Cannot be "renewed" directly

**Example in our code** (`src/lib/gmail.js`):
```javascript
export async function sendGmailMessage({ accessToken, to, subject, body }) {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,  // Using access token here
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encodedEmail })
  });

  return await response.json();
}
```

### 2. Refresh Token

```javascript
"refresh_token": "1//0gCmFjYxK..."
```

**What is it?**
- A **long-lived** credential (can last indefinitely)
- Like a master key that generates new temporary badges
- Used to get new access_tokens when they expire

**How to use it:**
```javascript
// When access_token expires, use refresh_token to get a new one
const response = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    refresh_token: refreshToken,  // ← The refresh token
    grant_type: 'refresh_token'
  })
});

// Response:
{
  "access_token": "ya29.NEW_ACCESS_TOKEN...",  // ← New access token!
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**Properties:**
- ✅ Long-lived (doesn't expire automatically)
- ✅ Can generate new access_tokens
- ❌ Very sensitive (like a master password)
- ❌ Should be stored securely (we store in Supabase database)

**Example in our code** (`src/lib/gmail.js`):
```javascript
export async function refreshGmailToken(refreshToken, clientId, clientSecret) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) throw new Error('Failed to refresh token');

  const data = await response.json();
  // data.access_token is the new access token!
  return data;
}
```

### 3. Expires In

```javascript
"expires_in": 3600  // seconds
```

**What is it?**
- Number of seconds until access_token expires
- Typically 3600 (1 hour)

**How we use it:**
```javascript
// When saving tokens, calculate expiry time
const expiryDate = new Date(Date.now() + expires_in * 1000);
// Save to database: gmail_token_expiry = "2025-10-23T14:30:00Z"
```

**Checking if expired:**
```javascript
export function isTokenExpired(expiryDate) {
  if (!expiryDate) return true;

  const now = new Date();
  const expiry = new Date(expiryDate);
  const fiveMinutes = 5 * 60 * 1000;

  // Refresh 5 minutes before actual expiry (safety buffer)
  return (expiry.getTime() - now.getTime()) < fiveMinutes;
}
```

---

## How Our Frontend Handles OAuth

### File Structure

```
src/
├── components/
│   └── GmailConnect.jsx         ← OAuth button component
├── lib/
│   ├── gmail.js                 ← Gmail API functions
│   └── supabase.js              ← Token storage
└── App.jsx                      ← Uses tokens to send emails
```

### 1. GmailConnect Component

**Purpose:** Handle the OAuth flow and save tokens

```javascript
// src/components/GmailConnect.jsx

import { useGoogleLogin } from '@react-oauth/google';
import { emailAccountsAPI } from '../lib/supabase';

export default function GmailConnect({ userEmail, onConnected }) {
  const [isConnected, setIsConnected] = useState(false);

  // Check if Gmail is already connected on mount
  useEffect(() => {
    async function checkConnection() {
      const userId = 'default-user';
      const result = await emailAccountsAPI.getGmailTokens(userId, userEmail);
      setIsConnected(result.success && result.data?.gmail_connected);
    }
    checkConnection();
  }, [userEmail]);

  // Configure OAuth
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // We got tokens!
      console.log('Access token:', tokenResponse.access_token);
      console.log('Refresh token:', tokenResponse.refresh_token);

      // Save to Supabase
      const userId = 'default-user';
      const result = await emailAccountsAPI.saveGmailTokens(userId, userEmail, {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_in: tokenResponse.expires_in
      });

      if (result.success) {
        setIsConnected(true);
        if (onConnected) onConnected(tokenResponse);
      }
    },
    onError: (error) => {
      console.error('OAuth failed:', error);
    },
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
    flow: 'auth-code',
    prompt: 'consent',      // Always show consent screen
    access_type: 'offline'  // Get refresh_token
  });

  return (
    <button onClick={() => login()}>
      {isConnected ? 'Gmail Connected ✓' : 'Connect Gmail'}
    </button>
  );
}
```

**What happens when button is clicked:**
1. `login()` function is called
2. Popup opens to Google OAuth
3. User authorizes
4. `onSuccess` callback receives tokens
5. Tokens are saved to Supabase
6. Button changes to "Gmail Connected"

### 2. Token Storage (Supabase)

**Purpose:** Securely store tokens in database

```javascript
// src/lib/supabase.js

export const emailAccountsAPI = {
  async saveGmailTokens(userId, email, tokens) {
    const expiryDate = new Date(Date.now() + tokens.expires_in * 1000);

    const { data, error } = await supabase
      .from('email_accounts')
      .update({
        gmail_access_token: tokens.access_token,
        gmail_refresh_token: tokens.refresh_token,
        gmail_token_expiry: expiryDate.toISOString(),
        gmail_connected: true
      })
      .eq('user_id', userId)
      .eq('email', email);

    if (error) throw error;
    return { success: true, data };
  },

  async getGmailTokens(userId, email) {
    const { data, error } = await supabase
      .from('email_accounts')
      .select('gmail_access_token, gmail_refresh_token, gmail_token_expiry, gmail_connected')
      .eq('user_id', userId)
      .eq('email', email)
      .single();

    if (error) throw error;
    return { success: true, data };
  }
};
```

**Database table structure:**
```sql
CREATE TABLE email_accounts (
  id UUID PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  gmail_access_token TEXT,           -- ya29.a0AfB_...
  gmail_refresh_token TEXT,          -- 1//0gCmFj...
  gmail_token_expiry TIMESTAMP,      -- 2025-10-23T14:30:00Z
  gmail_connected BOOLEAN,           -- true/false
  business_description TEXT,
  products_services TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Sending Emails with Gmail API

**Purpose:** Use tokens to send emails via Gmail

```javascript
// src/App.jsx - runTest() function

async function runTest() {
  // Step 1: Get tokens from database
  const userId = 'default-user';
  const tokensResult = await emailAccountsAPI.getGmailTokens(userId, userEmail);

  if (!tokensResult.success || !tokensResult.data?.gmail_connected) {
    alert('Please connect Gmail first!');
    return;
  }

  let accessToken = tokensResult.data.gmail_access_token;

  // Step 2: Check if token expired
  const { isTokenExpired, refreshGmailToken } = await import('./lib/gmail.js');

  if (isTokenExpired(tokensResult.data.gmail_token_expiry)) {
    console.log('Token expired, refreshing...');

    // Step 3: Refresh token if needed
    const refreshResult = await refreshGmailToken(
      tokensResult.data.gmail_refresh_token,
      import.meta.env.VITE_GOOGLE_CLIENT_ID,
      import.meta.env.VITE_GOOGLE_CLIENT_SECRET
    );

    // Step 4: Save new access token
    accessToken = refreshResult.access_token;
    await emailAccountsAPI.saveGmailTokens(userId, userEmail, {
      access_token: refreshResult.access_token,
      refresh_token: tokensResult.data.gmail_refresh_token,
      expires_in: refreshResult.expires_in || 3600
    });
  }

  // Step 5: Send email via Gmail API
  const { sendGmailMessage } = await import('./lib/gmail.js');

  await sendGmailMessage({
    accessToken,
    to: 'recipient@example.com',
    from: userEmail,
    fromName: userName,
    subject: 'Test Email',
    body: 'Hello from my Gmail!'
  });

  alert(`Email sent from ${userEmail}!`);
}
```

---

## Gmail API Integration

### How Gmail API Works

**Base URL:** `https://gmail.googleapis.com/gmail/v1/`

**Authentication:** Every request needs `Authorization: Bearer {access_token}` header

### Sending an Email

```javascript
// src/lib/gmail.js

export async function sendGmailMessage({ accessToken, to, from, subject, body, fromName }) {
  // Step 1: Create RFC 2822 formatted email
  const email = [
    `From: ${fromName} <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    '',
    body
  ].join('\r\n');

  // Step 2: Encode in base64url format
  const encodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')    // + → -
    .replace(/\//g, '_')    // / → _
    .replace(/=+$/, '');    // Remove trailing =

  // Step 3: Send to Gmail API
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,  // ← Access token here!
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: encodedEmail
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gmail API error: ${error.error.message}`);
  }

  return await response.json();
}
```

**What happens:**
1. Email is formatted according to RFC 2822 standard
2. Encoded in base64url (Gmail API requirement)
3. Sent to Gmail API with access_token
4. Gmail sends the email **as the user** (from their Gmail account)

**Response from Gmail:**
```json
{
  "id": "18b5e0a1f2c3d4e5",
  "threadId": "18b5e0a1f2c3d4e5",
  "labelIds": ["SENT"]
}
```

---

## Security & Best Practices

### 1. Never Expose Client Secret in Frontend

**❌ Bad:**
```javascript
// DON'T hardcode in frontend JavaScript
const CLIENT_SECRET = 'GOCSPX-ABC123...';  // Visible to anyone!
```

**✅ Good:**
```javascript
// Use environment variables
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
```

**Even Better:**
- Client secret should ideally be used only on backend
- In our case, `@react-oauth/google` library handles this securely

### 2. Store Tokens Securely

**❌ Bad:**
```javascript
// Don't store in localStorage (vulnerable to XSS attacks)
localStorage.setItem('gmail_token', token);
```

**✅ Good:**
```javascript
// Store in database (Supabase) with proper access controls
await supabase.from('email_accounts').update({ gmail_access_token: token });
```

### 3. Use HTTPS Only

**Why:**
- Tokens are transmitted over the network
- HTTPS encrypts the connection
- Prevents man-in-the-middle attacks

**Our setup:**
- Development: `http://localhost:5173` (OK for testing)
- Production: `https://www.theagentsbuilder.com` (Must be HTTPS!)

### 4. Validate Redirect URIs

**In Google Cloud Console:**
```
Authorized redirect URIs:
✅ https://www.theagentsbuilder.com
✅ https://www.theagentsbuilder.com/
✅ http://localhost:5173 (for development)

❌ http://evil-site.com (would be rejected!)
```

**Why:**
- Google only redirects to pre-approved URIs
- Prevents attackers from stealing authorization codes

### 5. Use `prompt: 'consent'` for Refresh Tokens

```javascript
useGoogleLogin({
  prompt: 'consent',      // ← Important!
  access_type: 'offline'  // ← Important!
})
```

**Why:**
- `prompt: 'consent'` forces consent screen to show every time
- This ensures refresh_token is returned every time
- Without it, refresh_token only returned on first authorization

### 6. Handle Token Expiry Gracefully

```javascript
// Always check if token expired before using it
if (isTokenExpired(expiryDate)) {
  // Refresh token first
  const newToken = await refreshGmailToken(refreshToken);
  // Then use new token
  await sendEmail(newToken.access_token);
} else {
  // Use existing token
  await sendEmail(existingAccessToken);
}
```

### 7. Implement Token Revocation

**Allow users to disconnect:**
```javascript
async function disconnectGmail() {
  // Remove tokens from database
  await emailAccountsAPI.update({
    gmail_access_token: null,
    gmail_refresh_token: null,
    gmail_connected: false
  });

  // Optionally: Revoke token at Google
  await fetch(`https://oauth2.googleapis.com/revoke?token=${refreshToken}`, {
    method: 'POST'
  });
}
```

---

## Summary

### The Complete Flow

```
1. User clicks "Connect Gmail"
   ↓
2. Popup opens to Google OAuth consent screen
   ↓
3. User authorizes (clicks "Allow")
   ↓
4. Google redirects back with authorization code
   ↓
5. Our app exchanges code for tokens (behind the scenes)
   ↓
6. We receive:
   • access_token (valid for 1 hour)
   • refresh_token (valid indefinitely)
   ↓
7. We save tokens to Supabase database
   ↓
8. When sending email:
   • Check if access_token expired
   • If expired: use refresh_token to get new access_token
   • Use access_token to call Gmail API
   • Gmail sends email as the user
```

### Key Takeaways

1. **OAuth = Authorization, not Authentication**
   - Lets apps access user resources without passwords
   - User remains in control

2. **Two Types of Tokens**
   - **Access Token**: Short-lived, used for API calls
   - **Refresh Token**: Long-lived, gets new access tokens

3. **Security is Critical**
   - Use HTTPS in production
   - Store tokens securely (database, not localStorage)
   - Validate redirect URIs
   - Never expose client_secret

4. **Our Implementation**
   - Frontend handles OAuth popup
   - Tokens stored in Supabase
   - Gmail API sends emails as user
   - n8n only processes AI prompts (no email sending)

---

## Next Steps

To make OAuth work, you need to:

1. **Add Redirect URIs in Google Cloud Console**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Add: `https://www.theagentsbuilder.com`

2. **Add Test User**
   - Go to: https://console.cloud.google.com/apis/credentials/consent
   - Add: `spidercamholster.store@gmail.com`

3. **Test the Flow**
   - Click "Connect Gmail"
   - Authorize
   - Send a test email!

Once you do step 1 and 2, the OAuth rejection will be fixed and everything will work! 🚀
