-- ============================================================================
-- CompStat Rio de Janeiro - Schema Migration 001
-- Target: Neon PostgreSQL com PostGIS (SRID 4326 / WGS84)
-- ============================================================================

-- 0. Habilitar PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- 1. OCORRENCIAS (Ocorrencias Criminais)
-- Fonte: df_ocorrencias_tratado - Extracao 1 .csv (~115K registros)
-- ============================================================================

CREATE TABLE ocorrencias (
    id                  SERIAL PRIMARY KEY,
    id_criptografado    TEXT NOT NULL UNIQUE,
    ano                 INTEGER NOT NULL,
    data_fato           DATE,
    mes                 INTEGER NOT NULL,
    hora                TIME,
    delito              INTEGER NOT NULL,
    desc_delito         TEXT NOT NULL,
    longitude           DOUBLE PRECISION NOT NULL,
    latitude            DOUBLE PRECISION NOT NULL,
    aisp                INTEGER,
    risp                INTEGER,
    locf                TEXT,
    dia_semana          TEXT,
    geom                geometry(Point, 4326) NOT NULL
);

COMMENT ON TABLE ocorrencias IS 'Registros de ocorrencias criminais georreferenciadas (fonte: ISP-RJ)';
COMMENT ON COLUMN ocorrencias.data_fato IS 'Data do fato; fonte usa formato DD/MM/YYYY';
COMMENT ON COLUMN ocorrencias.aisp IS 'Area Integrada de Seguranca Publica';
COMMENT ON COLUMN ocorrencias.risp IS 'Regiao Integrada de Seguranca Publica';

CREATE INDEX idx_ocorrencias_geom ON ocorrencias USING GIST (geom);
CREATE INDEX idx_ocorrencias_ano_mes ON ocorrencias (ano, mes);
CREATE INDEX idx_ocorrencias_delito ON ocorrencias (delito);
CREATE INDEX idx_ocorrencias_aisp ON ocorrencias (aisp);

-- ============================================================================
-- 2. DENUNCIAS (Disque Denuncia - ~83.5K registros)
-- Fonte: disk_denuncia.csv | Delimitador: ; | Encoding: ISO-8859-1
-- ============================================================================

CREATE TABLE denuncias (
    id                              SERIAL PRIMARY KEY,
    numero_denuncia                 TEXT NOT NULL,
    id_denuncia                     TEXT NOT NULL UNIQUE,
    data_denuncia                   TIMESTAMP,
    data_difusao                    TIMESTAMP,

    -- Endereco
    tipo_logradouro                 TEXT,
    logradouro                      TEXT,
    numero_logradouro               TEXT,
    complemento_logradouro          TEXT,
    bairro_logradouro               TEXT,
    subbairro_logradouro            TEXT,
    cep_logradouro                  TEXT,
    referencia_logradouro           TEXT,
    municipio                       TEXT,
    estado                          TEXT,

    -- Coordenadas (fonte usa virgula como separador decimal)
    latitude                        DOUBLE PRECISION,
    longitude                       DOUBLE PRECISION,

    -- Xptos
    xptos_id                        TEXT,
    xptos_nome                      TEXT,

    -- Orgao (orgaos.*)
    orgaos_id                       TEXT,
    orgaos_nome                     TEXT,
    orgaos_tipo                     TEXT,

    -- Classificacao (assuntos.*)
    assuntos_id_classe              TEXT,
    assuntos_classe                 TEXT,
    assuntos_tipos_id_tipo          TEXT,
    assuntos_tipos_tipo             TEXT,
    assuntos_tipos_assunto_principal TEXT,

    -- Envolvidos (envolvidos.*)
    envolvidos_id                   TEXT,
    envolvidos_nome                 TEXT,
    envolvidos_vulgo                TEXT,
    envolvidos_sexo                 TEXT,
    envolvidos_idade                TEXT,
    envolvidos_pele                 TEXT,
    envolvidos_estatura             TEXT,
    envolvidos_porte                TEXT,
    envolvidos_cabelos              TEXT,
    envolvidos_olhos                TEXT,
    envolvidos_outras_caracteristicas TEXT,

    -- Status e metadata
    status_denuncia                 TEXT,
    timestamp_insercao              TIMESTAMP,

    -- Campos duplicados top-level (colunas 40-48 do CSV)
    top_id_classe                   TEXT,
    top_classe                      TEXT,
    top_tipos_id_tipo               TEXT,
    top_tipos_tipo                  TEXT,
    top_tipos_assunto_principal     TEXT,
    top_id_tipo                     TEXT,
    top_tipo                        TEXT,
    top_assunto_principal           TEXT,

    -- Relato (redatado)
    relato_redacted                 TEXT,

    -- Geometria (nullable: muitos registros sem coordenadas)
    geom                            geometry(Point, 4326)
);

COMMENT ON TABLE denuncias IS 'Denuncias anonimas do Disque Denuncia (181)';
COMMENT ON COLUMN denuncias.latitude IS 'Latitude; fonte CSV usa virgula como separador decimal';
COMMENT ON COLUMN denuncias.longitude IS 'Longitude; fonte CSV usa virgula como separador decimal';

CREATE INDEX idx_denuncias_geom ON denuncias USING GIST (geom);
CREATE INDEX idx_denuncias_data ON denuncias (data_denuncia);
CREATE INDEX idx_denuncias_bairro ON denuncias (bairro_logradouro);
CREATE INDEX idx_denuncias_assuntos_classe ON denuncias (assuntos_classe);

-- ============================================================================
-- 3. FATORES_URBANOS (Fatores Ambientais Urbanos - ~8.2K registros)
-- Fonte: fatores_urbanos.csv
-- ATENCAO: coordenada_x = latitude, coordenada_y = longitude (invertido!)
-- ============================================================================

