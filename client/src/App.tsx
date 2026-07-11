import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Funcionarios from './pages/Funcionarios'
import Setores from './pages/Setores'
import Equipe from './pages/Equipe'
import Ativos from './pages/Ativos'
import Relatorios from './pages/Relatorios'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import PublicRoute from './components/PublicRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/funcionarios" element={<RequireAuth><Funcionarios /></RequireAuth>} />
            <Route path="/setores" element={<RequireAuth><Setores /></RequireAuth>} />
            <Route path="/equipe" element={<RequireAuth><Equipe /></RequireAuth>} />
            <Route path="/ativos" element={<RequireAuth><Ativos /></RequireAuth>} />
            <Route path="/relatorios" element={<RequireAuth><Relatorios /></RequireAuth>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
    </BrowserRouter>
  )
}

export default App
