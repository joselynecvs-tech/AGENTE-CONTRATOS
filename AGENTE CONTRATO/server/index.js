import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mammoth from 'mammoth';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  analyzeContractWithGemini,
  formatGeminiError,
  FREE_TIER_MODELS,
} from './geminiAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB límite seguro para inlineData
});

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.csv', '.json', '.rtf', '.xml', '.html']);
const INLINE_MIME_MAP = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasServerKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
    defaultModel: process.env.GEMINI_MODEL || FREE_TIER_MODELS[0].id,
    models: FREE_TIER_MODELS,
  });
});

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    const headerKey = req.headers['x-gemini-api-key'];
    const apiKey = (typeof headerKey === 'string' && headerKey.trim()) || process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return res.status(400).json({
        error:
          'No se detectó una llave de API de Google. Configura GEMINI_API_KEY en Railway (o en tu archivo .env), o ingresa tu llave gratuita de Google AI Studio en el panel de configuración.',
      });
    }

    const preferredModel = (req.body?.model || 'auto').trim();
    let textContent = typeof req.body?.text === 'string' ? req.body.text : '';
    let fileName = req.body?.fileName || 'Contrato manual';
    let inlineFile = null;

    if (req.file) {
      fileName = req.file.originalname || 'Documento adjunto';
      const ext = path.extname(fileName).toLowerCase();

      if (ext === '.docx') {
        const extracted = await mammoth.extractRawText({ buffer: req.file.buffer });
        textContent = extracted.value || '';
        if (!textContent.trim()) {
          return res.status(400).json({
            error: 'El archivo .docx no contiene texto legible para analizar.',
          });
        }
      } else if (TEXT_EXTENSIONS.has(ext) || req.file.mimetype?.startsWith('text/')) {
        textContent = req.file.buffer.toString('utf-8');
      } else if (INLINE_MIME_MAP[ext] || INLINE_MIME_MAP[`.${req.file.mimetype?.split('/')[1]}`]) {
        const mimeType = INLINE_MIME_MAP[ext] || req.file.mimetype;
        inlineFile = {
          mimeType,
          base64: req.file.buffer.toString('base64'),
        };
      } else {
        return res.status(400).json({
          error: `Formato de archivo no compatible (${ext || req.file.mimetype}). Usa PDF, DOCX, TXT, MD o imágenes (PNG/JPG/WEBP).`,
        });
      }
    }

    if (!textContent.trim() && !inlineFile) {
      return res.status(400).json({
        error: 'Debes subir un archivo de contrato o pegar el texto del contrato para analizar.',
      });
    }

    const result = await analyzeContractWithGemini({
      apiKey,
      preferredModel,
      textContent,
      inlineFile,
      fileName,
    });

    return res.json({
      ok: true,
      fileName,
      modelUsed: result.modelUsed,
      analyzedAt: new Date().toISOString(),
      ...result.analysis,
    });
  } catch (err) {
    console.error('[LEXAURA /api/analyze]', err?.message || err);
    const formatted = formatGeminiError(err);
    return res.status(formatted.statusCode).json({ error: formatted.message });
  }
});

// Manejo de errores de Multer (ej. archivo mayor a 15 MB)
app.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(413).json({
      error:
        err.code === 'LIMIT_FILE_SIZE'
          ? 'El archivo supera el límite de 15 MB permitido por solicitud.'
          : `Error al recibir el archivo: ${err.message}`,
    });
  }
  return next(err);
});

// Servir frontend compilado por Vite en producción (Railway)
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distDir, 'index.html'));
    }
    return next();
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LEXAURA servidor activo en http://0.0.0.0:${PORT}`);
});
