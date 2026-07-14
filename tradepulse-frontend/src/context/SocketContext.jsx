import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { API_BASE_URL } from '../utils/constants'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    socketRef.current = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current.on('connect',       () => setConnected(true))
    socketRef.current.on('disconnect',    () => setConnected(false))
    socketRef.current.on('connect_error', (err) => console.error('[Socket]', err.message))

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [token, isAuthenticated])

  const emit = (event, data)   => socketRef.current?.emit(event, data)
  const on   = (event, cb)     => {
    socketRef.current?.on(event, cb)
    return () => socketRef.current?.off(event, cb)
  }
  const off  = (event, cb)     => socketRef.current?.off(event, cb)
  const joinRoom  = (room)     => emit('join_room',  room)
  const leaveRoom = (room)     => emit('leave_room', room)

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      emit, on, off,
      joinRoom, leaveRoom,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}
