import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileAudio, Play, Pause, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatFileSize, createSyntheticSampleFile } from '../utils/audio';

interface FileDropProps {
  onFileSelected: (file: File | null) => void;
  selectedFile: File | null;
  isCurrentSource: boolean;
}

export const FileDrop: React.FC<FileDropProps> = ({
  onFileSelected,
  selectedFile,
  isCurrentSource,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSample, setActiveSample] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  // Update audio URL when selectedFile changes
  useEffect(() => {
    if (isCurrentSource && selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setAudioUrl(null);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [selectedFile, isCurrentSource]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.wav', '.mp3', '.ogg', '.m4a', '.flac'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    const isAudioType = file.type.startsWith('audio/') || hasValidExt;

    if (!isAudioType) {
      alert('Please select a valid audio file (.wav or .mp3)');
      return;
    }

    setActiveSample(null);
    onFileSelected(file);
  };

  const togglePlayback = () => {
    if (!audioElementRef.current && audioUrl) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
    setActiveSample(null);
    onFileSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = (lang: string) => {
    const sample = createSyntheticSampleFile(lang);
    setActiveSample(lang);
    onFileSelected(sample);
  };

  const isSelected = isCurrentSource && selectedFile;

  return (
    <div
      className={`relative flex flex-col items-center justify-between p-6 sm:p-7 rounded-2xl border-4 border-black transition-all duration-200 ${
        isDragOver
          ? 'bg-[#E0E7FF] shadow-[8px_8px_0px_0px_#000000] scale-[1.01]'
          : isSelected
          ? 'bg-[#BAE6FD] shadow-[8px_8px_0px_0px_#000000]'
          : 'bg-[#FFFFFF] shadow-[6px_6px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#000000]'
      }`}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".wav,.mp3,audio/wav,audio/mpeg,audio/*"
        className="hidden"
      />

      {/* Neo-Brutalist Top Tag */}
      <div className="w-full flex items-center justify-between mb-4">
        <span className="px-2.5 py-1 bg-[#C084FC] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs font-black uppercase tracking-wider rounded">
          METHOD B
        </span>
        {isSelected && (
          <span className="px-2 py-0.5 bg-black text-[#67E8F9] text-xs font-bold uppercase rounded flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> SELECTED
          </span>
        )}
      </div>

      {/* Card Header */}
      <div className="w-full text-center mb-3">
        <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
          Upload Audio
        </h3>
        <p className="text-xs text-neutral-700 font-bold mt-1">
          Drag and drop or browse from disk
        </p>
      </div>

      {/* Main Dropzone Area */}
      <div
        onClick={() => !isSelected && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full my-2 flex flex-col items-center justify-center p-5 rounded-xl border-3 border-dashed border-black transition-all cursor-pointer ${
          isSelected
            ? 'bg-white shadow-[4px_4px_0px_0px_#000000] cursor-default'
            : isDragOver
            ? 'bg-[#C7D2FE] shadow-[6px_6px_0px_0px_#000000]'
            : 'bg-[#FAF5EA] hover:bg-[#F3E8D0] shadow-[3px_3px_0px_0px_#000000]'
        }`}
      >
        {isSelected ? (
          <div className="w-full flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-lg bg-[#FFDE59] border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center text-black mb-2">
              <FileAudio className="w-7 h-7 stroke-[2.5]" />
            </div>

            <p className="font-black text-black text-sm max-w-full truncate px-2 font-mono">
              {selectedFile.name}
            </p>
            <p className="text-xs text-neutral-700 mt-0.5 font-bold font-mono">
              {formatFileSize(selectedFile.size)}
            </p>

            {/* Audio playback controls */}
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#60A5FA] hover:bg-[#93C5FD] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-black" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>LISTEN</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#FF4D4D] hover:bg-[#ef4444] text-white text-xs font-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>REMOVE</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-14 h-14 rounded-xl bg-[#FFDE59] border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center text-black mb-3">
              <UploadCloud className="w-8 h-8 stroke-[2.5]" />
            </div>
            <p className="text-sm font-black text-black uppercase tracking-tight">
              DROP AUDIO FILE OR <span className="underline decoration-2">BROWSE</span>
            </p>
            <p className="text-[11px] text-neutral-700 mt-1 font-bold">
              Accepts .wav &amp; .mp3 formats
            </p>
          </div>
        )}
      </div>

      {/* Preset sample clips for quick testing */}
      <div className="w-full mt-3 pt-3 border-t-2 border-black">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase text-black flex items-center gap-1 tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Preset audio samples:</span>
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'darija', label: 'Darija', flag: '🇲🇦', color: 'bg-[#FBBF24]' },
            { id: 'msa', label: 'MSA', flag: '🇸🇦', color: 'bg-[#34D399]' },
            { id: 'french', label: 'French', flag: '🇫🇷', color: 'bg-[#60A5FA]' },
            { id: 'english', label: 'English', flag: '🇬🇧', color: 'bg-[#F87171]' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleLoadSample(item.id)}
              className={`py-1.5 px-1 rounded text-xs font-black transition-all text-center flex items-center justify-center gap-1 border-2 border-black cursor-pointer ${
                activeSample === item.id && isSelected
                  ? `${item.color} shadow-[3px_3px_0px_0px_#000000] -translate-y-0.5`
                  : 'bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#000000] hover:-translate-y-0.5'
              }`}
            >
              <span>{item.flag}</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
