import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import ContractIntake from './components/ContractIntake';
import ContractBoard from './components/ContractBoard';
import ContractDetailModal from './components/ContractDetailModal';
import ApiKeyModal from './components/ApiKeyModal';
import { STORAGE_KEYS } from './constants/categories';
import { exportContractsToCsv, exportContractsToJson } from './utils/exportContracts';

const FALLBACK_MODELS = [
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash (Recomendado · Nivel Gratuito)',
  },
  {
    id: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash-Lite (Alta Velocidad · Nivel Gratuito)',
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash (Compatibilidad · Nivel Gratuito)',
  },
];

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `ct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [contracts, setContracts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hasServerKey, setHasServerKey] = useState(false);
  const [models, setModels] = useState(FALLBACK_MODELS);
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem(STORAGE_KEYS.MODEL) || 'auto'
  );
  const [userApiKey, setUserApiKey] = useState(
    () => sessionStorage.getItem(STORAGE_KEYS.USER_API_KEY) || ''
  );

  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressInfo, setProgressInfo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    } catch {
      // Ignorar si el almacenamiento local está lleno
    }
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODEL, selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setHasServerKey(Boolean(data.hasServerKey));
        if (Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);
        }
      })
      .catch(() => {
        // Servidor local aún iniciando o en espera
      });
  }, []);

  const handleSaveApiKey = (key) => {
    setUserApiKey(key);
    if (key) {
      sessionStorage.setItem(STORAGE_KEYS.USER_API_KEY, key);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.USER_API_KEY);
    }
  };

  const handleClearApiKey = () => {
    setUserApiKey('');
    sessionStorage.removeItem(STORAGE_KEYS.USER_API_KEY);
  };

  const buildHeaders = (extra = {}) => {
    const headers = { ...extra };
    if (userApiKey) {
      headers['x-gemini-api-key'] = userApiKey;
    }
    return headers;
  };

  const ensureKeyOrPrompt = () => {
    if (!hasServerKey && !userApiKey) {
      setIsApiModalOpen(true);
      setErrorMessage(
        'Configura tu llave gratuita de Google AI Studio (GEMINI_API_KEY en Railway o en el botón superior) antes de analizar.'
      );
      return false;
    }
    return true;
  };

  const handleAnalyzeFiles = async (files) => {
    if (!ensureKeyOrPrompt()) return 0;
    setErrorMessage('');
    setIsAnalyzing(true);
    let successCount = 0;

    try {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        setProgressInfo(`Analizando ${i + 1} de ${files.length}: ${file.name}`);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', selectedModel);

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: buildHeaders(),
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Error al procesar ${file.name}`);
        }

        const newRecord = {
          ...data,
          id: createId(),
          notas: '',
        };
        setContracts((prev) => [newRecord, ...prev]);
        successCount += 1;
      }
    } catch (err) {
      setErrorMessage(err.message || 'Ocurrió un error al analizar el archivo.');
    } finally {
      setIsAnalyzing(false);
      setProgressInfo('');
    }

    return successCount;
  };

  const handleAnalyzeText = async ({ text, fileName }) => {
    if (!ensureKeyOrPrompt()) return false;
    setErrorMessage('');
    setIsAnalyzing(true);
    setProgressInfo(`Clasificando "${fileName}"...`);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: buildHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          text,
          fileName,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo analizar el contrato.');
      }

      const newRecord = {
        ...data,
        id: createId(),
        notas: '',
      };
      setContracts((prev) => [newRecord, ...prev]);
      return true;
    } catch (err) {
      setErrorMessage(err.message || 'Error al conectar con el servidor.');
      return false;
    } finally {
      setIsAnalyzing(false);
      setProgressInfo('');
    }
  };

  const handleReclassify = (id, nextCategory) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, categoria: nextCategory } : c))
    );
  };

  const handleSaveNotes = (id, notas) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, notas } : c)));
  };

  const handleDeleteContract = (id) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    if (selectedContractId === id) {
      setSelectedContractId(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('¿Deseas vaciar todos los contratos analizados de la bóveda local?')) {
      setContracts([]);
      setSelectedContractId(null);
    }
  };

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        hasServerKey={hasServerKey}
        userApiKey={userApiKey}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        contractsCount={contracts.length}
        onExportCsv={() => exportContractsToCsv(contracts)}
        onExportJson={() => exportContractsToJson(contracts)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Intro editorial */}
        <div className="mb-6 flex flex-col justify-between gap-3 border-b gold-hairline pb-5 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold-400">
              Sistema de Inteligencia Jurídica
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
              Organización y Clasificación de Contratos
            </h2>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
            Analiza contratos en PDF, Word o texto plano mediante el nivel gratuito de Google AI Studio y organízalos automáticamente en{' '}
            <span className="text-gold-300">Jugadores</span>,{' '}
            <span className="text-gold-300">Administradores</span> y{' '}
            <span className="text-gold-300">Proveedores</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <ContractIntake
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              isAnalyzing={isAnalyzing}
              progressInfo={progressInfo}
              errorMessage={errorMessage}
              onDismissError={() => setErrorMessage('')}
              onAnalyzeFiles={handleAnalyzeFiles}
              onAnalyzeText={handleAnalyzeText}
            />
          </div>

          <div className="lg:col-span-8">
            <ContractBoard
              contracts={contracts}
              onSelectContract={(c) => setSelectedContractId(c.id)}
              onReclassify={handleReclassify}
              onDeleteContract={handleDeleteContract}
              onClearAll={handleClearAll}
            />
          </div>
        </div>
      </main>

      <footer className="border-t gold-hairline bg-obsidian-950/80 py-4 text-center text-[11px] text-zinc-500">
        LEXAURA · Impulsado por Google Gemini API (Free Tier) · Preparado para despliegue en Railway
      </footer>

      <ContractDetailModal
        contract={selectedContract}
        onClose={() => setSelectedContractId(null)}
        onReclassify={handleReclassify}
        onSaveNotes={handleSaveNotes}
      />

      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        hasServerKey={hasServerKey}
        userApiKey={userApiKey}
        onSaveKey={handleSaveApiKey}
        onClearKey={handleClearApiKey}
      />
    </div>
  );
}
