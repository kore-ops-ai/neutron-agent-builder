/**
 * Gmail API Helper Functions
 * Handles sending emails via user's connected Gmail account
 */

/**
 * Send an email using Gmail API
 * @param {Object} params
 * @param {string} params.accessToken - Gmail OAuth access token
 * @param {string} params.to - Recipient email
 * @param {string} params.from - Sender email
 * @param {string} params.subject - Email subject
 * @param {string} params.body - Email body (plain text)
 * @param {string} params.fromName - Sender name
 */
export async function sendGmailMessage({ accessToken, to, from, subject, body, fromName }) {
  try {
    // Create email in RFC 2822 format
    const email = [
      `From: ${fromName} <${from}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/plain; charset=utf-8`,
      '',
      body
    ].join('\r\n');

    // Encode email in base64url format
    const encodedEmail = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedEmail
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send email');
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
      threadId: data.threadId
    };
  } catch (error) {
    console.error('Error sending Gmail:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Refresh an expired access token
 * @param {string} refreshToken - Gmail OAuth refresh token
 * @param {string} clientId - Google OAuth Client ID
 * @param {string} clientSecret - Google OAuth Client Secret
 */
export async function refreshGmailToken(refreshToken, clientId, clientSecret) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return {
      success: true,
      access_token: data.access_token,
      expires_in: data.expires_in
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if token is expired
 * @param {string} expiryDate - ISO date string of token expiry
 */
export function isTokenExpired(expiryDate) {
  if (!expiryDate) return true;
  const expiry = new Date(expiryDate);
  const now = new Date();
  // Add 5 minute buffer
  return expiry.getTime() - now.getTime() < 5 * 60 * 1000;
}
