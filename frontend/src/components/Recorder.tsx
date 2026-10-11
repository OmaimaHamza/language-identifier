import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatTime } from '../utils/audio';

interface RecorderProps {
  onAudioReady: (file: File | null) => void;
  selectedFile: File | null;
  isCurrentSource: boolean;
}

export const Recorder: React.FC<RecorderProps> = ({
  onAudioReady,
  selectedFile,
  isCurrentSource,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Reset internal audio preview if parent cleared selection
  useEffect(() => {
    if (!isCurrentSource && audioUrl) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [isCurrentSource]);

  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];

    // Stop previous audio playback
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', ''];
      const mimeType = mimeTypes.find((type) => !type || MediaRecorder.isTypeSupported(type)) || '';

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/wav',
        });

        const audioFile = new File([audioBlob], 'recording.wav', {
          type: 'audio/wav',
          lastModified: Date.now(),
        });

        const newUrl = URL.createObjectURL(audioBlob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(newUrl);

        onAudioReady(audioFile);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordDuration(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      let message = 'Could not access microphone. Please grant permission.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        message = 'No microphone device found on your system.';
      }
      setPermissionError(message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
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

  const resetRecording = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordDuration(0);
    if (isCurrentSource) {
      onAudioReady(null);
    }
  };

  const isSelected = isCurrentSource && selectedFile;

  return (
    <div
      className={`relative flex flex-col items-center justify-between p-6 sm:p-7 rounded-2xl border-4 border-black transition-all duration-200 ${
        isRecording
          ? 'bg-[#FFE4E6] shadow-[8px_8px_0px_0px_#000000]'
          : isSelected
          ? 'bg-[#FEF08A] shadow-[8px_8px_0px_0px_#000000]'
          : 'bg-[#FFFFFF] shadow-[6px_6px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#000000]'
      }`}
    >
      {/* Neo-Brutalist Top Tag */}
      <div className="w-full flex items-center justify-between mb-4">
        <span className="px-2.5 py-1 bg-[#A3E635] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs font-black uppercase tracking-wider rounded">
          METHOD A
        </span>
        {isSelected && (
          <span className="px-2 py-0.5 bg-black text-[#A3E635] text-xs font-bold uppercase rounded flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> SELECTED
          </span>
        )}
      </div>

      {/* Card Header */}
      <div className="w-full text-center mb-3">
        <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
          Record Audio
        </h3>
        <p className="text-xs text-neutral-700 font-bold mt-1">
          Speak in Darija, MSA, French, or English
        </p>
      </div>

      {/* Main Microphone Action Button */}
      <div className="my-4 flex flex-col items-center justify-center">
        <div className="relative">
          <button
            type="button"
            onClick={toggleRecording}
            className={`relative w-26 h-26 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center transition-all cursor-pointer border-4 border-black ${
              isRecording
                ? 'bg-[#EF4444] text-white shadow-[6px_6px_0px_0px_#000000] animate-bounce'
                : 'bg-[#FFDE59] text-black shadow-[6px_6px_0px_0px_#000000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000000]'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <Square className="w-10 h-10 fill-current text-white stroke-black stroke-2" />
            ) : (
              <Mic className="w-12 h-12 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Live Timer / Neo-wave Indicator */}
        <div className="mt-5 text-center min-h-[50px] flex flex-col items-center justify-center">
          {isRecording ? (
            <div className="flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FEE2E2] border-2 border-black shadow-[3px_3px_0px_0px_#000000] rounded">
                <span className="w-3 h-3 rounded-full bg-[#EF4444] border border-black animate-ping" />
                <span className="font-mono text-xl font-black text-black tracking-wider tabular-nums">
                  {formatTime(recordDuration)}
                </span>
              </div>
              {/* Neo Brutalist Equalizer Wave */}
              <div className="flex items-center gap-1.5 h-6 mt-1">
                <span className="w-2 bg-black border border-black rounded-sm animate-neo-wave [animation-delay:-0.4s]" />
                <span className="w-2 bg-black border border-black rounded-sm animate-neo-wave [animation-delay:-0.2s]" />
                <span className="w-2 bg-[#EF4444] border border-black rounded-sm animate-neo-wave" />
                <span className="w-2 bg-black border border-black rounded-sm animate-neo-wave [animation-delay:-0.3s]" />
                <span className="w-2 bg-black border border-black rounded-sm animate-neo-wave [animation-delay:-0.1s]" />
              </div>
            </div>
          ) : isSelected && audioUrl ? (
            <div className="flex items-center gap-2 text-xs font-bold text-black bg-white py-1.5 px-3 rounded border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
              <span>recording.wav ({formatTime(recordDuration || 3)})</span>
            </div>
          ) : (
            <span className="text-xs text-neutral-800 font-extrabold uppercase tracking-wide bg-[#F3F4F6] border-2 border-black px-3 py-1 rounded shadow-[2px_2px_0px_0px_#000000]">
              Click button to start recording
            </span>
          )}
        </div>
      </div>

      {/* Permission Error Message */}
      {permissionError && (
        <div className="w-full mt-2 p-3 rounded bg-[#FEE2E2] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-xs font-bold text-black flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Playback Controls when audio recorded */}
      <div className="w-full mt-3 pt-3 border-t-2 border-black flex items-center justify-between text-xs">
        {isSelected && audioUrl ? (
          <>
            <button
              type="button"
              onClick={togglePlayback}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#60A5FA] hover:bg-[#93C5FD] text-black font-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-black" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>PLAY</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetRecording}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#F3F4F6] hover:bg-[#E5E7EB] text-black font-bold border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
              title="Delete recording"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RE-RECORD</span>
            </button>
          </>
        ) : (
          <div className="w-full text-center text-xs text-neutral-600 font-bold uppercase tracking-wider">
            RECOMMENDED: 2–5 SECONDS OF VOICE
          </div>
        )}
      </div>
    </div>
  );
};
