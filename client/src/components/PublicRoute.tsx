import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface PublicRouteProps {
  children: ReactElement
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const auth = useAuth()

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
