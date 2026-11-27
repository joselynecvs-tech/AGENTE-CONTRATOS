import { GoogleGenAI } from '@google/genai';

export const FREE_TIER_MODELS = [
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash (Recomendado · Nivel Gratuito)',
    description: 'Equilibrio óptimo de precisión jurídica y velocidad en el nivel gratuito.',
  },
  {
    id: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash-Lite (Alta Velocidad · Nivel Gratuito)',
    description: 'Ideal para lotes grandes y análisis rápido con menor consumo de cuota.',
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash (Compatibilidad · Nivel Gratuito)',
    description: 'Modelo Flash estándar para proyectos con rutas clásicas de AI Studio.',
  },
];

const SYSTEM_INSTRUCTION = `Eres un abogado corporativo y deportivo sénior especializado en auditoría, clasificación y síntesis contractual.
Tu tarea es analizar el contrato proporcionado y clasificarlo OBLIGATORIAMENTE en exactamente una de las siguientes tres categorías:

1. "jugadores": Contratos celebrados con deportistas, jugadores profesionales o amateurs, talentos competitivos (incluyendo deportes tradicionales o esports). Incluye fichajes, contratos laborales deportivos, cesiones/préstamos, derechos de imagen de jugador, bonos por rendimiento o cláusulas de rescisión deportiva.
2. "administradores": Contratos de alta dirección, administradores únicos o solidarios, gerentes generales, directores ejecutivos (CEO/CFO/COO), consejeros, apoderados legales, mandatos societarios o prestación de servicios de administración y gobierno corporativo.
3. "proveedores": Contratos comerciales con terceros externos para suministro de bienes, prestación de servicios técnicos o profesionales, licenciamiento de software/SaaS, logística, mantenimiento, marketing, patrocinio comercial o consultoría externa no directiva.

Reglas estrictas de análisis:
- Responde SIEMPRE en español formal, preciso y objetivo.
- Basa todos los datos extraídos únicamente en el texto o documento proporcionado. Si un dato (fecha, monto, etc.) no aparece en el contrato, indica "No especificada" o "No especificado".
- Evalúa los riesgos reales (penalidades desproporcionadas, renovación automática silenciosa, cesión amplia de derechos, ausencia de límite de responsabilidad, terminación unilateral, confidencialidad indefinida, etc.).
- El campo "confianza" debe ser un número entero entre 0 y 100 reflejando qué tan clara es la pertenencia al grupo asignado.`;

const CONTRACT_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    categoria: {
      type: 'STRING',
      enum: ['jugadores', 'administradores', 'proveedores'],
      description: 'Grupo obligatorio al que pertenece el contrato.',
    },
    confianza: {
      type: 'INTEGER',
      description: 'Nivel de confianza de la clasificación de 0 a 100.',
    },
    justificacion_clasificacion: {
      type: 'STRING',
      description: 'Explicación jurídica concisa de por qué corresponde a esa categoría.',
    },
    titulo_contrato: {
      type: 'STRING',
      description: 'Título formal o denominación descriptiva del contrato.',
    },
    subtipo: {
      type: 'STRING',
      description: 'Subtipo específico (ej. Contrato Laboral Deportivo, Mandato de Dirección, Suministro SaaS).',
    },
    partes_involucradas: {
      type: 'ARRAY',
      description: 'Personas físicas o jurídicas que firman el contrato.',
      items: {
        type: 'OBJECT',
        properties: {
          nombre: { type: 'STRING' },
          rol: { type: 'STRING' },
        },
        required: ['nombre', 'rol'],
      },
    },
    resumen_ejecutivo: {
      type: 'STRING',
      description: 'Resumen formal de 2 a 4 oraciones sobre el objeto y alcance del contrato.',
    },
    fecha_inicio: {
      type: 'STRING',
      description: 'Fecha de inicio o firma (formato YYYY-MM-DD si existe, o "No especificada").',
    },
    fecha_fin: {
      type: 'STRING',
      description: 'Fecha de término, vigencia o "Indefinida" / "No especificada".',
    },
    valor_economico: {
      type: 'STRING',
      description: 'Contraprestación, salario, honorarios o monto total con moneda.',
    },
    obligaciones_clave: {
      type: 'ARRAY',
      description: 'De 3 a 5 obligaciones principales de las partes.',
      items: { type: 'STRING' },
    },
    clausulas_criticas: {
      type: 'ARRAY',
      description: 'Cláusulas sensibles, penalidades, rescisión, exclusividad o confidencialidad.',
      items: {
        type: 'OBJECT',
        properties: {
          titulo: { type: 'STRING' },
          detalle: { type: 'STRING' },
          nivel_riesgo: {
            type: 'STRING',
            enum: ['bajo', 'medio', 'alto'],
          },
        },
        required: ['titulo', 'detalle', 'nivel_riesgo'],
      },
    },
    riesgo_general: {
      type: 'STRING',
      enum: ['bajo', 'medio', 'alto'],
      description: 'Evaluación global del riesgo contractual.',
    },
    recomendaciones: {
      type: 'ARRAY',
      description: 'De 2 a 4 recomendaciones prácticas antes de firmar o archivar.',
      items: { type: 'STRING' },
    },
  },
  required: [
    'categoria',
    'confianza',
    'justificacion_clasificacion',
    'titulo_contrato',
    'subtipo',
    'partes_involucradas',
    'resumen_ejecutivo',
    'fecha_inicio',
    'fecha_fin',
    'valor_economico',
    'obligaciones_clave',
    'clausulas_criticas',
    'riesgo_general',
    'recomendaciones',
  ],
};

