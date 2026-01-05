import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const askAICoach = async (
  userQuery: string,
  contextData: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Using a performant model for text chat
    const modelId = 'gemini-3-flash-preview'; 

    const systemInstruction = `
      Você é um treinador de musculação experiente e motivador, especialista em hipertrofia e força.
      Seu nome é "IronCoach".
      Responda sempre em Português do Brasil.
      Seja conciso, direto e útil.
      Use o contexto fornecido sobre o treino/exercício do usuário para dar conselhos personalizados.
      Se o usuário perguntar sobre execução, explique a técnica correta.
      Se o usuário perguntar sobre progressão de carga, sugira estratégias seguras.
    `;

    const prompt = `
      Contexto do Treino/Exercício Atual:
      ${contextData}

      Pergunta do Usuário:
      ${userQuery}
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "Desculpe, não consegui processar sua pergunta agora.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao consultar o IronCoach. Verifique sua chave de API.";
  }
};