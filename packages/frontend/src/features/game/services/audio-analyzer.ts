export class AudioAnalyzer {
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private listeners: Set<(level: number) => void> = new Set();
  private animationFrameId: number | null = null;

  constructor(stream: MediaStream, audioContext: AudioContext) {
    const source = (audioContext as any).createMediaStreamAudioSource(stream);
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength) as Uint8Array;
  }

  start(): void {
    const analyze = () => {
      (this.analyser.getByteFrequencyData as any)(this.dataArray);
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i];
      }
      const average = sum / this.dataArray.length;
      const normalizedLevel = Math.min(average / 255, 1);

      this.listeners.forEach((listener) => listener(normalizedLevel));
      this.animationFrameId = requestAnimationFrame(analyze);
    };

    analyze();
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  onLevelChange(callback: (level: number) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}
