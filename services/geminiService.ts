
import { GoogleGenAI, Type } from "@google/genai";
import type { SensorData, WeatherData, AIDecision } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
if (!GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY not set in .env.local");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const parseJsonResponse = <T,>(text: string): T | null => {
  try {
    const cleanedText = text.replace(/^```json\s*|```\s*$/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Failed to parse JSON response:', text, error);
    return null;
  }
};

export const getIrrigationDecision = async (
  sensorData: SensorData,
  weather: WeatherData,
  cropType?: string
): Promise<AIDecision> => {
  const todayWeather = weather.forecast[0];
  const tomorrowWeather = weather.forecast.length > 1 
    ? weather.forecast[1] 
    : { description: 'not available', rainChance: 0 }; // Default if no tomorrow data
  
  const prompt = `You are an expert AI agronomist for a smart irrigation system. Analyze the following data to provide a clear irrigation recommendation.
    - Current Soil Moisture: ${sensorData.soilMoisture}% (Ideal is 40-60%)
    - Current Temperature: ${sensorData.temperature}°C
    - Current Humidity: ${sensorData.humidity}%
    - Weather Forecast (Today): ${todayWeather.description}, chance of rain is ${todayWeather.rainChance}%.
    - Weather Forecast (Tomorrow): ${tomorrowWeather.description}, chance of rain is ${tomorrowWeather.rainChance}%.
    - Crop Type: ${cropType ? cropType : 'unspecified'}

    Decision Rules:
    1. PRIORITIZE WATER CONSERVATION. Do not irrigate if rain is likely (> 50% chance today or tomorrow).
    2. PREVENT PLANT STRESS. Irrigate if soil moisture is critically low (< 35%), unless significant rain is imminent.
    3. OPTIMIZE FOR CROP TYPE. Adjust the target soil moisture band and urgency based on the crop's typical water needs:
       - Water-loving crops (e.g., rice, taro): lean towards irrigation when moisture < 50% if no rain is expected.
       - Moderate crops (e.g., wheat, maize): keep the 40–60% ideal band.
       - Drought-tolerant crops (e.g., millet, sorghum): be conservative; avoid irrigation unless moisture < 35–40% with no rain expected.
       If crop type is unknown, use the general 40–60% guidance.
    4. HOLD if moisture is adequate relative to the chosen crop band.

    Additionally, provide a concise 'short_message' (max 2 sentences) that references the crop type directly and explains the necessity of the decision in plain language (e.g., "For rice, irrigate now because moisture is below target and no rain is expected."). If crop type is unspecified, use "the crop".

    Respond ONLY with a JSON object in the specified format. The analysis points should be concise, actionable insights based on the data. The confidence score should reflect your certainty in the decision.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
       config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision: { type: Type.STRING, enum: ["Irrigate", "Hold"] },
            reason: { type: Type.STRING, description: "A brief, one-sentence explanation of the decision." },
            short_message: { type: Type.STRING, description: "1–2 sentences referencing the crop type and necessity." },
            analysis_points: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of 2-3 bullet points analyzing the key factors (moisture, rain, temperature)."
            },
            confidence_score: {
                type: Type.NUMBER,
                description: "A score from 0.0 to 1.0 indicating confidence in the recommendation."
            }
          },
          required: ["decision", "reason", "analysis_points", "confidence_score", "short_message"]
        }
      }
    });

    const decisionData = parseJsonResponse<AIDecision>(response.text);
    if (decisionData && (decisionData.decision === 'Irrigate' || decisionData.decision === 'Hold')) {
      return decisionData;
    }
    throw new Error('Invalid decision data format from API.');
  } catch (error) {
    console.error("Error fetching irrigation decision:", error);
    return { decision: 'Error', reason: 'Failed to contact AI.' };
  }
};
