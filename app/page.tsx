export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

function diasRestantes(fecha: Date) {
  const hoy = new Date()
  hoy.setHours(0,0,0,0)
  const diff = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default async function Dashboard() {
  const [productos, pedidos, movimientos] = await Promise.all([
    prisma.producto.findMany(),
    prisma.pedido.findMany({ where: { estatus: 'en_camino' }, orderBy: { fechaEstimada: 'asc' } }),
    prisma.movimiento.findMany(),
  ])

  const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0)
  const gastos   = movimientos.filter(m => m.tipo === 'gasto').reduce((a, m) => a + m.monto, 0)
  const stockBajo = productos.filter(p => p.piezas <= 3)

  const cards = [
    { label: 'Productos', value: productos.length, emoji: '📦', color: '--oikko-primary' },
    { label: 'En camino', value: pedidos.length, emoji: '🚢', color: '--oikko-secondary' },
    { label: 'Stock bajo', value: stockBajo.length, emoji: '⚠️', color: '--oikko-accent' },
    { label: 'Balance', value: `$${(ingresos - gastos).toLocaleString()}`, emoji: '💰', color: '#22c55e' },
  ]

  const pedidosConFecha = pedidos.filter(p => p.fechaEstimada)

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6 tracking-wide" style={{ color: 'var(--oikko-text)' }}>Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className="oikko-card glass flex flex-col items-center text-center"
            style={{ borderLeft: `4px solid var(${c.color}, ${c.color})` }}>
            <div className="text-4xl mb-2">{c.emoji}</div>
            <div className="text-3xl font-bold" style={{ color: 'var(--oikko-text)' }}>{c.value}</div>
            <div className="text-xs mt-1" style={{ color: '#888' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Pedidos próximos */}
      {pedidosConFecha.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">🚢 Próximas llegadas</h2>
          <div className="space-y-2">
            {pedidosConFecha.slice(0, 3).map(p => {
              const dias = diasRestantes(p.fechaEstimada!)
              const urgente = dias <= 3
              return (
                <Link key={p.id} href="/pedidos"
                  className="flex justify-between items-center bg-white rounded-xl border px-4 py-3 hover:shadow-sm transition">
                  <div>
                    <span className="font-medium">{p.proveedor || 'Pedido'}</span>
                    <span className="text-xs text-gray-400 ml-2">{p.origen === 'asia' ? '🌏' : '🏠'}</span>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${urgente ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                    {dias <= 0 ? '¡Hoy!' : dias === 1 ? 'Mañana' : `${dias} días`}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Stock bajo */}
      {stockBajo.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">⚠️ Stock bajo</h2>
          <div className="space-y-2">
            {stockBajo.map(p => (
              <div key={p.id} className="bg-white rounded-xl border px-4 py-3 flex justify-between items-center">
                <span className="font-medium">{p.nombre}</span>
                <span className="text-red-500 font-bold">{p.piezas} pzas</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