CREATE TABLE fatores_urbanos (
    id                              SERIAL PRIMARY KEY,
    id_resposta_ocorrencia          INTEGER NOT NULL UNIQUE,
    logradouro                      TEXT,
    numero_porta                    TEXT,
    referencia                      TEXT,
    latitude                        DOUBLE PRECISION,
    longitude                       DOUBLE PRECISION,
    observacao                      TEXT,
    endereco_informado              TEXT,
    valido                          BOOLEAN,

    -- Localizacao
    id_bairro                       INTEGER,
    bairro_nome                     TEXT,
    id_subarea                      INTEGER,
    subarea_nome                    TEXT,

    -- Tipo de pessoa
    id_tipo_pessoa                  TEXT,
    tipo_pessoa_descricao           TEXT,
    id_ocupacao_pessoa              TEXT,
    ocupacao_pessoa_descricao       TEXT,

    -- Frequencia
    id_tipo_frequencia              TEXT,
    tipo_frequencia_descricao       TEXT,

    -- Drogas
    ocupacao_drogas                 TEXT,
    ocupacao_drogas_descricao       TEXT,

    -- Itens de praca
    id_item_praca                   TEXT,
    item_praca_descricao            TEXT,

    -- Tipo de ocorrencia (o fator urbano)
    id_tipo_ocorrencia              INTEGER,
    tipo_ocorrencia_descricao       TEXT,
    tipo_ocorrencia_ativo           BOOLEAN,

    -- Orgao responsavel
    orgao_responsavel               TEXT,
    ocorrencia_informacao           TEXT,

    -- Detalhes do orgao
    id_orgao_ocorrencia             INTEGER,
    ocorrencia_orgao_nome           TEXT,
    codigo_ocorrencia_orgao         TEXT,

    -- Geometria
    geom                            geometry(Point, 4326)
);

COMMENT ON TABLE fatores_urbanos IS 'Fatores urbanos/ambientais de incidencia criminal mapeados em campo';
COMMENT ON COLUMN fatores_urbanos.latitude IS 'Latitude; no CSV fonte esta na coluna coordenada_x (invertido)';
COMMENT ON COLUMN fatores_urbanos.longitude IS 'Longitude; no CSV fonte esta na coluna coordenada_y (invertido)';

CREATE INDEX idx_fatores_urbanos_geom ON fatores_urbanos USING GIST (geom);
CREATE INDEX idx_fatores_urbanos_tipo_ocorrencia ON fatores_urbanos (id_tipo_ocorrencia);
CREATE INDEX idx_fatores_urbanos_orgao ON fatores_urbanos (orgao_responsavel);
CREATE INDEX idx_fatores_urbanos_bairro ON fatores_urbanos (id_bairro);

-- ============================================================================
-- 4. CAMERAS (Cameras de Vigilancia nas Areas FM - ~985 registros)
-- Fonte: cameras_areas_fm.csv
-- ============================================================================

CREATE TABLE cameras (
    id                  SERIAL PRIMARY KEY,
    id_ponto            UUID NOT NULL UNIQUE,
    nome_area_fm        TEXT NOT NULL,
    id_trecho           TEXT,
    geom                geometry(Point, 4326) NOT NULL
);

COMMENT ON TABLE cameras IS 'Localizacao das cameras de vigilancia nas areas da Forca Municipal';

CREATE INDEX idx_cameras_geom ON cameras USING GIST (geom);
CREATE INDEX idx_cameras_area_fm ON cameras (nome_area_fm);

-- ============================================================================
-- 5. DOMINIOS_TERRITORIAIS (Dominios de Faccoes Criminosas - ~1.628 registros)
-- Fonte: dominio_territorial - Extracao 1.csv
-- ============================================================================

CREATE TABLE dominios_territoriais (
    id                  SERIAL PRIMARY KEY,
    nome_territorio     TEXT NOT NULL,
    dominio_orcrim      TEXT NOT NULL,
    geom                geometry(MultiPolygon, 4326) NOT NULL
);

COMMENT ON TABLE dominios_territoriais IS 'Poligonos de dominio territorial de organizacoes criminosas no Rio de Janeiro';
COMMENT ON COLUMN dominios_territoriais.dominio_orcrim IS 'Sigla da organizacao criminosa (ADA, TCP, CV, etc.)';

CREATE INDEX idx_dominios_territoriais_geom ON dominios_territoriais USING GIST (geom);
CREATE INDEX idx_dominios_territoriais_orcrim ON dominios_territoriais (dominio_orcrim);

-- ============================================================================
-- 6. AREAS_FM (Areas Operacionais da Forca Municipal - 22 registros)
-- Fonte: sh_area_forca/areas_forca_municipal.shp (WGS84)
-- ============================================================================

CREATE TABLE areas_fm (
    id                  SERIAL PRIMARY KEY,
    nome_area_fm        TEXT NOT NULL UNIQUE,
    geom                geometry(MultiPolygon, 4326) NOT NULL
);

COMMENT ON TABLE areas_fm IS 'Poligonos das 22 areas de atuacao da Forca Municipal';
COMMENT ON COLUMN areas_fm.nome_area_fm IS 'Nome da area operacional; chave para JOIN com tabela cameras';

CREATE INDEX idx_areas_fm_geom ON areas_fm USING GIST (geom);

-- ============================================================================
-- Verificacao: listar colunas de geometria registradas
-- ============================================================================
SELECT f_table_name, f_geometry_column, srid, type
FROM geometry_columns
WHERE f_table_schema = 'public'
ORDER BY f_table_name;
