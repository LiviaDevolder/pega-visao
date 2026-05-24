-- CompStat Rio — Schema PostGIS
-- Execute contra o banco Neon após habilitar PostGIS:
--   CREATE EXTENSION IF NOT EXISTS postgis;

CREATE EXTENSION IF NOT EXISTS postgis;

-- ─────────────────────────────────────────
-- 1. Ocorrências criminais (furto e roubo)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ocorrencias (
  id                TEXT PRIMARY KEY,
  ano               INTEGER,
  data              DATE,
  mes               INTEGER,
  hora              TEXT,
  delito            TEXT,
  longitude         DOUBLE PRECISION,
  latitude          DOUBLE PRECISION,
  desc_delito       TEXT,
  aisp              INTEGER,
  risp              INTEGER,
  locf              TEXT,
  dia_semana        TEXT,
  geom              GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_ocorrencias_geom ON ocorrencias USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_delito ON ocorrencias (delito);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_data ON ocorrencias (data);

-- ─────────────────────────────────────────
-- 2. Disque Denúncia
--    Fonte: disk_denuncia.csv (sep=";", encoding=ISO-8859-1)
--    Atenção: latitude/longitude usam vírgula como separador decimal
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS denuncias (
  numero_denuncia         TEXT,
  id_denuncia             TEXT PRIMARY KEY,
  data_denuncia           TIMESTAMP,
  data_difusao            TIMESTAMP,
  tipo_logradouro         TEXT,
  logradouro              TEXT,
  numero_logradouro       TEXT,
  bairro_logradouro       TEXT,
  municipio               TEXT,
  latitude                DOUBLE PRECISION,
  longitude               DOUBLE PRECISION,
  orgao_nome              TEXT,
  classe                  TEXT,
  tipo                    TEXT,
  assunto_principal       BOOLEAN,
  status_denuncia         TEXT,
  relato_redacted         TEXT,
  geom                    GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_denuncias_geom ON denuncias USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_denuncias_classe ON denuncias (classe);
CREATE INDEX IF NOT EXISTS idx_denuncias_data ON denuncias (data_denuncia);

-- ─────────────────────────────────────────
-- 3. Fatores Urbanos / Ambientais
--    coordenada_x = latitude, coordenada_y = longitude (nomenclatura invertida na fonte)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fatores_urbanos (
  id_resposta_ocorrencia  INTEGER PRIMARY KEY,
  logradouro              TEXT,
  numero_porta            TEXT,
  referencia              TEXT,
  coordenada_x            DOUBLE PRECISION,  -- latitude
  coordenada_y            DOUBLE PRECISION,  -- longitude
  bairro_nome             TEXT,
  id_subarea              INTEGER,
  subarea_nome            TEXT,
  id_tipo_ocorrencia      INTEGER,
  tipo_ocorrencia_descricao TEXT,
  orgao_responsavel       TEXT,
  valido                  BOOLEAN,
  geom                    GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_fatores_urbanos_geom ON fatores_urbanos USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_fatores_urbanos_tipo ON fatores_urbanos (id_tipo_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_fatores_urbanos_orgao ON fatores_urbanos (orgao_responsavel);

-- ─────────────────────────────────────────
-- 4. Câmeras nas áreas da FM
--    Fonte: cameras_areas_fm.csv (geometry = WKT POINT)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cameras (
  id_ponto    TEXT PRIMARY KEY,
  nome_area_fm TEXT,
  id_trecho   INTEGER,
  geom        GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_cameras_geom ON cameras USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_cameras_area ON cameras (nome_area_fm);

-- ─────────────────────────────────────────
-- 5. Domínios Territoriais (facções)
--    Fonte: dominio_territorial - Extração 1.csv (geometry = WKT POLYGON)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dominios_territoriais (
  id              SERIAL PRIMARY KEY,
  nome_territorio TEXT,
  dominio_orcrim  TEXT,
  geom            GEOMETRY(MultiPolygon, 4326)
);

CREATE INDEX IF NOT EXISTS idx_dominios_geom ON dominios_territoriais USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_dominios_orcrim ON dominios_territoriais (dominio_orcrim);

-- ─────────────────────────────────────────
-- 6. Áreas da Força Municipal (FM)
--    Fonte: sh_area_forca/areas_forca_municipal.shp
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS areas_fm (
  id        SERIAL PRIMARY KEY,
  nome_area TEXT,
  geom      GEOMETRY(MultiPolygon, 4326)
);

CREATE INDEX IF NOT EXISTS idx_areas_fm_geom ON areas_fm USING GIST (geom);
