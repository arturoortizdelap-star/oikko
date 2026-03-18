'use client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }
  return (
    <button onClick={logout}
      className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition"
      style={{ color: 'rgba(255,255,255,0.5)' }}>
      🚪 Cerrar sesión
    </button>
  )
}
