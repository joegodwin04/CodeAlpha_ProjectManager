import { io } from 'socket.io-client';

let socket = null;

/**
 * Resolve the backend URL based on environment variables.
 * Prioritizes VITE_SOCKET_URL, falls back to stripping '/api' from VITE_API_URL,
 * or defaults to http://localhost:5000.
 */
const getBackendUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '');
  }
  return 'http://localhost:5000';
};

/**
 * Obtain or initialize the singleton Socket.IO client instance.
 * Prevents multiple socket instances across React re-renders.
 */
export const getSocket = () => {
  if (!socket) {
    const serverUrl = getBackendUrl();
    socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to backend server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
    });
  }

  return socket;
};

/**
 * Emit event to join a project-specific room: project-${projectId}
 */
export const joinProjectRoom = (projectId) => {
  if (!projectId) return;
  const s = getSocket();
  if (s.connected) {
    s.emit('joinProject', projectId);
  } else {
    // If connecting or disconnected, join as soon as connection is ready
    s.once('connect', () => {
      s.emit('joinProject', projectId);
    });
    if (!s.connected) {
      s.connect();
    }
  }
};

/**
 * Emit event to leave a project-specific room: project-${projectId}
 */
export const leaveProjectRoom = (projectId) => {
  if (!projectId || !socket) return;
  socket.emit('leaveProject', projectId);
};

/**
 * Join per-user room to receive personal notifications: user-${userId}
 */
export const joinUserRoom = (userId) => {
  if (!userId) return;
  const s = getSocket();
  if (s.connected) {
    s.emit('joinUserRoom', userId);
  } else {
    s.once('connect', () => {
      s.emit('joinUserRoom', userId);
    });
    if (!s.connected) s.connect();
  }
};

/**
 * Leave the per-user notification room
 */
export const leaveUserRoom = (userId) => {
  if (!userId || !socket) return;
  socket.emit('leaveUserRoom', userId);
};

/**
 * Disconnect socket cleanly.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
