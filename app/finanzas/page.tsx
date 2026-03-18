export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

export default async function Finanzas() {
  const movimientos = await prisma.movimiento.findMany({ orderBy: { fecha: 'desc' } })
  const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0)
  const gastos = movimientos.filter(m => m.tipo === 'gasto').reduce((a, m) => a + m.monto, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">💰 Finanzas</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-sm text-gray-500">Ingresos</div>
          <div className="text-2xl font-bold text-green-600">${ingresos.toLocaleString()}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-sm text-gray-500">Gastos</div>
          <div className="text-2xl font-bold text-red-500">${gastos.toLocaleString()}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-sm text-gray-500">Balance</div>
          <div className={`text-2xl font-bold ${ingresos - gastos >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ${(ingresos - gastos).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        {movimientos.length === 0 ? (
          <div className="text-center text-gray-400 p-10">Sin movimientos aún</div>
        ) : movimientos.map(m => (
          <div key={m.id} className="flex justify-between items-center px-4 py-3 border-b last:border-0">
            <div>
              <div className="font-medium">{m.concepto}</div>
              <div className="text-xs text-gray-400">{new Date(m.fecha).toLocaleDateString('es-MX')}</div>
            </div>
            <span className={`font-bold ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}>
              {m.tipo === 'ingreso' ? '+' : '-'}${m.monto.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
