// Re-export useSocket from SocketContext
// The actual socket.io connection is established inside SocketContext
// only when the user is authenticated (checks token from AuthContext).
export { useSocket } from '../context/SocketContext'
