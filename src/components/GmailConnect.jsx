import React, { useState, useEffect } from 'react';
import { emailAccountsAPI } from '../lib/supabase';
import { getBrowserUserId } from '../lib/userId';

/**
 * Gmail Connect Button Component
 * Allows users to connect their Gmail account via OAuth
 */
export default function GmailConnect({ userEmail, onConnected }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const REDIRECT_URI = window.location.origin;
  const userId = getBrowserUserId(); // Unique ID per browser

  // Check if Gmail is already connected
  useEffect(() => {
    checkConnection();
  }, [userEmail]);

  // Handle OAuth redirect callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state === 'gmail_oauth') {
        console.log('[GmailConnect] OAuth code received from redirect:', code);
        setConnecting(true);

        // Retrieve saved email from sessionStorage
        const savedEmail = sessionStorage.getItem('gmail_oauth_email');
        console.log('[GmailConnect] Retrieved email from session:', savedEmail);

        try {
          // Exchange code for tokens
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              client_id: GOOGLE_CLIENT_ID,
              client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
              redirect_uri: REDIRECT_URI,
              grant_type: 'authorization_code'
            })
          });

          const tokens = await tokenResponse.json();
          console.log('[GmailConnect] Tokens received:', tokens);

          if (tokens.error) {
            throw new Error(tokens.error_description || tokens.error);
          }

          if (!tokens.refresh_token) {
            throw new Error('No refresh token received. Please revoke access at myaccount.google.com/permissions and try again.');
          }

          // Save tokens to database using the saved email
          const result = await emailAccountsAPI.saveGmailTokens(userId, savedEmail || userEmail, {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_in: tokens.expires_in
          });

          if (result.success) {
            console.log('[GmailConnect] Tokens saved successfully!');
            setIsConnected(true);
            // Clean up
            sessionStorage.removeItem('gmail_oauth_email');
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            throw new Error(result.error || 'Failed to save tokens');
          }
        } catch (err) {
          console.error('[GmailConnect] Error handling OAuth callback:', err);
          setError(err.message);
          // Clean up URL and session even on error
          sessionStorage.removeItem('gmail_oauth_email');
          window.history.replaceState({}, document.title, window.location.pathname);
        } finally {
          setConnecting(false);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  async function checkConnection() {
    if (!userEmail) return;
    const result = await emailAccountsAPI.getGmailTokens(userId, userEmail);
    console.log('[GmailConnect] checkConnection result:', result);
    setIsConnected(result.success && result.data?.gmail_connected);
  }

  // Manual OAuth redirect function
  function startGmailOAuth() {
    console.log('[GmailConnect] Starting Gmail OAuth redirect...');

    // Save userEmail to sessionStorage so we can retrieve it after redirect
    sessionStorage.setItem('gmail_oauth_email', userEmail);

    // Build Google OAuth URL
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
      access_type: 'offline',
      prompt: 'consent', // Force consent to get refresh token
      state: 'gmail_oauth' // To identify this flow
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('[GmailConnect] Redirecting to:', authUrl);

    // Redirect to Google
    window.location.href = authUrl;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {isConnected ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded bg-green-500/20 text-green-400 border border-green-500/30">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Gmail Connected</span>
          </div>
        ) : (
          <button
            onClick={startGmailOAuth}
            disabled={connecting || !userEmail}
            className="flex items-center gap-2 px-4 py-2 rounded bg-white text-black font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            {connecting ? 'Connecting...' : 'Connect Gmail'}
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">
          {error}
        </div>
      )}

      {!userEmail && (
        <div className="text-xs text-white/50">
          Please save your email account first before connecting Gmail
        </div>
      )}

      {isConnected && (
        <div className="text-xs text-white/60">
          Emails will be sent from your connected Gmail account
        </div>
      )}
    </div>
  );
}
