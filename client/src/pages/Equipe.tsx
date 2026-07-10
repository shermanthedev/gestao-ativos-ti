import { useState, useEffect } from 'react'
import { Search as SearchIcon, Email as EmailIcon, Person as PersonIcon } from '@mui/icons-material'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Layout from '../components/Layout'
import { api } from '../lib/api'

type UsuarioTI = {
  id: string
  nome: string
  email: string
  createdAt: string
}

export default function Equipe() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [usuarios, setUsuarios] = useState<UsuarioTI[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get('/usuarios-ti', {
          params: {
            nome: searchTerm || undefined,
            page: 1,
            limit: 100,
          },
        })
        setUsuarios(response.data.data)
      } catch (err: any) {
        setError(err?.response?.data?.erro || err?.message || 'Erro ao carregar equipe')
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchUsuarios, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  return (
    <Layout
      header={<Header onMenuToggle={setSidebarOpen} />}
      sidebar={<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Equipe TI</h1>
          <p className="text-sm text-gray-500">Visualize todos os integrantes da equipe</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-200">
            <SearchIcon className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border text-center text-gray-500">
            Carregando equipe...
          </div>
        )}

        {/* List */}
        {!loading && usuarios.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {usuario.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{usuario.nome}</h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <EmailIcon className="h-4 w-4 text-gray-400" />
                          {usuario.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <PersonIcon className="h-4 w-4 text-gray-400" />
                          Integrante desde {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{usuario.id}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && usuarios.length === 0 && !error && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
            <div className="text-gray-400 mb-2">
              <SearchIcon sx={{ fontSize: 48 }} />
            </div>
            <p className="text-gray-600 font-medium">Nenhum integrante encontrado</p>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Tente buscar por outro nome' : 'Nenhum integrante cadastrado ainda'}
            </p>
          </div>
        )}

        {/* Count */}
        {!loading && usuarios.length > 0 && (
          <div className="text-sm text-gray-600">
            Total de <span className="font-semibold">{usuarios.length}</span> integrante(s) encontrado(s)
          </div>
        )}
      </div>
    </Layout>
  )
}
