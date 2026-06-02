/**
 * geminiService.ts
 * Aquvaris AI — Motor de Inteligência Ambiental
 *
 * Responsabilidades:
 * - Calcular o Score Ambiental Preditivo com base nas 5 camadas operacionais
 * - Gerar diagnóstico técnico via Google Gemini API
 * - Processar evidências visuais (fotos de vistoria) com Gemini Vision
 * - Classificar nível de risco ambiental
 */

import { GoogleGenAI, Part } from "@google/genai";
import { EnvironmentalRisk, TechnicalSurvey, UnitIntelligence } from "../types";

// ─── Inicialização do cliente Gemini ─────────────────────────────────────────
// Aceita GEMINI_API_KEY ou GEMINI_APY_KEY (fallback para compatibilidade)
const apiKey =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_GEMINI_APY_KEY ||
  "";

if (!apiKey) {
  console.warn(
    "[Aquvaris] Chave da API Gemini não encontrada. " +
      "Defina VITE_GEMINI_API_KEY no arquivo .env.local"
  );
}

const ai = new GoogleGenAI({ apiKey });
const MODEL = "gemini-2.0-flash";

// ─── Tipos internos ───────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  total: number;               // 0–100
  risk: number;                // Risco ambiental (peso 30%)
  hydric: number;              // Camada hídrica (peso 25%)
  waste: number;               // Camada de resíduos (peso 20%)
  energy: number;              // Camada energia/operação (peso 15%)
  territorial: number;         // Camada territorial (peso 10%)
  riskLevel: EnvironmentalRisk;
  anomalies: string[];         // Anomalias identificadas automaticamente
}

export interface DiagnosticResult {
  summary: string;             // Resumo executivo (1–2 frases)
  anomalies: string[];         // Anomalias detectadas
  recommendations: string[];   // Recomendações técnicas priorizadas
  confidence: number;          // Confiança da IA (0–100)
  urgency: "immediate" | "short_term" | "monitoring" | "normal";
}

// ─── Score Ambiental Preditivo ────────────────────────────────────────────────

/**
 * Calcula o score ambiental com base nas 5 camadas operacionais.
 * Cada camada tem um peso estratégico definido pela metodologia Aquvaris.
 *
 * Pesos:
 *   Risco Ambiental  → 30%
 *   Hídrico          → 25%
 *   Resíduos         → 20%
 *   Energia/Operação → 15%
 *   Territorial      → 10%
 */
