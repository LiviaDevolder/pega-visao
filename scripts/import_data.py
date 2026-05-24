"""
CompStat Rio — Script de importação de dados para o banco Neon PostGIS

Dependências Python:
    pip install psycopg2-binary pandas geopandas shapely python-dotenv

Uso:
    cp .env.local.example .env.local  # preencha DATABASE_URL
    python scripts/import_data.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env.local")

import pandas as pd
import geopandas as gpd
import psycopg2
from psycopg2.extras import execute_values
from shapely import wkt

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    sys.exit("DATABASE_URL não definida — configure o .env.local")

BASE = Path(__file__).parent.parent / "base_data"
DADOS = BASE / "dados"

# ─────────────────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(DATABASE_URL)


def log(msg: str):
    print(f"→ {msg}", flush=True)


# ─────────────────────────────────────────────────────────────────────────────
# 1. Ocorrências (115k registros)
# ─────────────────────────────────────────────────────────────────────────────

def import_ocorrencias(conn):
    log("Importando ocorrências...")
    csv_path = DADOS / "df_ocorrencias_tratado - Extração 1 .csv"
    df = pd.read_csv(csv_path, dtype=str)

    # Normaliza colunas numéricas
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["ano"] = pd.to_numeric(df["ano"], errors="coerce").astype("Int64")
    df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
    df["aisp"] = pd.to_numeric(df["aisp"], errors="coerce").astype("Int64")
    df["risp"] = pd.to_numeric(df["risp"], errors="coerce").astype("Int64")

    rows = []
    for _, r in df.iterrows():
        lat, lon = r["latitude"], r["longitude"]
        geom = f"SRID=4326;POINT({lon} {lat})" if pd.notna(lat) and pd.notna(lon) else None
        rows.append((
            r["id_criptografado"],
            r["ano"] if pd.notna(r["ano"]) else None,
            r["data"] if pd.notna(r["data"]) else None,
            r["mes"] if pd.notna(r["mes"]) else None,
            r["hora"] if pd.notna(r["hora"]) else None,
            r["delito"] if pd.notna(r["delito"]) else None,
            lon if pd.notna(lon) else None,
            lat if pd.notna(lat) else None,
            r["desc_delito"] if pd.notna(r["desc_delito"]) else None,
            r["aisp"] if pd.notna(r["aisp"]) else None,
            r["risp"] if pd.notna(r["risp"]) else None,
            r["locf"] if pd.notna(r["locf"]) else None,
            r["dia_semana"] if pd.notna(r["dia_semana"]) else None,
            geom,
        ))

    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE ocorrencias")
        execute_values(cur, """
            INSERT INTO ocorrencias
              (id, ano, data, mes, hora, delito, longitude, latitude,
               desc_delito, aisp, risp, locf, dia_semana, geom)
            VALUES %s
            ON CONFLICT (id) DO NOTHING
        """, rows, template="(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,ST_GeomFromEWKT(%s))")
    conn.commit()
    log(f"  {len(rows)} ocorrências importadas.")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Disque Denúncia (83.5k registros, ISO-8859-1, sep=;)
# ─────────────────────────────────────────────────────────────────────────────

def import_denuncias(conn):
    log("Importando denúncias...")
    csv_path = DADOS / "disk_denuncia.csv"
    df = pd.read_csv(csv_path, sep=";", encoding="iso-8859-1", dtype=str)

    # Latitude e longitude usam vírgula como separador decimal
    df["latitude"] = pd.to_numeric(df["latitude"].str.replace(",", "."), errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"].str.replace(",", "."), errors="coerce")

    rows = []
    for _, r in df.iterrows():
        lat, lon = r["latitude"], r["longitude"]
        geom = f"SRID=4326;POINT({lon} {lat})" if pd.notna(lat) and pd.notna(lon) else None

        assunto_principal = None
        if pd.notna(r.get("assunto_principal")):
            val = str(r["assunto_principal"]).strip()
            if val in ("1", "True", "true", "TRUE"):
                assunto_principal = True
            elif val in ("0", "False", "false", "FALSE"):
                assunto_principal = False

        rows.append((
            r.get("numero_denuncia"),
            r.get("id_denuncia"),
            r.get("data_denuncia"),
            r.get("data_difusao"),
            r.get("tipo_logradouro"),
            r.get("logradouro"),
            r.get("numero_logradouro"),
            r.get("bairro_logradouro"),
            r.get("municipio"),
            lat if pd.notna(lat) else None,
            lon if pd.notna(lon) else None,
            r.get("orgaos.nome"),
            r.get("classe"),
            r.get("tipos.tipo"),
            assunto_principal,
            r.get("status_denuncia"),
            r.get("relato_redacted"),
            geom,
        ))

    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE denuncias")
        execute_values(cur, """
            INSERT INTO denuncias
              (numero_denuncia, id_denuncia, data_denuncia, data_difusao,
               tipo_logradouro, logradouro, numero_logradouro, bairro_logradouro,
               municipio, latitude, longitude, orgao_nome, classe, tipo,
               assunto_principal, status_denuncia, relato_redacted, geom)
            VALUES %s
            ON CONFLICT (id_denuncia) DO NOTHING
        """, rows, template="(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,ST_GeomFromEWKT(%s))")
    conn.commit()
    log(f"  {len(rows)} denúncias importadas.")


# ─────────────────────────────────────────────────────────────────────────────
# 3. Fatores Urbanos (2.085 registros)
# ─────────────────────────────────────────────────────────────────────────────

def import_fatores_urbanos(conn):
    log("Importando fatores urbanos...")
    csv_path = DADOS / "fatores_urbanos.csv"
    df = pd.read_csv(csv_path, dtype=str)

    df["coordenada_x"] = pd.to_numeric(df["coordenada_x"], errors="coerce")  # latitude
    df["coordenada_y"] = pd.to_numeric(df["coordenada_y"], errors="coerce")  # longitude
    df["id_resposta_ocorrencia"] = pd.to_numeric(df["id_resposta_ocorrencia"], errors="coerce").astype("Int64")
    df["id_subarea"] = pd.to_numeric(df["id_subarea"], errors="coerce").astype("Int64")
    df["id_tipo_ocorrencia"] = pd.to_numeric(df["id_tipo_ocorrencia"], errors="coerce").astype("Int64")

    rows = []
    for _, r in df.iterrows():
        lat = r["coordenada_x"]  # x=lat na fonte
        lon = r["coordenada_y"]  # y=lon na fonte
        geom = f"SRID=4326;POINT({lon} {lat})" if pd.notna(lat) and pd.notna(lon) else None

        valido = None
        if pd.notna(r.get("valido")):
            valido = str(r["valido"]).strip().upper() == "TRUE"

        rows.append((
            r["id_resposta_ocorrencia"] if pd.notna(r["id_resposta_ocorrencia"]) else None,
            r.get("logradouro"),
            r.get("numero_porta"),
            r.get("referencia"),
            lat if pd.notna(lat) else None,
            lon if pd.notna(lon) else None,
            r.get("bairro_nome"),
            r["id_subarea"] if pd.notna(r["id_subarea"]) else None,
            r.get("subarea_nome"),
            r["id_tipo_ocorrencia"] if pd.notna(r["id_tipo_ocorrencia"]) else None,
            r.get("tipo_ocorrencia_descricao"),
            r.get("orgao_responsavel"),
            valido,
            geom,
        ))

    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE fatores_urbanos")
        execute_values(cur, """
            INSERT INTO fatores_urbanos
              (id_resposta_ocorrencia, logradouro, numero_porta, referencia,
               coordenada_x, coordenada_y, bairro_nome, id_subarea, subarea_nome,
               id_tipo_ocorrencia, tipo_ocorrencia_descricao, orgao_responsavel,
               valido, geom)
            VALUES %s
            ON CONFLICT (id_resposta_ocorrencia) DO NOTHING
        """, rows, template="(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,ST_GeomFromEWKT(%s))")
    conn.commit()
    log(f"  {len(rows)} fatores urbanos importados.")


# ─────────────────────────────────────────────────────────────────────────────
# 4. Câmeras (985 registros, WKT POINT)
# ─────────────────────────────────────────────────────────────────────────────

def import_cameras(conn):
    log("Importando câmeras...")
    csv_path = DADOS / "cameras_areas_fm.csv"
    df = pd.read_csv(csv_path, dtype=str)

    rows = []
    for _, r in df.iterrows():
        geom = None
        geom_wkt = r.get("geometry", "")
        if pd.notna(geom_wkt) and geom_wkt.strip():
            try:
                # WKT já vem com coordenadas lon lat
                geom = f"SRID=4326;{geom_wkt.strip()}"
            except Exception:
                pass

        rows.append((
            r["id_ponto"],
            r.get("nome_area_fm"),
            int(r["id_trecho"]) if pd.notna(r.get("id_trecho")) else None,
            geom,
        ))

    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE cameras")
        execute_values(cur, """
            INSERT INTO cameras (id_ponto, nome_area_fm, id_trecho, geom)
            VALUES %s
            ON CONFLICT (id_ponto) DO NOTHING
        """, rows, template="(%s,%s,%s,ST_GeomFromEWKT(%s))")
    conn.commit()
    log(f"  {len(rows)} câmeras importadas.")


# ─────────────────────────────────────────────────────────────────────────────
# 5. Domínios Territoriais (1.628 registros, WKT POLYGON)
# ─────────────────────────────────────────────────────────────────────────────

def import_dominios_territoriais(conn):
    log("Importando domínios territoriais...")
    csv_path = DADOS / "outros dados" / "dominio_territorial - Extração 1.csv"
    df = pd.read_csv(csv_path, dtype=str)

    rows = []
    for _, r in df.iterrows():
        geom = None
        geom_wkt = r.get("geometria", "")
        if pd.notna(geom_wkt) and geom_wkt.strip():
            try:
                shape = wkt.loads(geom_wkt.strip())
                # Garante MULTIPOLYGON para uniformidade
                if shape.geom_type == "Polygon":
                    from shapely.geometry import MultiPolygon
                    shape = MultiPolygon([shape])
                geom = f"SRID=4326;{shape.wkt}"
            except Exception:
                pass

        rows.append((
            r.get("nome_territorio"),
            r.get("dominio_orcrim"),
            geom,
        ))

    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE dominios_territoriais RESTART IDENTITY")
        execute_values(cur, """
            INSERT INTO dominios_territoriais (nome_territorio, dominio_orcrim, geom)
            VALUES %s
        """, rows, template="(%s,%s,ST_GeomFromEWKT(%s))")
    conn.commit()
    log(f"  {len(rows)} domínios territoriais importados.")


# ─────────────────────────────────────────────────────────────────────────────
# 6. Áreas FM (22 polígonos, shapefile)
# ─────────────────────────────────────────────────────────────────────────────

def import_areas_fm(conn):
    log("Importando áreas da Força Municipal (shapefile)...")
    shp_path = BASE / "sh_area_forca" / "areas_forca_municipal.shp"
    gdf = gpd.read_file(shp_path)

    # Reprojetar para WGS84 (EPSG:4326) se necessário
    if gdf.crs and gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)

    # Identifica coluna de nome (primeira coluna de texto que não seja geometry)
    name_col = next(
        (c for c in gdf.columns if c != "geometry" and gdf[c].dtype == object),
        None,
    )

    rows = []
    for _, r in gdf.iterrows():
        shape = r.geometry
        if shape is None:
            continue
        if shape.geom_type == "Polygon":
            from shapely.geometry import MultiPolygon
            shape = MultiPolygon([shape])
        geom = f"SRID=4326;{shape.wkt}"
        nome = r[name_col] if name_col else None
        rows.append((nome, geom))

    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE areas_fm RESTART IDENTITY")
        execute_values(cur, """
            INSERT INTO areas_fm (nome_area, geom)
            VALUES %s
        """, rows, template="(%s,ST_GeomFromEWKT(%s))")
    conn.commit()
    log(f"  {len(rows)} áreas FM importadas.")


# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("CompStat Rio — Importação de dados")
    print("=" * 40)

    # Valida existência dos arquivos
    required = [
        DADOS / "df_ocorrencias_tratado - Extração 1 .csv",
        DADOS / "disk_denuncia.csv",
        DADOS / "fatores_urbanos.csv",
        DADOS / "cameras_areas_fm.csv",
        DADOS / "outros dados" / "dominio_territorial - Extração 1.csv",
        BASE / "sh_area_forca" / "areas_forca_municipal.shp",
    ]
    missing = [p for p in required if not p.exists()]
    if missing:
        print("Arquivos não encontrados:")
        for p in missing:
            print(f"  {p}")
        sys.exit(1)

    conn = get_conn()
    try:
        import_ocorrencias(conn)
        import_denuncias(conn)
        import_fatores_urbanos(conn)
        import_cameras(conn)
        import_dominios_territoriais(conn)
        import_areas_fm(conn)
        print("\nImportação concluída com sucesso.")
    except Exception as e:
        conn.rollback()
        print(f"\nErro durante importação: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
