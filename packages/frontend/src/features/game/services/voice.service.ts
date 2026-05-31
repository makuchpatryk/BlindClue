import { Socket } from "socket.io-client";
import { AudioAnalyzer } from "./audio-analyzer.js";

interface PeerConnection {
  pc: RTCPeerConnection;
  stream?: MediaStream;
  analyzer?: AudioAnalyzer;
  audioElement?: HTMLAudioElement;
  iceCandidateBuffer: RTCIceCandidateInit[];
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
  private localAudioLevel: number = 0;
  private localLevelListeners: Set<(level: number) => void> = new Set();
  private localAnalyzer: AudioAnalyzer | null = null;

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
      const peer = this.state.peers.get(fromPlayerId);
      if (peer && answer) {
        const pc = peer.pc;
        console.log(
          "Received voice answer from:",
          fromPlayerId,
          "Connection state:",
          pc.signalingState,
        );
        try {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log("Remote description set for:", fromPlayerId);
            await this.flushIceCandidates(fromPlayerId);
          } else {
            console.warn(
              "Cannot set remote answer - wrong signaling state:",
              pc.signalingState,
            );
          }
        } catch (err) {
          console.error("Failed to set remote description:", err);
        }
      }
    });

    this.socket.on("VoiceIceCandidate", async (data) => {
      const { fromPlayerId, candidate } = data;
      let peer = this.state.peers.get(fromPlayerId);
      if (!peer) {
        console.log("No peer connection for ICE candidate from:", fromPlayerId);
        return;
      }

      if (!peer.iceCandidateBuffer) {
        peer.iceCandidateBuffer = [];
      }

      if (candidate) {
        if (peer.pc.remoteDescription) {
          try {
            await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("ICE candidate added for:", fromPlayerId);
          } catch (err) {
            console.error("Failed to add ICE candidate:", err);
          }
        } else {
          console.log(
            "Buffering ICE candidate for:",
            fromPlayerId,
            "- remote description not ready",
          );
          peer.iceCandidateBuffer.push(candidate);
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
      console.log("Local audio stream obtained:", stream);

      if (this.audioContext && !this.localAnalyzer) {
        this.localAnalyzer = new AudioAnalyzer(stream, this.audioContext);
        let logCounter = 0;
        this.localAnalyzer.onLevelChange((level) => {
          this.localAudioLevel = level;
          logCounter++;
          if (logCounter % 30 === 0) {
            console.log("Local audio level:", level);
          }
          this.localLevelListeners.forEach((listener) => listener(level));
        });
        this.localAnalyzer.start();
        console.log("Local audio analyzer started");
      }
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

    if (!this.state.peers.has(peerId)) {
      this.state.peers.set(peerId, { pc, iceCandidateBuffer: [] });
    } else {
      const peer = this.state.peers.get(peerId)!;
      peer.pc = pc;
    }

    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.state.localStream!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate to:", peerId);
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

        if (event.track.kind === "audio") {
          if (!peer.audioElement) {
            peer.audioElement = document.createElement("audio");
            peer.audioElement.srcObject = peer.stream;
            peer.audioElement.autoplay = true;
            peer.audioElement.play().catch((err) => {
              console.warn("Failed to autoplay audio for peer:", err);
            });
          }

          if (this.audioContext && !peer.analyzer) {
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
      console.log("Created peer connection for:", peerId);
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("Sending voice offer to peer:", peerId);
      this.socket.emit("voiceOffer", {
        gameId,
        fromPlayerId: peerId,
        offer: offer,
      });
    } catch (err) {
      console.error("Failed to create offer:", err);
    }
  }

  private async flushIceCandidates(peerId: string): Promise<void> {
    const peer = this.state.peers.get(peerId);
    if (peer && peer.iceCandidateBuffer.length > 0) {
      console.log(
        "Flushing",
        peer.iceCandidateBuffer.length,
        "buffered ICE candidates for:",
        peerId,
      );
      for (const candidate of peer.iceCandidateBuffer) {
        try {
          await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Failed to add buffered ICE candidate:", err);
        }
      }
      peer.iceCandidateBuffer = [];
    }
  }

  private async handleVoiceOffer(
    gameId: string,
    fromPlayerId: string,
    offer: RTCSessionDescriptionInit,
  ): Promise<void> {
    console.log("Received voice offer from:", fromPlayerId);
    let pc = this.state.peers.get(fromPlayerId)?.pc;

    if (pc && pc.signalingState === "have-local-offer") {
      console.log("Offer collision detected with:", fromPlayerId);
      console.log("Using existing local offer, ignoring remote offer");
      return;
    }

    if (!pc) {
      pc = this.createPeerConnection(gameId, fromPlayerId);
      console.log("Created peer connection for offer from:", fromPlayerId);
    } else {
      console.log(
        "Using existing peer connection for:",
        fromPlayerId,
        "state:",
        pc.signalingState,
      );
    }

    try {
      if (pc.signalingState === "stable") {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("Remote offer description set for:", fromPlayerId);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("Sending voice answer to:", fromPlayerId);
        this.socket.emit("voiceAnswer", {
          gameId,
          fromPlayerId: fromPlayerId,
          answer: answer,
        });
        await this.flushIceCandidates(fromPlayerId);
      } else {
        console.warn(
          "Cannot handle offer - peer connection not in stable state:",
          pc.signalingState,
        );
      }
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

  getLocalAudioLevel(): number {
    return this.localAudioLevel;
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

  onLocalAudioLevelChange(callback: (level: number) => void): () => void {
    this.localLevelListeners.add(callback);
    return () => this.localLevelListeners.delete(callback);
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
      if (peer.analyzer) {
        peer.analyzer.stop();
      }
      if (peer.audioElement) {
        peer.audioElement.pause();
        peer.audioElement.srcObject = null;
      }
      peer.pc.close();
      this.state.peers.delete(peerId);
      this.peerConnectionStates.delete(peerId);
    }
  }

  cleanup(): void {
    if (this.localAnalyzer) {
      this.localAnalyzer.stop();
      this.localAnalyzer = null;
    }

    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    this.state.peers.forEach((peer) => {
      if (peer.analyzer) {
        peer.analyzer.stop();
      }
      if (peer.audioElement) {
        peer.audioElement.pause();
        peer.audioElement.srcObject = null;
      }
      peer.pc.close();
    });

    this.state.peers.clear();
    this.peerConnectionStates.clear();
    this.audioLevels.clear();
    this.levelListeners.clear();
    this.localLevelListeners.clear();
    this.listeners.clear();
    this.state.localStream = undefined;
    this.state.isMuted = false;
    this.localAudioLevel = 0;

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
