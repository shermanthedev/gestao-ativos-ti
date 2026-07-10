import { useAuth } from '../context/AuthContext'
import { Menu as MenuIcon } from '@mui/icons-material'

interface HeaderProps {
  onMenuToggle: (open: boolean) => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="border-b bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              E
            </div>
            <div>
              <div className="text-lg font-semibold">Gestão de Ativos - TI Esposende</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex sm:items-center sm:gap-4">
              <div className="text-sm text-gray-600">{user ? user.nome : 'Usuário'}</div>
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
    </header>
  )
}
