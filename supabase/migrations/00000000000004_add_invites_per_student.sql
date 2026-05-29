-- Migration to add invites_per_student to events
ALTER TABLE public.events ADD COLUMN invites_per_student INTEGER NOT NULL DEFAULT 3;
