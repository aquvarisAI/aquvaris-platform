"""
Aquvaris MTR — Pipeline Gold
EPIC 06 — MTR-039 a MTR-046
Version: 0.1
Date: 2026-09-16

Transforma registros Silver em inteligência analítica:
- Séries temporais por categoria
- Detecção de anomalias (Z-score)
- Indicadores de crescimento
- Rankings e tendências

Uso:
    python mtr_gold.py              # processa todos os Silver
    python mtr_gold.py --visualizar # abre gráficos
"""

import json
import hashlib
import logging
import argparse
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
log = logging.getLogger("mtr.gold")

BASE_DIR   = Path(__file__).parent
SILVER_DIR = BASE_DIR / "data" / "mtr" / "silver"
GOLD_DIR   = BASE_DIR / "data" / "mtr" / "gold"


# ── Funções auxiliares ────────────────────────────────────────────────────────

def media(valores: list[float]) -> float:
    return sum(valores) / len(valores) if valores else 0.0

def desvio_padrao(valores: list[float]) -> float:
    if len(valores) < 2:
        return 0.0
    m = media(valores)
    return (sum((v - m) ** 2 for v in valores) / (len(valores) - 1)) ** 0.5

def zscore(valor: float, m: float, dp: float) -> float:
    if dp == 0:
        return 0.0
    return (valor - m) / dp

def variacao_pct(anterior: float, atual: float) -> float | None:
    if anterior == 0:
        return None
    return round((atual - anterior) / anterior * 100, 2)

def gerar_gold_id(chave: str) -> str:
    return "gld_" + hashlib.sha256(chave.encode()).hexdigest()[:12]


# ── Carregar todos os Silver ──────────────────────────────────────────────────

def carregar_silver() -> dict[str, list[dict]]:
    """Carrega todos os Silver e agrupa por categoria."""
    por_categoria = defaultdict(list)
    arquivos = sorted(SILVER_DIR.glob("*_silver.json"))

    if not arquivos:
        log.error(f"Nenhum arquivo Silver encontrado em {SILVER_DIR}")
        return {}

    log.info(f"Carregando {len(arquivos)} arquivo(s) Silver...")

    for arq in arquivos:
        with open(arq, encoding="utf-8") as f:
            dados = json.load(f)
        for reg in dados["registros"]:
            if reg.get("validation_status") == "passed":
                por_categoria[reg["categoria"]].append(reg)

    for cat, regs in por_categoria.items():
        log.info(f"  {cat}: {len(regs)} registros")

    return por_categoria


# ── GOLD 1: Série temporal de usuários cadastrados ────────────────────────────

def gold_usuarios(registros: list[dict]) -> dict:
    """
    MTR-039 — Evolução dos usuários cadastrados por perfil ao longo do tempo.
    """
    # Agrupar por perfil → lista ordenada por período
    por_perfil = defaultdict(list)
    for r in registros:
        por_perfil[r["perfil"]].append({
            "periodo":    r["periodo"],
            "quantidade": r["quantidade"]
        })

    series = {}
    for perfil, pontos in por_perfil.items():
        pontos_ord = sorted(pontos, key=lambda x: x["periodo"])
        quantidades = [p["quantidade"] for p in pontos_ord]
        m  = media(quantidades)
        dp = desvio_padrao(quantidades)

        serie = []
        for i, p in enumerate(pontos_ord):
            z = zscore(p["quantidade"], m, dp)
            var = variacao_pct(pontos_ord[i-1]["quantidade"], p["quantidade"]) if i > 0 else None
            serie.append({
                "periodo":         p["periodo"],
                "quantidade":      p["quantidade"],
                "variacao_pct":    var,
                "zscore":          round(z, 3),
                "anomaly_flag":    abs(z) > 2.5,
            })

        ultimo  = quantidades[-1] if quantidades else 0
        primeiro = quantidades[0] if quantidades else 0
        series[perfil] = {
            "serie":              serie,
            "media":              round(m, 0),
            "desvio_padrao":      round(dp, 0),
            "crescimento_total_pct": variacao_pct(primeiro, ultimo),
            "ultimo_valor":       ultimo,
            "n_periodos":         len(serie),
        }

    return {
        "gold_id":       gerar_gold_id("usuarios_cadastrados"),
        "categoria":     "usuarios_cadastrados",
        "descricao":     "Evolução dos usuários cadastrados no MTR Online por perfil",
        "series":        series,
        "gerado_em":     datetime.now(timezone.utc).isoformat(),
        "schema_version":"mtr_gold_v0.1",
    }


