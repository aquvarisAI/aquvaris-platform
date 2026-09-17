"""
Aquvaris MTR — Pipeline de Ingestão Bronze
EPIC 03 — MTR-018 a MTR-024
Version: 0.1
Date: 2026-09-16

Baixa os Relatórios Gerenciais Mensais do MTR Online FEPAM
e os armazena na camada Bronze com rastreabilidade completa.

Uso:
    python mtr_ingestao.py                  # baixa todos os disponíveis
    python mtr_ingestao.py --ano 2026       # só 2026
    python mtr_ingestao.py --mes 2026-08    # só agosto/2026
    python mtr_ingestao.py --dry-run        # lista sem baixar
"""

import os
import sys
import hashlib
import json
import argparse
import time
import logging
from datetime import datetime, timezone
from pathlib import Path
import requests

# ── Configuração ──────────────────────────────────────────────────────────────

BASE_DIR     = Path(__file__).parent
BRONZE_DIR   = BASE_DIR / "data" / "mtr" / "bronze"
MANIFEST_FILE = BRONZE_DIR / "_manifest.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
log = logging.getLogger("mtr.ingestao")

# ── Catálogo de relatórios disponíveis ────────────────────────────────────────
# Fonte: https://fepam.rs.gov.br/manifesto-de-transporte-de-residuos-mtr
# Tipo: Relatório Gerencial Mensal (RGM) — publicado pela FEPAM
# Acesso: público, sem autenticação

RELATORIOS = [
    # 2025
    {"periodo": "2025-01", "label": "Janeiro/2025",   "url": "https://fepam.rs.gov.br/upload/arquivos/202509/23155901-relatoriogerencialmensal-jan-2025-1.pdf"},
    {"periodo": "2025-02", "label": "Fevereiro/2025", "url": "https://fepam.rs.gov.br/upload/arquivos/202509/23155900-relatoriogerencialmensal-fev-2025-1.pdf"},
    {"periodo": "2025-03", "label": "Março/2025",     "url": "https://fepam.rs.gov.br/upload/arquivos/202509/23155904-relatoriogerencialmensal-mar-2025-1.pdf"},
    {"periodo": "2025-04", "label": "Abril/2025",     "url": "https://fepam.rs.gov.br/upload/arquivos/202509/23155858-relatoriogerencialmensal-abr-2025-1.pdf"},
    {"periodo": "2025-05", "label": "Maio/2025",      "url": "https://fepam.rs.gov.br/upload/arquivos/202509/23155903-relatoriogerencialmensal-mai-2025-1.pdf"},
    {"periodo": "2025-06", "label": "Junho/2025",     "url": "https://fepam.rs.gov.br/upload/arquivos/202509/23155902-relatoriogerencialmensal-jun-2025-1.pdf"},
    {"periodo": "2025-07", "label": "Julho/2025",     "url": "https://fepam.rs.gov.br/upload/arquivos/202509/23155901-relatoriogerencialmensal-jul-2025-1.pdf"},
    {"periodo": "2025-08", "label": "Agosto/2025",    "url": "https://fepam.rs.gov.br/upload/arquivos/202509/23155859-relatoriogerencialmensal-ago-2025-1.pdf"},
    {"periodo": "2025-09", "label": "Setembro/2025",  "url": "https://fepam.rs.gov.br/upload/arquivos/202511/10111938-relatoriogerencialmensal-set-2025.pdf"},
    {"periodo": "2025-10", "label": "Outubro/2025",   "url": "https://fepam.rs.gov.br/upload/arquivos/202511/10111937-relatoriogerencialmensal-out-2025.pdf"},
    {"periodo": "2025-11", "label": "Novembro/2025",  "url": "https://fepam.rs.gov.br/upload/arquivos/202512/12104352-relatoriogerencialmensal-11-2025.pdf"},
    {"periodo": "2025-12", "label": "Dezembro/2025",  "url": "https://fepam.rs.gov.br/upload/arquivos/202603/17112923-relatoriogerencialmensal-12-2025.pdf"},
    # 2026
    {"periodo": "2026-01", "label": "Janeiro/2026",   "url": "https://fepam.rs.gov.br/upload/arquivos/202603/17112923-relatoriogerencialmensal-01-2026.pdf"},
    {"periodo": "2026-02", "label": "Fevereiro/2026", "url": "https://fepam.rs.gov.br/upload/arquivos/202603/17112922-relatoriogerencialmensal-02-2026.pdf"},
    {"periodo": "2026-03", "label": "Março/2026",     "url": "https://fepam.rs.gov.br/upload/arquivos/202606/01133227-relatoriogerencialmensal-marco-2026.pdf"},
    {"periodo": "2026-04", "label": "Abril/2026",     "url": "https://fepam.rs.gov.br/upload/arquivos/202606/01133228-relatoriogerencialmensal-abril-2026.pdf"},
    {"periodo": "2026-05", "label": "Maio/2026",      "url": "https://fepam.rs.gov.br/upload/arquivos/202606/01133226-relatoriogerencialmensal-maio-2026.pdf"},
    {"periodo": "2026-06", "label": "Junho/2026",     "url": "https://fepam.rs.gov.br/upload/arquivos/202609/01102352-relatoriogerencialmensal-junho-2026.pdf"},
    {"periodo": "2026-07", "label": "Julho/2026",     "url": "https://fepam.rs.gov.br/upload/arquivos/202609/01102353-relatoriogerencialmensal-julho-2026.pdf"},
    {"periodo": "2026-08", "label": "Agosto/2026",    "url": "https://fepam.rs.gov.br/upload/arquivos/202609/01102351-relatoriogerencialmensal-agosto-2026.pdf"},
]

