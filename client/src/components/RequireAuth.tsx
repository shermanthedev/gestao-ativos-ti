import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const auth = useAuth()
  const location = useLocation()

  if (!auth.isAuthenticated) {
    // redirect to login, preserve current location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
