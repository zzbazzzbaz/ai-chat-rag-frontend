import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function withBasePath(url?: string | null) {
  if (!url) return ''
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) return url

  const base = import.meta.env.BASE_URL
  if (base === '/') return url

  return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}