# ── GOLD 2: Série temporal de MTRs emitidos/recebidos ────────────────────────

def gold_mtrs(registros: list[dict]) -> dict:
    """
    MTR-041 — Série temporal de MTRs emitidos e recebidos.
    Detecta meses com queda ou pico anormal.
    """
    # Usar o período de referência do próprio mês reportado
    # (cada Silver traz dados dos últimos 3 meses — usar só o mês atual)
    por_mes = {}
    for r in registros:
        periodo_ref = r.get("periodo_referencia", "")
        # Normalizar: "Agosto/2026" → "2026-08"
        mes_ref = normalizar_periodo(periodo_ref)
        if not mes_ref:
            continue
        # Só usar o mês que corresponde ao próprio período do documento
        if mes_ref == r["periodo"]:
            por_mes[mes_ref] = {
                "periodo":       mes_ref,
                "emitidos":      r.get("mtrs_emitidos", 0),
                "recebidos":     r.get("mtrs_recebidos", 0),
            }

    pontos = sorted(por_mes.values(), key=lambda x: x["periodo"])
    emitidos_vals  = [p["emitidos"]  for p in pontos]
    recebidos_vals = [p["recebidos"] for p in pontos]

    m_e  = media(emitidos_vals);  dp_e  = desvio_padrao(emitidos_vals)
    m_r  = media(recebidos_vals); dp_r  = desvio_padrao(recebidos_vals)

    serie = []
    for i, p in enumerate(pontos):
        z_e = zscore(p["emitidos"],  m_e,  dp_e)
        z_r = zscore(p["recebidos"], m_r,  dp_r)
        taxa = round(p["recebidos"] / p["emitidos"] * 100, 1) if p["emitidos"] > 0 else None
        var_e = variacao_pct(pontos[i-1]["emitidos"],  p["emitidos"])  if i > 0 else None
        serie.append({
            "periodo":          p["periodo"],
            "mtrs_emitidos":    p["emitidos"],
            "mtrs_recebidos":   p["recebidos"],
            "taxa_recebimento_pct": taxa,
            "variacao_emitidos_pct": var_e,
            "zscore_emitidos":  round(z_e, 3),
            "zscore_recebidos": round(z_r, 3),
            "anomaly_flag":     abs(z_e) > 2.5 or abs(z_r) > 2.5,
            "alerta":           taxa is not None and taxa < 70,
        })

    return {
        "gold_id":       gerar_gold_id("mtrs_serie"),
        "categoria":     "mtrs_emitidos_recebidos",
        "descricao":     "Série temporal de MTRs emitidos e recebidos — taxa de conformidade de recebimento",
        "serie":         serie,
        "media_emitidos":  round(m_e, 0),
        "media_recebidos": round(m_r, 0),
        "gerado_em":     datetime.now(timezone.utc).isoformat(),
        "schema_version":"mtr_gold_v0.1",
    }


# ── GOLD 3: Série temporal de resíduos por classe ─────────────────────────────

