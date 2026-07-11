type StatCardProps = {
  title: string
  value: string | number
  description: string
}

export default function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      <div className="text-xs text-gray-400">{description}</div>
    </div>
  )
}
