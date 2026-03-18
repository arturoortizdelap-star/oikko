'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EntregarBtn({ id }: { id: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const entregar = async () => {
    if (!confirm('¿Marcar como entregada? Se quitará de la lista.')) return
    setLoading(true)
    await fetch(`/api/composturas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estatus: 'entregada' })
    })
    router.refresh()
  }

  return (
    <button onClick={entregar} disabled={loading}
      className="text-xs px-3 py-1 rounded-full font-semibold text-white"
      style={{ background: 'linear-gradient(135deg,#00E5D1,#00B8A9)' }}>
      {loading ? '...' : '✅ Entregar'}
    </button>
  )
}
