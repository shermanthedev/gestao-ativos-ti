import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remember, setRemember] = useState(false)
  const auth = useAuth()

  const REMEMBER_KEY = 'gestao-ativos-ti:remembered-email'

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY)
      if (saved) {
        setEmail(saved)
        setRemember(true)
      }
    } catch (err) {
      // ignore storage errors
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await auth.login(email, password)
      // after successful login, remember or forget email (do NOT store password)
      try {
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, email)
        } else {
          localStorage.removeItem(REMEMBER_KEY)
        }
      } catch (err) {
        // ignore storage errors
      }
      // navigation happens inside auth.login
    } catch (err: any) {
      // Prefer the backend's `erro` field (Portuguese) if present, then common `message`/`error`, then the Axios message
      const apiMsg = err?.response?.data?.erro || err?.response?.data?.message || err?.response?.data?.error
      setError(apiMsg || err?.message || 'Erro ao autenticar')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <div className="w-full max-w-sm p-6">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div>
              <h2 className="text-lg font-semibold">Bem-vindo</h2>
              <p className="text-sm text-gray-500">Entre na sua conta</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="seu@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" />
                <span>Lembrar credenciais</span>
              </label>
              <a className="text-indigo-600 hover:underline" href="#">Esqueci a senha</a>
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={"mt-2 w-full py-2 rounded-lg text-white text-sm font-medium " + (loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95')}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">© 2026 Gestão de Ativos - TI Esposende</p>
      </div>
    </div>
  )
}
