-- Add image_type to issue_images table
-- Existing rows default to 'REPORTED'
ALTER TABLE issue_images ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) DEFAULT 'REPORTED' NOT NULL;
ALTER TABLE issue_images ALTER COLUMN image_url TYPE VARCHAR(1000);
