import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3333'

export const api = axios.create({
  baseURL: API_BASE,
})

export function getApiErrorMessage(error: any): string {
  const payload = error?.response?.data

  if (Array.isArray(payload)) {
    const first = payload[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object') {
      return first.message || first.error || first.erro || first.detail || 'Ocorreu um erro inesperado.'
    }
  }

  if (typeof payload === 'string') return payload

  const message = payload?.message || payload?.erro || payload?.error || payload?.detail
  if (typeof message === 'string') return message

  return error?.message || 'Ocorreu um erro inesperado.'
}

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}
