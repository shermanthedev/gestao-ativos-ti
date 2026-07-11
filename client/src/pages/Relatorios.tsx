import { useEffect, useMemo, useState } from 'react'
import { Download as DownloadIcon, Inventory as InventoryIcon, People as PeopleIcon, Business as BusinessIcon } from '@mui/icons-material'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { api } from '../lib/api'
import { downloadCsv } from '../utils/export'

type Ativo = {
  id: string
  tipo: string
  modelo: string
  numeroSerie?: string | null
  ip?: string
  status: 'EM_ESTOQUE' | 'ALOCADO' | 'MANUTENCAO'
  funcionario?: { nome: string }
  setor?: { nome: string }
}

type Funcionario = {
  id: string
  nome: string
  email: string
  setor?: { nome: string }
}

export default function Relatorios() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [ativosRes, funcionariosRes] = await Promise.all([
          api.get('/ativos', { params: { page: 1, limit: 100 } }),
          api.get('/funcionarios', { params: { page: 1, limit: 100 } }),
        ])
        setAtivos(ativosRes.data.data ?? [])
        setFuncionarios(funcionariosRes.data.data ?? [])
      } catch (err) {
        setError('Não foi possível carregar os dados para os relatórios.')
        console.warn(err)
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [])

  const metrics = useMemo(() => {
    const estoque = ativos.filter((ativo) => ativo.status === 'EM_ESTOQUE').length
    const alocados = ativos.filter((ativo) => ativo.status === 'ALOCADO').length
    const manutencao = ativos.filter((ativo) => ativo.status === 'MANUTENCAO').length
    const semResponsavel = ativos.filter((ativo) => !ativo.funcionario && !ativo.setor).length

    return {
      totalAtivos: ativos.length,
      estoque,
      alocados,
      manutencao,
      semResponsavel,
      funcionarios: funcionarios.length,
    }
  }, [ativos, funcionarios])

  const exportAtivos = () => {
    const rows = ativos.map((ativo) => ({
      modelo: ativo.modelo,
      tipo: ativo.tipo,
      status: ativo.status,
      serie: ativo.numeroSerie ?? '',
      ip: ativo.ip ?? '',
      responsavel: ativo.funcionario?.nome ?? 'Sem responsável',
      setor: ativo.setor?.nome ?? 'Sem setor',
    }))

    downloadCsv('ativos-relatorio.csv', rows)
  }

  const exportFuncionarios = () => {
    const rows = funcionarios.map((funcionario) => ({
      nome: funcionario.nome,
      email: funcionario.email,
      setor: funcionario.setor?.nome ?? 'Sem setor',
    }))

    downloadCsv('funcionarios-relatorio.csv', rows)
  }

  return (
    <Layout
      header={<Header onMenuToggle={setSidebarOpen} />}
      sidebar={<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
    >
      <div className="space-y-6">
        <PageHeader
          title="Relatórios"
          description="Resumo operacional e exportação de dados para análise."
        />

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Ativos cadastrados" value={metrics.totalAtivos} description="Total geral do inventário" />
          <StatCard title="Disponíveis" value={metrics.estoque} description="Em estoque" />
          <StatCard title="Alocados" value={metrics.alocados} description="Em uso" />
          <StatCard title="Em manutenção" value={metrics.manutencao} description="Aguardando revisão" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Exportações rápidas</h3>
                <p className="mt-1 text-sm text-gray-600">Baixe listas prontas para análise em CSV.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={exportAtivos}
                className="flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
              >
                <DownloadIcon className="h-4 w-4" />
                Exportar ativos
              </button>
              <button
                type="button"
                onClick={exportFuncionarios}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <DownloadIcon className="h-4 w-4" />
                Exportar funcionários
              </button>
            </div>
          </section>

          <aside className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Resumo operacional</h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="flex items-center gap-2">
                  <PeopleIcon className="h-4 w-4 text-indigo-500" />
                  Funcionários
                </span>
                <span className="font-semibold text-gray-900">{metrics.funcionarios}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="flex items-center gap-2">
                  <InventoryIcon className="h-4 w-4 text-indigo-500" />
                  Sem responsável
                </span>
                <span className="font-semibold text-gray-900">{metrics.semResponsavel}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="flex items-center gap-2">
                  <BusinessIcon className="h-4 w-4 text-indigo-500" />
                  Setores ativos
                </span>
                <span className="font-semibold text-gray-900">{new Set(ativos.map((ativo) => ativo.tipo)).size}</span>
              </div>
            </div>
          </aside>
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            Carregando relatórios...
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