def gold_residuos_classe(registros: list[dict]) -> dict:
    """
    MTR-039/041 — Evolução de resíduos por classe ao longo do tempo.
    Z-score para detectar meses anômalos por classe.
    """
    # Filtrar só o mês de referência = período do documento
    por_classe_mes = defaultdict(dict)
    for r in registros:
        mes_ref = normalizar_periodo(r.get("periodo_referencia", ""))
        if mes_ref and mes_ref == r["periodo"]:
            por_classe_mes[r["classe"]][mes_ref] = r.get("quantidade_toneladas", 0)

    series = {}
    anomalias = []

    for classe, meses in sorted(por_classe_mes.items()):
        pontos = sorted(meses.items())
        valores = [v for _, v in pontos]
        m  = media(valores)
        dp = desvio_padrao(valores)

        serie = []
        for i, (periodo, valor) in enumerate(pontos):
            z = zscore(valor, m, dp)
            var = variacao_pct(valores[i-1], valor) if i > 0 else None
            is_anomaly = abs(z) > 2.5 and dp > 0
            if is_anomaly:
                anomalias.append({
                    "classe":   classe,
                    "periodo":  periodo,
                    "valor":    valor,
                    "zscore":   round(z, 3),
                    "media":    round(m, 2),
                })
            serie.append({
                "periodo":           periodo,
                "quantidade_toneladas": valor,
                "variacao_pct":      var,
                "zscore":            round(z, 3),
                "anomaly_flag":      is_anomaly,
            })

        series[classe] = {
            "serie":         serie,
            "media_toneladas":   round(m, 2),
            "desvio_padrao": round(dp, 2),
            "total_periodo": round(sum(valores), 2),
            "n_meses":       len(serie),
        }

    return {
        "gold_id":    gerar_gold_id("residuos_por_classe"),
        "categoria":  "residuos_por_classe",
        "descricao":  "Evolução mensal de resíduos recebidos por classe — Z-score para anomalias",
        "series":     series,
        "anomalias":  anomalias,
        "total_anomalias": len(anomalias),
        "gerado_em":  datetime.now(timezone.utc).isoformat(),
        "schema_version": "mtr_gold_v0.1",
    }


# ── GOLD 4: Ranking e série por tecnologia ────────────────────────────────────

def gold_tecnologias(registros: list[dict]) -> dict:
    """
    MTR-039/042 — Ranking de tecnologias de destinação + séries temporais.
    Identifica tecnologias em crescimento ou declínio.
    """
    por_tec_mes = defaultdict(dict)
    for r in registros:
        mes_ref = normalizar_periodo(r.get("periodo_referencia", ""))
        if mes_ref and mes_ref == r["periodo"]:
            por_tec_mes[r["tecnologia"]][mes_ref] = r.get("quantidade_toneladas", 0)

    series = {}
    ranking_ultimo_mes = {}

    # Identificar o mês mais recente disponível
    todos_meses = set()
    for meses in por_tec_mes.values():
        todos_meses.update(meses.keys())
    mes_mais_recente = max(todos_meses) if todos_meses else None

    for tec, meses in sorted(por_tec_mes.items()):
        pontos = sorted(meses.items())
        valores = [v for _, v in pontos]
        m  = media(valores)
        dp = desvio_padrao(valores)

        # Tendência: regressão linear simples
        n = len(valores)
        if n >= 3:
            x_m = (n - 1) / 2
            num = sum((i - x_m) * (v - m) for i, v in enumerate(valores))
            den = sum((i - x_m) ** 2 for i in range(n))
            slope = num / den if den != 0 else 0
            tendencia = "crescimento" if slope > 0.01 * m else ("declínio" if slope < -0.01 * m else "estável")
        else:
            slope, tendencia = 0, "indeterminado"

        serie = []
        for i, (periodo, valor) in enumerate(pontos):
            z = zscore(valor, m, dp)
            var = variacao_pct(valores[i-1], valor) if i > 0 else None
            serie.append({
                "periodo":              periodo,
                "quantidade_toneladas": valor,
                "variacao_pct":         var,
                "zscore":               round(z, 3),
                "anomaly_flag":         abs(z) > 2.5 and dp > 0,
            })

        ultimo_valor = meses.get(mes_mais_recente, 0) if mes_mais_recente else 0
        ranking_ultimo_mes[tec] = ultimo_valor

        series[tec] = {
            "serie":              serie,
            "media_toneladas":    round(m, 2),
            "desvio_padrao":      round(dp, 2),
            "total_periodo":      round(sum(valores), 2),
            "tendencia":          tendencia,
            "slope_mensal":       round(slope, 2),
            "ultimo_valor":       ultimo_valor,
        }

    # Ranking do mês mais recente
    ranking = sorted(ranking_ultimo_mes.items(), key=lambda x: x[1], reverse=True)

    return {
        "gold_id":          gerar_gold_id("tecnologias"),
        "categoria":        "residuos_por_tecnologia",
        "descricao":        "Ranking e séries temporais de tecnologias de destinação — tendências e anomalias",
        "mes_referencia":   mes_mais_recente,
        "ranking":          [{"posicao": i+1, "tecnologia": t, "quantidade_toneladas": v}
                             for i, (t, v) in enumerate(ranking)],
        "series":           series,
        "gerado_em":        datetime.now(timezone.utc).isoformat(),
        "schema_version":   "mtr_gold_v0.1",
    }


