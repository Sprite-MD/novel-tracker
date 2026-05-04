-- Convert status from TEXT to TEXT[] so a novel can have multiple status tags.
-- 'reading' is the implicit default (empty array = currently reading).

ALTER TABLE novels DROP CONSTRAINT IF EXISTS novels_status_check;

-- Drop the old string default before changing the column type
ALTER TABLE novels ALTER COLUMN status DROP DEFAULT;

ALTER TABLE novels
  ALTER COLUMN status TYPE TEXT[]
  USING CASE
    WHEN status = 'reading' THEN '{}'::TEXT[]
    ELSE ARRAY[status]
  END;

ALTER TABLE novels ALTER COLUMN status SET DEFAULT '{}';
