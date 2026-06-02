-- Migration to add rsvp_deadline_days to events
ALTER TABLE public.events ADD COLUMN rsvp_deadline_days INTEGER NOT NULL DEFAULT 7;