# ── GOLD 5: Indicadores consolidados (resumo executivo) ───────────────────────

def gold_indicadores(usuarios: dict, mtrs: dict, classes: dict, tecs: dict) -> dict:
    """
    MTR-039 — Painel de indicadores consolidados para o mês mais recente.
    """
    # Último mês disponível
    serie_mtrs = mtrs.get("serie", [])
    ultimo_mtr = serie_mtrs[-1] if serie_mtrs else {}

    # Total de resíduos no último mês
    total_residuos = 0
    for classe, dados in classes.get("series", {}).items():
        if dados["serie"]:
            total_residuos += dados["serie"][-1].get("quantidade_toneladas", 0)

    # Tecnologia dominante
    ranking = tecs.get("ranking", [])
    tec_dominante = ranking[0] if ranking else {}

    # Usuários mais recentes
    geradores = usuarios.get("series", {}).get("Geradores", {})
    ultimo_geradores = geradores.get("ultimo_valor", 0) if geradores else 0
    crescimento_geradores = geradores.get("crescimento_total_pct") if geradores else None

    # Anomalias detectadas
    total_anomalias = classes.get("total_anomalias", 0)

    return {
        "gold_id":         gerar_gold_id("indicadores_consolidados"),
        "categoria":       "indicadores_consolidados",
        "descricao":       "Painel executivo MTR — indicadores do período mais recente",
        "periodo_referencia": ultimo_mtr.get("periodo", "N/A"),
        "indicadores": {
            "geradores_cadastrados":        ultimo_geradores,
            "crescimento_geradores_pct":    crescimento_geradores,
            "mtrs_emitidos":                ultimo_mtr.get("mtrs_emitidos"),
            "mtrs_recebidos":               ultimo_mtr.get("mtrs_recebidos"),
            "taxa_recebimento_pct":         ultimo_mtr.get("taxa_recebimento_pct"),
            "alerta_baixo_recebimento":     ultimo_mtr.get("alerta", False),
            "total_residuos_toneladas":     round(total_residuos, 2),
            "tecnologia_dominante":         tec_dominante.get("tecnologia"),
            "volume_tec_dominante_t":       tec_dominante.get("quantidade_toneladas"),
            "total_anomalias_detectadas":   total_anomalias,
        },
        "gerado_em":       datetime.now(timezone.utc).isoformat(),
        "schema_version":  "mtr_gold_v0.1",
    }


# ── Utilitário: normalizar período ────────────────────────────────────────────

