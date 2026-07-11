import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { api } from '../lib/api'
import { formatTimeAgo } from '../utils/date'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Activity = {
  id: string
  text: string
  createdAt: string
  timeAgo: string
  variant: 'info' | 'success'
}

type TipoCount = {
  tipo: string
  total: number
}

type SummaryMetrics = {
  totalAtivos: number
  ativosEmEstoque: number
  ativosAlocados: number
  ativosManutencao: number
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ativosCount, setAtivosCount] = useState(0)
  const [lastUpdatedText, setLastUpdatedText] = useState('Atualizado há --')
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [ativosByTipo, setAtivosByTipo] = useState<TipoCount[]>([])
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics>({
    totalAtivos: 0,
    ativosEmEstoque: 0,
    ativosAlocados: 0,
    ativosManutencao: 0,
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ativosRes, auditRes, summaryRes] = await Promise.all([
          api.get('/ativos', { params: { page: 1, limit: 1 } }),
          api.get('/auditoria', { params: { take: 5 } }),
          api.get('/ativos/summary'),
        ])

        setAtivosCount(ativosRes.data.total ?? ativosRes.data.data.length)

        const latestAtivo = ativosRes.data.data?.[0]
        if (latestAtivo?.createdAt) {
          setLastUpdatedText(`Atualizado ${formatTimeAgo(latestAtivo.createdAt)}`)
        } else if ((ativosRes.data.total ?? 0) === 0) {
          setLastUpdatedText('Nenhum ativo registrado ainda')
        }

        const activities = (auditRes.data.data ?? []).map((log: any) => ({
          id: log.id,
          text: log.message,
          createdAt: log.createdAt,
          timeAgo: formatTimeAgo(log.createdAt),
          variant: log.action === 'DELETE' ? 'info' : 'success',
        }))

        const summaryData = summaryRes.data as Array<{ tipo: string; total: number; alocados: number; emEstoque: number }>
        const tipoCounts = summaryData.reduce((acc, item) => {
          acc[item.tipo] = (acc[item.tipo] ?? 0) + item.total
          return acc
        }, {} as Record<string, number>)

        const totalAtivos = summaryData.reduce((sum, item) => sum + (item.total ?? 0), 0)
        const ativosEmEstoque = summaryData.reduce((sum, item) => sum + (item.emEstoque ?? 0), 0)
        const ativosAlocados = summaryData.reduce((sum, item) => sum + (item.alocados ?? 0), 0)
        const ativosManutencao = summaryData.reduce((sum, item) => sum + Math.max(0, (item.total ?? 0) - (item.alocados ?? 0) - (item.emEstoque ?? 0)), 0)

        setSummaryMetrics({
          totalAtivos,
          ativosEmEstoque,
          ativosAlocados,
          ativosManutencao,
        })

        setAtivosByTipo(
          Object.entries(tipoCounts)
            .map(([tipo, total]) => ({ tipo, total }))
            .sort((a, b) => b.total - a.total)
        )

        setRecentActivities(activities)
      } catch (err) {
        console.warn('Erro ao carregar dados do dashboard', err)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <Layout
      header={<Header onMenuToggle={setSidebarOpen} />}
      sidebar={<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
    >
      <div>
        <PageHeader title="Painel" description="Visão geral dos ativos e atividades recentes." />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard title="Ativos cadastrados" value={ativosCount} description={lastUpdatedText} />
          <StatCard title="Disponíveis" value={summaryMetrics.ativosEmEstoque} description="Em estoque" />
          <StatCard title="Alocados" value={summaryMetrics.ativosAlocados} description="Em uso" />
          <StatCard title="Manutenção" value={summaryMetrics.ativosManutencao} description="Aguardando revisão" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-sm font-medium text-gray-700">Ativos por tipo</h3>
            <p className="mt-2 text-sm text-gray-600">Tipo de ativo com mais registros no inventário.</p>

            <div className="mt-6 h-80">
              {ativosByTipo.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-400">
                  Nenhum dado de ativos disponível no momento.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ativosByTipo} margin={{ top: 16, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" tick={{ fill: '#6B7280', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                    <Bar dataKey="total" name="Ativos" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <aside className="bg-white rounded-2xl p-6 shadow-sm border">
            <h4 className="text-sm font-medium text-gray-700">Atividades recentes</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              {recentActivities.length === 0 ? (
                <li className="text-gray-400">Nenhuma atividade recente disponível.</li>
              ) : (
                recentActivities.map((activity) => (
                  <li key={activity.id} className="flex items-start gap-3">
                    <span
                      className={`h-2 w-2 rounded-full mt-2 ${activity.variant === 'success' ? 'bg-emerald-500' : 'bg-sky-500'
                        }`}
                    />
                    <div>
                      <div className="font-medium">{activity.text}</div>
                      <div className="text-xs text-gray-400">{activity.timeAgo}</div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </aside>
        </div>
      </div>
    </Layout>
  )
}
