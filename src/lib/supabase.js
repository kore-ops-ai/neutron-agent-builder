import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Please check your .env.local file and ensure:');
  console.error('- VITE_SUPABASE_URL is set');
  console.error('- VITE_SUPABASE_ANON_KEY is set');
  console.error('See SETUP.md for instructions');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Email Accounts API
export const emailAccountsAPI = {
  /**
   * Save or update an email account
   * @param {Object} account - Email account data
   * @param {string} account.userId - User identifier
   * @param {string} account.email - Email address
   * @param {string} account.name - User name
   * @param {string} account.company - Company name
   * @param {string} account.signature - Email signature
   * @param {string} account.businessDescription - Business description
   * @param {string} account.productsServices - Products/services offered
   * @param {string} account.valueProposition - Value proposition
   * @param {boolean} account.isDefault - Set as default account
   */
  async save(account) {
    try {
      // First check if account already exists
      const { data: existing, error: checkError } = await supabase
        .from('email_accounts')
        .select('id')
        .eq('user_id', account.userId)
        .eq('email', account.email)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing account
        result = await supabase
          .from('email_accounts')
          .update({
            name: account.name,
            company: account.company,
            signature: account.signature,
            business_description: account.businessDescription || '',
            products_services: account.productsServices || '',
            value_proposition: account.valueProposition || '',
            is_default: account.isDefault || false,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // Insert new account
        result = await supabase
          .from('email_accounts')
          .insert({
            user_id: account.userId,
            email: account.email,
            name: account.name,
            company: account.company,
            signature: account.signature,
            business_description: account.businessDescription || '',
            products_services: account.productsServices || '',
            value_proposition: account.valueProposition || '',
            is_default: account.isDefault || false
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error saving email account:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all email accounts for a user
   * @param {string} userId - User identifier
   */
  async getAll(userId) {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching email accounts:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Get default email account for a user
   * @param {string} userId - User identifier
   */
  async getDefault(userId) {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching default email account:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  /**
   * Delete an email account
   * @param {string} accountId - Account UUID
   */
  async delete(accountId) {
    try {
      const { error} = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting email account:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Save Gmail OAuth tokens for an account
   * @param {string} userId - User identifier
   * @param {string} email - Email address
   * @param {Object} tokens - Gmail OAuth tokens
   */
  async saveGmailTokens(userId, email, tokens) {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .update({
          gmail_access_token: tokens.access_token,
          gmail_refresh_token: tokens.refresh_token,
          gmail_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          gmail_connected: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('email', email)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving Gmail tokens:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get Gmail tokens for an account
   * @param {string} userId - User identifier
   * @param {string} email - Email address
   */
  async getGmailTokens(userId, email) {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('gmail_access_token, gmail_refresh_token, gmail_token_expiry, gmail_connected')
        .eq('user_id', userId)
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting Gmail tokens:', error);
      return { success: false, error: error.message, data: null };
    }
  }
};
