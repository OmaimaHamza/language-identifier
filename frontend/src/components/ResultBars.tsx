import React, { useEffect, useState } from 'react';
import { RotateCcw, Award, CheckCircle } from 'lucide-react';
import { PredictResponse } from '../services/api';

interface ResultBarsProps {
  result: PredictResponse;
  onReset: () => void;
  fileName?: string;
}

interface LanguageMeta {
  key: string;
  name: string;
  nativeName: string;
  flag: string;
  barColor: string;
  badgeBg: string;
  description: string;
}

const LANGUAGES: Record<string, LanguageMeta> = {
  darija: {
    key: 'darija',
    name: 'Darija',
    nativeName: 'الدارجة المغربية',
    flag: '🇲🇦',
    barColor: 'bg-[#F59E0B]',
    badgeBg: 'bg-[#FEF3C7]',
    description: 'Moroccan Arabic vernacular dialect with Amazigh, French, & Spanish influences.',
  },
  msa: {
    key: 'msa',
    name: 'MSA',
    nativeName: 'العربية الفصحى',
    flag: '🇸🇦',
    barColor: 'bg-[#10B981]',
    badgeBg: 'bg-[#D1FAE5]',
    description: 'Modern Standard Arabic, the formal literary language of the Arab world.',
  },
  french: {
    key: 'french',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    barColor: 'bg-[#3B82F6]',
    badgeBg: 'bg-[#DBEAFE]',
    description: 'Romance language spoken widely across Europe, North Africa, and West Africa.',
  },
  english: {
    key: 'english',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    barColor: 'bg-[#EF4444]',
    badgeBg: 'bg-[#FEE2E2]',
    description: 'Global Germanic lingua franca with widespread international usage.',
  },
};

export const ResultBars: React.FC<ResultBarsProps> = ({ result, onReset, fileName }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [result]);

  const winningKey = (result.language || 'english').toLowerCase();
  const winningMeta = LANGUAGES[winningKey] || {
    key: winningKey,
    name: result.language.toUpperCase(),
    nativeName: '',
    flag: '🌐',
    barColor: 'bg-[#6366F1]',
    badgeBg: 'bg-[#E0E7FF]',
    description: 'Classified voice input',
  };

  const confidencePct = (result.confidence * 100).toFixed(1);
  const languageKeys = ['darija', 'msa', 'french', 'english'];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border-4 border-black shadow-[10px_10px_0px_0px_#000000] rounded-3xl p-6 sm:p-9 text-black">
      {/* Top Banner Tag */}
      <div className="text-center pb-6 border-b-3 border-black">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FFDE59] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase tracking-wider mb-4">
          <Award className="w-4 h-4 text-black" />
          <span>CLASSIFICATION RESULT</span>
          {fileName && <span className="font-mono text-neutral-800">· {fileName}</span>}
        </div>

        {/* Big Headline */}
        <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight flex items-center justify-center gap-3 uppercase">
          <span>Detected:</span>
          <span className="px-3 py-1 bg-black text-[#FFDE59] rounded-lg shadow-[3px_3px_0px_0px_#000000] inline-flex items-center gap-2">
            {winningMeta.name} {winningMeta.flag}
          </span>
        </h2>

        {/* Confidence metric */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-sm font-black uppercase tracking-wide text-neutral-700">Confidence:</span>
          <span className="font-mono text-2xl sm:text-3xl font-black text-black bg-[#A3E635] border-2 border-black px-3 py-0.5 rounded shadow-[3px_3px_0px_0px_#000000] tabular-nums">
            {confidencePct}%
          </span>
        </div>

        <p className="text-xs text-neutral-600 font-bold max-w-md mx-auto mt-3">
          "{winningMeta.description}"
        </p>
      </div>

      {/* Four Horizontal Progress Bars */}
      <div className="py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-black">
            Language Probability Distribution
          </h3>
          <span className="text-[11px] font-bold text-neutral-500 uppercase">
            Model Probabilities
          </span>
        </div>

        {languageKeys.map((key) => {
          const meta = LANGUAGES[key];
          const rawProb = result.probabilities?.[key] ?? 0;
          const percentage = Math.min(100, Math.max(0, rawProb * 100));
          const isWinner = key === winningKey;

          return (
            <div
              key={key}
              className={`p-4 rounded-xl border-3 border-black transition-all ${
                isWinner
                  ? `${meta.badgeBg} shadow-[5px_5px_0px_0px_#000000] -translate-y-0.5`
                  : 'bg-[#FAF5EA] shadow-[3px_3px_0px_0px_#000000]'
              }`}
            >
              {/* Row Header: Name & Percentage */}
              <div className="flex items-center justify-between text-sm mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg select-none">{meta.flag}</span>
                  <span className="font-black text-black text-base uppercase">
                    {meta.name}
                  </span>
                  <span className="text-xs text-neutral-600 font-bold font-arabic">
                    ({meta.nativeName})
                  </span>
                  {isWinner && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black text-[#FFDE59] border border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
                      TOP PREDICTION
                    </span>
                  )}
                </div>

                <span className="font-mono font-black text-base tabular-nums text-black">
                  {percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar Track & Fill with thick black borders */}
              <div className="w-full h-5 rounded-md bg-white border-2 border-black overflow-hidden relative shadow-inner">
                <div
                  className={`h-full ${meta.barColor} border-r-2 border-black transition-all duration-1000 ease-out`}
                  style={{
                    width: animated ? `${percentage}%` : '0%',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action: Try another button */}
      <div className="pt-4 border-t-3 border-black flex items-center justify-center">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FFDE59] hover:bg-[#FACC15] text-black font-black text-base uppercase tracking-wider border-3 border-black shadow-[5px_5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_#000000] transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>TRY ANOTHER</span>
        </button>
      </div>
    </div>
  );
};
