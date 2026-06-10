<div align="center">

<img src="https://avatars.githubusercontent.com/u/282925572?s=200&v=4" alt="Aquvaris AI" width="100" style="border-radius: 12px"/>

# Aquvaris AI — Platform

**Plataforma de inteligência ambiental e operacional**

Transformamos dados ambientais complexos em decisões práticas — com IA, geolocalização e automação.

[![Status](https://img.shields.io/badge/Status-MVP%20em%20desenvolvimento-4CAF50?style=flat)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Next.js-3178C6?style=flat&logo=typescript&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](#)
[![OpenAI](https://img.shields.io/badge/IA-OpenAI%20API-412991?style=flat&logo=openai&logoColor=white)](#)
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-green?style=flat)](#)

[Organização](https://github.com/aquvarisAI) · [ai-models](https://github.com/aquvarisAI/aquvaris-ai-models) · [inspection-engine](https://github.com/aquvarisAI/aquvaris-inspection-engine) · [design-system](https://github.com/aquvarisAI/aquvaris-design-system)

</div>

---

## O problema

Empresas, indústrias e órgãos públicos acumulam dados ambientais em sistemas isolados — planilhas, formulários físicos, laudos em PDF. O resultado é análise lenta, decisão reativa e risco de não conformidade regulatória.

**A Aquvaris responde perguntas que nenhum dashboard convencional responde:**

| Pergunta | Como a Aquvaris responde |
|----------|--------------------------|
| Onde estão os riscos ambientais? | Mapa inteligente com camadas de análise territorial |
| O que precisa de atenção primeiro? | Priorização automática por IA |
| Quais indicadores estão piorando? | Dashboard com alertas em tempo real |
| O que a IA recomenda fazer? | Insights e recomendações gerados automaticamente |
| Como gerar relatórios automaticamente? | Relatórios executivos via OpenAI API |

---

## Visão geral da plataforma

A Aquvaris é um **copiloto de análise e decisão operacional** — não apenas armazena dados, mas analisa, prioriza e recomenda ações em tempo real para equipes ambientais, técnicas e de gestão.

```
┌─────────────────────────────────────────────────────────────┐
│                      AQUVARIS PLATFORM                      │
│                   React + Next.js + TypeScript              │
│                        Deploy: Vercel                       │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
┌────────────▼───────────┐   ┌────────────▼───────────────────┐
│   BACKEND & DADOS      │   │        IA & ANÁLISE            │
│  Supabase + PostgreSQL │   │  aquvaris-ai-models            │
│  PostGIS (geoespacial) │   │  OpenAI API                    │
│  Supabase Auth         │   │  Anomaly detection             │
│  Supabase Storage      │   │  Predictive analytics          │
└────────────┬───────────┘   └────────────────────────────────┘
             │
┌────────────▼───────────────────────────────────────────────┐
│              MÓDULOS INTEGRADOS                            │
│  🌎 Mapa (Google Maps API)                                 │
│  📋 Inspeções (aquvaris-inspection-engine)                 │
│  🎨 Interface (aquvaris-design-system)                     │
└────────────────────────────────────────────────────────────┘
```

---

## Funcionalidades

### 🌎 Mapa Inteligente
Visualização geográfica de ativos, inspeções e ocorrências com integração Google Maps API e camadas de análise territorial por região, risco e prioridade.

### 📊 Dashboard Analítico
Indicadores ambientais em tempo real, alertas automáticos e priorização inteligente de problemas — de forma visual e acionável.

### 🤖 IA para Insights
Geração automática de análises, resumos executivos e recomendações de ação via OpenAI API. Identificação de anomalias sem intervenção manual.

### 📋 Inspeções Digitais
Formulários inteligentes para coleta estruturada de dados em campo, avaliação de conformidade e geração automática de relatórios.

### 📈 Inteligência Preditiva *(próxima fase)*
Previsão de riscos ambientais, tendências e modelos preditivos para água, resíduos, emissões e energia.

---

## Repositórios da organização

| Repositório | Descrição | Status |
|-------------|-----------|--------|
| **aquvaris-platform** | Frontend principal — interface e dashboards | 🔄 Em desenvolvimento |
| [aquvaris-ai-models](https://github.com/aquvarisAI/aquvaris-ai-models) | Modelos de IA, detecção de anomalias e análise preditiva | 🔄 Em desenvolvimento |
| [aquvaris-inspection-engine](https://github.com/aquvarisAI/aquvaris-inspection-engine) | Motor de inspeções digitais e scoring operacional | 🔄 Em desenvolvimento |
| [aquvaris-design-system](https://github.com/aquvarisAI/aquvaris-design-system) | Design system e arquitetura de interface | 🔄 Em desenvolvimento |

---

## Stack técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Next.js + TypeScript |
| Banco de dados | PostgreSQL + PostGIS |
| Backend & Auth | Supabase |
| Armazenamento | Supabase Storage |
| IA | OpenAI API |
| Mapas | Google Maps API |
| Deploy | Vercel |

---

## Para quem

- 🏭 **Indústrias** — saneamento, energia, agronegócio
- 🌿 **Consultorias ambientais** — engenheiros, técnicos e analistas
- 🏛️ **Setor público** — prefeituras, secretarias de meio ambiente
- 📊 **Gestores ESG** — auditores e analistas de sustentabilidade

---

## Status do MVP

| Módulo | Status |
|--------|--------|
| Interface React/Next.js | ✅ Em construção |
| Dashboard analítico | ✅ Em construção |
| Integração Google Maps | ✅ Implementado |
| Autenticação Supabase | ✅ Configurado |
| Banco PostgreSQL + PostGIS | ✅ Estruturado |
| Relatórios por IA | 🔄 Em desenvolvimento |
| Inspeções digitais | 🔄 Em desenvolvimento |
| Inteligência preditiva | 📅 Próxima fase |

---

## Como rodar localmente

```bash
# 1. Clone o repositório
git clone https://github.com/aquvarisAI/aquvaris-platform.git

# 2. Instale as dependências
cd aquvaris-platform
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Preencha: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_KEY, GOOGLE_MAPS_KEY, OPENAI_KEY

# 4. Rode em desenvolvimento
npm run dev
```

---

## Fundadora

**Bruna Preschadt de Oliveira**
Data Engineer & AI Developer · Engenharia Ambiental

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Bruna%20Preschadt-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/bruna-preschadt-de-oliveira-1550ab1ab/)
[![GitHub](https://img.shields.io/badge/GitHub-bpreschad--gif-181717?style=flat&logo=github)](https://github.com/bpreschad-gif)
[![Kaggle](https://img.shields.io/badge/Kaggle-brunapreschadt-20BEFF?style=flat&logo=kaggle)](https://www.kaggle.com/brunapreschadt)

---

<div align="center">
<sub>Aquvaris AI © 2025 · Inteligência ambiental e operacional · Brasil</sub>
</div>
