import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Recorder } from './components/Recorder';
import { FileDrop } from './components/FileDrop';
import { ResultBars } from './components/ResultBars';
import {
  checkBackendHealth,
  predictLanguage,
  simulatePrediction,
  DEFAULT_API_URL,
  PredictResponse,
} from './services/api';
import { Loader2, Sparkles, AlertCircle, RefreshCw, Radio } from 'lucide-react';

export default function App() {
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_API_URL);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Audio source selection state
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeSource, setActiveSource] = useState<'record' | 'upload' | null>(null);

  // Prediction analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check health on mount and when apiUrl changes
  const checkHealth = useCallback(async (url: string = apiUrl) => {
    setIsCheckingHealth(true);
    const res = await checkBackendHealth(url);
    setBackendHealthy(res.healthy);
    setIsCheckingHealth(false);
  }, [apiUrl]);

  useEffect(() => {
    checkHealth(apiUrl);
  }, [apiUrl, checkHealth]);

  const handleAudioFromRecord = (file: File | null) => {
    setRecordedFile(file);
    if (file) {
      setActiveSource('record');
      setUploadedFile(null); // exclusive selection
    } else if (activeSource === 'record') {
      setActiveSource(null);
    }
    setResult(null);
    setErrorMessage(null);
  };

  const handleAudioFromUpload = (file: File | null) => {
    setUploadedFile(file);
    if (file) {
      setActiveSource('upload');
      setRecordedFile(null); // exclusive selection
    } else if (activeSource === 'upload') {
      setActiveSource(null);
    }
    setResult(null);
    setErrorMessage(null);
  };

  const currentAudioFile = activeSource === 'record' ? recordedFile : uploadedFile;
  const isAudioReady = Boolean(currentAudioFile);

  const handleAnalyze = async () => {
    if (!currentAudioFile) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      let data: PredictResponse;

      if (isDemoMode) {
        // Demo simulation mode
        data = await simulatePrediction(currentAudioFile.name);
      } else {
        try {
          data = await predictLanguage(
            currentAudioFile,
            currentAudioFile.name || 'recording.wav',
            apiUrl
          );
        } catch (apiError: any) {
          console.warn('Backend error or unreachable, evaluating fallback:', apiError);
          const msg = apiError.response?.data?.error ||
            apiError.response?.data?.message ||
            apiError.message ||
            'Could not reach Flask backend at ' + apiUrl;

          setErrorMessage(
            `${msg}. Make sure your Flask server is running at ${apiUrl} with CORS enabled, or enable Demo Mode to preview.`
          );
          setIsAnalyzing(false);
          return;
        }
      }

      setResult(data);
    } catch (err: any) {
      console.error('Unexpected analysis failure:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during audio analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setRecordedFile(null);
    setUploadedFile(null);
    setActiveSource(null);
    setErrorMessage(null);
  };

  const handleToggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen text-black flex flex-col font-sans selection:bg-[#FFDE59] selection:text-black">
      {/* Fixed Neo-Brutalist Navbar */}
      <Navbar
        backendHealthy={backendHealthy}
        apiUrl={apiUrl}
        isCheckingHealth={isCheckingHealth}
        onRefreshHealth={() => checkHealth(apiUrl)}
        onUpdateApiUrl={(newUrl) => {
          setApiUrl(newUrl);
          checkHealth(newUrl);
        }}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
      />

      {/* Main Content Area: Centered horizontally and vertically */}
      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full flex flex-col items-center justify-center">
        {/* Error Toast / Alert Banner in Neo-Brutalist Box */}
        {errorMessage && (
          <div className="w-full max-w-2xl mb-7 p-4 bg-[#FEE2E2] border-3 border-black shadow-[6px_6px_0px_0px_#000000] text-black text-sm rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-black uppercase tracking-wide text-black">
                Backend Connection Notice
              </p>
              <p className="text-xs text-neutral-800 mt-1 font-bold leading-relaxed">
                {errorMessage}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDemoMode(true);
                    setErrorMessage(null);
                  }}
                  className="px-3 py-1.5 bg-[#FFDE59] hover:bg-[#FACC15] text-xs text-black font-black uppercase rounded border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                >
                  Enable Demo Mode
                </button>
                <button
                  type="button"
                  onClick={() => checkHealth(apiUrl)}
                  className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-xs text-black font-bold uppercase rounded border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="w-6 h-6 flex items-center justify-center font-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-sm leading-none cursor-pointer rounded"
            >
              ✕
            </button>
          </div>
        )}

        {/* Demo Mode Notice Banner if enabled */}
        {isDemoMode && !result && (
          <div className="w-full max-w-2xl mb-6 px-4 py-2.5 bg-[#FEF08A] border-3 border-black shadow-[4px_4px_0px_0px_#000000] rounded-xl text-black text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black shrink-0" />
              <span>
                <strong>DEMO SIMULATION ACTIVE:</strong> Running local browser inference simulation without requiring the Flask backend.
              </span>
            </div>
            <button
              onClick={() => setIsDemoMode(false)}
              className="text-xs underline font-black uppercase hover:text-neutral-800 shrink-0 ml-3 cursor-pointer"
            >
              Turn Off
            </button>
          </div>
        )}

        {/* Content Switch: Either Result or Input Cards */}
        {result ? (
          <div className="w-full transition-all">
            <ResultBars
              result={result}
              onReset={handleReset}
              fileName={currentAudioFile?.name}
            />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Hero Heading */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFDE59] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase tracking-wider text-black rounded-lg mb-4">
                <Radio className="w-4 h-4 text-black" />
                <span>Voice Language Identifier</span>
                <span>·</span>
                <span>4 Languages</span>
              </div>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-black tracking-tight uppercase leading-[1.05]">
                Identify the language of any audio
              </h2>

              <p className="mt-4 text-sm sm:text-base text-neutral-800 font-bold max-w-xl mx-auto">
                Record your voice or upload an audio file to classify between{' '}
                <span className="bg-[#FEF3C7] border border-black px-1 py-0.5 rounded shadow-[1.5px_1.5px_0px_0px_#000000] text-black">
                  Darija
                </span>
                {', '}
                <span className="bg-[#D1FAE5] border border-black px-1 py-0.5 rounded shadow-[1.5px_1.5px_0px_0px_#000000] text-black">
                  MSA
                </span>
                {', '}
                <span className="bg-[#DBEAFE] border border-black px-1 py-0.5 rounded shadow-[1.5px_1.5px_0px_0px_#000000] text-black">
                  French
                </span>
                {' or '}
                <span className="bg-[#FEE2E2] border border-black px-1 py-0.5 rounded shadow-[1.5px_1.5px_0px_0px_#000000] text-black">
                  English
                </span>
                .
              </p>
            </div>

            {/* Two Side-by-Side Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 w-full max-w-3xl">
              {/* Card A: Record */}
              <Recorder
                onAudioReady={handleAudioFromRecord}
                selectedFile={recordedFile}
                isCurrentSource={activeSource === 'record'}
              />

              {/* Card B: Upload */}
              <FileDrop
                onFileSelected={handleAudioFromUpload}
                selectedFile={uploadedFile}
                isCurrentSource={activeSource === 'upload'}
              />
            </div>

            {/* Big Neo-Brutalist Analyze Button */}
            <div className="mt-8 flex flex-col items-center">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!isAudioReady || isAnalyzing}
                className={`px-12 py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-3 border-4 border-black ${
                  isAudioReady && !isAnalyzing
                    ? 'bg-[#A3E635] hover:bg-[#86efac] text-black shadow-[6px_6px_0px_0px_#000000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000000] cursor-pointer'
                    : 'bg-[#E5E7EB] text-neutral-400 border-neutral-400 cursor-not-allowed shadow-[3px_3px_0px_0px_#A3A3A3]'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-black stroke-[3]" />
                    <span>ANALYZING AUDIO...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 text-black stroke-[2.5]" />
                    <span>ANALYZE</span>
                  </>
                )}
              </button>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-black uppercase text-neutral-700 bg-white border-2 border-black px-2.5 py-1 rounded shadow-[2px_2px_0px_0px_#000000]">
                  {isAudioReady
                    ? `READY: ${currentAudioFile?.name}`
                    : 'STAGE AUDIO ABOVE TO ENABLE'}
                </span>
              </div>
            </div>

            {/* Languages legend stickers */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs font-black uppercase">
              <span className="text-neutral-700">Supported:</span>
              <div className="px-2.5 py-1 bg-[#FEF3C7] border-2 border-black rounded shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
                <span>🇲🇦</span>
                <span>Darija</span>
              </div>
              <div className="px-2.5 py-1 bg-[#D1FAE5] border-2 border-black rounded shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
                <span>🇸🇦</span>
                <span>MSA</span>
              </div>
              <div className="px-2.5 py-1 bg-[#DBEAFE] border-2 border-black rounded shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
                <span>🇫🇷</span>
                <span>French</span>
              </div>
              <div className="px-2.5 py-1 bg-[#FEE2E2] border-2 border-black rounded shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
                <span>🇬🇧</span>
                <span>English</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Neo-Brutalist Footer */}
      <footer className="w-full border-t-4 border-black bg-white py-4 text-xs font-black text-black">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 uppercase tracking-wide">
          <span>🎙️ LANGUAGE IDENTIFIER · NEO-BRUTALIST AUDIO CLASSIFIER</span>
          <span className="font-mono text-neutral-700">TARGET: {apiUrl}</span>
        </div>
      </footer>
    </div>
  );
}