def normalizar_periodo(texto: str) -> str | None:
    """Converte 'Agosto/2026' → '2026-08'."""
    if not texto:
        return None
    MESES = {
        "janeiro":1,"fevereiro":2,"março":3,"abril":4,
        "maio":5,"junho":6,"julho":7,"agosto":8,
        "setembro":9,"outubro":10,"novembro":11,"dezembro":12
    }
    partes = texto.strip().split("/")
    if len(partes) == 2:
        mes_str = partes[0].strip().lower()
        ano_str = partes[1].strip()
        mes_num = MESES.get(mes_str)
        if mes_num and ano_str.isdigit():
            return f"{ano_str}-{mes_num:02d}"
    return None


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Aquvaris MTR — Gold (EPIC 06)")
    parser.add_argument("--visualizar", action="store_true", help="Exibir gráficos")
    args = parser.parse_args()

    log.info("Aquvaris MTR — Pipeline Gold v0.1")

    por_categoria = carregar_silver()
    if not por_categoria:
        return

    GOLD_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).isoformat()

    # Gerar cada camada Gold
    log.info("\nProcessando Gold...")

    gold_u = gold_usuarios(por_categoria.get("usuarios_cadastrados", []))
    log.info(f"  ✅ Usuários: {len(gold_u['series'])} perfis")

    gold_m = gold_mtrs(por_categoria.get("mtrs_emitidos_recebidos", []))
    log.info(f"  ✅ MTRs: {len(gold_m['serie'])} meses")

    gold_c = gold_residuos_classe(por_categoria.get("residuos_por_classe", []))
    log.info(f"  ✅ Resíduos por classe: {len(gold_c['series'])} classes | {gold_c['total_anomalias']} anomalia(s)")

    gold_t = gold_tecnologias(por_categoria.get("residuos_por_tecnologia", []))
    log.info(f"  ✅ Tecnologias: {len(gold_t['series'])} | Top: {gold_t['ranking'][0]['tecnologia'] if gold_t['ranking'] else 'N/A'}")

    gold_i = gold_indicadores(gold_u, gold_m, gold_c, gold_t)
    log.info(f"  ✅ Indicadores consolidados: {gold_i['periodo_referencia']}")

    # Salvar
    arquivos = {
        "mtr_gold_usuarios.json":    gold_u,
        "mtr_gold_mtrs.json":        gold_m,
        "mtr_gold_classes.json":     gold_c,
        "mtr_gold_tecnologias.json": gold_t,
        "mtr_gold_indicadores.json": gold_i,
    }

    for nome, dados in arquivos.items():
        caminho = GOLD_DIR / nome
        with open(caminho, "w", encoding="utf-8") as f:
            json.dump(dados, f, ensure_ascii=False, indent=2)
        log.info(f"  💾 {nome}")

    # Resumo executivo no terminal
    ind = gold_i["indicadores"]
    log.info(f"\n{'─'*55}")
    log.info(f"RESUMO EXECUTIVO MTR — {gold_i['periodo_referencia']}")
    log.info(f"{'─'*55}")
    log.info(f"  Geradores cadastrados:    {ind['geradores_cadastrados']:>10,.0f}")
    log.info(f"  MTRs emitidos:            {ind['mtrs_emitidos']:>10,.0f}" if ind['mtrs_emitidos'] else "  MTRs emitidos:            N/A")
    log.info(f"  MTRs recebidos:           {ind['mtrs_recebidos']:>10,.0f}" if ind['mtrs_recebidos'] else "  MTRs recebidos:           N/A")
    log.info(f"  Taxa de recebimento:      {ind['taxa_recebimento_pct']:>9.1f}%" if ind['taxa_recebimento_pct'] else "  Taxa de recebimento:      N/A")
    log.info(f"  Total resíduos (t):       {ind['total_residuos_toneladas']:>10,.2f}")
    log.info(f"  Tecnologia dominante:     {ind['tecnologia_dominante']}")
    log.info(f"  Anomalias detectadas:     {ind['total_anomalias_detectadas']:>10}")
    if ind['alerta_baixo_recebimento']:
        log.warning(f"  ⚠️  ALERTA: taxa de recebimento abaixo de 70%!")
    log.info(f"{'─'*55}")

    if args.visualizar:
        visualizar(gold_m, gold_c, gold_t)


