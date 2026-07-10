import React from 'react'

interface LayoutProps {
  header: React.ReactNode
  sidebar: React.ReactNode
  children: React.ReactNode
}

export default function Layout({ header, sidebar, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {header}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {sidebar}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
