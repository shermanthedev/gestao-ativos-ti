import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
      {icon ? <div className="mb-2 flex justify-center text-gray-400">{icon}</div> : null}
      <p className="text-gray-600 font-medium">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
