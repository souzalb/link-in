-- Migration: add super_admin to the user_role enum
-- ─────────────────────────────────────────────────────────────────────────────
-- IMPORTANT: PostgreSQL requires ALTER TYPE ADD VALUE to be committed before
-- the new value can be used. Run this migration in TWO separate queries:
--
--   STEP 1: Run only the ALTER TYPE statement and wait for it to succeed.
--   STEP 2: Run the rest (DROP/CREATE POLICY statements).
-- ─────────────────────────────────────────────────────────────────────────────

-- ══ STEP 1 ══ Run this alone first, then commit/run before proceeding.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';


-- ══ STEP 2 ══ Run this in a new query AFTER step 1 has been committed.

-- user_roles table
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage user_roles" ON public.user_roles
    FOR ALL USING (get_user_role() IN ('admin', 'super_admin'));

-- events table
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING (get_user_role() IN ('admin', 'super_admin'));

-- allocations table
DROP POLICY IF EXISTS "Admins can manage allocations" ON public.allocations;
CREATE POLICY "Admins can manage allocations" ON public.allocations
    FOR ALL USING (get_user_role() IN ('admin', 'super_admin'));

-- tickets table
DROP POLICY IF EXISTS "Admins can manage tickets" ON public.tickets;
CREATE POLICY "Admins can manage tickets" ON public.tickets
    FOR ALL USING (get_user_role() IN ('admin', 'super_admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- To promote an existing user to super_admin:
--   UPDATE public.user_roles SET role = 'super_admin' WHERE user_id = '<uuid>';
-- ─────────────────────────────────────────────────────────────────────────────
