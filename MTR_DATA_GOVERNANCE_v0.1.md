# Aquvaris MTR — Data Governance

**Version:** 0.1  
**Date:** 2026-09-16  
**Status:** Draft  
**Responsible:** Aquvaris AI — Bruna Preschadt de Oliveira  

---

## 1. Purpose

Estabelecer o framework de governança de dados para a camada MTR da Aquvaris AI.

O objetivo é transformar documentos e dados institucionais do Sistema MTR Online FEPAM em informação estruturada, rastreável, espacializada e consultável por IA — preservando a origem e a evidência de cada informação em cada etapa do pipeline.

**Princípio central:** o LLM não é a fonte da verdade. Ele é uma camada interpretativa sobre dados estruturados e documentos com evidência.

---

## 2. Scope

Este documento governa:
- Captação de dados do MTR Online FEPAM (relatórios públicos e, futuramente, dados brutos via acordo institucional)
- Pipeline Bronze → Silver → Gold aplicado a resíduos industriais
- Schema de entidades MTR
- Padrão de evidência e proveniência
- Uso de LLMs (Gemini) e RAG (FAISS) sobre dados MTR
- Integração com a arquitetura existente da Aquvaris (sem reconstrução)

**Fora do escopo desta versão:** FastAPI, PostgreSQL/PostGIS, integração SINIR nacional, outros estados.

---

## 3. Auditoria da Aquvaris — Matriz MTR-001 a MTR-010

### 3.1 Estrutura de arquivos (MTR-001)

```
src/
  App.tsx                          — orquestrador principal
  index.css / main.tsx             — entrada da aplicação
  types.ts                         — tipos globais legados
  vite-env.d.ts                    — declarações Vite

  components/
    AccessGate.tsx                 — controle de acesso
    AddUnitForm.tsx                — formulário de unidade
    AdminPanel.tsx                 — painel administrativo
    AIDashboard.tsx                — dashboard de IA
    AIDiagnosis.tsx                — diagnóstico ambiental IA
    CompanyDashboard.tsx           — dashboard de empresas
    CRMKanban.tsx                  — CRM (novo)
    EnvironmentalMap.tsx           — mapa ambiental
    HydricDashboard.tsx            — dashboard hídrico
    IntelligentMap.tsx             — mapa inteligente
    MetricCard.tsx                 — card de métrica
    Portfolio.tsx                  — portfólio
    ReportsDashboard.tsx           — relatórios
    RiskDashboard.tsx              — risco ambiental
    Sidebar.tsx                    — navegação
    SurveyDashboard.tsx            — vistorias
    SurveyForm.tsx                 — formulário de vistoria
    WasteDashboard.tsx             — resíduos (mock)
    ui/GlassCard.tsx               — componente base UI

  lib/
    access.ts                      — controle de acesso + tenantId
    firebase.ts                    — Firebase Auth + Firestore
    utils.ts                       — utilitários gerais

  services/
    crmservice.ts                  — CRUD CRM (Firestore)
    geminiService.ts               — integração Gemini AI

  types/
    aquvaris.ts                    — tipos ambientais
    crm.ts                         — tipos CRM (com tenantId)
```

### 3.2 Matriz EXISTE / FUNCIONA / REUTILIZAR / ALTERAR / NOVO (MTR-002 a MTR-010)

