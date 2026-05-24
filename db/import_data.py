"""
CompStat Rio - Script de importação de dados para Neon PostgreSQL + PostGIS
Importa 6 tabelas a partir dos CSVs e shapefile em base_data/
"""

import csv
import os
import sys
from datetime import datetime

import geopandas as gpd
import psycopg2
from psycopg2.extras import execute_values

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "base_data", "dados")
SHP_DIR = os.path.join(BASE_DIR, "base_data", "sh_area_forca")

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    # Tenta ler do .env
    env_path = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    DATABASE_URL = line.strip().split("=", 1)[1]
                    break

if not DATABASE_URL:
    print("ERROR: DATABASE_URL não definida")
    sys.exit(1)

BATCH_SIZE = 1000


def get_conn():
    return psycopg2.connect(DATABASE_URL)


# ---------------------------------------------------------------------------
# 1. Ocorrências (~115K registros)
# ---------------------------------------------------------------------------
def import_ocorrencias(conn):
    filepath = os.path.join(DATA_DIR, "df_ocorrencias_tratado - Extração 1 .csv")
    print(f"\n{'='*60}")
    print(f"Importando OCORRÊNCIAS de {os.path.basename(filepath)}")

    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM ocorrencias")
    if cur.fetchone()[0] > 0:
        print("  Tabela já possui dados, pulando...")
        return

    rows = []
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            # Parse data (DD/MM/YYYY ou vazio)
            data_fato = None
            if r["data"]:
                try:
                    data_fato = datetime.strptime(r["data"], "%d/%m/%Y").date()
                except ValueError:
                    data_fato = None

            # Parse hora (HH:MM:SS ou vazio)
            hora = r["hora"] if r["hora"] else None

            lon = float(r["longitude"])
            lat = float(r["latitude"])

            rows.append((
                r["id_criptografado"],
                int(r["ano"]),
                data_fato,
                int(r["mes"]),
                hora,
                int(r["delito"]),
                r["desc_delito"],
                lon,
                lat,
                int(r["aisp"]) if r["aisp"] else None,
                int(r["risp"]) if r["risp"] else None,
                r["locf"] if r["locf"] else None,
                r["dia_semana"] if r["dia_semana"] else None,
                lon, lat  # para ST_SetSRID
            ))

    sql = """
        INSERT INTO ocorrencias (
            id_criptografado, ano, data_fato, mes, hora, delito, desc_delito,
            longitude, latitude, aisp, risp, locf, dia_semana, geom
        ) VALUES %s
        ON CONFLICT (id_criptografado) DO NOTHING
    """
    template = """(
        %s, %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s,
        ST_SetSRID(ST_MakePoint(%s, %s), 4326)
    )"""

    total = len(rows)
    inserted = 0
    for i in range(0, total, BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        execute_values(cur, sql, batch, template=template, page_size=BATCH_SIZE)
        conn.commit()
        inserted += len(batch)
        print(f"  {inserted}/{total} ({100*inserted//total}%)", end="\r")

    print(f"\n  OK: {total} registros processados")


# ---------------------------------------------------------------------------
# 2. Denúncias (~83.5K registros) - ISO-8859-1, delimitador ;
# ---------------------------------------------------------------------------
def parse_decimal_br(val):
    """Converte ',-22,899555' para float. Trata vírgula como separador decimal."""
    if not val or val.strip() == "":
        return None
    try:
        return float(val.replace(",", "."))
    except ValueError:
        return None


def parse_datetime_us(val):
    """Parse formato M/D/YYYY H:MM:SS"""
    if not val or val.strip() == "":
        return None
    try:
        return datetime.strptime(val.strip(), "%m/%d/%Y %H:%M:%S")
    except ValueError:
        try:
            return datetime.strptime(val.strip(), "%m/%d/%Y %H:%M")
        except ValueError:
            return None


def import_denuncias(conn):
    filepath = os.path.join(DATA_DIR, "disk_denuncia.csv")
    print(f"\n{'='*60}")
    print(f"Importando DENÚNCIAS de {os.path.basename(filepath)}")

    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM denuncias")
    if cur.fetchone()[0] > 0:
        print("  Tabela já possui dados, pulando...")
        return

    rows = []
    with open(filepath, encoding="iso-8859-1") as f:
        reader = csv.DictReader(f, delimiter=";")
        for r in reader:
            lat = parse_decimal_br(r.get("latitude"))
            lon = parse_decimal_br(r.get("longitude"))

            rows.append((
                r.get("numero_denuncia", ""),
                r.get("id_denuncia", ""),
                parse_datetime_us(r.get("data_denuncia")),
                parse_datetime_us(r.get("data_difusao")),
                r.get("tipo_logradouro") or None,
                r.get("logradouro") or None,
                r.get("numero_logradouro") or None,
                r.get("complemento_logradouro") or None,
                r.get("bairro_logradouro") or None,
                r.get("subbairro_logradouro") or None,
                r.get("cep_logradouro") or None,
                r.get("referencia_logradouro") or None,
                r.get("municipio") or None,
                r.get("estado") or None,
                lat,
                lon,
                r.get("xptos.id") or None,
                r.get("xptos.nome") or None,
                r.get("orgaos.id") or None,
                r.get("orgaos.nome") or None,
                r.get("orgaos.tipo") or None,
                r.get("assuntos.id_classe") or None,
                r.get("assuntos.classe") or None,
                r.get("assuntos.tipos.id_tipo") or None,
                r.get("assuntos.tipos.tipo") or None,
                r.get("assuntos.tipos.assunto_principal") or None,
                r.get("envolvidos.id") or None,
                r.get("envolvidos.nome") or None,
                r.get("envolvidos.vulgo") or None,
                r.get("envolvidos.sexo") or None,
                r.get("envolvidos.idade") or None,
                r.get("envolvidos.pele") or None,
                r.get("envolvidos.estatura") or None,
                r.get("envolvidos.porte") or None,
                r.get("envolvidos.cabelos") or None,
                r.get("envolvidos.olhos") or None,
                r.get("envolvidos.outras_caracteristicas") or None,
                r.get("status_denuncia") or None,
                parse_datetime_us(r.get("timestamp_insercao")),
                r.get("id_classe") or None,
                r.get("classe") or None,
                r.get("tipos.id_tipo") or None,
                r.get("tipos.tipo") or None,
                r.get("tipos.assunto_principal") or None,
                r.get("id_tipo") or None,
                r.get("tipo") or None,
                r.get("assunto_principal") or None,
                r.get("relato_redacted") or None,
                lon, lat  # para geom (pode ser None)
            ))

    sql = """
        INSERT INTO denuncias (
            numero_denuncia, id_denuncia, data_denuncia, data_difusao,
            tipo_logradouro, logradouro, numero_logradouro, complemento_logradouro,
            bairro_logradouro, subbairro_logradouro, cep_logradouro, referencia_logradouro,
            municipio, estado, latitude, longitude,
            xptos_id, xptos_nome,
            orgaos_id, orgaos_nome, orgaos_tipo,
            assuntos_id_classe, assuntos_classe,
            assuntos_tipos_id_tipo, assuntos_tipos_tipo, assuntos_tipos_assunto_principal,
            envolvidos_id, envolvidos_nome, envolvidos_vulgo, envolvidos_sexo,
            envolvidos_idade, envolvidos_pele, envolvidos_estatura, envolvidos_porte,
            envolvidos_cabelos, envolvidos_olhos, envolvidos_outras_caracteristicas,
            status_denuncia, timestamp_insercao,
            top_id_classe, top_classe, top_tipos_id_tipo, top_tipos_tipo,
            top_tipos_assunto_principal, top_id_tipo, top_tipo, top_assunto_principal,
            relato_redacted, geom
        ) VALUES %s
        ON CONFLICT (id_denuncia) DO NOTHING
    """
    template = """(
        %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s,
        %s, %s, %s,
        %s, %s,
        %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s,
        %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s,
        CASE WHEN %s IS NOT NULL AND %s IS NOT NULL
             THEN ST_SetSRID(ST_MakePoint(%s, %s), 4326)
             ELSE NULL END
    )"""

    total = len(rows)
    inserted = 0
    for i in range(0, total, BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        # Cada row precisa lon,lat repetido para o CASE + MakePoint
        expanded = []
        for row in batch:
            # row[-2] = lon, row[-1] = lat
            lon_val = row[-2]
            lat_val = row[-1]
            expanded.append(row[:-2] + (lon_val, lat_val, lon_val, lat_val))
        execute_values(cur, sql, expanded, template=template, page_size=BATCH_SIZE)
        conn.commit()
        inserted += len(batch)
        print(f"  {inserted}/{total} ({100*inserted//total}%)", end="\r")

    print(f"\n  OK: {total} registros processados")


# ---------------------------------------------------------------------------
# 3. Fatores Urbanos (~8.2K registros)
# ATENÇÃO: coordenada_x = latitude, coordenada_y = longitude (invertido!)
# ---------------------------------------------------------------------------
def import_fatores_urbanos(conn):
    filepath = os.path.join(DATA_DIR, "fatores_urbanos.csv")
    print(f"\n{'='*60}")
    print(f"Importando FATORES URBANOS de {os.path.basename(filepath)}")

    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM fatores_urbanos")
    if cur.fetchone()[0] > 0:
        print("  Tabela já possui dados, pulando...")
        return

    rows = []
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            # coordenada_x = latitude, coordenada_y = longitude (invertido no CSV!)
            lat_str = r.get("coordenada_x", "").strip()
            lon_str = r.get("coordenada_y", "").strip()
            lat = float(lat_str) if lat_str else None
            lon = float(lon_str) if lon_str else None

            valido = None
            v = r.get("valido", "").strip().upper()
            if v == "TRUE":
                valido = True
            elif v == "FALSE":
                valido = False

            tipo_oc_ativo = None
            ta = r.get("tipo_ocorrencia_ativo", "").strip().upper()
            if ta == "TRUE":
                tipo_oc_ativo = True
            elif ta == "FALSE":
                tipo_oc_ativo = False

            def safe_int(val):
                v = val.strip() if val else ""
                return int(v) if v else None

            rows.append((
                int(r["id_resposta_ocorrencia"]),
                r.get("logradouro") or None,
                r.get("numero_porta") or None,
                r.get("referencia") or None,
                lat,
                lon,
                r.get("observacao") or None,
                r.get("endereco_informado") or None,
                valido,
                safe_int(r.get("id_bairro", "")),
                r.get("bairro_nome") or None,
                safe_int(r.get("id_subarea", "")),
                r.get("subarea_nome") or None,
                r.get("id_tipo_pessoa") or None,
                r.get("tipo_pessoa_descricao") or None,
                r.get("id_ocupacao_pessoa") or None,
                r.get("ocupacao_pessoa_descricao") or None,
                r.get("id_tipo_frequencia") or None,
                r.get("tipo_frequencia_descricao") or None,
                r.get("ocupacao_drogas") or None,
                r.get("ocupacao_drogas_descricao") or None,
                r.get("id_item_praca") or None,
                r.get("item_praca_descricao") or None,
                safe_int(r.get("id_tipo_ocorrencia", "")),
                r.get("tipo_ocorrencia_descricao") or None,
                tipo_oc_ativo,
                r.get("orgao_responsavel") or None,
                r.get("ocorrencia_informacao") or None,
                safe_int(r.get("id_orgao_ocorrencia", "")),
                r.get("ocorrencia_orgao_nome") or None,
                r.get("codigo_ocorrencia_orgao") or None,
                lon, lat  # para ST_MakePoint(lon, lat)
            ))

    sql = """
        INSERT INTO fatores_urbanos (
            id_resposta_ocorrencia, logradouro, numero_porta, referencia,
            latitude, longitude, observacao, endereco_informado, valido,
            id_bairro, bairro_nome, id_subarea, subarea_nome,
            id_tipo_pessoa, tipo_pessoa_descricao,
            id_ocupacao_pessoa, ocupacao_pessoa_descricao,
            id_tipo_frequencia, tipo_frequencia_descricao,
            ocupacao_drogas, ocupacao_drogas_descricao,
            id_item_praca, item_praca_descricao,
            id_tipo_ocorrencia, tipo_ocorrencia_descricao, tipo_ocorrencia_ativo,
            orgao_responsavel, ocorrencia_informacao,
            id_orgao_ocorrencia, ocorrencia_orgao_nome, codigo_ocorrencia_orgao,
            geom
        ) VALUES %s
        ON CONFLICT (id_resposta_ocorrencia) DO NOTHING
    """
    template = """(
        %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s,
        %s, %s, %s,
        %s, %s,
        %s, %s, %s,
        CASE WHEN %s IS NOT NULL AND %s IS NOT NULL
             THEN ST_SetSRID(ST_MakePoint(%s, %s), 4326)
             ELSE NULL END
    )"""

    total = len(rows)
    inserted = 0
    for i in range(0, total, BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        expanded = []
        for row in batch:
            lon_val = row[-2]
            lat_val = row[-1]
            expanded.append(row[:-2] + (lon_val, lat_val, lon_val, lat_val))
        execute_values(cur, sql, expanded, template=template, page_size=BATCH_SIZE)
        conn.commit()
        inserted += len(batch)
        print(f"  {inserted}/{total} ({100*inserted//total}%)", end="\r")

    print(f"\n  OK: {total} registros processados")


# ---------------------------------------------------------------------------
# 4. Câmeras (~985 registros)
# ---------------------------------------------------------------------------
def import_cameras(conn):
    filepath = os.path.join(DATA_DIR, "cameras_areas_fm.csv")
    print(f"\n{'='*60}")
    print(f"Importando CÂMERAS de {os.path.basename(filepath)}")

    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM cameras")
    if cur.fetchone()[0] > 0:
        print("  Tabela já possui dados, pulando...")
        return

    rows = []
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            wkt = r["geometry"].strip()
            rows.append((
                r["id_ponto"],
                r["nome_area_fm"],
                r.get("id_trecho") or None,
                wkt,
            ))

    sql = """
        INSERT INTO cameras (id_ponto, nome_area_fm, id_trecho, geom)
        VALUES %s
        ON CONFLICT (id_ponto) DO NOTHING
    """
    template = "(%s, %s, %s, ST_SetSRID(ST_GeomFromText(%s), 4326))"

    execute_values(cur, sql, rows, template=template, page_size=BATCH_SIZE)
    conn.commit()
    print(f"  OK: {len(rows)} registros processados")


# ---------------------------------------------------------------------------
# 5. Domínios Territoriais (~1.628 registros)
# ---------------------------------------------------------------------------
def import_dominios_territoriais(conn):
    filepath = os.path.join(DATA_DIR, "outros dados",
                            "dominio_territorial - Extração 1.csv")
    print(f"\n{'='*60}")
    print(f"Importando DOMÍNIOS TERRITORIAIS de {os.path.basename(filepath)}")

    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM dominios_territoriais")
    if cur.fetchone()[0] > 0:
        print("  Tabela já possui dados, pulando...")
        return

    rows = []
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            wkt = r["geometria"].strip()
            # Tabela espera MultiPolygon; WKT pode ser POLYGON ou MULTIPOLYGON
            rows.append((
                r["nome_territorio"],
                r["dominio_orcrim"],
                wkt,
            ))

    sql = """
        INSERT INTO dominios_territoriais (nome_territorio, dominio_orcrim, geom)
        VALUES %s
    """
    # ST_Multi converte POLYGON em MULTIPOLYGON se necessário
    template = "(%s, %s, ST_Multi(ST_SetSRID(ST_GeomFromText(%s), 4326)))"

    execute_values(cur, sql, rows, template=template, page_size=BATCH_SIZE)
    conn.commit()
    print(f"  OK: {len(rows)} registros processados")


# ---------------------------------------------------------------------------
# 6. Áreas FM (22 polígonos do Shapefile)
# ---------------------------------------------------------------------------
def import_areas_fm(conn):
    filepath = os.path.join(SHP_DIR, "areas_forca_municipal.shp")
    print(f"\n{'='*60}")
    print(f"Importando ÁREAS FM de {os.path.basename(filepath)}")

    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM areas_fm")
    if cur.fetchone()[0] > 0:
        print("  Tabela já possui dados, pulando...")
        return

    gdf = gpd.read_file(filepath)
    # Garantir CRS 4326
    if gdf.crs and gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)

    print(f"  Shapefile tem {len(gdf)} registros, colunas: {list(gdf.columns)}")

    # Coluna 'nome_subar' contém o nome da área FM
    nome_col = "nome_subar"
    print(f"  Usando coluna '{nome_col}' como nome_area_fm")

    rows = []
    for _, row in gdf.iterrows():
        geom = row.geometry
        # Garantir MultiPolygon
        if geom.geom_type == "Polygon":
            from shapely.geometry import MultiPolygon
            geom = MultiPolygon([geom])
        wkt = geom.wkt
        rows.append((row[nome_col], wkt))

    sql = """
        INSERT INTO areas_fm (nome_area_fm, geom)
        VALUES %s
        ON CONFLICT (nome_area_fm) DO NOTHING
    """
    template = "(%s, ST_SetSRID(ST_GeomFromText(%s), 4326))"

    execute_values(cur, sql, rows, template=template, page_size=100)
    conn.commit()
    print(f"  OK: {len(rows)} registros processados")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("CompStat Rio - Importação de Dados")
    print("=" * 60)

    conn = get_conn()
    try:
        import_ocorrencias(conn)
        import_denuncias(conn)
        import_fatores_urbanos(conn)
        import_cameras(conn)
        import_dominios_territoriais(conn)
        import_areas_fm(conn)

        # Validação final
        print(f"\n{'='*60}")
        print("VALIDAÇÃO FINAL")
        print("=" * 60)
        cur = conn.cursor()
        tables = [
            ("ocorrencias", "~115K"),
            ("denuncias", "~83.5K"),
            ("fatores_urbanos", "~8.2K"),
            ("cameras", "~985"),
            ("dominios_territoriais", "~1.628"),
            ("areas_fm", "22"),
        ]
        for table, expected in tables:
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            count = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {table} WHERE geom IS NOT NULL")
            geom_count = cur.fetchone()[0]
            print(f"  {table:25s} {count:>8,} registros  (geom: {geom_count:>8,})  esperado: {expected}")

    finally:
        conn.close()

    print("\nImportação concluída!")


if __name__ == "__main__":
    main()
