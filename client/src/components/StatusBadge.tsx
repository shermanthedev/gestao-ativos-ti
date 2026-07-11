type StatusBadgeProps = {
  status: string
}

const statusMap: Record<string, { label: string; className: string }> = {
  ALOCADO: { label: 'Alocado', className: 'bg-green-50 text-green-700 border-green-200' },
  EM_ESTOQUE: { label: 'Em Estoque', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  MANUTENCAO: { label: 'Manutenção', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status] ?? { label: status, className: 'bg-gray-50 text-gray-700 border-gray-200' }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}
