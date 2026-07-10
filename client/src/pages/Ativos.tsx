import { useState, useEffect, useMemo } from 'react'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Laptop as LaptopIcon,
  DesktopWindows as DesktopIcon,
  DesktopMac as DesktopMacIcon,
  Print as PrintIcon,
  Phone as PhoneIcon,
  DevicesOther as DevicesOtherIcon,
  Power as PowerIcon,
  Storage as StorageIcon,
  SettingsEthernet as SettingsEthernetIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Wifi as WifiIcon,
  CalendarToday as CalendarTodayIcon,
  LocalOffer as LocalOfferIcon,
  Edit as EditIcon,
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
  Autocomplete,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Layout from '../components/Layout'
import { api } from '../lib/api'

type Ativo = {
  id: string
  tipo: string
  modelo: string
  numeroSerie?: string | null
  ip?: string
  status: 'EM_ESTOQUE' | 'ALOCADO' | 'MANUTENCAO'
  quantidade?: number
  setorId?: string
  funcionarioId?: string
  createdAt: string
  funcionario?: {
    id: string
    nome: string
  }
  setor?: {
    id: string
    nome: string
  }
}

type Funcionario = {
  id: string
  nome: string
}

type Setor = {
  id: string
  nome: string
}

type TipoAtivo = {
  id: string
  nome: string
  isIndividual?: boolean
}


