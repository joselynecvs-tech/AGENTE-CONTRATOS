import React, { useState } from 'react';
import { X, KeyRound, ExternalLink, CheckCircle2, Trash2, Server } from 'lucide-react';

export default function ApiKeyModal({
  isOpen,
  onClose,
  hasServerKey,
  userApiKey,
  onSaveKey,
  onClearKey,
}) {
  const [draftKey, setDraftKey] = useState(userApiKey || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveKey(draftKey.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-gold-400/35 bg-obsidian-900 p-6 shadow-gold">
        <div className="flex items-start justify-between gap-4 border-b gold-hairline pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-400/40 bg-gold-400/10">
              <KeyRound className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-zinc-50">
                Configuración de Google AI Studio
              </h2>
              <p className="text-xs text-zinc-400">
                Nivel Gratuito (Free Tier) · Sin tarjeta requerida
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-obsidian-800 hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm text-zinc-300">
          {hasServerKey && (
            <div className="flex items-start gap-2.5 rounded-xl border border-gold-400/30 bg-gold-400/10 p-3 text-xs text-gold-100">
              <Server className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <div>
                <p className="font-semibold text-gold-300">
                  Variable GEMINI_API_KEY detectada en el servidor
                </p>
                <p className="mt-0.5 text-zinc-300">
                  La aplicación ya puede analizar contratos usando la llave configurada en Railway / `.env`. Solo ingresa una llave abajo si deseas sobrescribirla temporalmente en tu sesión.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl border gold-hairline bg-obsidian-850 p-3.5 text-xs leading-relaxed text-zinc-300">
            <p className="font-medium text-gold-300">¿Cómo obtener tu llave gratuita?</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-zinc-400">
              <li>
                Ingresa a{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-gold-300 underline decoration-gold-400/40 hover:text-gold-200"
                >
                  Google AI Studio (API Keys)
                  <ExternalLink className="h-3 w-3" />
                </a>
                .
              </li>
              <li>Haz clic en &ldquo;Create API key&rdquo; (plan gratuito / Free Tier).</li>
              <li>
                Para producción en Railway, agrégala en <code className="font-mono text-gold-200">Variables → GEMINI_API_KEY</code>.
              </li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Llave API de Sesión (Opcional)
              </label>
              <input
                type="password"
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border gold-hairline bg-obsidian-950 px-3.5 py-2.5 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-gold-400 focus:outline-none"
              />
              <p className="mt-1.5 text-[11px] text-zinc-500">
                Se guarda únicamente en `sessionStorage` de tu navegador y se envía por HTTPS al servidor para consultar Gemini.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              {userApiKey ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraftKey('');
                    onClearKey();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/35 bg-red-950/30 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-950/60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Quitar llave de sesión
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border gold-hairline px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:bg-obsidian-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gold-400 px-4 py-2 text-xs font-semibold text-obsidian-950 transition hover:bg-gold-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Guardar Llave
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
