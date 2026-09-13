const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO with the HTTP server instance.
 * Configures CORS based on environment and development origins.
 */
const initSocket = (server) => {
  const configuredOrigin = process.env.CLIENT_URL;
  const allowedOrigins = [
    configuredOrigin,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        // In development mode, allow localhost variations
        if (process.env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join project-specific room
    socket.on('joinProject', (projectId) => {
      if (!projectId) return;
      const roomName = `project-${projectId}`;
      socket.join(roomName);
      console.log(`[Socket.IO] Socket ${socket.id} joined room: ${roomName}`);
    });

    // Leave project-specific room
    socket.on('leaveProject', (projectId) => {
      if (!projectId) return;
      const roomName = `project-${projectId}`;
      socket.leave(roomName);
      console.log(`[Socket.IO] Socket ${socket.id} left room: ${roomName}`);
    });

    // Join per-user room for personal notifications
    socket.on('joinUserRoom', (userId) => {
      if (!userId) return;
      const roomName = `user-${userId}`;
      socket.join(roomName);
      console.log(`[Socket.IO] Socket ${socket.id} joined user room: ${roomName}`);
    });

    // Leave per-user room
    socket.on('leaveUserRoom', (userId) => {
      if (!userId) return;
      const roomName = `user-${userId}`;
      socket.leave(roomName);
      console.log(`[Socket.IO] Socket ${socket.id} left user room: ${roomName}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

/**
 * Retrieve the initialized Socket.IO instance.
 */
const getIO = () => {
  return io;
};

module.exports = {
  initSocket,
  getIO
};
