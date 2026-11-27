export const CONTRACT_GROUPS = {
  jugadores: {
    id: 'jugadores',
    label: 'Jugadores',
    singular: 'Jugador',
    subtitle: 'Deportistas, fichajes, cesiones y derechos de imagen',
    accentBorder: 'border-gold-400/40',
    accentBg: 'bg-gold-400/10',
    accentText: 'text-gold-300',
    badgeClass: 'bg-gold-400/15 text-gold-300 border border-gold-400/35',
    dotClass: 'bg-gold-400',
  },
  administradores: {
    id: 'administradores',
    label: 'Administradores',
    singular: 'Administrador',
    subtitle: 'Alta dirección, gerencia, mandatos y apoderados',
    accentBorder: 'border-amber-400/40',
    accentBg: 'bg-amber-400/10',
    accentText: 'text-amber-200',
    badgeClass: 'bg-amber-400/15 text-amber-200 border border-amber-400/35',
    dotClass: 'bg-amber-400',
  },
  proveedores: {
    id: 'proveedores',
    label: 'Proveedores',
    singular: 'Proveedor',
    subtitle: 'Servicios externos, suministro, licencias y SLA',
    accentBorder: 'border-yellow-600/45',
    accentBg: 'bg-yellow-500/10',
    accentText: 'text-yellow-200',
    badgeClass: 'bg-yellow-600/20 text-yellow-200 border border-yellow-500/35',
    dotClass: 'bg-yellow-500',
  },
};

export const GROUP_ORDER = ['jugadores', 'administradores', 'proveedores'];

export const RISK_STYLES = {
  bajo: {
    label: 'Riesgo Bajo',
    badgeClass: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30',
  },
  medio: {
    label: 'Riesgo Medio',
    badgeClass: 'bg-gold-900/40 text-gold-300 border border-gold-400/40',
  },
  alto: {
    label: 'Riesgo Alto',
    badgeClass: 'bg-red-950/70 text-red-300 border border-red-500/40',
  },
};

export const STORAGE_KEYS = {
  CONTRACTS: 'lexaura_contracts_v1',
  USER_API_KEY: 'lexaura_gemini_session_key',
  MODEL: 'lexaura_selected_model',
};
