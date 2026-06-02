-- Migration to add allocation flags for retraction and modals
ALTER TABLE public.allocations ADD COLUMN retracted_quota INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.allocations ADD COLUMN has_seen_welcome BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.allocations ADD COLUMN has_seen_deadline_warning BOOLEAN NOT NULL DEFAULT false;
