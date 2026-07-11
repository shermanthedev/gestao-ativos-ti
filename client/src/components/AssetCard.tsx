import {
  CalendarToday as CalendarTodayIcon,
  DesktopMac as DesktopMacIcon,
  DesktopWindows as DesktopIcon,
  DevicesOther as DevicesOtherIcon,
  Laptop as LaptopIcon,
  LocalOffer as LocalOfferIcon,
  Phone as PhoneIcon,
  Power as PowerIcon,
  Print as PrintIcon,
  QrCodeScanner as QrCodeScannerIcon,
  SettingsEthernet as SettingsEthernetIcon,
  Storage as StorageIcon,
  Wifi as WifiIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import StatusBadge from './StatusBadge'

type Ativo = {
  id: string
  tipo: string
  modelo: string
  numeroSerie?: string | null
  ip?: string
  status: 'EM_ESTOQUE' | 'ALOCADO' | 'MANUTENCAO'
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

type TipoAtivo = {
  id: string
  nome: string
  isIndividual?: boolean
}

type AssetCardProps = {
  ativo: Ativo
  tipoInfo?: TipoAtivo
  onManage: () => void
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

export default function AssetCard({ ativo, tipoInfo, onManage }: AssetCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-indigo-50">{getIconForTipo(ativo.tipo)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-lg">{ativo.modelo}</h3>
                {tipoInfo ? (
                  <span className="ml-3 inline-flex items-center gap-2 text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100 px-2 py-0.5 rounded">
                    {tipoInfo.isIndividual ? 'Individual' : 'Coletivo'}
                  </span>
                ) : null}
              </div>
              <div className="mt-2 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    <LocalOfferIcon className="h-3.5 w-3.5" />
                    {ativo.tipo}
                  </span>
                  <StatusBadge status={ativo.status} />
                </div>

                {ativo.numeroSerie ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Série:</span>
                    {ativo.numeroSerie}
                  </div>
                ) : null}

                {ativo.ip ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">IP:</span>
                    {ativo.ip}
                  </div>
                ) : null}

                <div className="flex items-center gap-2 text-xs text-gray-600 pt-2">
                  <CalendarTodayIcon className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-700">Cadastrado em</p>
                    <p>{formatDate(ativo.createdAt)}</p>
                  </div>
                </div>

                {ativo.status === 'ALOCADO' ? (
                  <div className="mt-2 text-sm text-gray-700">
                    {ativo.funcionario ? (
                      <div>
                        Alocado para: <span className="font-medium">{ativo.funcionario.nome}</span>
                      </div>
                    ) : ativo.setor ? (
                      <div>
                        Alocado para setor: <span className="font-medium">{ativo.setor.nome}</span>
                      </div>
                    ) : (
                      <div>Alocado (destinatário não informado)</div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 sm:items-end sm:text-right">
          <button
            type="button"
            onClick={onManage}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <EditIcon className="h-4 w-4" />
            Gerenciar
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">ID: {ativo.id}</div>
    </div>
  )
}
