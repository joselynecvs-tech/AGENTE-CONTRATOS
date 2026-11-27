# LEXAURA · Analizador y Clasificador de Contratos

Herramienta desarrollada en **React + Vite + Express** con el SDK oficial **`@google/genai`** (compatible con el **nivel gratuito de Google AI Studio**) para analizar contratos y clasificarlos automáticamente en **3 grupos**:

1. **Jugadores** (contratos deportivos, fichajes, cesiones, derechos de imagen, primas y rescisión).
2. **Administradores** (alta dirección, gerencia, mandatos societarios, poderes y gobierno corporativo).
3. **Proveedores** (suministro, servicios externos, SaaS, SLA, consultoría y facturación comercial).

---

## Características principales

- **Análisis multimodal directo**: Soporta archivos `.pdf`, `.docx`, `.txt`, `.md`, `.csv` e imágenes escaneadas (`.png`, `.jpg`, `.webp`), además de pegado directo de texto.
- **Compatible con Google AI Studio Free Tier**: Configurado con salida JSON estructurada usando `gemini-3.8-flash` (y respaldo automático con `gemini-3.5-flash-lite` y `gemini-2.5-flash`).
- **Tablero por 3 Grupos y Lista Ejecutiva**: Filtra por grupo, nivel de riesgo (`alto`, `medio`, `bajo`) o búsqueda de texto; reclasifica manualmente si lo deseas y agrega notas internas.
- **Exportación**: Descarga el expediente clasificado en **CSV** (compatible con Excel) o **JSON**.
- **Estética Negro y Oro**: Interfaz formal con tipografía editorial (`Playfair Display` + `Inter` + `JetBrains Mono`).

---

## 1. Obtener tu llave gratuita de Google AI Studio

1. Ingresa a [Google AI Studio — API Keys](https://aistudio.google.com/apikey) (documentación: [Get Started](https://aistudio.google.com/docs/get-started)).
2. Crea una nueva API Key (el nivel gratuito no requiere tarjeta de crédito).
3. Guarda esa llave para configurarla en tu `.env` local o en las variables de Railway.

> **Nota sobre el nivel gratuito:** Google AI Studio aplica límites de peticiones por minuto y por día según el proyecto. Si analizas muchos contratos seguidos y alcanzas el límite temporal (`429`), cambia al modelo **Gemini 3.5 Flash-Lite** o espera unos segundos.

---

## 2. Ejecutar en local

Requisitos: **Node.js 20+**

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env a partir de .env.example
cp .env.example .env
# Edita .env y coloca tu GEMINI_API_KEY

# 3. Iniciar frontend (Vite) + backend (Express) en desarrollo
npm run dev
```

Abre `http://localhost:5173`.

Para probar el modo producción localmente:

```bash
npm run build
npm start
```

---

## 3. Desplegar en Railway

El proyecto incluye `railway.json`, `nixpacks.toml` y un servidor Express unificado que compila Vite (`npm run build`) y sirve el frontend + API desde el mismo puerto `PORT` que asigna Railway.

### Pasos en Railway

1. Sube esta carpeta a un repositorio en **GitHub**.
2. En [Railway](https://railway.com), haz clic en **New Project → Deploy from GitHub repo** y selecciona tu repositorio.
3. Ve a la pestaña **Variables** de tu servicio y agrega:
   - `GEMINI_API_KEY`: tu llave gratuita de Google AI Studio (`AIzaSy...`)
   - *(Opcional)* `GEMINI_MODEL`: `gemini-3.8-flash`
4. Railway ejecutará automáticamente:
   - Instalación (`npm install`)
   - Compilación (`npm run build`)
   - Arranque (`npm start`)
   - Healthcheck en `/api/health`
5. Genera tu dominio público en **Settings → Networking → Generate Domain**.

> Si despliegas sin definir `GEMINI_API_KEY` en Railway, los usuarios también pueden ingresar su propia llave gratuita temporalmente desde el botón **"Configurar Llave Google AI"** en la barra superior.
