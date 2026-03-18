'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteVenta({ id, cliente }: { id: number; cliente: string }) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)

  const eliminar = async () => {
    if (!confirm(`¿Cancelar venta de ${cliente}? Se restaurará el inventario.`)) return
    setCargando(true)
    await fetch(`/api/ventas/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button onClick={eliminar} disabled={cargando}
      className="text-gray-300 hover:text-red-400 transition text-lg ml-1"
      title="Eliminar venta">
      {cargando ? '⏳' : '🗑️'}
    </button>
  )
}
