import { useState, useEffect } from 'react'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import SearchField from '../components/SearchField'
import EmptyState from '../components/EmptyState'
import AssignedAssetsDialog from '../components/AssignedAssetsDialog'
import { api, getApiErrorMessage } from '../lib/api'

type Setor = {
  id: string
  nome: string
}

type Funcionario = {
  id: string
  nome: string
  email: string
}

type Ativo = {
  id: string
  modelo: string
  tipo: string
  status: string
  funcionario?: {
    nome: string
  }
}

export default function Setores() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [setores, setSetores] = useState<Setor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [openManage, setOpenManage] = useState(false)
  const [selectedSetor, setSelectedSetor] = useState<Setor | null>(null)
  const [editName, setEditName] = useState('')
  const [manageLoading, setManageLoading] = useState(false)
  const [manageError, setManageError] = useState<string | null>(null)
  const [sectorEmployees, setSectorEmployees] = useState<Funcionario[]>([])
  const [sectorEmployeesLoading, setSectorEmployeesLoading] = useState(false)
  const [sectorAssets, setSectorAssets] = useState<Ativo[]>([])
  const [sectorAssetsLoading, setSectorAssetsLoading] = useState(false)
  const [assetsOpen, setAssetsOpen] = useState(false)
  const [deallocatingAssetId, setDeallocatingAssetId] = useState<string | null>(null)
  const [transferToSetorId, setTransferToSetorId] = useState('')

  const loadSetores = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/setores', { params: { nome: searchTerm || undefined, page: 1, limit: 100 } })
      setSetores(response.data.data)
    } catch (err: any) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = window.setTimeout(loadSetores, 300)
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
    setFormError(null)
  }

  const handleCreate = async () => {
    if (!newName) {
      setFormError('Preencha o nome do setor.')
      return
    }

    setCreateLoading(true)
    setFormError(null)
    try {
      await api.post('/setores', { nome: newName })
      handleCloseCreate()
      await loadSetores()
    } catch (err: any) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setCreateLoading(false)
    }
  }

  const loadSectorAssets = async (setorId: string) => {
    setSectorAssetsLoading(true)
    try {
      const response = await api.get('/ativos', {
        params: { setorId, page: 1, limit: 100 },
      })
      setSectorAssets(response.data.data ?? [])
    } catch (err: any) {
      setSectorAssets([])
      console.warn('Erro ao carregar ativos do setor', err)
    } finally {
      setSectorAssetsLoading(false)
    }
  }

  const handleOpenManage = async (setor: Setor) => {
    setSelectedSetor(setor)
    setEditName(setor.nome)
    setManageError(null)
    setTransferToSetorId('')
    setOpenManage(true)
    setSectorEmployeesLoading(true)
    setSectorAssets([])

    try {
      const [funcionariosResponse] = await Promise.all([
        api.get('/funcionarios', {
          params: { setorId: setor.id, page: 1, limit: 100 },
        }),
      ])
      setSectorEmployees(funcionariosResponse.data.data)
    } catch (err: any) {
      setSectorEmployees([])
      setManageError(getApiErrorMessage(err))
    } finally {
      setSectorEmployeesLoading(false)
    }

    await loadSectorAssets(setor.id)
  }

  const handleCloseManage = () => {
    setOpenManage(false)
    setSelectedSetor(null)
    setEditName('')
    setManageError(null)
    setTransferToSetorId('')
    setSectorEmployees([])
    setSectorAssets([])
  }

  const handleOpenAssets = async () => {
    if (!selectedSetor) return
    setAssetsOpen(true)
    setSectorAssetsLoading(true)
    try {
      const response = await api.get('/ativos', {
        params: { setorId: selectedSetor.id, page: 1, limit: 100 },
      })
      setSectorAssets(response.data.data ?? [])
    } catch (err: any) {
      console.warn('Erro ao carregar ativos do setor', err)
      setSectorAssets([])
    } finally {
      setSectorAssetsLoading(false)
    }
  }

  const handleCloseAssets = () => {
    setAssetsOpen(false)
    setSectorAssets([])
    setDeallocatingAssetId(null)
  }

  const handleDeallocateAsset = async (assetId: string) => {
    setDeallocatingAssetId(assetId)
    try {
      await api.post('/ativos/deallocate', { ids: [assetId] })
      setSectorAssets((current) => current.filter((asset) => asset.id !== assetId))
    } catch (err: any) {
      console.warn('Erro ao desalocar ativo', err)
    } finally {
      setDeallocatingAssetId(null)
    }
  }

  const handleSaveSetor = async () => {
    if (!selectedSetor) return
    if (!editName.trim()) {
      setManageError('Informe o novo nome do setor.')
      return
    }

    setManageLoading(true)
    setManageError(null)

    try {
      await api.put(`/setores/${selectedSetor.id}`, { nome: editName.trim() })
      handleCloseManage()
      await loadSetores()
    } catch (err: any) {
      setManageError(getApiErrorMessage(err))
    } finally {
      setManageLoading(false)
    }
  }

  const handleDeleteSetor = async () => {
    if (!selectedSetor) return

    setManageLoading(true)
    setManageError(null)

    try {
      await api.delete(`/setores/${selectedSetor.id}`, {
        data: transferToSetorId ? { transferToSetorId } : undefined,
      })
      handleCloseManage()
      await loadSetores()
    } catch (err: any) {
      setManageError(getApiErrorMessage(err))
    } finally {
      setManageLoading(false)
    }
  }

  return (
    <Layout header={<Header onMenuToggle={setSidebarOpen} />} sidebar={<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}>
      <div className="space-y-6">
        <PageHeader
          title="Setores"
          description="Gerencie os setores da organização"
          actions={
            <button type="button" onClick={handleOpenCreate} className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition">
              <AddIcon className="h-4 w-4" />
              Adicionar setor
            </button>
          }
        />

        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nome..." className="flex-1" />
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>}

        {loading && <div className="bg-white rounded-2xl p-8 shadow-sm border text-center text-gray-500">Carregando setores...</div>}

        {!loading && setores.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {setores.map((setor) => (
              <div key={setor.id} className="bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{setor.nome}</h3>
                    <div className="text-xs text-gray-400 mt-2">ID: {setor.id}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenManage(setor)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <EditIcon className="h-4 w-4" />
                    Gerenciar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && setores.length === 0 && !error && (
          <EmptyState
            title="Nenhum setor encontrado"
            description={searchTerm ? 'Tente buscar por outro nome' : 'Nenhum setor cadastrado ainda'}
            icon={<span className="text-4xl">🏢</span>}
          />
        )}

        {!loading && setores.length > 0 && (
          <div className="text-sm text-gray-600">Total de <span className="font-semibold">{setores.length}</span> setor(es) encontrado(s)</div>
        )}
      </div>

      <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar setor</DialogTitle>
        <DialogContent>
          <Stack spacing={3} className="mt-2">
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} fullWidth variant="outlined" />
          </Stack>
        </DialogContent>
        <DialogActions className="gap-3 p-4">
          <button type="button" onClick={handleCloseCreate} disabled={createLoading} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition">Cancelar</button>
          <button type="button" onClick={handleCreate} disabled={createLoading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition">{createLoading ? 'Salvando...' : 'Salvar'}</button>
        </DialogActions>
      </Dialog>

      <Dialog open={openManage} onClose={handleCloseManage} fullWidth maxWidth="md">
        <DialogTitle>Gerenciar setor</DialogTitle>
        <DialogContent>
          <Stack spacing={3} className="mt-2">
            {manageError && <Alert severity="error">{manageError}</Alert>}
            <TextField label="Nome do setor" value={editName} onChange={(e) => setEditName(e.target.value)} fullWidth variant="outlined" />

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Funcionários neste setor</p>
              {sectorEmployeesLoading ? (
                <p className="text-sm text-gray-500">Carregando funcionários...</p>
              ) : sectorEmployees.length > 0 ? (
                <ul className="max-h-40 space-y-2 overflow-y-auto">
                  {sectorEmployees.map((funcionario) => (
                    <li key={funcionario.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                      <p className="font-medium text-gray-900">{funcionario.nome}</p>
                      <p className="text-xs text-gray-500">{funcionario.email}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Nenhum funcionário cadastrado neste setor.</p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Ativos alocados neste setor</p>
              {sectorAssetsLoading ? (
                <p className="text-sm text-gray-500">Carregando ativos...</p>
              ) : sectorAssets.length > 0 ? (
                <ul className="max-h-40 space-y-2 overflow-y-auto">
                  {sectorAssets.map((ativo) => (
                    <li key={ativo.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                      <p className="font-medium text-gray-900">{ativo.modelo}</p>
                      <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                        <span>{ativo.tipo}</span>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">{ativo.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Nenhum ativo alocado neste setor.</p>
              )}
            </div>

            <FormControl fullWidth>
              <InputLabel id="transfer-setor-label">Transferir para outro setor ao apagar</InputLabel>
              <Select
                labelId="transfer-setor-label"
                value={transferToSetorId}
                label="Transferir para outro setor ao apagar"
                onChange={(e) => setTransferToSetorId(e.target.value)}
              >
                <MenuItem value="">Nenhum (apenas apagar se não houver dependências)</MenuItem>
                {setores
                  .filter((setor) => setor.id !== selectedSetor?.id)
                  .map((setor) => (
                    <MenuItem key={setor.id} value={setor.id}>
                      {setor.nome}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions className="gap-3 p-4">
          <button type="button" onClick={handleCloseManage} disabled={manageLoading} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition">Cancelar</button>
          <button type="button" onClick={handleDeleteSetor} disabled={manageLoading} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition">
            <DeleteIcon className="h-4 w-4" />
            Apagar setor
          </button>
          <button type="button" onClick={handleOpenAssets} disabled={manageLoading} className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 transition">
            Gerenciar ativos do setor
          </button>
          <button type="button" onClick={handleSaveSetor} disabled={manageLoading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition">
            {manageLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </DialogActions>
      </Dialog>

      <AssignedAssetsDialog
        open={assetsOpen}
        title={`Ativos alocados a ${selectedSetor?.nome}`}
        loading={sectorAssetsLoading}
        assets={sectorAssets}
        emptyMessage="Nenhum ativo alocado a este setor."
        deallocatingAssetId={deallocatingAssetId}
        onClose={handleCloseAssets}
        onDeallocate={handleDeallocateAsset}
      />
    </Layout>
  )
}