function buildModelCandidates(preferredModel) {
  const defaultId = process.env.GEMINI_MODEL || FREE_TIER_MODELS[0].id;
  const knownIds = FREE_TIER_MODELS.map((m) => m.id);
  const start = preferredModel && preferredModel !== 'auto' ? preferredModel : defaultId;
  return [start, ...knownIds.filter((id) => id !== start)];
}

function isModelUnavailableError(err) {
  const status = err?.status || err?.code;
  const msg = String(err?.message || '').toLowerCase();
  return (
    status === 404 ||
    msg.includes('not found') ||
    msg.includes('is not supported') ||
    msg.includes('deprecated')
  );
}

export function formatGeminiError(err) {
  const status = err?.status || err?.code;
  const raw = String(err?.message || 'Error desconocido al consultar Gemini API.');
  const lower = raw.toLowerCase();

  if (status === 401 || status === 403 || lower.includes('api key not valid') || lower.includes('permission denied')) {
    return {
      statusCode: 401,
      message: 'La llave de API de Google AI Studio es inválida o no tiene permisos. Verifica tu GEMINI_API_KEY en Google AI Studio.',
    };
  }
  if (status === 429 || lower.includes('quota') || lower.includes('rate limit') || lower.includes('resource_exhausted')) {
    return {
      statusCode: 429,
      message: 'Se alcanzó el límite de peticiones por minuto/día del nivel gratuito de Google AI Studio. Espera unos segundos e intenta de nuevo o cambia a Gemini 3.5 Flash-Lite.',
    };
  }
  if (lower.includes('too large') || lower.includes('payload')) {
    return {
      statusCode: 413,
      message: 'El documento excede el tamaño máximo permitido para análisis directo.',
    };
  }
  return {
    statusCode: 500,
    message: `No se pudo completar el análisis con Gemini: ${raw}`,
  };
}

/**
 * Analiza un contrato (texto o archivo binario multimodal como PDF/imagen) con el SDK @google/genai.
 */
export async function analyzeContractWithGemini({
  apiKey,
  preferredModel = 'auto',
  textContent = '',
  inlineFile = null,
  fileName = 'Contrato',
}) {
  const ai = new GoogleGenAI({ apiKey });
  const candidates = buildModelCandidates(preferredModel);

  const parts = [];
  if (inlineFile?.base64 && inlineFile?.mimeType) {
    parts.push({
      inlineData: {
        mimeType: inlineFile.mimeType,
        data: inlineFile.base64,
      },
    });
  }

  const promptText = textContent?.trim()
    ? `Analiza y clasifica el siguiente contrato (${fileName}) en uno de los tres grupos (jugadores, administradores o proveedores):\n\n${textContent.trim()}`
    : `Analiza y clasifica el documento contractual adjunto (${fileName}) en uno de los tres grupos (jugadores, administradores o proveedores).`;

  parts.push({ text: promptText });

  let lastError = null;
  for (const modelId of candidates) {
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.15,
          responseMimeType: 'application/json',
          responseJsonSchema: CONTRACT_RESPONSE_SCHEMA,
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('El modelo devolvió una respuesta vacía.');
      }

      const parsed = JSON.parse(rawText);
      return {
        analysis: parsed,
        modelUsed: modelId,
      };
    } catch (err) {
      lastError = err;
      if (isModelUnavailableError(err)) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Ningún modelo del nivel gratuito pudo procesar la solicitud.');
}
