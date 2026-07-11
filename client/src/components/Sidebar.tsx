import { Link, useLocation } from 'react-router-dom'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
} from '@mui/icons-material'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/funcionarios', label: 'Funcionários', icon: PeopleIcon },
    { path: '/setores', label: 'Setores', icon: BusinessIcon },
    { path: '/equipe', label: 'Minha Equipe', icon: GroupIcon },
    { path: '/ativos', label: 'Ativos', icon: InventoryIcon },
    { path: '/relatorios', label: 'Relatórios', icon: AssessmentIcon },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:block fixed lg:relative z-50 h-screen lg:h-auto w-64 bg-white border border-gray-200 md:rounded-2xl transition-transform duration-300 flex`}
      >
        <div className="p-4 border-b flex items-center justify-between sm:hidden">
          <div className="text-lg font-semibold">Menu</div>
          <button onClick={onClose} aria-label="Fechar menu">
            <CloseIcon />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(path)
                  ? 'font-medium text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
