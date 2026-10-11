/**
 * Audio synthesis helper to generate small realistic speech-like test audio wav files in browser
 * without relying on external CDNs or missing files.
 */

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Creates a synthetic demo .wav File in the browser so the user can test instant upload
 * even before recording or downloading external files.
 */
export function createSyntheticSampleFile(languageName: string): File {
  const sampleRate = 44100;
  const duration = 2.5; // 2.5 seconds
  const numFrames = sampleRate * duration;
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, byteRate, true);
  // block align
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);

  // Generate a multi-harmonic vocal formant sound wave (speech-like pattern)
  const baseFreq = languageName.toLowerCase() === 'darija' ? 220
    : languageName.toLowerCase() === 'msa' ? 190
    : languageName.toLowerCase() === 'french' ? 260
    : 210;

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    // Modulation envelope simulating syllables
    const envelope = Math.sin(Math.PI * t / duration) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 4 * t));
    const sample = envelope * (
      0.6 * Math.sin(2 * Math.PI * baseFreq * t) +
      0.25 * Math.sin(2 * Math.PI * (baseFreq * 2.1) * t) +
      0.15 * Math.sin(2 * Math.PI * (baseFreq * 3.4) * t)
    );
    const clamped = Math.max(-1, Math.min(1, sample));
    const intSample = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return new File([blob], `${languageName.toLowerCase()}_voice_sample.wav`, {
    type: 'audio/wav',
    lastModified: Date.now(),
  });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