def visualizar(gold_m, gold_c, gold_t):
    try:
        import matplotlib.pyplot as plt
        import matplotlib.gridspec as gridspec

        fig = plt.figure(figsize=(16, 10))
        fig.suptitle("Aquvaris MTR — Gold Intelligence Dashboard", fontsize=14, fontweight="bold")
        gs = gridspec.GridSpec(2, 2, figure=fig, hspace=0.4, wspace=0.3)

        # 1. MTRs emitidos vs recebidos
        ax1 = fig.add_subplot(gs[0, 0])
        serie = gold_m["serie"]
        periodos = [s["periodo"] for s in serie]
        emitidos  = [s["mtrs_emitidos"]  for s in serie]
        recebidos = [s["mtrs_recebidos"] for s in serie]
        ax1.plot(periodos, emitidos,  label="Emitidos",  marker="o", color="#00A878")
        ax1.plot(periodos, recebidos, label="Recebidos", marker="s", color="#3B82F6", linestyle="--")
        ax1.set_title("MTRs Emitidos vs Recebidos")
        ax1.set_xlabel("Período"); ax1.set_ylabel("Quantidade")
        ax1.legend(); ax1.tick_params(axis="x", rotation=45)
        # Alertas
        for i, s in enumerate(serie):
            if s.get("anomaly_flag"):
                ax1.axvline(x=periodos[i], color="red", alpha=0.3, linestyle=":")

        # 2. Resíduos Classe I e IIA
        ax2 = fig.add_subplot(gs[0, 1])
        for classe, cor in [("Classe I", "#EF4444"), ("Classe IIA", "#F59E0B"), ("Classe IIB", "#8B5CF6")]:
            dados = gold_c["series"].get(classe, {})
            if dados.get("serie"):
                ps = [s["periodo"] for s in dados["serie"]]
                vs = [s["quantidade_toneladas"] for s in dados["serie"]]
                ax2.plot(ps, vs, label=classe, marker="o", color=cor)
                # Marcar anomalias
                for s in dados["serie"]:
                    if s.get("anomaly_flag"):
                        ax2.scatter(s["periodo"], s["quantidade_toneladas"], color="red", s=100, zorder=5)
        ax2.set_title("Resíduos por Classe (toneladas)")
        ax2.set_xlabel("Período"); ax2.set_ylabel("Toneladas")
        ax2.legend(); ax2.tick_params(axis="x", rotation=45)

        # 3. Top 8 tecnologias (mês mais recente)
        ax3 = fig.add_subplot(gs[1, 0])
        ranking = gold_t["ranking"][:8]
        tecs  = [r["tecnologia"][:20] for r in ranking]
        vols  = [r["quantidade_toneladas"] for r in ranking]
        cores = ["#00A878" if i == 0 else "#3B82F6" for i in range(len(tecs))]
        bars = ax3.barh(tecs, vols, color=cores)
        ax3.set_title(f"Top 8 Tecnologias — {gold_t['mes_referencia']}")
        ax3.set_xlabel("Toneladas")
        ax3.invert_yaxis()

        # 4. Tendências por tecnologia
        ax4 = fig.add_subplot(gs[1, 1])
        tec_tendencias = {t: d["tendencia"] for t, d in gold_t["series"].items()}
        contagem = {"crescimento": 0, "declínio": 0, "estável": 0, "indeterminado": 0}
        for t in tec_tendencias.values():
            contagem[t] = contagem.get(t, 0) + 1
        labels = [k for k, v in contagem.items() if v > 0]
        sizes  = [contagem[k] for k in labels]
        cores_pizza = ["#00A878", "#EF4444", "#F59E0B", "#9CA3AF"]
        ax4.pie(sizes, labels=labels, autopct="%1.0f%%",
                colors=cores_pizza[:len(labels)], startangle=90)
        ax4.set_title("Tendências das Tecnologias")

        plt.savefig(str(GOLD_DIR / "mtr_gold_dashboard.png"), dpi=150, bbox_inches="tight")
        log.info(f"  📊 Dashboard salvo: {GOLD_DIR / 'mtr_gold_dashboard.png'}")
        plt.show()

    except ImportError:
        log.warning("matplotlib não instalado. Rode: python -m pip install matplotlib")


if __name__ == "__main__":
    main()
