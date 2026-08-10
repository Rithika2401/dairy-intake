const { GoogleGenAI } = require('@google/genai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

let ai = null;
if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '') {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log('[Gemini Client]: Initialized GoogleGenAI client successfully.');
  } catch (err) {
    console.warn('[Gemini Client Warning]: Initialization failed:', err.message);
  }
} else {
  console.warn('[Gemini Client Warning]: GEMINI_API_KEY environment variable is not configured. AI extraction will run in fallback/offline mode.');
}

/**
 * Helper to call Gemini model for structured JSON generation
 */
async function generateStructuredJson(prompt, schema, modelName = 'gemini-1.5-flash') {
  if (!ai) {
    return {
      available: false,
      reason: 'GEMINI_API_KEY is not configured in backend environment variables.'
    };
  }

  try {
    const startTime = Date.now();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });

    const latencyMs = Date.now() - startTime;
    const text = response.text;
    const parsed = JSON.parse(text);

    return {
      available: true,
      data: parsed,
      latencyMs,
      model: modelName
    };
  } catch (error) {
    console.error(`[Gemini API Call Error]: ${error.message}`);
    return {
      available: false,
      error: error.message,
      code: 'AI_API_ERROR'
    };
  }
}

/**
 * Helper to generate grounded case summary
 */
async function generateGroundedSummaryText(contextPrompt, modelName = 'gemini-1.5-flash') {
  if (!ai) {
    return {
      available: false,
      reason: 'GEMINI_API_KEY is not configured in backend environment variables.'
    };
  }

  try {
    const startTime = Date.now();
    const systemPrompt = `You are an AI decision support assistant for a dairy cooperative compliance system.
Your job is to generate a concise, grounded executive summary of the case based ONLY on the provided document fields and validation checks.
Strict Rules:
1. Do NOT invent, assume, or hallucinate any facts not present in the input.
2. Every key claim MUST cite the source document or field.
3. Highlight any quality risks, temperature violations, or quantity mismatches.
4. If evidence is insufficient or missing, explicitly state "Evidence is insufficient for conclusive determination."
5. Output format must be JSON containing: summary, key_findings (array), risks (array), cited_evidence (array).`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `${systemPrompt}\n\nCase Input Context:\n${JSON.stringify(contextPrompt, null, 2)}`
    });

    const latencyMs = Date.now() - startTime;
    let jsonResult;
    try {
      jsonResult = JSON.parse(response.text);
    } catch (e) {
      jsonResult = {
        summary: response.text,
        key_findings: [],
        risks: [],
        cited_evidence: []
      };
    }

    return {
      available: true,
      data: jsonResult,
      latencyMs,
      model: modelName
    };
  } catch (error) {
    console.error(`[Gemini Grounded Summary Error]: ${error.message}`);
    return {
      available: false,
      error: error.message
    };
  }
}

module.exports = {
  ai,
  generateStructuredJson,
  generateGroundedSummaryText
};
