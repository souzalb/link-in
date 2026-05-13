-- Initial schema for Link-in System

-- ENUMS
CREATE TYPE ticket_status AS ENUM ('pending', 'issued', 'checked_in', 'revoked');
CREATE TYPE user_role AS ENUM ('admin', 'student', 'scanner');

-- USER ROLES TABLE
-- Associates a role to an authenticated user id.
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- EVENTS TABLE
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    banner_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ALLOCATIONS TABLE
CREATE TABLE public.allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_email VARCHAR(255) NOT NULL,
    total_quota INTEGER NOT NULL DEFAULT 0,
    used_quota INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, student_email)
);

-- TICKETS TABLE
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    allocated_by VARCHAR(255) NOT NULL, -- student_email
    guest_email VARCHAR(255),
    guest_name VARCHAR(255),
    qr_token UUID UNIQUE DEFAULT gen_random_uuid(),
    status ticket_status NOT NULL DEFAULT 'pending',
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Setup
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- POLICIES

-- user_roles: only users can read their own roles (admins can read all, wait, we'll keep it simple for now)
CREATE POLICY "Users can read their own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user_roles" ON public.user_roles
    FOR ALL USING (get_user_role() = 'admin');

-- events: everyone can read events
CREATE POLICY "Anyone can read events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING (get_user_role() = 'admin');

-- allocations: admins manage, students can read their own based on auth.jwt() email
CREATE POLICY "Admins can manage allocations" ON public.allocations
    FOR ALL USING (get_user_role() = 'admin');

CREATE POLICY "Students can read their own allocations" ON public.allocations
    FOR SELECT USING (
      student_email = (auth.jwt() ->> 'email')
    );

-- tickets: admins manage, students can manage their own allocations, guests can read their own
CREATE POLICY "Admins can manage tickets" ON public.tickets
    FOR ALL USING (get_user_role() = 'admin');

CREATE POLICY "Students can manage tickets they allocated" ON public.tickets
    FOR ALL USING (
      allocated_by = (auth.jwt() ->> 'email')
    );

CREATE POLICY "Guests can view their own ticket" ON public.tickets
    FOR SELECT USING (
      guest_email = (auth.jwt() ->> 'email')
    );

CREATE POLICY "Scanners can read and update tickets" ON public.tickets
    FOR UPDATE USING (get_user_role() = 'scanner');

CREATE POLICY "Scanners can view tickets" ON public.tickets
    FOR SELECT USING (get_user_role() = 'scanner');