| Componente | Existe | Funciona | Reutilizar | Alterar | Novo MTR |
|---|---|---|---|---|---|
| **INFRAESTRUTURA** | | | | | |
| React + TypeScript + Vite | ✅ | ✅ | ✅ | — | — |
| Firebase Auth | ✅ | ✅ | ✅ | — | — |
| Firestore | ✅ | ✅ | ✅ | Regras p/ MTR | — |
| GlassCard + UI base | ✅ | ✅ | ✅ | — | — |
| Sidebar + navegação | ✅ | ✅ | ✅ | Adicionar tab MTR | — |
| App.tsx + roteamento | ✅ | ✅ | ✅ | Adicionar rota MTR | — |
| **DADOS E TIPOS** | | | | | |
| types/aquvaris.ts | ✅ | ✅ | ✅ | — | types/mtr.ts |
| types/crm.ts + tenantId | ✅ | ✅ | ✅ | — | — |
| types.ts (legado) | ✅ | Parcial | Referência | — | — |
| **SERVIÇOS** | | | | | |
| crmservice.ts | ✅ | ✅ | Modelo | — | mtrservice.ts |
| geminiService.ts | ✅ | ✅ | Adaptar | Prompts MTR | — |
| access.ts + tenantId | ✅ | ✅ | ✅ | — | — |
| firebase.ts | ✅ | ✅ | ✅ | — | — |
| **PIPELINE DE DADOS** | | | | | |
| Bronze → Silver → Gold | ✅ conceito | Parcial OpenAQ | Padrão oficial | Formalizar | Pipeline MTR |
| Detecção de anomalias | ✅ conceito | Parcial | ✅ reutilizar | Adaptar MTR | — |
| **IA E RAG** | | | | | |
| Gemini (agente) | ✅ | ✅ | ✅ | Prompts MTR | — |
| FAISS/RAG | ✅ | ✅ | ✅ | Indexar docs MTR | — |
| **COMPONENTES VISUAIS** | | | | | |
| EnvironmentalMap | ✅ | ✅ | ✅ reutilizar | Dados MTR | — |
| IntelligentMap + PostGIS | ✅ | ✅ | ✅ | Fluxos resíduos | — |
| WasteDashboard | ✅ | ⚠️ Mock | Base visual | Dados reais MTR | — |
| ReportsDashboard | ✅ | ⚠️ Mock | Base visual | Relatórios MTR | — |
| AIDashboard | ✅ | ✅ | ✅ | Módulo MTR | — |
| CRMKanban | ✅ | ✅ | — | — | — |
| AdminPanel | ✅ | ✅ | ✅ | Gestão tenants MTR | — |
| **NÃO INICIADO** | | | | | |
| PostgreSQL/PostGIS | ❌ | — | — | — | Fase futura |
| FastAPI | ❌ | — | — | — | Fase futura |
| Pipeline Python MTR | ❌ | — | — | — | **Construir** |
| Parser PDF/tabelas MTR | ❌ | — | — | — | **Construir** |
| Schema Evidence/Provenance | ❌ | — | — | — | **Construir** |
| Data Lineage | ❌ | — | — | — | **Construir** |
| Módulo MTR (src/modules/) | ❌ | — | — | — | **Construir** |

**Conclusão da auditoria:** a Aquvaris tem ~70% da infraestrutura necessária para o MTR. O que falta é a camada de dados Python (pipeline de ingestão/extração), o schema de evidência e os componentes MTR-específicos — todos acoplados ao que já existe, sem reconstrução.

---

## 4. Data Sources

| Fonte | Tipo | Acesso atual | Periodicidade | Prioridade |
|---|---|---|---|---|
| Relatórios FEPAM (R3, R21, R32, R39, R40) | PDF/Excel público | Download manual | Trimestral/Anual | **P1 — agora** |
| Dados brutos MTR por registro | Interno FEPAM | Via acordo com Eduardo (bolsa IC) | Sob demanda | P2 — negociar |
| SINIR API federal | API pública parcial | Acesso aberto | Mensal | P3 — fase 2 |
| Licenciamento FEPAM | Institucional | Via acordo | Sob demanda | P2 |
| CNAE/IBGE | API pública | Acesso aberto | Anual | P3 |

---

## 5. Data Dictionary — Núcleo MTR v0.1

### Entidade: MTR

| Campo | Tipo | Definição | Obrigatório |
|---|---|---|---|
| mtr_id | UUID | Identificador interno Aquvaris | ✅ |
| numero_mtr | string | Número do manifesto no sistema FEPAM | ✅ |
| data_emissao | date | Data de emissão do MTR | ✅ |
| status | enum | emitido / baixado / cancelado | ✅ |
| gerador_cnpj | string | CNPJ do gerador do resíduo | ✅ |
| gerador_nome | string | Razão social do gerador | ✅ |
| transportador_cnpj | string | CNPJ do transportador | ✅ |
| destinador_cnpj | string | CNPJ do destinador | ✅ |
| residuo_codigo | string | Código conforme IN 13/2012 IBAMA | ✅ |
| residuo_nome | string | Denominação do resíduo | ✅ |
| classe_residuo | enum | I / IIA / IIB | ✅ |
| quantidade | float | Quantidade declarada | ✅ |
| unidade | enum | t / kg / L / m³ / unidade | ✅ |
| quantidade_toneladas | float | Quantidade normalizada em toneladas | ✅ |
| tecnologia_destinacao | string | Tecnologia de destinação final | ✅ |
| macrorregiao_gerador | string | Gerência Regional FEPAM do gerador | ✅ |
| macrorregiao_destinador | string | Gerência Regional FEPAM do destinador | ✅ |
| document_source | string | Nome/ID do documento de origem | ✅ |
| document_version | string | Versão do schema de extração | ✅ |
| extraction_method | string | pdf_parser / api / manual | ✅ |
| validation_status | enum | passed / flagged / failed | ✅ |
| anomaly_flag | boolean | Indica dado fora do padrão histórico | ✅ |
| created_at | timestamp | Criação no sistema Aquvaris | ✅ |
| updated_at | timestamp | Última atualização | ✅ |

