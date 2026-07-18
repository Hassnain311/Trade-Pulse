import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { API_BASE_URL } from '../utils/constants'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { isAuthenticated, loading } = useAuth()   // ← added loading
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [, forceRender] = useState(0)              // ← forces context value to update with new socket instance

  useEffect(() => {
    // Wait until AuthContext has finished checking the session
    // Without this, isAuthenticated can briefly be false on load
    // even for a logged-in user, so the socket never connects
    if (loading) return
    if (!isAuthenticated) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
      return
    }

    socketRef.current = io(API_BASE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current.on('connect', () => {
      setConnected(true)
      forceRender(n => n + 1)
    })

    socketRef.current.on('disconnect', () => {
      setConnected(false)
    })

    socketRef.current.on('connect_error', (err) => {
      console.error('[Socket connect_error]', err.message)
      setConnected(false)
    })

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [isAuthenticated, loading])

  const emit = (event, data) => socketRef.current?.emit(event, data)
  const on   = (event, cb)   => {
    socketRef.current?.on(event, cb)
    return () => socketRef.current?.off(event, cb)
  }
  const off       = (event, cb) => socketRef.current?.off(event, cb)
  const joinRoom  = (room)      => emit('join_room',  room)
  const leaveRoom = (room)      => emit('leave_room', room)

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