const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ALOCADO':
      return 'Alocado'
    case 'EM_ESTOQUE':
      return 'Em Estoque'
    case 'MANUTENCAO':
      return 'Manutenção'
    default:
      return status
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ALOCADO':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'EM_ESTOQUE':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'MANUTENCAO':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const getIconForTipo = (tipo: string) => {
  switch (tipo) {
    case 'NOTEBOOK':
      return <LaptopIcon className="text-indigo-600 h-6 w-6" />
    case 'IMPRESSORA':
      return <PrintIcon className="text-indigo-600 h-6 w-6" />
    case 'RAMAL':
      return <PhoneIcon className="text-indigo-600 h-6 w-6" />
    case 'MONITOR':
      return <DesktopIcon className="text-indigo-600 h-6 w-6" />
    case 'COMPUTADOR':
      return <DesktopMacIcon className="text-indigo-600 h-6 w-6" />
    case 'PERIFÉRICO':
      return <DevicesOtherIcon className="text-indigo-600 h-6 w-6" />
    case 'NOBREAK':
      return <PowerIcon className="text-indigo-600 h-6 w-6" />
    case 'SERVIDOR':
      return <StorageIcon className="text-indigo-600 h-6 w-6" />
    case 'SWITCH':
      return <SettingsEthernetIcon className="text-indigo-600 h-6 w-6" />
    case 'LEITOR':
      return <QrCodeScannerIcon className="text-indigo-600 h-6 w-6" />
    case 'ACCESSPOINT':
      return <WifiIcon className="text-indigo-600 h-6 w-6" />
    case 'ROTEADOR':
      return <WifiIcon className="text-indigo-600 h-6 w-6" />
    default:
      return <LaptopIcon className="text-indigo-600 h-6 w-6" />
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export default function Ativos() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [tiposAtivos, setTiposAtivos] = useState<TipoAtivo[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal Criar
  const [openCreate, setOpenCreate] = useState(false)
  const [newModelo, setNewModelo] = useState('')
  const [newTipo, setNewTipo] = useState('')
  const [newNumeroSerie, setNewNumeroSerie] = useState('')
  const [newIp, setNewIp] = useState('')
  const [newHasIp, setNewHasIp] = useState(false)
  // quantidade removida — ativos são individuais
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Modal Gerenciar
  const [openManage, setOpenManage] = useState(false)
  const [selectedAtivo, setSelectedAtivo] = useState<Ativo | null>(null)
  const [editModelo, setEditModelo] = useState('')
  const [editTipo, setEditTipo] = useState('')
  const [editNumeroSerie, setEditNumeroSerie] = useState('')
  const [editIp, setEditIp] = useState('')
  const [editHasIp, setEditHasIp] = useState(false)
  const [editStatus, setEditStatus] = useState('')
  const [editFuncionarioId, setEditFuncionarioId] = useState<string | null>(null)
  const [editSetorId, setEditSetorId] = useState<string | null>(null)
  const [manageLoading, setManageLoading] = useState(false)
  const [manageError, setManageError] = useState<string | null>(null)

  // Sugestões de modelo
  const modelosSugestoes = useMemo(() => {
    if (!newModelo) return []
    return Array.from(new Set(ativos.map((a) => a.modelo)))
      .filter((m) => m.toLowerCase().includes(newModelo.toLowerCase()))
      .slice(0, 5)
  }, [newModelo, ativos])

  const loadAtivos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/ativos', {
        params: {
          modelo: searchTerm || undefined,
          page: 1,
          limit: 100,
        },
      })
      setAtivos(response.data.data)
    } catch (err: any) {
      setError(err?.response?.data?.erro || err?.message || 'Erro ao carregar ativos')
    } finally {
      setLoading(false)
    }
  }

  const loadFuncionarios = async () => {
    try {
      const response = await api.get('/funcionarios', {
        params: { page: 1, limit: 100 },
      })
      setFuncionarios(response.data.data)
    } catch (err: any) {
      console.warn('Erro ao carregar funcionários', err)
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

  const loadTiposAtivos = async () => {
    try {
      const response = await api.get('/ativos/tipos')
      setTiposAtivos(response.data)
    } catch (err: any) {
      console.warn('Erro ao carregar tipos de ativos', err)
    }
  }

  useEffect(() => {
    const debounceTimer = window.setTimeout(loadAtivos, 300)
    return () => window.clearTimeout(debounceTimer)
  }, [searchTerm])

  const [viewMode, setViewMode] = useState<'ALL' | 'ESTOQUE' | 'ALOCADOS'>('ALL')
  useEffect(() => {
    loadFuncionarios()
    loadSetores()
    loadTiposAtivos()
  }, [])

  const loadEstoque = async () => {
    setLoading(true)
    try {
      const res = await api.get('/ativos', { params: { status: 'EM_ESTOQUE', page: 1, limit: 100 } })
      setAtivos(res.data.data)
    } catch (err: any) {
      console.warn('Erro ao carregar estoque', err)
    } finally {
      setLoading(false)
    }
  }

  const loadAlocados = async () => {
    setLoading(true)
    try {
      const res = await api.get('/ativos/allocated', { params: { page: 1, limit: 200 } })
      setAtivos(res.data.data)
    } catch (err: any) {
      console.warn('Erro ao carregar ativos alocados', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // When viewMode changes, load appropriate data
    if (viewMode === 'ALL') loadAtivos()
    else if (viewMode === 'ESTOQUE') loadEstoque()
    else if (viewMode === 'ALOCADOS') loadAlocados()
  }, [viewMode])

  const filteredAtivos = ativos

  // Total de registros (agora ativos são individuais)
  const totalAtivos = filteredAtivos.length

  const handleOpenCreate = () => {
    setFormError(null)
    setOpenCreate(true)
  }

  const handleCloseCreate = () => {
    setOpenCreate(false)
    setNewModelo('')
    setNewTipo('')
    setNewNumeroSerie('')
    setNewIp('')
    setNewHasIp(false)
    // quantidade removida
    setFormError(null)
  }

  const handleCreate = async () => {
    if (!newModelo || !newTipo) {
      setFormError('Preencha todos os campos obrigatórios.')
      return
    }

    setCreateLoading(true)
    setFormError(null)

    try {
      await api.post('/ativos', {
        modelo: newModelo,
        tipo: newTipo,
        numeroSerie: newNumeroSerie || null,
        ip: newHasIp ? (newIp || undefined) : undefined,
        status: 'EM_ESTOQUE'
      })
      handleCloseCreate()
      await loadAtivos()
    } catch (err: any) {
      setFormError(err?.response?.data?.erro || err?.message || 'Erro ao criar ativo')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleOpenManage = (ativo: Ativo) => {
    setSelectedAtivo(ativo)
    setEditModelo(ativo.modelo)
    setEditTipo(ativo.tipo)
    setEditNumeroSerie(ativo.numeroSerie || '')
    setEditIp(ativo.ip || '')
    setEditHasIp(Boolean(ativo.ip))
    // quantidade removida
    setEditStatus(ativo.status)
    setEditFuncionarioId(ativo.funcionarioId || null)
    setEditSetorId(ativo.setorId || null)
    setManageError(null)
    setOpenManage(true)
  }

  const handleCloseManage = () => {
    setOpenManage(false)
    setSelectedAtivo(null)
    setEditModelo('')
    setEditTipo('')
    setEditNumeroSerie('')
    setEditIp('')
    setEditStatus('')
    setEditFuncionarioId(null)
    setEditSetorId(null)
    setManageError(null)
  }

  const handleSaveManage = async () => {
    if (!selectedAtivo) return

    if (!editModelo || !editTipo) {
      setManageError('Preencha todos os campos obrigatórios.')
      return
    }

    setManageLoading(true)
    setManageError(null)

    try {
      await api.put(`/ativos/${selectedAtivo.id}`, {
        modelo: editModelo,
        tipo: editTipo,
        numeroSerie: editNumeroSerie || null,
        ip: editHasIp ? (editIp || undefined) : null,
        status: editStatus,
        funcionarioId: editFuncionarioId || undefined,
        setorId: editSetorId || undefined,
      })
      handleCloseManage()
      await loadAtivos()
    } catch (err: any) {
      setManageError(err?.response?.data?.erro || err?.message || 'Erro ao atualizar ativo')
    } finally {
      setManageLoading(false)
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
            <h1 className="text-2xl font-semibold text-gray-900">Ativos</h1>
            <p className="text-sm text-gray-500">Gerencie todos os ativos de TI da organização</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setViewMode('ALL')}
                  className={`px-3 py-1.5 rounded-md text-sm ${viewMode === 'ALL' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-600'}`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('ESTOQUE')}
                  className={`px-3 py-1.5 rounded-md text-sm ${viewMode === 'ESTOQUE' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-600'}`}
                >
                  Em estoque
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('ALOCADOS')}
                  className={`px-3 py-1.5 rounded-md text-sm ${viewMode === 'ALOCADOS' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-600'}`}
                >
                  Alocados
                </button>
              </div>

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
                  Adicionar ativo
                </button>
              </div>
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
            Carregando ativos...
          </div>
        )}

        {/* List */}
        {!loading && filteredAtivos.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {filteredAtivos.map((ativo) => (
              <div
                key={ativo.id}
                className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  {/* Informações Principais */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-indigo-50">
                        {getIconForTipo(ativo.tipo)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 text-lg">{ativo.modelo}</h3>
                          {/* Mostrar se é Individual ou Coletivo */}
                          {(() => {
                            const tipoInfo = tiposAtivos.find((t) => t.id === ativo.tipo)
                            if (tipoInfo) {
                              return (
                                <span className="ml-3 inline-flex items-center gap-2 text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100 px-2 py-0.5 rounded">
                                  {tipoInfo.isIndividual ? 'Individual' : 'Coletivo'}
                                </span>
                              )
                            }
                            return null
                          })()}
                        </div>
                        <div className="mt-2 space-y-3">
                          {/* Tipo e Status */}
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                              <LocalOfferIcon className="h-3.5 w-3.5" />
                              {ativo.tipo}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(
                                ativo.status
                              )}`}
                            >
                              {getStatusLabel(ativo.status)}
                            </span>
                          </div>

                          {/* Número de Série (apenas se existir) */}
                          {ativo.numeroSerie && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-medium text-gray-900">Série:</span>
                              {ativo.numeroSerie}
                            </div>
                          )}

                          {/* IP (se disponível) */}
                          {ativo.ip && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-medium text-gray-900">IP:</span>
                              {ativo.ip}
                            </div>
                          )}

                          {/* Data de Cadastro */}
                          <div className="flex items-center gap-2 text-xs text-gray-600 pt-2">
                            <CalendarTodayIcon className="h-3.5 w-3.5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-700">Cadastrado em</p>
                              <p>{formatDate(ativo.createdAt)}</p>
                            </div>
                          </div>

                          {/* Info de alocação (quando aplicável) */}
                          {ativo.status === 'ALOCADO' && (
                            <div className="mt-2 text-sm text-gray-700">
                              {ativo.funcionario ? (
                                <div>Alocado para: <span className="font-medium">{ativo.funcionario.nome}</span></div>
                              ) : ativo.setor ? (
                                <div>Alocado para setor: <span className="font-medium">{ativo.setor.nome}</span></div>
                              ) : (
                                <div>Alocado (destinatário não informado)</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col items-start gap-4 sm:items-end sm:text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenManage(ativo)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <EditIcon className="h-4 w-4" />
                      Gerenciar
                    </button>
                  </div>
                </div>

                {/* ID do Ativo (rodapé) */}
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                  ID: {ativo.id}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAtivos.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
            <div className="text-gray-400 mb-2">
              <SearchIcon sx={{ fontSize: 48 }} />
            </div>
            <p className="text-gray-600 font-medium">Nenhum ativo encontrado</p>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Tente buscar por outro nome' : 'Nenhum ativo cadastrado ainda'}
            </p>
          </div>
        )}

        {/* Count */}
        {filteredAtivos.length > 0 && (
          <div className="text-sm text-gray-600">
            Total de <span className="font-semibold">{totalAtivos}</span> ativo(s)
            {searchTerm && ` encontrado(s) para "${searchTerm}"`}
          </div>
        )}
      </div>

      {/* Modal de Criar Ativo */}
      <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar ativo</DialogTitle>
        <DialogContent>
          <Stack spacing={3} className="mt-2">
            {formError && <Alert severity="error">{formError}</Alert>}
            <Autocomplete
              freeSolo
              options={modelosSugestoes}
              inputValue={newModelo}
              onInputChange={(_, value) => setNewModelo(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Modelo"
                  placeholder="Ex: Dell XPS 15"
                  variant="outlined"
                />
              )}
            />
            <FormControl fullWidth>
              <InputLabel id="tipo-select-label">Tipo de Ativo</InputLabel>
              <Select
                labelId="tipo-select-label"
                value={newTipo}
                label="Tipo de Ativo"
                onChange={(e) => setNewTipo(e.target.value)}
              >
                {tiposAtivos.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Número de Série (opcional)"
              value={newNumeroSerie}
              onChange={(e) => setNewNumeroSerie(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Ex: DELL-XPS-001"
            />
            <FormControlLabel
              control={<Checkbox checked={newHasIp} onChange={(e) => { setNewHasIp(e.target.checked); if (!e.target.checked) setNewIp('') }} />}
              label="Possui IP fixo?"
            />
            {newHasIp && (
              <TextField
                label="IP (Opcional)"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: 192.168.1.10"
              />
            )}
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

      {/* Modal de Gerenciar Ativo */}
      <Dialog open={openManage} onClose={handleCloseManage} fullWidth maxWidth="sm">
        <DialogTitle>Gerenciar ativo</DialogTitle>
        <DialogContent>
          <Stack spacing={3} className="mt-2">
            {manageError && <Alert severity="error">{manageError}</Alert>}
            <Autocomplete
              freeSolo
              options={modelosSugestoes}
              inputValue={editModelo}
              onInputChange={(_, value) => setEditModelo(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Modelo"
                  placeholder="Ex: Dell XPS 15"
                  variant="outlined"
                />
              )}
            />
            <FormControl fullWidth>
              <InputLabel id="tipo-select-label-edit">Tipo de Ativo</InputLabel>
              <Select
                labelId="tipo-select-label-edit"
                value={editTipo}
                label="Tipo de Ativo"
                onChange={(e) => setEditTipo(e.target.value)}
              >
                {tiposAtivos.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Número de Série (opcional)"
              value={editNumeroSerie}
              onChange={(e) => setEditNumeroSerie(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Ex: DELL-XPS-001"
            />
            <FormControlLabel
              control={<Checkbox checked={editHasIp} onChange={(e) => { setEditHasIp(e.target.checked); if (!e.target.checked) setEditIp('') }} />}
              label="Possui IP fixo?"
            />
            {editHasIp && (
              <TextField
                label="IP (Opcional)"
                value={editIp}
                onChange={(e) => setEditIp(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: 192.168.1.10"
              />
            )}
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={editStatus}
                label="Status"
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <MenuItem value="EM_ESTOQUE">Em Estoque</MenuItem>
                <MenuItem value="ALOCADO">Alocado</MenuItem>
                <MenuItem value="MANUTENCAO">Manutenção</MenuItem>
              </Select>
            </FormControl>

            {/* Relacionamentos */}
            <div className="border-t pt-4">
              <p className="font-semibold text-sm text-gray-900 mb-3">Relacionamentos</p>

              {/* Relacionamento: mostrar somente o campo apropriado com base no tipo (isIndividual vindo do backend) */}
              {(() => {
                const tipoInfo = tiposAtivos.find((t) => t.id === editTipo)
                if (tipoInfo?.isIndividual) {
                  return (
                    <Autocomplete
                      options={funcionarios}
                      getOptionLabel={(option) => option.nome}
                      value={
                        editFuncionarioId
                          ? funcionarios.find((f) => f.id === editFuncionarioId) || null
                          : null
                      }
                      onChange={(_, value) => {
                        setEditFuncionarioId(value?.id || null)
                        if (value) {
                          setEditSetorId(null)
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Funcionário (Ativo Individual)"
                          placeholder="Selecione um funcionário"
                          variant="outlined"
                        />
                      )}
                      className="mb-3"
                    />
                  )
                }

                return (
                  <Autocomplete
                    options={setores}
                    getOptionLabel={(option) => option.nome}
                    value={
                      editSetorId
                        ? setores.find((s) => s.id === editSetorId) || null
                        : null
                    }
                    onChange={(_, value) => {
                      setEditSetorId(value?.id || null)
                      if (value) {
                        setEditFuncionarioId(null)
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Setor (Ativo Coletivo)"
                        placeholder="Selecione um setor"
                        variant="outlined"
                      />
                    )}
                  />
                )
              })()}
            </div>
          </Stack>
        </DialogContent>
        <DialogActions className="gap-3 p-4">
          <button
            type="button"
            onClick={handleCloseManage}
            disabled={manageLoading}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!selectedAtivo) return
              const ok = window.confirm('Deseja realmente excluir este ativo? Esta ação é irreversível.')
              if (!ok) return
              setManageLoading(true)
              try {
                await api.delete(`/ativos/${selectedAtivo.id}`)
                handleCloseManage()
                await loadAtivos()
              } catch (err: any) {
                setManageError(err?.response?.data?.erro || err?.message || 'Erro ao deletar ativo')
              } finally {
                setManageLoading(false)
              }
            }}
            disabled={manageLoading}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            Excluir
          </button>

          <button
            type="button"
            onClick={handleSaveManage}
            disabled={manageLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {manageLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}
