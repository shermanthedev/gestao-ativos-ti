import { useState, useEffect } from 'react'
import {
  Search as SearchIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  ManageAccounts as ManageAccountsIcon,
} from '@mui/icons-material'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
} from '@mui/material'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Layout from '../components/Layout'
import { api } from '../lib/api'

type Funcionario = {
  id: string
  nome: string
  email: string
  setor: {
    id: string
    nome: string
  }
}

type Setor = {
  id: string
  nome: string
}

export default function Funcionarios() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newSetorId, setNewSetorId] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadFuncionarios = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/funcionarios', {
        params: {
          nome: searchTerm || undefined,
          page: 1,
          limit: 100,
        },
      })
      setFuncionarios(response.data.data)
    } catch (err: any) {
      setError(err?.response?.data?.erro || err?.message || 'Erro ao carregar funcionários')
    } finally {
      setLoading(false)
    }
  }

  const loadSetores = async () => {
    try {
      const response = await api.get('/setores', {
        params: { page: 1, limit: 100 },
      })
      setSetores(response.data.data)
    } catch (err: any) {
      console.warn('Erro ao carregar setores', err)
    }
  }

  useEffect(() => {
    const debounceTimer = window.setTimeout(loadFuncionarios, 300)
    return () => window.clearTimeout(debounceTimer)
  }, [searchTerm])

  useEffect(() => {
    loadSetores()
  }, [])

  const handleOpenCreate = () => {
    setFormError(null)
    setOpenCreate(true)
  }

  const handleCloseCreate = () => {
    setOpenCreate(false)
    setNewName('')
    setNewEmail('')
    setNewSetorId('')
    setFormError(null)
  }

  const handleCreate = async () => {
    if (!newName || !newEmail || !newSetorId) {
      setFormError('Preencha todos os campos.')
      return
    }

  setCreateLoading(true)
  setFormError(null)
  try {
    await api.post('/funcionarios', {
      nome: newName,
      email: newEmail,
      setorId: newSetorId,
    })
    handleCloseCreate()
    await loadFuncionarios()
  } catch (err: any) {
    setFormError(err?.response?.data?.erro || err?.message || 'Erro ao criar funcionário')
  } finally {
    setCreateLoading(false)
  }
}
  return (
    <Layout
      header={<Header onMenuToggle={setSidebarOpen} />}
      sidebar={<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Funcionários</h1>
            <p className="text-sm text-gray-500">Gerencie todos os funcionários cadastrados</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-200 flex-1">
                <SearchIcon className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition"
              >
                <AddIcon className="h-4 w-4" />
                Adicionar funcionário
              </button>
            </div>
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
            Carregando funcionários...
          </div>
        )}

        {/* List */}
        {!loading && funcionarios.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {funcionarios.map((funcionario) => (
              <div key={funcionario.id} className="bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{funcionario.nome}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <EmailIcon className="h-4 w-4 text-gray-400" />
                        {funcionario.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BusinessIcon className="h-4 w-4 text-gray-400" />
                        {funcionario.setor.nome}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-400">{funcionario.id}</div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <ManageAccountsIcon className="h-4 w-4" />
                      Gerenciar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && funcionarios.length === 0 && !error && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
            <div className="text-gray-400 mb-2">
              <SearchIcon sx={{ fontSize: 48 }} />
            </div>
            <p className="text-gray-600 font-medium">Nenhum funcionário encontrado</p>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Tente buscar por outro nome' : 'Nenhum funcionário cadastrado ainda'}
            </p>
          </div>
        )}

        {/* Count */}
        {!loading && funcionarios.length > 0 && (
          <div className="text-sm text-gray-600">
            Total de <span className="font-semibold">{funcionarios.length}</span> funcionário(s) encontrado(s)
          </div>
        )}
      </div>

      <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar funcionário</DialogTitle>
        <DialogContent>
          <Stack spacing={3} className="mt-2">
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Nome"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel id="setor-select-label">Setor</InputLabel>
              <Select
                labelId="setor-select-label"
                value={newSetorId}
                label="Setor"
                onChange={(e) => setNewSetorId(e.target.value)}
              >
                {setores.map((setor) => (
                  <MenuItem key={setor.id} value={setor.id}>
                    {setor.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions className="gap-3 p-4">
          <button
            type="button"
            onClick={handleCloseCreate}
            disabled={createLoading}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={createLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {createLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}
