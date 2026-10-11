// import axios from 'axios';

// export interface PredictResponse {
//   success: boolean;
//   language: 'darija' | 'msa' | 'french' | 'english' | string;
//   confidence: number;
//   probabilities: {
//     darija: number;
//     msa: number;
//     french: number;
//     english: number;
//     [key: string]: number;
//   };
// }

// export const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// export async function checkBackendHealth(baseUrl: string = DEFAULT_API_URL): Promise<{ healthy: boolean; message?: string }> {
//   try {
//     const res = await axios.get(`${baseUrl}/health`, {
//       timeout: 4000,
//     });
//     if (res.data && (res.data.status === 'healthy' || res.status === 200)) {
//       return { healthy: true };
//     }
//     return { healthy: false, message: 'Invalid health status response' };
//   } catch (error: any) {
//     return {
//       healthy: false,
//       message: error.message || 'Cannot reach backend server',
//     };
//   }
// }

// export async function predictLanguage(
//   audioFile: File | Blob,
//   fileName: string = 'recording.wav',
//   baseUrl: string = DEFAULT_API_URL
// ): Promise<PredictResponse> {
//   const formData = new FormData();
//   // Ensure the file has a filename ending in .wav or .mp3
//   formData.append('audio', audioFile, fileName);

//   const response = await axios.post<PredictResponse>(`${baseUrl}/predict`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//     timeout: 30000,
//   });

//   return response.data;
// }

// /**
//  * Fallback simulator when Flask backend is not yet started by the user.
//  * Provides realistic probabilistic outputs so users can evaluate the full UI immediately.
//  */
// export async function simulatePrediction(fileName?: string): Promise<PredictResponse> {
//   // Simulate network latency (800ms - 1500ms)
//   await new Promise((r) => setTimeout(r, 1100));

//   const lower = (fileName || '').toLowerCase();
//   let dominant: 'darija' | 'msa' | 'french' | 'english' = 'english';

//   if (lower.includes('darija') || lower.includes('moroc') || lower.includes('maghreb')) {
//     dominant = 'darija';
//   } else if (lower.includes('msa') || lower.includes('arabic') || lower.includes('fusha')) {
//     dominant = 'msa';
//   } else if (lower.includes('french') || lower.includes('francais') || lower.includes('fr')) {
//     dominant = 'french';
//   } else {
//     // Randomly pick one or default to english
//     const langs: Array<'darija' | 'msa' | 'french' | 'english'> = ['darija', 'msa', 'french', 'english'];
//     dominant = langs[Math.floor(Math.random() * langs.length)];
//   }

//   // Generate realistic confidence and complementary probabilities
//   const highConf = Number((0.82 + Math.random() * 0.14).toFixed(3));
//   const remaining = Number((1 - highConf).toFixed(3));
  
//   // distribute remaining among other 3
//   const p1 = Number((remaining * 0.5).toFixed(3));
//   const p2 = Number((remaining * 0.35).toFixed(3));
//   const p3 = Number((remaining - p1 - p2).toFixed(3));

//   const otherLangs = (['darija', 'msa', 'french', 'english'] as const).filter(l => l !== dominant);
  
//   const probs: { darija: number; msa: number; french: number; english: number } = {
//     darija: 0,
//     msa: 0,
//     french: 0,
//     english: 0,
//   };

//   probs[dominant] = highConf;
//   probs[otherLangs[0]] = p1;
//   probs[otherLangs[1]] = p2;
//   probs[otherLangs[2]] = Math.max(0.001, p3);

//   return {
//     success: true,
//     language: dominant,
//     confidence: highConf,
//     probabilities: probs,
//   };
// }
import axios from 'axios';

export interface PredictResponse {
  success: boolean;
  language: 'darija' | 'msa' | 'french' | 'english' | string;
  confidence: number;
  probabilities: {
    darija: number;
    msa: number;
    french: number;
    english: number;
    [key: string]: number;
  };
}

export const DEFAULT_API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function checkBackendHealth(
  baseUrl: string = DEFAULT_API_URL
): Promise<{ healthy: boolean; message?: string }> {
  try {
    const res = await axios.get(`${baseUrl}/health`, { timeout: 4000 });
    if (res.data && (res.data.status === 'healthy' || res.status === 200)) {
      return { healthy: true };
    }
    return { healthy: false, message: 'Invalid health status response' };
  } catch (error: any) {
    return { healthy: false, message: error.message || 'Cannot reach backend' };
  }
}

