import { lazy } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'

const Landing        = lazy(() => import('../pages/Landing'))
const Register       = lazy(() => import('../pages/Register'))
const OtpVerify      = lazy(() => import('../pages/OtpVerify'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
const ResetPassword  = lazy(() => import('../pages/ResetPassword'))
const Login          = lazy(() => import('../pages/Login'))
const Dashboard      = lazy(() => import('../pages/Dashboard'))
const Trade          = lazy(() => import('../pages/Trade'))
const Agents         = lazy(() => import('../pages/Agents'))
const News           = lazy(() => import('../pages/News'))
const Portfolio      = lazy(() => import('../pages/Portfolio'))

// Forces Trade to fully remount when symbol changes so the
// WebSocket, header, and BuySellPanel all reset to the new coin
function TradeWrapper() {
  const { symbol } = useParams()
  return <Trade key={symbol} />
}

export default function AppRoutes() {
  return (
    <Routes>

      {/* ── PUBLIC ROUTES ── */}
      <Route path="/"                element={<Landing />}        />
      <Route path="/register"        element={<Register />}       />
      <Route path="/verify-otp"      element={<OtpVerify />}      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />}  />
      <Route path="/login"           element={<Login />}          />

      {/* ── PROTECTED ROUTES ── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"     element={<Dashboard />}      />
        <Route path="/trade/:symbol" element={<TradeWrapper />}   />
        <Route path="/agents"        element={<Agents />}         />
        <Route path="/news"          element={<News />}           />
        <Route path="/portfolio"     element={<Portfolio />}      />
      </Route>

      {/* ── FALLBACK ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}