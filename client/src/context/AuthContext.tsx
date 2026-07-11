import { createContext, useContext, useEffect, useState } from 'react'
import { api, setAuthToken } from '../lib/api'
import { useNavigate } from 'react-router-dom'

type User = {
  id: string
  nome: string
  email: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  updateProfile: (payload: { nome?: string; email?: string; senha?: string }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'gestao-ativos-ti:auth'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()

  const getStoredAuth = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { user: null, token: null }
      const parsed = JSON.parse(raw)
      return {
        user: parsed.user ?? null,
        token: parsed.token ?? null,
      }
    } catch (err) {
      console.warn('Failed to parse auth from storage', err)
      return { user: null, token: null }
    }
  }

  const { user: initialUser, token: initialToken } = getStoredAuth()
  const [user, setUser] = useState<User | null>(initialUser)
  const [token, setToken] = useState<string | null>(initialToken)

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  useEffect(() => {
    try {
      if (user == null && token == null) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
      }
    } catch (err) {
      console.warn('Failed to persist auth to storage', err)
    }
  }, [user, token])

  const login = async (email: string, password: string) => {
    // backend expects { email, senha }
    const body = { email, senha: password }
    const res = await api.post('/auth/login', body)
    const { token: receivedToken, usuario } = res.data
    setUser(usuario)
    setToken(receivedToken)
    setAuthToken(receivedToken)
    // navigate to dashboard after login
    navigate('/dashboard')
  }

  const updateProfile = async (payload: { nome?: string; email?: string; senha?: string }) => {
    if (!user?.id) return

    const sanitizedPayload: { nome?: string; email?: string; senha?: string } = {}

    if (payload.nome?.trim()) sanitizedPayload.nome = payload.nome.trim()
    if (payload.email?.trim()) sanitizedPayload.email = payload.email.trim().toLowerCase()
    if (payload.senha?.trim()) sanitizedPayload.senha = payload.senha.trim()

    if (Object.keys(sanitizedPayload).length === 0) return

    const response = await api.put(`/usuarios-ti/${user.id}`, sanitizedPayload)
    const payloadData = response.data as { usuario?: User; token?: string; user?: User }
    const updatedUser = (payloadData.usuario ?? payloadData.user ?? response.data) as User

    if (payloadData.token) {
      setToken(payloadData.token)
      setAuthToken(payloadData.token)
    }

    setUser((currentUser) => (currentUser ? { ...currentUser, ...updatedUser } : updatedUser))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setAuthToken(null)
    localStorage.removeItem(STORAGE_KEY)
    navigate('/login')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    updateProfile,
    logout,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