export function calculatePredictiveScore(survey: TechnicalSurvey): ScoreBreakdown {
  const anomalies: string[] = [];

  // ── Camada: Risco Ambiental (0–100, peso 30%) ──────────────────────────────
  let riskScore = 100;
  const riskCategory = survey.risk?.riskCategory;
  if (riskCategory === EnvironmentalRisk.CRITICAL) {
    riskScore = 0;
    anomalies.push("Risco ambiental classificado como CRÍTICO");
  } else if (riskCategory === EnvironmentalRisk.HIGH) {
    riskScore = 30;
    anomalies.push("Risco ambiental classificado como ALTO");
  } else if (riskCategory === EnvironmentalRisk.MEDIUM) {
    riskScore = 60;
  } else {
    riskScore = 100; // LOW
  }

  if (survey.risk?.hasEnvironmentalLiability) {
    riskScore = Math.max(0, riskScore - 25);
    anomalies.push("Passivo ambiental identificado na unidade");
  }

  // ── Camada: Hídrica (0–100, peso 25%) ─────────────────────────────────────
  let hydricScore = 100;

  if (survey.hydric?.observedLeaks) {
    hydricScore -= 50;
    anomalies.push("Vazamento hídrico observado em campo");
  }

  // Consumo noturno anômalo: se leitura noturna > 20% da média diária esperada
  const nightlyConsumption = survey.hydric?.nightlyMeterReading ?? 0;
  const dailyExpected = survey.hydric?.expectedDailyConsumption ?? 0;
  if (dailyExpected > 0 && nightlyConsumption > dailyExpected * 0.20) {
    hydricScore -= 30;
    anomalies.push(
      `Consumo noturno anômalo detectado: ${nightlyConsumption}m³ ` +
      `(${((nightlyConsumption / dailyExpected) * 100).toFixed(0)}% do consumo diário esperado)`
    );
  }

  // Pressão fora do padrão (referência: 10–40 mca)
  const pressure = survey.hydric?.pressureBar ?? -1;
  if (pressure >= 0 && (pressure < 1.0 || pressure > 4.0)) {
    hydricScore -= 15;
    anomalies.push(`Pressão da rede fora do padrão: ${pressure} bar`);
  }

  hydricScore = Math.max(0, hydricScore);

  // ── Camada: Resíduos (0–100, peso 20%) ────────────────────────────────────
  let wasteScore = 100;
  const segregationScore = survey.waste?.segregationScore ?? 100; // 0–100

  wasteScore = segregationScore; // Score de segregação é direto

  if (survey.waste?.hasHazardousWaste) {
    wasteScore = Math.max(0, wasteScore - 30);
    anomalies.push("Resíduo perigoso identificado — verificar destinação");
  }

  const volumeKG = survey.waste?.volumeKG ?? 0;
  const volumeExpectedKG = survey.waste?.expectedVolumeKG ?? 0;
  if (volumeExpectedKG > 0 && volumeKG > volumeExpectedKG * 1.5) {
    wasteScore = Math.max(0, wasteScore - 20);
    anomalies.push(
      `Volume de resíduos 50% acima do esperado: ${volumeKG}kg vs ${volumeExpectedKG}kg esperados`
    );
  }

  // ── Camada: Energia/Operação (0–100, peso 15%) ────────────────────────────
  let energyScore = 100;
  const kwhReading = survey.energy?.kwhReading ?? 0;
  const kwhExpected = survey.energy?.expectedKwh ?? 0;

  if (kwhExpected > 0 && kwhReading > kwhExpected * 1.3) {
    energyScore -= 40;
    anomalies.push(
      `Consumo energético 30% acima do esperado: ${kwhReading}kWh vs ${kwhExpected}kWh`
    );
  }

  if (survey.energy?.networkInstability) {
    energyScore -= 20;
    anomalies.push("Instabilidade na rede elétrica reportada");
  }

  const occupancyRate = survey.energy?.occupancyRate ?? 100; // 0–100%
  // Se consumo alto com ocupação baixa, sinaliza ineficiência
  if (kwhExpected > 0 && kwhReading > kwhExpected && occupancyRate < 50) {
    energyScore = Math.max(0, energyScore - 25);
    anomalies.push(
      `Consumo incompatível com taxa de ocupação: ${occupancyRate}% de ocupação, ` +
      `mas consumo acima do esperado`
    );
  }

  energyScore = Math.max(0, energyScore);

  // ── Camada: Territorial (0–100, peso 10%) ─────────────────────────────────
  let territorialScore = 100;
  const landscapeIntegrity = survey.territorial?.landscapeIntegrityScore ?? 100;
  territorialScore = landscapeIntegrity;

  if (survey.territorial?.proximityToWaterBody) {
    // Unidades próximas a corpos d'água têm peso de risco adicional
    if (riskScore < 60) {
      territorialScore = Math.max(0, territorialScore - 20);
      anomalies.push("Unidade próxima a corpo hídrico — risco de contaminação elevado");
    }
  }

  // ── Score Final (média ponderada) ─────────────────────────────────────────
  const total = Math.round(
    riskScore       * 0.30 +
    hydricScore     * 0.25 +
    wasteScore      * 0.20 +
    energyScore     * 0.15 +
    territorialScore * 0.10
  );

  // ── Classificação de Risco ────────────────────────────────────────────────
  let riskLevel: EnvironmentalRisk;
  if (total >= 80) riskLevel = EnvironmentalRisk.LOW;
  else if (total >= 60) riskLevel = EnvironmentalRisk.MEDIUM;
  else if (total >= 40) riskLevel = EnvironmentalRisk.HIGH;
  else riskLevel = EnvironmentalRisk.CRITICAL;

  return {
    total,
    risk: riskScore,
    hydric: hydricScore,
    waste: wasteScore,
    energy: energyScore,
    territorial: territorialScore,
    riskLevel,
    anomalies,
  };
}

