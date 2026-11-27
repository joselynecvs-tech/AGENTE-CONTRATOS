import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  X,
  Cpu,
  BookOpenCheck,
  AlertTriangle,
} from 'lucide-react';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';

export default function ContractIntake({
  models,
  selectedModel,
  onSelectModel,
  isAnalyzing,
  progressInfo,
  errorMessage,
  onDismissError,
  onAnalyzeFiles,
  onAnalyzeText,
}) {
  const [mode, setMode] = useState('files'); // 'files' | 'text'
  const [queuedFiles, setQueuedFiles] = useState([]);
  const [contractTitle, setContractTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFilesSelected = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    setQueuedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const unique = incoming.filter((f) => !existingNames.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const removeQueuedFile = (index) => {
    setQueuedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitFiles = async (e) => {
    e.preventDefault();
    if (!queuedFiles.length || isAnalyzing) return;
    const filesToProcess = [...queuedFiles];
    const successCount = await onAnalyzeFiles(filesToProcess);
    if (successCount > 0) {
      setQueuedFiles([]);
    }
  };

  const handleSubmitText = async (e) => {
    e.preventDefault();
    if (!rawText.trim() || isAnalyzing) return;
    const ok = await onAnalyzeText({
      text: rawText,
      fileName: contractTitle.trim() || 'Contrato pegado manualmente',
    });
    if (ok) {
      setRawText('');
      setContractTitle('');
    }
  };

  const loadSample = (sample) => {
    setMode('text');
    setContractTitle(sample.fileName);
    setRawText(sample.text);
  };

  return (
    <section className="rounded-2xl border gold-hairline bg-obsidian-900/95 p-5 shadow-gold-sm sm:p-6">
      {/* Encabezado del panel */}
      <div className="flex items-start justify-between gap-3 border-b gold-hairline pb-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-400">
            Módulo de Ingreso
          </span>
          <h2 className="mt-0.5 font-display text-xl font-semibold text-zinc-50">
            Analizar Nuevo Contrato
          </h2>
        </div>
        <div className="flex rounded-lg border gold-hairline bg-obsidian-950 p-1">
          <button
            type="button"
            onClick={() => setMode('files')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              mode === 'files'
                ? 'bg-gold-400 text-obsidian-950'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Archivos
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              mode === 'text'
                ? 'bg-gold-400 text-obsidian-950'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Texto
          </button>
        </div>
      </div>

      {/* Selector de Modelo Free Tier */}
      <div className="mt-4">
        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          <Cpu className="h-3.5 w-3.5 text-gold-400" />
          Modelo Google AI (Nivel Gratuito)
        </label>
        <select
          value={selectedModel}
          onChange={(e) => onSelectModel(e.target.value)}
          disabled={isAnalyzing}
          className="w-full rounded-xl border gold-hairline bg-obsidian-950 px-3 py-2 text-xs text-zinc-200 focus:border-gold-400 focus:outline-none disabled:opacity-60"
        >
          <option value="auto">Automático (Gemini 3.8 Flash con respaldo gratuito)</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Alerta de error si existe */}
      {errorMessage && (
        <div className="mt-4 flex items-start justify-between gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="shrink-0 rounded p-0.5 text-red-300 hover:bg-red-900/40"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Modo Archivos */}
      {mode === 'files' ? (
        <form onSubmit={handleSubmitFiles} className="mt-4 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
              isDragging
                ? 'border-gold-400 bg-gold-400/10'
                : 'border-gold-400/25 bg-obsidian-950/70 hover:border-gold-400/55 hover:bg-obsidian-850/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/35 bg-gold-400/10">
              <Upload className="h-5 w-5 text-gold-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-zinc-100">
              Arrastra contratos aquí o <span className="text-gold-400 underline">examina tu equipo</span>
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Admite PDF, Word (.docx), TXT, Markdown e imágenes escaneadas (máx. 15 MB)
            </p>
          </div>

          {queuedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Cola de análisis ({queuedFiles.length})</span>
                <button
                  type="button"
                  onClick={() => setQueuedFiles([])}
                  className="text-gold-300 hover:underline"
                >
                  Limpiar cola
                </button>
              </div>
              <ul className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
                {queuedFiles.map((file, idx) => (
                  <li
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between gap-2 rounded-lg border gold-hairline bg-obsidian-950 px-3 py-2 text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-gold-400" />
                      <span className="truncate text-zinc-200">{file.name}</span>
                      <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQueuedFile(idx)}
                      disabled={isAnalyzing}
                      className="rounded p-1 text-zinc-500 hover:bg-obsidian-800 hover:text-zinc-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={!queuedFiles.length || isAnalyzing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 px-4 py-3 text-sm font-semibold text-obsidian-950 shadow-gold-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{progressInfo || 'Analizando y clasificando...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>
                  {queuedFiles.length > 1
                    ? `Analizar y Clasificar (${queuedFiles.length} contratos)`
                    : 'Analizar y Clasificar Contrato'}
                </span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* Modo Texto */
        <form onSubmit={handleSubmitText} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Nombre o Referencia del Documento
            </label>
            <input
              type="text"
              value={contractTitle}
              onChange={(e) => setContractTitle(e.target.value)}
              placeholder="Ej. Contrato de Jugador 2026 - Club Áureo"
              className="w-full rounded-xl border gold-hairline bg-obsidian-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-gold-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Contenido Íntegro o Cláusulas del Contrato
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Pega aquí las cláusulas o texto del contrato para clasificarlo en Jugadores, Administradores o Proveedores..."
              className="w-full rounded-xl border gold-hairline bg-obsidian-950 p-3 text-xs leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-gold-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!rawText.trim() || isAnalyzing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 px-4 py-3 text-sm font-semibold text-obsidian-950 shadow-gold-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{progressInfo || 'Analizando con Gemini...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Analizar Texto Contractual</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Ejemplos rápidos */}
      <div className="mt-5 border-t gold-hairline pt-4">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          <BookOpenCheck className="h-3.5 w-3.5 text-gold-400" />
          <span>Cargar contrato de ejemplo para probar</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {SAMPLE_CONTRACTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => loadSample(sample)}
              disabled={isAnalyzing}
              className="rounded-lg border gold-hairline bg-obsidian-950 px-2.5 py-2 text-left text-[11px] font-medium text-gold-200 transition hover:border-gold-400/55 hover:bg-obsidian-850 disabled:opacity-50"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
