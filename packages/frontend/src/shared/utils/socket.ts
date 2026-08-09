import { io, Socket } from "socket.io-client";
import { SOCKET_URL, SOCKET_RECONNECTION_DELAY_MAX } from "./constants.js";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: SOCKET_RECONNECTION_DELAY_MAX,
      reconnectionAttempts: 5,
      withCredentials: true,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
