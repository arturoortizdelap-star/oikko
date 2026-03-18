export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const CATEGORIAS: Record<string, { label: string; emoji: string; color: string }> = {
  ventas:           { label: 'Ventas',            emoji: '💳', color: '#22c55e' },
  compras_oficina:  { label: 'Compras oficina',   emoji: '🏢', color: '#f59e0b' },
  nomina:           { label: 'Nómina',            emoji: '👥', color: '#8b5cf6' },
  otros:            { label: 'Otros gastos',      emoji: '📋', color: '#6b7280' },
}

export default async function Finanzas() {
  const movimientos = await prisma.movimiento.findMany({ orderBy: { fecha: 'desc' } })

  const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0)
  const gastos   = movimientos.filter(m => m.tipo === 'gasto').reduce((a, m) => a + m.monto, 0)
  const balance  = ingresos - gastos

  // Gastos por categoría
  const porCategoria: Record<string, number> = {}
  movimientos.filter(m => m.tipo === 'gasto').forEach(m => {
    const cat = m.categoria || 'otros'
    porCategoria[cat] = (porCategoria[cat] || 0) + m.monto
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold">💰 Finanzas</h1>
        <Link href="/finanzas/nuevo"
          className="px-4 py-2 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg,#C8420A,#E8341A)' }}>
          + Registrar
        </Link>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Ingresos</div>
          <div className="text-lg font-bold text-green-600">${ingresos.toLocaleString()}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Gastos</div>
          <div className="text-lg font-bold text-red-500">${gastos.toLocaleString()}</div>
        </div>
        <div className={`rounded-xl p-3 text-center border ${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-xs text-gray-400 mb-1">Balance</div>
          <div className={`text-lg font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>${balance.toLocaleString()}</div>
        </div>
      </div>

      {/* Desglose gastos */}
      {Object.keys(porCategoria).length > 0 && (
        <div className="bg-white rounded-2xl border p-4 mb-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Desglose de gastos</h2>
          {Object.entries(porCategoria).map(([cat, monto]) => {
            const info = CATEGORIAS[cat] || CATEGORIAS.otros
            return (
              <div key={cat} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm">{info.emoji} {info.label}</span>
                <span className="font-bold text-sm" style={{ color: info.color }}>${monto.toLocaleString()}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Historial */}
      <div className="bg-white rounded-2xl border">
        {movimientos.length === 0 ? (
          <div className="text-center text-gray-400 p-10">Sin movimientos</div>
        ) : movimientos.map(m => {
          const info = CATEGORIAS[m.categoria || 'otros'] || CATEGORIAS.otros
          return (
            <div key={m.id} className="flex justify-between items-center px-4 py-3 border-b last:border-0">
              <div>
                <div className="font-medium text-sm">{m.concepto}</div>
                <div className="text-xs text-gray-400">{info.emoji} {info.label} · {new Date(m.fecha).toLocaleDateString('es-MX')}</div>
              </div>
              <span className={`font-bold ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}>
                {m.tipo === 'ingreso' ? '+' : '-'}${m.monto.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
