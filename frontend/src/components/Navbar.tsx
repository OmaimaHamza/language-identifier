import React, { useState } from 'react';
import { Settings, RefreshCw, CheckCircle2, AlertCircle, Server } from 'lucide-react';

interface NavbarProps {
  backendHealthy: boolean | null;
  apiUrl: string;
  isCheckingHealth: boolean;
  onRefreshHealth: () => void;
  onUpdateApiUrl: (url: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  backendHealthy,
  apiUrl,
  isCheckingHealth,
  onRefreshHealth,
  onUpdateApiUrl,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [inputUrl, setInputUrl] = useState(apiUrl);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onUpdateApiUrl(inputUrl.trim());
      setShowConfig(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121212] text-white border-b-4 border-black shadow-[0px_5px_0px_0px_#000000]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-[#FFDE59] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] rounded-lg flex items-center justify-center text-xl select-none font-bold">
            🎙️
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Language Identifier
            </h1>
          </div>
        </div>

        {/* Center / Right: Subtitle & Status */}
        <div className="flex items-center gap-4 sm:gap-6">
          <p className="hidden md:block text-xs sm:text-sm text-neutral-300 font-bold uppercase tracking-wider whitespace-nowrap">
            Detect Darija, MSA, French or English from voice
          </p>

          {/* Backend Status indicator in Neo-Brutalist Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#232323] hover:bg-[#2e2e2e] border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all text-xs font-bold text-white group cursor-pointer"
              title="Click to view connection settings"
            >
              <span className="relative flex h-2.5 w-2.5">
                {backendHealthy === true ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E] border border-black"></span>
                  </>
                ) : isDemoMode ? (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FACC15] border border-black"></span>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF4444] border border-black"></span>
                )}
              </span>

              <span className="hidden sm:inline">
                {backendHealthy === true
                  ? 'BACKEND CONNECTED'
                  : isDemoMode
                  ? 'DEMO SIMULATION'
                  : 'BACKEND OFFLINE'}
              </span>

              <Settings className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Dropdown Popover (Neo-brutalist modal) */}
      {showConfig && (
        <div className="absolute right-4 top-20 w-88 max-w-[calc(100vw-2rem)] bg-[#FFFFFF] border-3 border-black shadow-[8px_8px_0px_0px_#000000] p-5 text-black z-50 text-xs rounded-xl">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2 font-black text-black text-sm uppercase tracking-wide">
              <Server className="w-4 h-4 text-black" />
              <span>Backend Configuration</span>
            </div>
            <button
              onClick={() => setShowConfig(false)}
              className="w-6 h-6 flex items-center justify-center font-black bg-[#FFDE59] border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-[#fcd34d] active:shadow-none text-sm leading-none cursor-pointer rounded"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveUrl} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-black mb-1 uppercase tracking-wide">
                Flask API Endpoint URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="http://localhost:5000"
                  className="flex-1 bg-[#FAF5EA] border-2 border-black shadow-[2px_2px_0px_0px_#000000] rounded px-3 py-2 text-xs text-black font-mono font-bold focus:outline-none focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#A3E635] hover:bg-[#86efac] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] font-black rounded cursor-pointer"
                >
                  SAVE
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t-2 border-black">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-neutral-700">Health:</span>
                {backendHealthy === true ? (
                  <span className="bg-[#DCFCE7] text-[#166534] border border-black px-1.5 py-0.5 rounded flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE
                  </span>
                ) : (
                  <span className="bg-[#FEE2E2] text-[#991B1B] border border-black px-1.5 py-0.5 rounded flex items-center gap-1 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" /> OFFLINE
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onRefreshHealth}
                disabled={isCheckingHealth}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#E0E7FF] hover:bg-[#C7D2FE] border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-black font-bold rounded disabled:opacity-50 cursor-pointer text-[11px]"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                <span>PING</span>
              </button>
            </div>

            {/* Demo mode toggle */}
            <div className="pt-3 border-t-2 border-black flex items-center justify-between">
              <div>
                <p className="font-extrabold text-black uppercase text-[11px]">Demo Mode (Offline)</p>
                <p className="text-[10px] text-neutral-600 font-medium">
                  Simulate local predictions if backend is not started
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleDemoMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-black transition-colors duration-150 ease-in-out focus:outline-none shadow-[2px_2px_0px_0px_#000000] ${
                  isDemoMode ? 'bg-[#A3E635]' : 'bg-[#E5E7EB]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-black border border-black transition duration-150 ease-in-out mt-[1px] ${
                    isDemoMode ? 'translate-x-5 bg-black' : 'translate-x-0.5 bg-neutral-600'
                  }`}
                />
              </button>
            </div>
          </form>
        </div>
      )}
    </nav>
  );
};
