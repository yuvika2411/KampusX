-- Add floor_room and created_at to issues table
-- Existing rows stay valid with NULL values
ALTER TABLE issues ADD COLUMN IF NOT EXISTS floor_room VARCHAR(100);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
