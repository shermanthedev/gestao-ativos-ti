import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'

interface HeaderProps {
  onMenuToggle: (open: boolean) => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout, updateProfile } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [formData, setFormData] = useState({ nome: user?.nome ?? '', email: user?.email ?? '', senha: '', confirmarSenha: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleOpenProfileModal = () => {
    setFormData({ nome: user?.nome ?? '', email: user?.email ?? '', senha: '', confirmarSenha: '' })
    setError(null)
    setSuccess(null)
    setProfileOpen(true)
  }

  const handleCloseProfileModal = () => {
    setProfileOpen(false)
    setError(null)
    setSuccess(null)
  }

  const handleSaveProfile = async () => {
    if (!formData.nome.trim()) {
      setError('Informe o nome.')
      return
    }

    if (!formData.email.trim()) {
      setError('Informe o e-mail.')
      return
    }

    if (formData.senha && formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await updateProfile({
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha || undefined,
      })
      setSuccess('Dados atualizados com sucesso.')
      setFormData((current) => ({ ...current, senha: '', confirmarSenha: '' }))
    } catch (err: any) {
      setError(err?.message || 'Não foi possível atualizar o perfil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              E
            </div>
            <div>
              <div className="text-lg font-semibold">Gestão de Ativos - TI Esposende</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex sm:items-center sm:gap-3">
              <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  <PersonIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-900">{user ? user.nome : 'Usuário'}</div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenProfileModal}
                  className="rounded-md p-1 text-gray-500 transition hover:bg-white hover:text-indigo-600"
                  aria-label="Editar perfil"
                >
                  <SettingsIcon className="h-4 w-4" />
                </button>
              </div>
              <button onClick={logout} className="text-sm text-red-600 hover:underline">
                Sair
              </button>
            </div>

            <button
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => onMenuToggle(true)}
              aria-label="Abrir menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={profileOpen} onClose={handleCloseProfileModal} fullWidth maxWidth="sm">
        <DialogTitle>Editar perfil</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} className="mt-2">
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
            <TextField
              label="Nome"
              value={formData.nome}
              onChange={(event) => setFormData((current) => ({ ...current, nome: event.target.value }))}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Nova senha"
              type="password"
              value={formData.senha}
              onChange={(event) => setFormData((current) => ({ ...current, senha: event.target.value }))}
              fullWidth
              variant="outlined"
              placeholder="Deixe em branco para manter a atual"
            />
            <TextField
              label="Confirmar nova senha"
              type="password"
              value={formData.confirmarSenha}
              onChange={(event) => setFormData((current) => ({ ...current, confirmarSenha: event.target.value }))}
              fullWidth
              variant="outlined"
            />
          </Stack>
        </DialogContent>
        <DialogActions className="gap-2 p-4">
          <button
            type="button"
            onClick={handleCloseProfileModal}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </DialogActions>
      </Dialog>
    </header>
  )
}
