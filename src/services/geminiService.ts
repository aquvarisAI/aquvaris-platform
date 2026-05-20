
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UnitIntelligence, TechnicalSurvey, EnvironmentalRisk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Calcula um score preditivo baseado nas 5 camadas operacionais
 */
export function calculatePredictiveScore(survey: TechnicalSurvey): number {
  let score = 0;
  
  // 1. Camada Hídrica (25%)
  let hydricScore = 100;
  if (survey.hydric.observedLeaks) hydricScore -= 40;
  if (survey.hydric.waterPressure === 'HIGH') hydricScore -= 10;
  score += hydricScore * 0.25;

  // 2. Camada Resíduo (20%)
  let wasteScore = survey.waste.segregationScore;
  if (survey.waste.hazardousWaste) wasteScore = Math.max(0, wasteScore - 30);
  score += wasteScore * 0.20;

  // 3. Camada Energia (15%)
  let energyScore = survey.energy.mainGridStable ? 100 : 60;
  score += energyScore * 0.15;

  // 4. Camada de Risco (30%)
  let riskScore = 100;
  switch (survey.risk.riskCategory) {
    case EnvironmentalRisk.CRITICAL: riskScore = 0; break;
    case EnvironmentalRisk.HIGH: riskScore = 30; break;
    case EnvironmentalRisk.MEDIUM: riskScore = 60; break;
    case EnvironmentalRisk.LOW: riskScore = 100; break;
  }
  if (survey.risk.environmentalLiability) riskScore = Math.max(0, riskScore - 20);
  score += riskScore * 0.30;

  // 5. Camada Territorial (10%)
  score += (survey.territorial.landscapeIntegrity) * 0.10;

  return Math.round(score);
}

export async function generateEnvironmentalDiagnostic(unit: UnitIntelligence): Promise<string> {
  const prompt = `
    Como a Aquvaris AI (camada de inteligência operacional), analise:
    
    Unidade: ${unit.name}
    Score: ${unit.currentScore}/100
    Risco: ${unit.risk}
    Alertas: ${unit.alerts.map(a => a.message).join(', ')}

    Forneça um diagnóstico técnico curto e estratégico focado em SG e eficiência prática.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Sem diagnóstico disponível.";
  } catch (error) {
    console.error("Gemini Diagnostic Error:", error);
    return "Erro na análise de inteligência. Verifique a configuração da chave API.";
  }
}

/**
 * Inteligência de Imagens: Analisa evidências visuais coletadas em campo
 */
export async function analyzeSurveyWithVision(survey: TechnicalSurvey, imagesBase64: string[]): Promise<string> {
  if (!imagesBase64.length) return "Nenhuma evidência visual fornecida.";

  const prompt = `
    Analise as seguintes imagens de evidência técnica para a unidade ${survey.unitId}.
    Contexto da Vistoria:
    - Risco Declarado: ${survey.risk.riskCategory}
    - Vazamentos: ${survey.hydric.observedLeaks ? 'Sim' : 'Não'}
    - Notas: ${survey.observations}

    Identifique anomalias visíveis (corrosão, descartes irregulares, sinais de vazamento, falta de manutenção) e correlacione com os dados da vistoria.
    Responda em tom técnico e objetivo.
  `;

  const imageParts = imagesBase64.map(b64 => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: b64.split(',')[1] || b64, // Remove prefix if present
    },
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { 
        parts: [
          { text: prompt },
          ...imageParts
        ] 
      },
    });

    return response.text || "Análise visual inconclusiva.";
  } catch (error) {
    console.error("Vision Analysis Error:", error);
    return "Ocorreu um erro ao processar a inteligência de imagens.";
  }
}
