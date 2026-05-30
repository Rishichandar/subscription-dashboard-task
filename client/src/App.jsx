import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe } from './store/authSlice'

import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PlansPage from './pages/PlansPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import LoadingScreen from './components/LoadingScreen'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, accessToken, initialized } = useSelector((s) => s.auth)
  if (!initialized) return <LoadingScreen />
  if (!accessToken || !user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function GuestRoute({ children }) {
  const { accessToken, user, initialized } = useSelector((s) => s.auth)
  if (!initialized) return <LoadingScreen />
  if (accessToken && user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const dispatch = useDispatch()
  const { accessToken, initialized } = useSelector((s) => s.auth)

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchMe())
    } else {
      dispatch({ type: 'auth/me/rejected' })
    }
  }, [])

  if (!initialized && accessToken) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/login"
          element={<GuestRoute><LoginPage /></GuestRoute>}
        />
        <Route
          path="/register"
          element={<GuestRoute><RegisterPage /></GuestRoute>}
        />
        <Route element={<Layout />}>
          <Route
            path="/plans"
            element={<ProtectedRoute><PlansPage /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/subscriptions"
            element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>}
          />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
