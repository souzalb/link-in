-- Migration to add guest phone to tickets
ALTER TABLE public.tickets ADD COLUMN guest_phone VARCHAR(255);
