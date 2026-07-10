import { useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Layout from '../components/Layout'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Layout
      header={<Header onMenuToggle={setSidebarOpen} />}
      sidebar={<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="text-sm text-gray-500">Ativos cadastrados</div>
          <div className="mt-3 text-2xl font-semibold">1.254</div>
          <div className="text-xs text-gray-400">Atualizado há 2 horas</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="text-sm text-gray-500">Setores</div>
          <div className="mt-3 text-2xl font-semibold">24</div>
          <div className="text-xs text-gray-400">Total de setores ativos</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="text-sm text-gray-500">Usuários TI</div>
          <div className="mt-3 text-2xl font-semibold">3</div>
          <div className="text-xs text-gray-400">Contas com acesso</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="text-sm text-gray-500">Alertas</div>
          <div className="mt-3 text-2xl font-semibold text-rose-600">2</div>
          <div className="text-xs text-gray-400">Itens requerendo atenção</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-700">Resumo recente</h3>
          <div className="mt-4 text-gray-600">
            <p className="text-sm">Aqui podem ficar gráficos, tabelas e listas rápidas com informações relevantes.</p>
          </div>

          <div className="mt-6 h-40 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center text-indigo-400">
            <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5 50 L20 30 L35 40 L50 20 L65 30 L80 15 L95 35 L110 25"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </section>

        <aside className="bg-white rounded-2xl p-6 shadow-sm border">
          <h4 className="text-sm font-medium text-gray-700">Atividades recentes</h4>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="h-2 w-2 bg-indigo-500 rounded-full mt-2" />
              <div>
                <div className="font-medium">Novo ativo registrado</div>
                <div className="text-xs text-gray-400">há 10 minutos</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-2 w-2 bg-rose-500 rounded-full mt-2" />
              <div>
                <div className="font-medium">Alerta de manutenção</div>
                <div className="text-xs text-gray-400">há 2 horas</div>
              </div>
            </li>
          </ul>
        </aside>
      </div>
    </Layout>
  )
}
