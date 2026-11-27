import React, { useMemo, useState } from 'react';
import {
  Users,
  Briefcase,
  Truck,
  Search,
  LayoutGrid,
  List,
  Trash2,
  Eye,
  ArrowRightLeft,
  Calendar,
  Coins,
  FolderOpen,
} from 'lucide-react';
import { CONTRACT_GROUPS, GROUP_ORDER, RISK_STYLES } from '../constants/categories';

const GROUP_ICONS = {
  jugadores: Users,
  administradores: Briefcase,
  proveedores: Truck,
};

export default function ContractBoard({
  contracts,
  onSelectContract,
  onReclassify,
  onDeleteContract,
  onClearAll,
}) {
  const [activeGroup, setActiveGroup] = useState('todos'); // 'todos' | 'jugadores' | 'administradores' | 'proveedores'
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'
  const [riskFilter, setRiskFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => {
    return {
      todos: contracts.length,
      jugadores: contracts.filter((c) => c.categoria === 'jugadores').length,
      administradores: contracts.filter((c) => c.categoria === 'administradores').length,
      proveedores: contracts.filter((c) => c.categoria === 'proveedores').length,
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return contracts.filter((c) => {
      if (activeGroup !== 'todos' && c.categoria !== activeGroup) return false;
      if (riskFilter !== 'todos' && c.riesgo_general !== riskFilter) return false;
      if (!q) return true;
      const haystack = [
        c.titulo_contrato,
        c.subtipo,
        c.fileName,
        c.resumen_ejecutivo,
        c.valor_economico,
        ...(c.partes_involucradas || []).map((p) => `${p.nombre} ${p.rol}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [contracts, activeGroup, riskFilter, searchQuery]);

  const visibleGroups = activeGroup === 'todos' ? GROUP_ORDER : [activeGroup];

  return (
    <section className="space-y-5">
      {/* Tarjetas KPI de Resumen e Interacción */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setActiveGroup('todos')}
          className={`rounded-2xl border p-4 text-left transition ${
            activeGroup === 'todos'
              ? 'border-gold-400/70 bg-obsidian-850 shadow-gold-sm'
              : 'gold-hairline bg-obsidian-900/90 hover:border-gold-400/40'
          }`}
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            Total Expediente
          </span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-gold-300">
              {counts.todos}
            </span>
            <span className="text-[11px] text-zinc-500">Contratos</span>
          </div>
        </button>

        {GROUP_ORDER.map((groupId) => {
          const group = CONTRACT_GROUPS[groupId];
          const Icon = GROUP_ICONS[groupId];
          const isSelected = activeGroup === groupId;
          return (
            <button
              key={groupId}
              type="button"
              onClick={() => setActiveGroup(isSelected ? 'todos' : groupId)}
              className={`rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? 'border-gold-400/70 bg-obsidian-850 shadow-gold-sm'
                  : 'gold-hairline bg-obsidian-900/90 hover:border-gold-400/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  {group.label}
                </span>
                <Icon className="h-4 w-4 text-gold-400/80" />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-zinc-50">
                  {counts[groupId]}
                </span>
                <span className="text-[11px] text-gold-300/80">
                  {counts.todos > 0
                    ? `${Math.round((counts[groupId] / counts.todos) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Barra de Búsqueda, Filtros y Modo de Vista */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border gold-hairline bg-obsidian-900/90 p-3.5">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por parte firmante, título, monto o cláusula..."
            className="w-full rounded-xl border gold-hairline bg-obsidian-950 py-2 pl-9 pr-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-gold-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-xl border gold-hairline bg-obsidian-950 px-3 py-2 text-xs text-zinc-200 focus:border-gold-400 focus:outline-none"
          >
            <option value="todos">Riesgo: Todos</option>
            <option value="alto">Riesgo Alto</option>
            <option value="medio">Riesgo Medio</option>
            <option value="bajo">Riesgo Bajo</option>
          </select>

          <div className="flex rounded-xl border gold-hairline bg-obsidian-950 p-1">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              title="Vista de Tablero por 3 Grupos"
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                viewMode === 'board'
                  ? 'bg-gold-400 text-obsidian-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">3 Grupos</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Vista de Lista Ejecutiva"
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                viewMode === 'list'
                  ? 'bg-gold-400 text-obsidian-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>

          {contracts.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              title="Vaciar archivo de contratos"
              className="inline-flex items-center gap-1 rounded-xl border border-red-500/25 bg-red-950/20 px-2.5 py-2 text-xs text-red-300 transition hover:bg-red-950/50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Estado Vacío */}
      {contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold-400/25 bg-obsidian-900/60 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/35 bg-gold-400/10">
            <FolderOpen className="h-6 w-6 text-gold-400" />
          </div>
          <h3 className="mt-4 font-display text-xl font-semibold text-zinc-100">
            Bóveda Contractual Vacía
          </h3>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-zinc-400">
            Sube archivos PDF, Word o texto en el panel izquierdo —o carga uno de los{' '}
            <span className="text-gold-300">contratos de ejemplo</span>— para que Gemini los analice y clasifique automáticamente en{' '}
            <strong className="text-zinc-200">Jugadores</strong>,{' '}
            <strong className="text-zinc-200">Administradores</strong> y{' '}
            <strong className="text-zinc-200">Proveedores</strong>.
          </p>
        </div>
      ) : viewMode === 'board' ? (
        /* Vista Tablero de 3 Columnas */
        <div
          className={`grid gap-4 ${
            visibleGroups.length === 1
              ? 'grid-cols-1'
              : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {visibleGroups.map((groupId) => {
            const group = CONTRACT_GROUPS[groupId];
            const Icon = GROUP_ICONS[groupId];
            const items = filteredContracts.filter((c) => c.categoria === groupId);

            return (
              <div
                key={groupId}
                className="flex flex-col rounded-2xl border gold-hairline bg-obsidian-900/80"
              >
                <div className="flex items-center justify-between border-b gold-hairline px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-400/30 bg-gold-400/10">
                      <Icon className="h-4 w-4 text-gold-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold text-zinc-50">
                        {group.label}
                      </h3>
                      <p className="text-[10px] text-zinc-400">{group.subtitle}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-gold-400/35 bg-obsidian-950 px-2.5 py-0.5 font-mono text-xs font-semibold text-gold-300">
                    {items.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 p-3.5">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 px-3 py-8 text-center text-xs text-zinc-500">
                      Sin contratos en {group.label.toLowerCase()}
                    </div>
                  ) : (
                    items.map((contract) => (
                      <ContractCard
                        key={contract.id}
                        contract={contract}
                        onSelect={() => onSelectContract(contract)}
                        onReclassify={onReclassify}
                        onDelete={() => onDeleteContract(contract.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista Lista Ejecutiva */
        <div className="space-y-3">
          {filteredContracts.length === 0 ? (
            <div className="rounded-2xl border gold-hairline bg-obsidian-900/80 py-10 text-center text-xs text-zinc-400">
              No hay contratos que coincidan con los filtros seleccionados.
            </div>
          ) : (
            filteredContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                compactRow
                onSelect={() => onSelectContract(contract)}
                onReclassify={onReclassify}
                onDelete={() => onDeleteContract(contract.id)}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

function ContractCard({ contract, compactRow = false, onSelect, onReclassify, onDelete }) {
  const group = CONTRACT_GROUPS[contract.categoria] || CONTRACT_GROUPS.proveedores;
  const risk = RISK_STYLES[contract.riesgo_general] || RISK_STYLES.medio;

  return (
    <article
      className={`group rounded-xl border gold-hairline bg-obsidian-950/90 p-3.5 transition hover:border-gold-400/55 hover:bg-obsidian-850/90 ${
        compactRow ? 'flex flex-col justify-between gap-3 sm:flex-row sm:items-center' : ''
      }`}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {compactRow && (
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${group.badgeClass}`}>
                {group.label}
              </span>
            )}
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${risk.badgeClass}`}>
              {risk.label}
            </span>
            <span className="rounded-md border border-zinc-800 bg-obsidian-900 px-1.5 py-0.5 font-mono text-[10px] text-gold-300">
              {contract.confianza}% conf.
            </span>
          </div>

          <button
            type="button"
            onClick={onDelete}
            title="Eliminar contrato"
            className="rounded p-1 text-zinc-600 opacity-70 transition hover:bg-red-950/40 hover:text-red-300 group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <button type="button" onClick={onSelect} className="block w-full text-left">
          <h4 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-zinc-50 transition group-hover:text-gold-300">
            {contract.titulo_contrato}
          </h4>
          <p className="mt-0.5 truncate text-[11px] text-zinc-400">
            {contract.subtipo} · <span className="font-mono text-zinc-500">{contract.fileName}</span>
          </p>
        </button>

        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
          {contract.resumen_ejecutivo}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-mono text-[10px] text-zinc-400">
          <span className="inline-flex items-center gap-1 text-gold-200/90">
            <Coins className="h-3 w-3 text-gold-400" />
            {contract.valor_economico}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3 text-zinc-500" />
            {contract.fecha_inicio} → {contract.fecha_fin}
          </span>
        </div>
      </div>

      {/* Barra de acciones */}
      <div
        className={`flex items-center justify-between gap-2 ${
          compactRow
            ? 'shrink-0 sm:flex-col sm:items-end'
            : 'mt-3 border-t border-zinc-900 pt-2.5'
        }`}
      >
        <div className="flex items-center gap-1">
          <ArrowRightLeft className="h-3 w-3 text-zinc-500" />
          <select
            aria-label="Reclasificar grupo del contrato"
            value={contract.categoria}
            onChange={(e) => onReclassify(contract.id, e.target.value)}
            className="rounded-md border border-zinc-800 bg-obsidian-900 px-1.5 py-1 text-[11px] text-zinc-300 focus:border-gold-400 focus:outline-none"
          >
            <option value="jugadores">Jugadores</option>
            <option value="administradores">Administradores</option>
            <option value="proveedores">Proveedores</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onSelect}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gold-400/35 bg-gold-400/10 px-2.5 py-1 text-[11px] font-medium text-gold-200 transition hover:bg-gold-400 hover:text-obsidian-950"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Dictamen</span>
        </button>
      </div>
    </article>
  );
}
