export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>, headers?: string[]) {
  const safeHeaders = headers ?? Object.keys(rows[0] ?? {})
  const csvRows = [safeHeaders.join(',')]

  rows.forEach((row) => {
    const values = safeHeaders.map((header) => {
      const value = row[header]
      const normalized = value == null ? '' : String(value)
      const escaped = normalized.replace(/\r?\n/g, ' ').replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  })

  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
