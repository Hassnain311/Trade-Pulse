// import { lazy } from 'react'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import ProtectedRoute from '../components/auth/ProtectedRoute'

// // ── Lazy-load all pages ─────────────────────────────────────────
// // Each page is code-split → only loaded when the user navigates to it
// // Suspense fallback (Loader) is handled in App.jsx
// const Landing   = lazy(() => import('../pages/Landing'))
// const Register  = lazy(() => import('../pages/Register'))
// const OtpVerify = lazy(() => import('../pages/OtpVerify'))
// const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
// const ResetPassword  = lazy(() => import('../pages/ResetPassword'))
// const Login     = lazy(() => import('../pages/Login'))
// const Dashboard = lazy(() => import('../pages/Dashboard'))
// const Trade     = lazy(() => import('../pages/Trade'))
// const Agents    = lazy(() => import('../pages/Agents'))
// const News      = lazy(() => import('../pages/News'))
// const Portfolio = lazy(() => import('../pages/Portfolio'))

// export default function AppRoutes() {
//   return (
//     <Routes>

//       {/* ── PUBLIC ROUTES ──────────────────────────────────────
//           No auth token required.
//           Landing, Register, OTP verify, Login are all public.    */}
//       <Route path="/"           element={<Landing />}   />
//       <Route path="/register"   element={<Register />}  />
//       <Route path="/verify-otp" element={<OtpVerify />} />
//       <Route path="/forgot-password" element={<ForgotPassword />} />
//       <Route path="/reset-password"  element={<ResetPassword />}  />    
//       <Route path="/login"      element={<Login />}     />

//       {/* ── PROTECTED ROUTES ───────────────────────────────────
//           Wrapped in <ProtectedRoute />.

//           How the token flow works here:
//           1. ProtectedRoute reads isAuthenticated from AuthContext.
//           2. AuthContext checks if a valid access token exists in
//              localStorage (STORAGE_KEYS.TOKEN).
//           3. On app start, AuthContext calls GET /api/auth/profile
//              using the saved access token to confirm it's still valid.
//           4. If the access token has expired, axiosInstance's response
//              interceptor automatically calls POST /api/auth/refresh
//              using the refresh token (STORAGE_KEYS.REFRESH_TOKEN).
//           5. If the refresh also fails → user is logged out → redirected
//              to /login with the original path saved in location.state.from
//              so they return to where they were after logging back in.       */}
//       <Route element={<ProtectedRoute />}>
//         <Route path="/dashboard"       element={<Dashboard />} />
//         <Route path="/trade/:symbol"   element={<Trade />}     />
//         <Route path="/agents"          element={<Agents />}    />
//         <Route path="/news"            element={<News />}      />
//         <Route path="/portfolio"       element={<Portfolio />} />
//       </Route>

//       {/* ── FALLBACK ───────────────────────────────────────────
//           Any unknown path redirects to landing page.               */}
//       <Route path="*" element={<Navigate to="/" replace />} />

//     </Routes>
//   )
// }

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