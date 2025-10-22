-- Add business context columns to email_accounts table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hdvbnnxcnknkeyzwgyij/sql/new

ALTER TABLE email_accounts
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS products_services TEXT,
ADD COLUMN IF NOT EXISTS value_proposition TEXT;

-- Add comment for clarity
COMMENT ON COLUMN email_accounts.business_description IS 'What the business does - helps AI understand context';
COMMENT ON COLUMN email_accounts.products_services IS 'What products/services the business offers';
COMMENT ON COLUMN email_accounts.value_proposition IS 'The business value proposition';
