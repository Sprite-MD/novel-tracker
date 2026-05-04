CREATE TABLE novels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  chapter     TEXT,
  last_read   DATE,
  notes       TEXT,
  origin      TEXT CHECK (origin IN ('chinese', 'korean', 'japanese', 'other')),
  status      TEXT NOT NULL DEFAULT 'reading'
              CHECK (status IN ('reading', 'finished', 'dropped',
                                'translation_dropped', 'translation_finished')),
  liked       BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER novels_updated_at
  BEFORE UPDATE ON novels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
