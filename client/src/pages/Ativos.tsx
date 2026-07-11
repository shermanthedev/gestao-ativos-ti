import { useState, useEffect, useMemo } from 'react'
import { Add as AddIcon } from '@mui/icons-material'
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
import PageHeader from '../components/PageHeader'
import SearchField from '../components/SearchField'
import EmptyState from '../components/EmptyState'
import AssetCard from '../components/AssetCard'
import { api, getApiErrorMessage } from '../lib/api'

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


export default function Ativos() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [tiposAtivos, setTiposAtivos] = useState<TipoAtivo[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EM_ESTOQUE' | 'ALOCADO' | 'MANUTENCAO'>('ALL')
  const [tipoFilter, setTipoFilter] = useState('')
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
      const params: Record<string, string | number | undefined> = {
        search: searchTerm.trim() || undefined,
        tipo: tipoFilter || undefined,
        page: 1,
        limit: 100,
      }

      if (statusFilter !== 'ALL') {
        params.status = statusFilter
      }

      const response = await api.get('/ativos', { params })

      setAtivos(response.data.data)
    } catch (err: any) {
      setError(getApiErrorMessage(err) || 'Erro ao carregar ativos')
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
    const debounceTimer = window.setTimeout(() => {
      void loadAtivos()
    }, 300)

    return () => window.clearTimeout(debounceTimer)
  }, [searchTerm, tipoFilter, statusFilter])

  useEffect(() => {
    loadFuncionarios()
    loadSetores()
    loadTiposAtivos()
  }, [])

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
      setFormError(getApiErrorMessage(err) || 'Erro ao criar ativo')
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
      setManageError(getApiErrorMessage(err) || 'Erro ao atualizar ativo')
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
        <PageHeader
          title="Ativos"
          description="Gerencie todos os ativos de TI da organização"
          actions={
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition"
            >
              <AddIcon className="h-4 w-4" />
              Adicionar ativo
            </button>
          }
        />

        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
              <SearchField
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por modelo, série ou IP"
              />

              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                >
                  <MenuItem value="ALL">Todos</MenuItem>
                  <MenuItem value="EM_ESTOQUE">Em Estoque</MenuItem>
                  <MenuItem value="ALOCADO">Alocados</MenuItem>
                  <MenuItem value="MANUTENCAO">Manutenção</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="type-filter-label">Tipo</InputLabel>
                <Select
                  labelId="type-filter-label"
                  value={tipoFilter}
                  label="Tipo"
                  onChange={(e) => setTipoFilter(e.target.value)}
                >
                  <MenuItem value="">Todos os tipos</MenuItem>
                  {tiposAtivos.map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border text-center text-gray-500">
            Carregando ativos...
          </div>
        ) : null}

        {!loading && filteredAtivos.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredAtivos.map((ativo) => (
              <AssetCard
                key={ativo.id}
                ativo={ativo}
                tipoInfo={tiposAtivos.find((tipo) => tipo.id === ativo.tipo)}
                onManage={() => handleOpenManage(ativo)}
              />
            ))}
          </div>
        ) : null}

        {!loading && filteredAtivos.length === 0 ? (
          <EmptyState
            title="Nenhum ativo encontrado"
            description={searchTerm ? 'Tente buscar por outro termo' : 'Nenhum ativo cadastrado ainda'}
            icon={<span className="text-4xl">📦</span>}
          />
        ) : null}

        {filteredAtivos.length > 0 ? (
          <div className="text-sm text-gray-600">
            Total de <span className="font-semibold">{totalAtivos}</span> ativo(s)
            {searchTerm ? ` encontrado(s) para "${searchTerm}"` : null}
          </div>
        ) : null}
      </div>

      <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar ativo</DialogTitle>
        <DialogContent>
          <Stack spacing={3} className="mt-2">
            {formError ? <Alert severity="error">{formError}</Alert> : null}
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
            {newHasIp ? (
              <TextField
                label="IP (Opcional)"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: 192.168.1.10"
              />
            ) : null}
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

      <Dialog open={openManage} onClose={handleCloseManage} fullWidth maxWidth="sm">
        <DialogTitle>Gerenciar ativo</DialogTitle>
        <DialogContent>
          <Stack spacing={3} className="mt-2">
            {manageError ? <Alert severity="error">{manageError}</Alert> : null}
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
            {editHasIp ? (
              <TextField
                label="IP (Opcional)"
                value={editIp}
                onChange={(e) => setEditIp(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: 192.168.1.10"
              />
            ) : null}
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

            <div className="border-t pt-4">
              <p className="font-semibold text-sm text-gray-900 mb-3">Relacionamentos</p>

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
                setManageError(getApiErrorMessage(err) || 'Erro ao deletar ativo')
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
