/*
  # Authentication and Security Setup

  1. New Tables
    - admin_users
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - role (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - payments
      - id (uuid, primary key)
      - invoice_id (uuid, references invoices)
      - amount (numeric)
      - payment_date (date)
      - payment_method (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security Updates
    - Add RLS policies for admin access
    - Add policies for customer invoice viewing
*/

-- Admin users table
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'editor'))
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage admin users
CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role = 'admin'
    )
  );

-- Payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices NOT NULL,
  amount numeric NOT NULL,
  payment_date date NOT NULL,
  payment_method text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can manage payments
CREATE POLICY "Admins can manage payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Update existing table policies

-- Customers table policies
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON customers;

CREATE POLICY "Admins can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Invoices table policies
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON invoices;

CREATE POLICY "Admins can manage invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Subscription requests table policies
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON subscription_requests;

CREATE POLICY "Admins can manage subscription requests"
  ON subscription_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Add trigger for admin_users updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for payments updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();