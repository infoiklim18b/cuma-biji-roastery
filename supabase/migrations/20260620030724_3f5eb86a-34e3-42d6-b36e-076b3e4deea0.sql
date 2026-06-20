-- Allow anyone (anon or signed in) to log contact messages via activity_logs.
-- Restricted to action='contact_message' to prevent abuse.
CREATE POLICY "anyone can log contact messages"
ON public.activity_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (action = 'contact_message');

GRANT INSERT ON public.activity_logs TO anon, authenticated;