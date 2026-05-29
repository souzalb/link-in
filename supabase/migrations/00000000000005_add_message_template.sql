-- Migration to add message_template to events
ALTER TABLE public.events ADD COLUMN message_template TEXT;
