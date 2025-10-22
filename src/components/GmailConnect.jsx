import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { emailAccountsAPI } from '../lib/supabase';

/**
 * Gmail Connect Button Component
 * Allows users to connect their Gmail account via OAuth
 */
export default function GmailConnect({ userEmail, onConnected }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if Gmail is already connected
  useEffect(() => {
    checkConnection();
  }, [userEmail]);

  async function checkConnection() {
    if (!userEmail) return;
    const userId = 'default-user'; // Replace with actual user auth later
    const result = await emailAccountsAPI.getGmailTokens(userId, userEmail);
    console.log('[GmailConnect] checkConnection result:', result);
    setIsConnected(result.success && result.data?.gmail_connected);
  }

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('[GmailConnect] OAuth success! Token response:', tokenResponse);
      setConnecting(true);
      setError(null);

      try {
        // Check if we got a refresh token
        if (!tokenResponse.refresh_token) {
          console.error('[GmailConnect] No refresh_token in response!');
          throw new Error('No refresh token received. Please revoke access at myaccount.google.com/permissions and try again.');
        }

        console.log('[GmailConnect] Saving tokens to database for:', userEmail);
        // Save tokens to Supabase
        const userId = 'default-user';
        const result = await emailAccountsAPI.saveGmailTokens(userId, userEmail, {
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_in: tokenResponse.expires_in
        });

        console.log('[GmailConnect] Save result:', result);

        if (result.success) {
          console.log('[GmailConnect] Tokens saved successfully!');
          setIsConnected(true);
          if (onConnected) onConnected(tokenResponse);
        } else {
          throw new Error(result.error || 'Failed to save Gmail tokens to database');
        }
      } catch (err) {
        setError(err.message);
        console.error('[GmailConnect] Error saving Gmail tokens:', err);
      } finally {
        setConnecting(false);
      }
    },
    onError: (error) => {
      setError('Failed to connect Gmail: ' + (error.error_description || error.message || 'Unknown error'));
      console.error('Gmail OAuth error:', error);
    },
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
    flow: 'auth-code',
    // Force consent screen to always show and return refresh_token
    prompt: 'consent',
    access_type: 'offline'
  });

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
            onClick={() => login()}
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
