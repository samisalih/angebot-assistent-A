
-- Remove overly permissive RLS policies that conflict with admin-only access

-- Drop the conflicting knowledge_base policy that allows all operations
DROP POLICY IF EXISTS "Allow all operations on knowledge_base" ON knowledge_base;

-- Drop the conflicting ai_service_config policy that allows anyone to manage
DROP POLICY IF EXISTS "Anyone can manage AI service config" ON ai_service_config;

-- Drop existing policies and recreate them to ensure clean state
DROP POLICY IF EXISTS "Authenticated users can read knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Only admins can manage knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Only admins can manage AI service config" ON ai_service_config;

-- Create proper RLS policies for knowledge_base (admin-only write, authenticated read)
CREATE POLICY "Authenticated users can read knowledge base" 
ON knowledge_base FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins can manage knowledge base" 
ON knowledge_base FOR ALL 
TO authenticated 
USING (public.is_admin_user(auth.uid()));

-- Create proper RLS policies for ai_service_config (admin-only)
CREATE POLICY "Only admins can manage AI service config" 
ON ai_service_config FOR ALL 
TO authenticated 
USING (public.is_admin_user(auth.uid()));

-- Create audit logging for admin user creation (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS admin_creation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id),
  target_user_id UUID NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin creation log
ALTER TABLE admin_creation_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admin creation log (drop first if exists)
DROP POLICY IF EXISTS "Only admins can view admin creation logs" ON admin_creation_log;
CREATE POLICY "Only admins can view admin creation logs" 
ON admin_creation_log FOR SELECT 
TO authenticated 
USING (public.is_admin_user(auth.uid()));
