-- Create survey tables and policies
-- Generated: 2025-02-02

-- 1. Create tables
CREATE TABLE IF NOT EXISTS public.survey_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completion_time INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL REFERENCES survey_results(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.survey_results TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.survey_responses TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 3. Enable RLS
ALTER TABLE public.survey_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for survey_results
CREATE POLICY "Users can insert own results" ON public.survey_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own results" ON public.survey_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own results" ON public.survey_results
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Create policies for survey_responses
CREATE POLICY "Users can manage own responses" ON public.survey_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.survey_results
            WHERE survey_results.id = survey_responses.survey_id
            AND survey_results.user_id = auth.uid()
        )
    );

-- 6. Admin policies
CREATE POLICY "Admins can view all survey results" ON public.survey_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all survey responses" ON public.survey_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 7. Grant admin role
UPDATE public.users
SET role = 'admin'
WHERE email = 'taejun@biocom.kr';