// ─── Diagnóstico Textual com Gemini ───────────────────────────────────────────

/**
 * Gera diagnóstico técnico-estratégico baseado nos dados da unidade e vistoria.
 * Output formatado para ser compreensível tanto por técnicos quanto por gestores.
 */
export async function generateEnvironmentalDiagnostic(
  unit: UnitIntelligence,
  survey: TechnicalSurvey,
  scoreBreakdown: ScoreBreakdown
): Promise<DiagnosticResult> {
  const prompt = `
Você é o motor de diagnóstico ambiental da Aquvaris AI. Analise os dados abaixo e gere um diagnóstico técnico-operacional preciso.

## Dados da Unidade
- Nome: ${unit.name}
- Endereço: ${unit.address}
- Score Ambiental Atual: ${scoreBreakdown.total}/100 (${scoreBreakdown.riskLevel})

## Breakdown do Score
- Risco Ambiental: ${scoreBreakdown.risk}/100 (peso 30%)
- Camada Hídrica: ${scoreBreakdown.hydric}/100 (peso 25%)
- Camada Resíduos: ${scoreBreakdown.waste}/100 (peso 20%)
- Camada Energia: ${scoreBreakdown.energy}/100 (peso 15%)
- Camada Territorial: ${scoreBreakdown.territorial}/100 (peso 10%)

## Anomalias Detectadas Automaticamente
${scoreBreakdown.anomalies.length > 0
  ? scoreBreakdown.anomalies.map((a) => `- ${a}`).join("\n")
  : "- Nenhuma anomalia crítica detectada nesta vistoria"}

## Dados da Vistoria
- Vazamento observado: ${survey.hydric?.observedLeaks ? "SIM" : "NÃO"}
- Consumo hídrico registrado: ${survey.hydric?.meterReading ?? "não informado"}m³
- Consumo noturno: ${survey.hydric?.nightlyMeterReading ?? "não informado"}m³
- Leitura energética: ${survey.energy?.kwhReading ?? "não informado"}kWh
- Taxa de ocupação: ${survey.energy?.occupancyRate ?? "não informado"}%
- Score de segregação de resíduos: ${survey.waste?.segregationScore ?? "não informado"}/100
- Categoria de risco: ${survey.risk?.riskCategory ?? "não classificado"}
- Observações técnicas: ${survey.technicalNotes || "nenhuma observação registrada"}

## Instruções de Output
Responda APENAS com um JSON válido, sem markdown, sem explicações fora do JSON:

{
  "summary": "resumo executivo em 1-2 frases, direto e acionável",
  "anomalies": ["anomalia 1 com linguagem técnica", "anomalia 2"],
  "recommendations": ["recomendação 1 priorizada", "recomendação 2", "recomendação 3"],
  "confidence": número entre 0 e 100,
  "urgency": "immediate" | "short_term" | "monitoring" | "normal"
}

Regras:
- summary: máximo 2 frases, linguagem objetiva
- anomalies: liste apenas as reais, com dados concretos quando disponíveis
- recommendations: ordene por urgência, máximo 4 recomendações
- confidence: reflita a completude dos dados fornecidos
- urgency: "immediate" se score < 40, "short_term" se 40-59, "monitoring" se 60-79, "normal" se >= 80
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = response.text?.trim() ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean) as DiagnosticResult;

    return parsed;
  } catch (error) {
    console.error("[Aquvaris] Erro ao gerar diagnóstico:", error);

    // Fallback seguro baseado nos dados locais
    return {
      summary:
        scoreBreakdown.total >= 80
          ? "Unidade operando dentro dos parâmetros ambientais aceitáveis."
          : `Score ambiental de ${scoreBreakdown.total}/100 indica necessidade de intervenção.`,
      anomalies: scoreBreakdown.anomalies,
      recommendations:
        scoreBreakdown.anomalies.length > 0
          ? ["Investigar anomalias identificadas na vistoria", "Agendar vistoria técnica especializada"]
          : ["Manter periodicidade das vistorias preventivas"],
      confidence: 60,
      urgency:
        scoreBreakdown.total < 40
          ? "immediate"
          : scoreBreakdown.total < 60
          ? "short_term"
          : scoreBreakdown.total < 80
          ? "monitoring"
          : "normal",
    };
  }
}

// ─── Análise de Imagens (Gemini Vision) ───────────────────────────────────────

/**
 * Analisa fotos de campo capturadas durante a vistoria.
 * Identifica anomalias visuais: corrosão, descarte irregular, vazamentos visíveis, etc.
 */
export async function analyzeEvidenceImages(
  imageBase64List: string[],
  context: string
): Promise<string> {
  if (!imageBase64List.length) {
    return "Nenhuma imagem de evidência fornecida para análise.";
  }

  const imageParts: Part[] = imageBase64List.map((base64) => ({
    inlineData: {
      mimeType: "image/jpeg" as const,
      data: base64,
    },
  }));

  const textPart: Part = {
    text: `Você é um inspetor ambiental especializado em análise de evidências visuais de campo.
    
Contexto da vistoria: ${context}

Analise as imagens fornecidas e identifique:
1. Evidências visíveis de problemas ambientais (vazamentos, corrosão, descarte irregular, efluentes, etc.)
2. Condição geral das instalações relevantes para conformidade ambiental
3. Risco visual imediato (se houver)

Seja técnico e preciso. Máximo 150 palavras. Foque em achados acionáveis.`,
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: { parts: [textPart, ...imageParts] },
    });

    return response.text?.trim() ?? "Análise visual não disponível.";
  } catch (error) {
    console.error("[Aquvaris] Erro na análise de imagens:", error);
    return "Não foi possível processar as imagens de evidência. Verifique a conexão e tente novamente.";
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Retorna o label em português do nível de risco.
 */
export function getRiskLabel(risk: EnvironmentalRisk): string {
  const labels: Record<EnvironmentalRisk, string> = {
    [EnvironmentalRisk.LOW]: "Normal",
    [EnvironmentalRisk.MEDIUM]: "Atenção",
    [EnvironmentalRisk.HIGH]: "Alto Risco",
    [EnvironmentalRisk.CRITICAL]: "Crítico",
  };
  return labels[risk];
}

/**
 * Retorna a classe de cor Tailwind correspondente ao nível de risco.
 */
export function getRiskColor(risk: EnvironmentalRisk): string {
  const colors: Record<EnvironmentalRisk, string> = {
    [EnvironmentalRisk.LOW]: "text-emerald-400",
    [EnvironmentalRisk.MEDIUM]: "text-yellow-400",
    [EnvironmentalRisk.HIGH]: "text-orange-400",
    [EnvironmentalRisk.CRITICAL]: "text-red-400",
  };
  return colors[risk];
}

/**
 * Retorna a urgência em português para exibição na UI.
 */
export function getUrgencyLabel(urgency: DiagnosticResult["urgency"]): string {
  const labels = {
    immediate: "Intervenção Imediata",
    short_term: "Ação em Curto Prazo",
    monitoring: "Monitoramento Reforçado",
    normal: "Operação Normal",
  };
  return labels[urgency];
}