import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const ESTATUS: Record<string, { label: string; color: string }> = {
  en_camino:      { label: '🚢 En camino',      color: 'bg-yellow-100 text-yellow-700' },
  en_produccion:  { label: '🏭 En producción',   color: 'bg-blue-100 text-blue-700' },
  terminado:      { label: '✅ Terminado',        color: 'bg-green-100 text-green-700' },
  en_inventario:  { label: '📦 En inventario',   color: 'bg-gray-100 text-gray-700' },
}

export default async function Pedidos() {
  const pedidos = await prisma.pedido.findMany({ orderBy: { fecha: 'desc' } })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🚢 Pedidos en camino</h1>
        <Link href="/pedidos/nuevo"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          + Nuevo pedido
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <div className="text-5xl mb-3">🚢</div>
          <p>Sin pedidos registrados</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map(p => {
            const e = ESTATUS[p.estatus] || { label: p.estatus, color: 'bg-gray-100 text-gray-700' }
            return (
              <Link key={p.id} href={`/pedidos/${p.id}`}
                className="bg-white rounded-xl border p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{p.proveedor || 'Proveedor sin nombre'}</div>
                    <div className="text-sm text-gray-400">{p.origen === 'asia' ? '🌏 Asia' : '🏠 Local'} · {new Date(p.fecha).toLocaleDateString('es-MX')}</div>
                    {p.notas && <div className="text-sm text-gray-500 mt-1">{p.notas}</div>}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${e.color}`}>{e.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
