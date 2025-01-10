/*
  # Initial Schema Setup for Newspaper Agency

  1. New Tables
    - customers
      - id (uuid, primary key)
      - name (text)
      - email (text)
      - phone (text)
      - address (text)
      - status (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - invoices
      - id (uuid, primary key)
      - customer_id (uuid, foreign key)
      - amount (numeric)
      - due_date (date)
      - status (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - subscription_requests
      - id (uuid, primary key)
      - name (text)
      - email (text)
      - phone (text)
      - address (text)
      - status (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to authenticated users"
  ON customers
  FOR ALL
  TO authenticated
  USING (true);

-- Invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  amount numeric NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to authenticated users"
  ON invoices
  FOR ALL
  TO authenticated
  USING (true);

-- Subscription requests table
CREATE TABLE subscription_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to authenticated users"
  ON subscription_requests
  FOR ALL
  TO authenticated
  USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_requests_updated_at
  BEFORE UPDATE ON subscription_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();