# ── Funções ───────────────────────────────────────────────────────────────────

def gerar_document_id(periodo: str, url: str) -> str:
    """Gera document_id único e estável: hash do período + URL."""
    raw = f"{periodo}::{url}"
    return "mtr_" + hashlib.sha256(raw.encode()).hexdigest()[:12]


def gerar_filename(periodo: str) -> str:
    """Padrão de nome: FEPAM_RGM_YYYY-MM.pdf"""
    return f"FEPAM_RGM_{periodo}.pdf"


def calcular_md5(filepath: Path) -> str:
    h = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def carregar_manifest() -> dict:
    if MANIFEST_FILE.exists():
        with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"version": "0.1", "created_at": datetime.now(timezone.utc).isoformat(), "documents": {}}


def salvar_manifest(manifest: dict):
    MANIFEST_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)


def baixar_relatorio(relatorio: dict, manifest: dict, dry_run: bool = False) -> dict:
    """
    Baixa um relatório e registra na camada Bronze.
    Retorna o registro de evidência do documento.
    """
    periodo  = relatorio["periodo"]
    label    = relatorio["label"]
    url      = relatorio["url"]
    filename = gerar_filename(periodo)
    filepath = BRONZE_DIR / filename
    doc_id   = gerar_document_id(periodo, url)

    # Verificar se já existe
    if doc_id in manifest["documents"]:
        log.info(f"[SKIP] {label} já está no Bronze (doc_id: {doc_id})")
        return manifest["documents"][doc_id]

    if dry_run:
        log.info(f"[DRY-RUN] {label} → {filename}")
        return {}

    log.info(f"[DOWNLOAD] {label} → {filename}")

    try:
        headers = {
            "User-Agent": "Aquvaris-MTR-Pipeline/0.1 (pesquisa-ic@fepam; bpreschad@gmail.com)"
        }
        resp = requests.get(url, headers=headers, timeout=60, stream=True)
        resp.raise_for_status()

        BRONZE_DIR.mkdir(parents=True, exist_ok=True)
        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        # Calcular hash para integridade
        md5 = calcular_md5(filepath)
        tamanho = filepath.stat().st_size

        # Registro de evidência Bronze (MTR-022, MTR-023, MTR-024)
        registro = {
            "document_id":       doc_id,
            "periodo":           periodo,
            "label":             label,
            "tipo":              "Relatorio_Gerencial_Mensal",
            "fonte":             "FEPAM_MTR_Online",
            "url_origem":        url,
            "filename":          filename,
            "filepath_bronze":   str(filepath),
            "tamanho_bytes":     tamanho,
            "md5":               md5,
            "schema_version":    "mtr_schema_v0.1",
            "access_method":     "http_download_publico",
            "layer":             "bronze",
            "transformation":    "none",
            "responsible":       "Aquvaris Data Pipeline v0.1",
            "download_timestamp": datetime.now(timezone.utc).isoformat(),
            "validation_status": "pending",
            "notes":             "Documento original preservado sem transformação. Extração Silver pendente."
        }

        manifest["documents"][doc_id] = registro
        salvar_manifest(manifest)

        log.info(f"  ✅ {tamanho/1024:.1f} KB | md5: {md5[:8]}... | doc_id: {doc_id}")
        return registro

    except requests.HTTPError as e:
        log.error(f"  ❌ HTTP {e.response.status_code} — {label}: {url}")
        return {}
    except Exception as e:
        log.error(f"  ❌ Erro ao baixar {label}: {e}")
        return {}


