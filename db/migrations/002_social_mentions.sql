CREATE TABLE social_mentions (
  id              SERIAL PRIMARY KEY,
  tweet_id        TEXT UNIQUE NOT NULL,
  texto           TEXT NOT NULL,
  autor           TEXT,
  data_tweet      TIMESTAMPTZ,
  url             TEXT,
  captured_at     TIMESTAMPTZ DEFAULT NOW(),
  query_origem    TEXT,
  status          TEXT DEFAULT 'pendente de classificacao',
  area_fm         TEXT,
  tipo_crime      TEXT,
  local_especifico TEXT,
  horario_relatado TEXT,
  relevancia      INTEGER CHECK (relevancia BETWEEN 1 AND 5),
  sentimento      TEXT
);

CREATE INDEX idx_social_status    ON social_mentions(status);
CREATE INDEX idx_social_area_fm   ON social_mentions(area_fm);
CREATE INDEX idx_social_tipo      ON social_mentions(tipo_crime);
CREATE INDEX idx_social_data      ON social_mentions(data_tweet DESC);
CREATE INDEX idx_social_relevancia ON social_mentions(relevancia);
