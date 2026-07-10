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
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editSetorId, setEditSetorId] = useState('')
  const [manageLoading, setManageLoading] = useState(false)
  const [manageError, setManageError] = useState<string | null>(null)
  const [assetsOpen, setAssetsOpen] = useState(false)
  const [funcionarioAssets, setFuncionarioAssets] = useState<any[]>([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [deallocatingAssetId, setDeallocatingAssetId] = useState<string | null>(null)

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

  const handleOpenManage = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario)
    setEditName(funcionario.nome)
    setEditEmail(funcionario.email)
    setEditSetorId(funcionario.setor.id)
    setManageError(null)
  }

  const handleCloseManage = () => {
    setSelectedFuncionario(null)
    setEditName('')
    setEditEmail('')
    setEditSetorId('')
    setManageError(null)
  }

  const handleUpdateFuncionario = async () => {
    if (!selectedFuncionario) return
    if (!editName || !editEmail || !editSetorId) {
      setManageError('Preencha todos os campos.')
      return
    }

    setManageLoading(true)
    setManageError(null)
    try {
      await api.put(`/funcionarios/${selectedFuncionario.id}`, {
        nome: editName,
        email: editEmail,
        setorId: editSetorId,
      })
      handleCloseManage()
      await loadFuncionarios()
    } catch (err: any) {
      setManageError(err?.response?.data?.erro || err?.message || 'Erro ao atualizar funcionário')
    } finally {
      setManageLoading(false)
    }
  }

  const handleDeleteFuncionario = async () => {
    if (!selectedFuncionario) return
    const confirmDelete = window.confirm(`Deseja realmente deletar ${selectedFuncionario.nome}?`)
    if (!confirmDelete) return

    setManageLoading(true)
    setManageError(null)
    try {
      await api.delete(`/funcionarios/${selectedFuncionario.id}`)
      handleCloseManage()
      await loadFuncionarios()
    } catch (err: any) {
      setManageError(err?.response?.data?.erro || err?.message || 'Erro ao deletar funcionário')
    } finally {
      setManageLoading(false)
    }
  }

  const handleOpenAssets = async () => {
    if (!selectedFuncionario) return
    setAssetsOpen(true)
    setAssetsLoading(true)
    try {
      const response = await api.get('/ativos', {
        params: {
          funcionarioId: selectedFuncionario.id,
          page: 1,
          limit: 100,
        },
      })
      setFuncionarioAssets(response.data.data)
    } catch (err: any) {
      console.warn('Erro ao carregar ativos do funcionário', err)
      setFuncionarioAssets([])
    } finally {
      setAssetsLoading(false)
    }
  }

  const handleCloseAssets = () => {
    setAssetsOpen(false)
    setFuncionarioAssets([])
  }

  const handleDeallocateAsset = async (assetId: string) => {
    setDeallocatingAssetId(assetId)
    try {
      await api.post('/ativos/deallocate', { ids: [assetId] })
      setFuncionarioAssets((current) => current.filter((asset) => asset.id !== assetId))
      await loadFuncionarios()
    } catch (err: any) {
      console.warn('Erro ao desalocar ativo', err)
    } finally {
      setDeallocatingAssetId(null)
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
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition"
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
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => handleOpenManage(funcionario)}
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
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={createLoading}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {createLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selectedFuncionario)} onClose={handleCloseManage} fullWidth maxWidth="sm">
        <DialogTitle>Gerenciar funcionário</DialogTitle>
        <DialogContent>
          <Stack spacing={3} className="mt-2">
            {manageError && <Alert severity="error">{manageError}</Alert>}
            <TextField
              label="Nome"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel id="edit-setor-select-label">Setor</InputLabel>
              <Select
                labelId="edit-setor-select-label"
                value={editSetorId}
                label="Setor"
                onChange={(e) => setEditSetorId(e.target.value)}
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
            onClick={handleCloseManage}
            disabled={manageLoading}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleOpenAssets}
            disabled={manageLoading}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-4 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            Gerenciar ativos do funcionário
          </button>
          <button
            type="button"
            onClick={handleDeleteFuncionario}
            disabled={manageLoading}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {manageLoading ? 'Processando...' : 'Deletar'}
          </button>
          <button
            type="button"
            onClick={handleUpdateFuncionario}
            disabled={manageLoading}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {manageLoading ? 'Processando...' : 'Salvar alterações'}
          </button>
        </DialogActions>
      </Dialog>

      <Dialog open={assetsOpen} onClose={handleCloseAssets} fullWidth maxWidth="md">
        <DialogTitle>Ativos alocados a {selectedFuncionario?.nome}</DialogTitle>
        <DialogContent>
          {assetsLoading ? (
            <div className="py-8 text-center text-gray-500">Carregando ativos...</div>
          ) : funcionarioAssets.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Nenhum ativo alocado a este funcionário.</div>
          ) : (
            <div className="space-y-3 py-2">
              {funcionarioAssets.map((asset) => (
                <div key={asset.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{asset.modelo}</div>
                    <div className="mt-1 text-sm text-gray-600">Tipo: {asset.tipo}</div>
                    <div className="mt-1 text-sm text-gray-600">S/N: {asset.numeroSerie ?? '—'}</div>
                    <div className="mt-1 text-sm text-gray-600">Status: {asset.status}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeallocateAsset(asset.id)}
                    disabled={Boolean(deallocatingAssetId)}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 transition"
                  >
                    {deallocatingAssetId === asset.id ? 'Desalocando...' : 'Desalocar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions className="gap-3 p-4">
          <button
            type="button"
            onClick={handleCloseAssets}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Fechar
          </button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}
