import { CONTRACT_GROUPS } from '../constants/categories';

function escapeCsvCell(value) {
  const str = String(value ?? '').replace(/\r?\n/g, ' ');
  if (str.includes(',') || str.includes('"') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportContractsToCsv(contracts) {
  const headers = [
    'ID',
    'Grupo',
    'Título del Contrato',
    'Subtipo',
    'Archivo Origen',
    'Confianza (%)',
    'Riesgo General',
    'Fecha Inicio',
    'Fecha Fin',
    'Valor Económico',
    'Partes Involucradas',
    'Resumen Ejecutivo',
    'Notas Personales',
    'Fecha de Análisis',
  ];

  const rows = contracts.map((c) => [
    c.id,
    CONTRACT_GROUPS[c.categoria]?.label || c.categoria,
    c.titulo_contrato,
    c.subtipo,
    c.fileName,
    c.confianza,
    c.riesgo_general,
    c.fecha_inicio,
    c.fecha_fin,
    c.valor_economico,
    (c.partes_involucradas || []).map((p) => `${p.nombre} (${p.rol})`).join(' | '),
    c.resumen_ejecutivo,
    c.notas || '',
    c.analyzedAt,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `lexaura_contratos_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportContractsToJson(contracts) {
  const payload = {
    exportadoEn: new Date().toISOString(),
    total: contracts.length,
    resumenPorGrupo: {
      jugadores: contracts.filter((c) => c.categoria === 'jugadores').length,
      administradores: contracts.filter((c) => c.categoria === 'administradores').length,
      proveedores: contracts.filter((c) => c.categoria === 'proveedores').length,
    },
    contratos: contracts,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  triggerDownload(blob, `lexaura_contratos_${new Date().toISOString().slice(0, 10)}.json`);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
