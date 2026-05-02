-- Create audit_alerts table for tracking store health alerts
CREATE TABLE public.audit_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.store_audits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Alert classification
  type TEXT NOT NULL,      -- 'critical' | 'sales' | 'stock' | 'retention' | 'financial'
  severity TEXT NOT NULL,  -- 'high' | 'medium' | 'low'
  message TEXT NOT NULL,
  recommendation TEXT NOT NULL DEFAULT '',
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit alerts"
  ON public.audit_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit alerts"
  ON public.audit_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audit alerts"
  ON public.audit_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audit alerts"
  ON public.audit_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Add health_percentage column to store_audits if not present
-- (overall_score already exists; health_percentage is a companion metric)
ALTER TABLE public.store_audits
  ADD COLUMN IF NOT EXISTS health_percentage INTEGER,
  ADD COLUMN IF NOT EXISTS alerts_count INTEGER DEFAULT 0;
