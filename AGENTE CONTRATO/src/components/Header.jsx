import React from 'react';
import { Scale, KeyRound, Download, FileSpreadsheet, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Header({
  hasServerKey,
  userApiKey,
  onOpenApiModal,
  contractsCount,
  onExportCsv,
  onExportJson,
}) {
  const isConfigured = hasServerKey || Boolean(userApiKey);

  return (
    <header className="sticky top-0 z-30 border-b gold-hairline bg-obsidian-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Marca Formal */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold-400/50 bg-gradient-to-br from-gold-400/20 via-obsidian-850 to-obsidian-900 shadow-gold-sm">
            <Scale className="h-5 w-5 text-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-xl font-bold tracking-wide text-zinc-50 sm:text-2xl">
                LEX<span className="gold-gradient-text">AURA</span>
              </h1>
              <span className="hidden rounded border border-gold-400/30 bg-gold-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-gold-300 sm:inline-block">
                Gemini Free Tier
              </span>
            </div>
            <p className="text-xs tracking-wide text-zinc-400">
              Auditoría y Clasificación Contractual · Jugadores · Administradores · Proveedores
            </p>
          </div>
        </div>

        {/* Acciones & Estado API */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenApiModal}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
              isConfigured
                ? 'border-gold-400/35 bg-obsidian-850 text-gold-200 hover:border-gold-400/70 hover:bg-obsidian-800'
                : 'border-amber-400/60 bg-gold-400/15 text-gold-200 hover:bg-gold-400/25'
            }`}
          >
            {isConfigured ? (
              <ShieldCheck className="h-4 w-4 text-gold-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gold-300" />
            )}
            <span>
              {userApiKey
                ? 'Llave Personal Activa'
                : hasServerKey
                ? 'API Servidor Conectada'
                : 'Configurar Llave Google AI'}
            </span>
            <KeyRound className="h-3.5 w-3.5 opacity-70" />
          </button>

          {contractsCount > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onExportCsv}
                title="Exportar resumen a Excel / CSV"
                className="inline-flex items-center gap-1.5 rounded-lg border gold-hairline bg-obsidian-850 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-gold-400/50 hover:text-gold-300"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-gold-400" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={onExportJson}
                title="Exportar expediente completo en JSON"
                className="inline-flex items-center gap-1.5 rounded-lg border gold-hairline bg-obsidian-850 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-gold-400/50 hover:text-gold-300"
              >
                <Download className="h-3.5 w-3.5 text-gold-400" />
                <span>JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
