export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeleteVenta from './DeleteVenta'

export default async function Ventas() {
  const ventas = await prisma.venta.findMany({
    include: { items: true },
    orderBy: { fecha: 'desc' }
  })
  const totalMes = ventas
    .filter(v => new Date(v.fecha).getMonth() === new Date().getMonth())
    .reduce((s, v) => s + v.total, 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-semibold">💳 Ventas</h1>
          <p className="text-sm text-gray-400">Este mes: <span className="font-bold" style={{ color: '#C8420A' }}>${totalMes.toLocaleString()}</span></p>
        </div>
        <Link href="/ventas/nueva"
          className="px-4 py-2 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #C8420A, #E8341A)' }}>
          + Nueva venta
        </Link>
      </div>

      {ventas.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <div className="text-5xl mb-3">💳</div>
          <p>Sin ventas registradas</p>
          <Link href="/ventas/nueva" className="text-sm underline mt-1 block" style={{ color: '#C8420A' }}>Registrar primera venta</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {ventas.map(v => (
            <div key={v.id} className="bg-white rounded-2xl border p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold">{v.cliente}</p>
                  {v.telefono && <p className="text-xs text-gray-400">{v.telefono}</p>}
                  <p className="text-xs text-gray-400">{new Date(v.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold" style={{ color: '#C8420A' }}>${v.total.toLocaleString()}</span>
                  <DeleteVenta id={v.id} cliente={v.cliente} />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                {v.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                    {item.imagen && <img src={item.imagen} className="w-6 h-6 rounded object-cover" />}
                    <span className="text-xs">{item.nombre} ×{item.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