def filtrar_relatorios(relatorios: list, ano: str = None, mes: str = None) -> list:
    if mes:
        return [r for r in relatorios if r["periodo"] == mes]
    if ano:
        return [r for r in relatorios if r["periodo"].startswith(ano)]
    return relatorios


def exibir_resumo(manifest: dict):
    docs = manifest.get("documents", {})
    if not docs:
        log.info("Bronze vazio.")
        return
    total_bytes = sum(d.get("tamanho_bytes", 0) for d in docs.values())
    log.info(f"\n{'─'*50}")
    log.info(f"Bronze — {len(docs)} documento(s) | {total_bytes/1024:.1f} KB total")
    for doc_id, d in sorted(docs.items(), key=lambda x: x[1]["periodo"]):
        log.info(f"  {d['periodo']} | {d['label']:<18} | {d['tamanho_bytes']/1024:>6.1f} KB | {doc_id}")
    log.info(f"{'─'*50}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Aquvaris MTR — Ingestão Bronze (EPIC 03)"
    )
    parser.add_argument("--ano",     help="Filtrar por ano (ex: 2026)")
    parser.add_argument("--mes",     help="Filtrar por período (ex: 2026-08)")
    parser.add_argument("--dry-run", action="store_true", help="Listar sem baixar")
    parser.add_argument("--resumo",  action="store_true", help="Exibir resumo do Bronze e sair")
    args = parser.parse_args()

    manifest = carregar_manifest()

    if args.resumo:
        exibir_resumo(manifest)
        return

    relatorios = filtrar_relatorios(RELATORIOS, ano=args.ano, mes=args.mes)

    log.info(f"Aquvaris MTR — Ingestão Bronze v0.1")
    log.info(f"Destino: {BRONZE_DIR}")
    log.info(f"Relatórios a processar: {len(relatorios)}")
    if args.dry_run:
        log.info("[DRY-RUN] Nenhum arquivo será baixado.")
    log.info("")

    baixados = 0
    for i, relatorio in enumerate(relatorios):
        resultado = baixar_relatorio(relatorio, manifest, dry_run=args.dry_run)
        if resultado and not args.dry_run:
            baixados += 1
        # Pausa entre downloads — respeito ao servidor público
        if i < len(relatorios) - 1 and not args.dry_run:
            time.sleep(1.5)

    log.info("")
    if not args.dry_run:
        log.info(f"Concluído: {baixados} relatório(s) baixado(s).")
        exibir_resumo(manifest)
    else:
        log.info(f"Dry-run concluído: {len(relatorios)} relatório(s) listado(s).")
        for r in relatorios:
            log.info(f"  {r['periodo']} | {r['label']}")


if __name__ == "__main__":
    main()
