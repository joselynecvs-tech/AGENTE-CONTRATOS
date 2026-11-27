import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Calendar,
  Coins,
  ShieldAlert,
  CheckSquare,
  Lightbulb,
  FileCheck2,
  StickyNote,
} from 'lucide-react';
import { CONTRACT_GROUPS, RISK_STYLES } from '../constants/categories';

export default function ContractDetailModal({
  contract,
  onClose,
  onReclassify,
  onSaveNotes,
}) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(contract?.notas || '');
  }, [contract]);

  if (!contract) return null;

  const group = CONTRACT_GROUPS[contract.categoria] || CONTRACT_GROUPS.proveedores;
  const risk = RISK_STYLES[contract.riesgo_general] || RISK_STYLES.medio;

  const handleNotesBlur = () => {
    if (notes !== (contract.notas || '')) {
      onSaveNotes(contract.id, notes);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gold-400/40 bg-obsidian-900 shadow-gold">
        {/* Header del Dictamen */}
        <div className="flex items-start justify-between gap-4 border-b gold-hairline bg-obsidian-950/90 px-6 py-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${group.badgeClass}`}>
                {group.label}
              </span>
              <span className={`rounded-md px-2.5 py-0.5 text-xs font-medium ${risk.badgeClass}`}>
                {risk.label}
              </span>
              <span className="rounded-md border border-zinc-800 bg-obsidian-900 px-2 py-0.5 font-mono text-[11px] text-gold-300">
                Confianza {contract.confianza}%
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold leading-tight text-zinc-50">
              {contract.titulo_contrato}
            </h2>
            <p className="text-xs text-zinc-400">
              {contract.subtipo} · Archivo: <span className="font-mono text-zinc-300">{contract.fileName}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-obsidian-800 hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Reclasificación rápida + Metadatos principales */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border gold-hairline bg-obsidian-950 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-400">
                <Coins className="h-3.5 w-3.5 text-gold-400" />
                <span>Valor Económico</span>
              </div>
              <p className="mt-1.5 font-mono text-xs font-medium text-gold-200">
                {contract.valor_economico}
              </p>
            </div>

            <div className="rounded-xl border gold-hairline bg-obsidian-950 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-400">
                <Calendar className="h-3.5 w-3.5 text-gold-400" />
                <span>Vigencia</span>
              </div>
              <p className="mt-1.5 font-mono text-xs text-zinc-200">
                {contract.fecha_inicio} → {contract.fecha_fin}
              </p>
            </div>

            <div className="rounded-xl border gold-hairline bg-obsidian-950 p-3.5">
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400">
                Reasignar Grupo
              </label>
              <select
                value={contract.categoria}
                onChange={(e) => onReclassify(contract.id, e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gold-400/35 bg-obsidian-900 px-2.5 py-1.5 text-xs font-medium text-gold-200 focus:border-gold-400 focus:outline-none"
              >
                <option value="jugadores">Jugadores</option>
                <option value="administradores">Administradores</option>
                <option value="proveedores">Proveedores</option>
              </select>
            </div>
          </div>

          {/* Resumen Ejecutivo & Justificación */}
          <div className="space-y-3 rounded-xl border gold-hairline bg-obsidian-850/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-300">
              <FileCheck2 className="h-4 w-4" />
              <span>Resumen Ejecutivo y Criterio de Clasificación</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-200">{contract.resumen_ejecutivo}</p>
            <p className="border-t border-zinc-800 pt-2.5 text-xs leading-relaxed text-zinc-400">
              <strong className="text-gold-300">Justificación ({group.label}):</strong>{' '}
              {contract.justificacion_clasificacion}
            </p>
          </div>

          {/* Partes Involucradas */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 font-display text-base font-semibold text-zinc-100">
              <Users className="h-4 w-4 text-gold-400" />
              Partes Involucradas
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {(contract.partes_involucradas || []).map((parte, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border gold-hairline bg-obsidian-950 px-3.5 py-2.5"
                >
                  <p className="text-xs font-semibold text-zinc-100">{parte.nombre}</p>
                  <p className="text-[11px] text-gold-300/80">{parte.rol}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Obligaciones Clave */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 font-display text-base font-semibold text-zinc-100">
              <CheckSquare className="h-4 w-4 text-gold-400" />
              Obligaciones Clave
            </h3>
            <ul className="space-y-2">
              {(contract.obligaciones_clave || []).map((ob, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl border gold-hairline bg-obsidian-950 px-3.5 py-2.5 text-xs leading-relaxed text-zinc-300"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                  <span>{ob}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cláusulas Críticas */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 font-display text-base font-semibold text-zinc-100">
              <ShieldAlert className="h-4 w-4 text-gold-400" />
              Cláusulas Críticas y Riesgos
            </h3>
            <div className="space-y-2.5">
              {(contract.clausulas_criticas || []).map((clausula, idx) => {
                const cRisk = RISK_STYLES[clausula.nivel_riesgo] || RISK_STYLES.medio;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border gold-hairline bg-obsidian-950 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-zinc-100">
                        {clausula.titulo}
                      </h4>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${cRisk.badgeClass}`}>
                        {cRisk.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                      {clausula.detalle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recomendaciones */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 font-display text-base font-semibold text-zinc-100">
              <Lightbulb className="h-4 w-4 text-gold-400" />
              Recomendaciones Jurídicas
            </h3>
            <ul className="space-y-2">
              {(contract.recomendaciones || []).map((rec, idx) => (
                <li
                  key={idx}
                  className="rounded-xl border border-gold-400/20 bg-gold-400/5 px-3.5 py-2.5 text-xs leading-relaxed text-gold-100"
                >
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Notas del usuario */}
          <div>
            <label className="mb-2 flex items-center gap-2 font-display text-base font-semibold text-zinc-100">
              <StickyNote className="h-4 w-4 text-gold-400" />
              Notas Internas del Despacho
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Agrega observaciones internas, responsable de firma o seguimiento (se guarda automáticamente)..."
              className="w-full rounded-xl border gold-hairline bg-obsidian-950 p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-gold-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t gold-hairline bg-obsidian-950 px-6 py-3 font-mono text-[10px] text-zinc-500">
          <span>Modelo usado: {contract.modelUsed || 'gemini-3.8-flash'}</span>
          <button
            type="button"
            onClick={() => {
              handleNotesBlur();
              onClose();
            }}
            className="rounded-lg bg-gold-400 px-4 py-1.5 font-sans text-xs font-semibold text-obsidian-950 transition hover:bg-gold-300"
          >
            Cerrar Dictamen
          </button>
        </div>
      </div>
    </div>
  );
}
