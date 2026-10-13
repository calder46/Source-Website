CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 campus text NOT NULL DEFAULT 'Residential' CHECK (campus IN ('Residential','Online')),
 current_degree text NOT NULL DEFAULT 'information-technology',
 academic_standing text NOT NULL DEFAULT 'Not provided',
 gpa numeric(3,2) CHECK (gpa >= 0 AND gpa <= 4),
 classification text NOT NULL DEFAULT 'Not provided',
 program_year text NOT NULL DEFAULT '2026-27',
 course_records jsonb NOT NULL DEFAULT '{}'::jsonb,
 service_complete boolean NOT NULL DEFAULT false,
 graduation_application boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own academic profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Create own academic profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Update own academic profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);