---

## 6. Access Methods

### Bronze
- Download manual dos relatórios públicos FEPAM
- Armazenamento em `data/mtr/bronze/` com nome padronizado: `FEPAM_R{numero}_{ano}_{trimestre}.pdf`
- Nenhuma transformação aplicada
- Hash MD5 do arquivo original registrado

### Silver
- Parser Python: `camelot-py` para tabelas em PDF, `pandas` para Excel
- Fallback: Gemini Vision para PDFs com layout não estruturado
- Normalização de unidades: kg→t (/1000), L→t (via densidade), m³→t (via densidade)
- Validação de CNPJ via algoritmo oficial
- Quality flags por campo

### Gold
- Agregações por macrorregião × classe × tecnologia × período
- Z-score para detecção de anomalias (reutiliza lógica existente OpenAQ)
- Séries temporais por região

---

## 7. Evidence & Provenance — Padrão v0.1

Cada dado relevante no Silver e Gold carrega um registro de evidência:

```json
{
  "field": "quantidade_toneladas",
  "value": 1.25,
  "unit": "t",
  "source_document": "FEPAM_R3_2022_Q4.pdf",
  "source_page": 4,
  "source_field_raw": "1.250 kg",
  "definition": "Quantidade declarada no manifesto de transporte",
  "access_method": "pdf_parser_camelot",
  "transformation": "kg_to_tonnes",
  "transformation_rule": "value / 1000",
  "schema_version": "mtr_schema_v0.1",
  "responsible": "Aquvaris Data Pipeline",
  "validation_status": "passed",
  "extraction_timestamp": "2026-09-16T10:00:00Z"
}
```

---

## 8. LLM Usage Policy

| Situação | Usar LLM? | Como |
|---|---|---|
| Extração de tabela estruturada | ❌ | Parser determinístico (camelot/pandas) |
| Campo ambíguo ou layout não padrão | ✅ | Gemini Vision com prompt versionado |
| Interpretação de regra regulatória | ✅ | RAG + Gemini com evidência |
| Resposta sobre dado específico | ✅ | FAISS recupera evidência, Gemini formula |
| Validação de consistência | ❌ | Regras determinísticas Python |
| Geração de relatório regulatório | ✅ | Template + Gemini + dados Gold |

**Regra:** toda resposta LLM sobre dado MTR deve incluir `source_document`, `page` e `confidence_score`.

---

## 9. Validation Rules — Núcleo v0.1

```python
RULES = {
    "volume_anomalia": "quantidade_toneladas > media_historica_gerador * 10",
    "tecnologia_classe": "classe == 'I' AND tecnologia == 'aterro_sanitario'",
    "unidade_classeiia": "classe == 'IIA' AND unidade == 'unidade'",
    "cdf_prazo": "status == 'emitido' AND dias_desde_emissao > 30",
    "destinador_capacidade": "volume > capacidade_licenciada_destinador",
}
```

---

## 10. Backlog Épicos — Sequência de execução

```
EPIC 01 — Auditoria          ✅ CONCLUÍDO (este documento)
EPIC 02 — Data Governance    ✅ INICIADO (este documento)
EPIC 03 — Ingestão           → PRÓXIMO
EPIC 04 — Extração           → Após ingestão
EPIC 05 — Silver             → Após extração
EPIC 06 — Gold/Intelligence  → Após Silver
EPIC 07 — IA + Evidência     → Paralelo ao Gold
EPIC 08 — Produto            → Após Gold validado
```

---

## 11. Responsible Parties

| Papel | Responsável |
|---|---|
| Data Governance | Bruna Preschadt de Oliveira |
| Pipeline Python | Bruna Preschadt de Oliveira |
| Arquitetura Aquvaris | Bruna Preschadt de Oliveira |
| Validação científica | Eduardo R.R. de Santana (FEPAM — orientador IC) |
| Fonte institucional | FEPAM / Sistema MTR Online |

---

## 12. Change Log

```
v0.1 — 2026-09-16
  Auditoria completa do aquvaris-platform (MTR-001 a MTR-010)
  Matriz EXISTE/FUNCIONA/REUTILIZAR/ALTERAR/NOVO produzida
  Data Dictionary núcleo MTR definido
  Padrão de evidência e proveniência estabelecido
  LLM Usage Policy definida
  Validation Rules núcleo definidas
  Backlog de 8 épicos sequenciado
  Fontes de dados priorizadas
  Responsible parties definidos
```