export async function predictLanguage(
  audioFile: File | Blob,
  fileName: string = 'recording.wav',
  baseUrl: string = DEFAULT_API_URL
): Promise<PredictResponse> {
  // Decode anything the browser can play, re-encode as real WAV.
  // This guarantees librosa can read it without needing ffmpeg.
  const wavFile = await convertToWav(audioFile, fileName);

  const formData = new FormData();
  formData.append('audio', wavFile, wavFile.name);

  const response = await axios.post<PredictResponse>(
    `${baseUrl}/predict`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }
  );

  return response.data;
}

/**
 * Converts any browser-supported audio (WebM/Opus, MP3, OGG, M4A, etc.)
 * into a real 16 kHz mono 16-bit PCM WAV that librosa can read natively.
 */
async function convertToWav(
  file: File | Blob,
  originalName: string
): Promise<File> {
  const arrayBuffer = await file.arrayBuffer();

  const AudioCtx: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtx();

  let audioBuffer: AudioBuffer;
  try {
    // slice(0) because decodeAudioData detaches the ArrayBuffer
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    audioCtx.close().catch(() => {});
  }

  const wavBlob = audioBufferToWav(audioBuffer, 16000, 1);

  const baseName = originalName.replace(/\.[^.]+$/, '') || 'recording';
  return new File([wavBlob], `${baseName}.wav`, { type: 'audio/wav' });
}

/**
 * Encodes an AudioBuffer as a 16-bit PCM WAV Blob.
 * Downmixes to mono, resamples to targetRate with linear interpolation.
 */
function audioBufferToWav(
  buffer: AudioBuffer,
  targetRate: number,
  targetChannels: number
): Blob {
  const srcRate = buffer.sampleRate;
  const ratio = srcRate / targetRate;
  const newLength = Math.max(1, Math.floor(buffer.length / ratio));

  // Downmix to mono
  const mono = new Float32Array(buffer.length);
  if (buffer.numberOfChannels === 1) {
    mono.set(buffer.getChannelData(0));
  } else {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let i = 0; i < buffer.length; i++) {
      mono[i] = (left[i] + right[i]) / 2;
    }
  }

  // Linear resample to target rate
  const resampled = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIdx = i * ratio;
    const idx0 = Math.floor(srcIdx);
    const idx1 = Math.min(idx0 + 1, mono.length - 1);
    const frac = srcIdx - idx0;
    resampled[i] = mono[idx0] * (1 - frac) + mono[idx1] * frac;
  }

  // Build WAV container
  const bytesPerSample = 2;
  const blockAlign = targetChannels * bytesPerSample;
  const byteRate = targetRate * blockAlign;
  const dataSize = newLength * blockAlign;
  const out = new ArrayBuffer(44 + dataSize);
  const view = new DataView(out);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, targetChannels, true);
  view.setUint32(24, targetRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < newLength; i++) {
    const s = Math.max(-1, Math.min(1, resampled[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([out], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Demo-mode fallback simulator (no backend needed).
 */
export async function simulatePrediction(
  fileName?: string
): Promise<PredictResponse> {
  await new Promise((r) => setTimeout(r, 1100));

  const lower = (fileName || '').toLowerCase();
  let dominant: 'darija' | 'msa' | 'french' | 'english' = 'english';

  if (lower.includes('darija') || lower.includes('moroc')) dominant = 'darija';
  else if (lower.includes('msa') || lower.includes('arabic')) dominant = 'msa';
  else if (lower.includes('french') || lower.includes('fr')) dominant = 'french';
  else {
    const langs: Array<'darija' | 'msa' | 'french' | 'english'> = [
      'darija',
      'msa',
      'french',
      'english',
    ];
    dominant = langs[Math.floor(Math.random() * langs.length)];
  }

  const highConf = Number((0.82 + Math.random() * 0.14).toFixed(3));
  const remaining = Number((1 - highConf).toFixed(3));
  const p1 = Number((remaining * 0.5).toFixed(3));
  const p2 = Number((remaining * 0.35).toFixed(3));
  const p3 = Number((remaining - p1 - p2).toFixed(3));

  const others = (['darija', 'msa', 'french', 'english'] as const).filter(
    (l) => l !== dominant
  );

  const probs = { darija: 0, msa: 0, french: 0, english: 0 };
  probs[dominant] = highConf;
  probs[others[0]] = p1;
  probs[others[1]] = p2;
  probs[others[2]] = Math.max(0.001, p3);

  return {
    success: true,
    language: dominant,
    confidence: highConf,
    probabilities: probs,
  };
}
