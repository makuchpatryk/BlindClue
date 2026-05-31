import { Socket } from "socket.io-client";
import { AudioAnalyzer } from "./audio-analyzer.js";

interface PeerConnection {
  pc: RTCPeerConnection;
  stream?: MediaStream;
  analyzer?: AudioAnalyzer;
}

interface VoiceState {
  localStream?: MediaStream;
  peers: Map<string, PeerConnection>;
  isMuted: boolean;
}

export class VoiceService {
  private static instance: VoiceService;
  private state: VoiceState = {
    peers: new Map(),
    isMuted: false,
  };

  private peerConnectionStates: Map<string, RTCPeerConnectionState> = new Map();
  private listeners: Set<() => void> = new Set();
  private audioContext: AudioContext | null = null;
  private audioLevels: Map<string, number> = new Map();
  private levelListeners: Map<string, Set<(level: number) => void>> = new Map();

  private constructor(private socket: Socket) {
    this.setupSocketListeners();
  }

  static getInstance(socket: Socket): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService(socket);
    }
    return VoiceService.instance;
  }

  private setupSocketListeners(): void {
    this.socket.on("VoiceOffer", async (data) => {
      const { gameId, fromPlayerId, offer } = data;
      await this.handleVoiceOffer(gameId, fromPlayerId, offer);
    });

    this.socket.on("VoiceAnswer", async (data) => {
      const { fromPlayerId, answer } = data;
      const pc = this.state.peers.get(fromPlayerId)?.pc;
      if (pc && answer) {
        await pc
          .setRemoteDescription(new RTCSessionDescription(answer))
          .catch((err) =>
            console.error("Failed to set remote description:", err),
          );
      }
    });

    this.socket.on("VoiceIceCandidate", async (data) => {
      const { fromPlayerId, candidate } = data;
      const pc = this.state.peers.get(fromPlayerId)?.pc;
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Failed to add ICE candidate:", err);
        }
      }
    });
  }

  async initializeAudio(gameId: string, playerId: string): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.state.localStream = stream;
    } catch (err) {
      console.error("Failed to get user media:", err);
      throw err;
    }
  }

  private createPeerConnection(
    gameId: string,
    peerId: string,
  ): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });

    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.state.localStream!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("voiceIceCandidate", {
          gameId,
          fromPlayerId: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Remote track received from", peerId);
      const peer = this.state.peers.get(peerId);
      if (peer) {
        if (!peer.stream) {
          peer.stream = new MediaStream();
        }
        peer.stream.addTrack(event.track);

        if (this.audioContext && event.track.kind === "audio") {
          if (!peer.analyzer) {
            peer.analyzer = new AudioAnalyzer(peer.stream, this.audioContext);
            peer.analyzer.onLevelChange((level) => {
              this.audioLevels.set(peerId, level);
              const listeners = this.levelListeners.get(peerId);
              if (listeners) {
                listeners.forEach((listener) => listener(level));
              }
            });
            peer.analyzer.start();
          }
        }
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Peer ${peerId} connection state: ${pc.connectionState}`);
      this.peerConnectionStates.set(peerId, pc.connectionState);
      this.notifyListeners();
      if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected"
      ) {
        this.closePeerConnection(peerId);
      }
    };

    return pc;
  }

  async createOffer(gameId: string, peerId: string): Promise<void> {
    let pc = this.state.peers.get(peerId)?.pc;
    if (!pc) {
      pc = this.createPeerConnection(gameId, peerId);
      this.state.peers.set(peerId, { pc });
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket.emit("voiceOffer", {
        gameId,
        fromPlayerId: peerId,
        offer: offer,
      });
    } catch (err) {
      console.error("Failed to create offer:", err);
    }
  }

  private async handleVoiceOffer(
    gameId: string,
    fromPlayerId: string,
    offer: RTCSessionDescriptionInit,
  ): Promise<void> {
    let pc = this.state.peers.get(fromPlayerId)?.pc;
    if (!pc) {
      pc = this.createPeerConnection(gameId, fromPlayerId);
      this.state.peers.set(fromPlayerId, { pc });
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.socket.emit("voiceAnswer", {
        gameId,
        fromPlayerId: fromPlayerId,
        answer: answer,
      });
    } catch (err) {
      console.error("Failed to handle voice offer:", err);
    }
  }

  toggleMute(peerId?: string): void {
    if (this.state.localStream) {
      this.state.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      this.state.isMuted = !this.state.isMuted;
    }
  }

  isMuted(): boolean {
    return this.state.isMuted;
  }

  getRemoteStream(peerId: string): MediaStream | undefined {
    return this.state.peers.get(peerId)?.stream;
  }

  getPeerConnectionState(peerId: string): RTCPeerConnectionState | undefined {
    return this.peerConnectionStates.get(peerId);
  }

  getAudioLevel(peerId: string): number {
    return this.audioLevels.get(peerId) ?? 0;
  }

  onAudioLevelChange(
    peerId: string,
    callback: (level: number) => void,
  ): () => void {
    if (!this.levelListeners.has(peerId)) {
      this.levelListeners.set(peerId, new Set());
    }
    this.levelListeners.get(peerId)!.add(callback);
    return () => {
      this.levelListeners.get(peerId)?.delete(callback);
    };
  }

  onStateChange(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  private closePeerConnection(peerId: string): void {
    const peer = this.state.peers.get(peerId);
    if (peer) {
      peer.pc.close();
      this.state.peers.delete(peerId);
      this.peerConnectionStates.delete(peerId);
    }
  }

  cleanup(): void {
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    this.state.peers.forEach((peer) => {
      if (peer.analyzer) {
        peer.analyzer.stop();
      }
      peer.pc.close();
    });

    this.state.peers.clear();
    this.peerConnectionStates.clear();
    this.audioLevels.clear();
    this.levelListeners.clear();
    this.listeners.clear();
    this.state.localStream = undefined;
    this.state.isMuted = false;

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
