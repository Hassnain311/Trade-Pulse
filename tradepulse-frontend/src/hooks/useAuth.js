// Re-export useAuth from AuthContext so components can import from
// '@hooks/useAuth' instead of '../../context/AuthContext'
// This keeps imports clean and decoupled from the context file location.
export { useAuth } from '../context/AuthContext'
