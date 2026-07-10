import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatTimeAgo(value: string | Date | number): string {
  const date = typeof value === 'string' ? new Date(value) : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'agora mesmo'
  }

  if (date.getTime() > Date.now()) {
    return 'agora mesmo'
  }

  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: ptBR,
  })
}
