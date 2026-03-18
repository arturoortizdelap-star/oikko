export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function Inventario() {
  const productos = await prisma.producto.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📦 Inventario</h1>
        <Link href="/inventario/nuevo"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          + Agregar producto
        </Link>
      </div>

      {productos.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <div className="text-5xl mb-3">📦</div>
          <p>Sin productos aún</p>
          <Link href="/inventario/nuevo" className="text-black underline text-sm">Agregar el primero</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {productos.map(p => (
            <Link key={p.id} href={`/inventario/${p.id}`}
              className="bg-white rounded-xl border p-4 hover:shadow-md transition">
              {p.imagen && (
                <img src={p.imagen} alt={p.nombre} className="w-full h-36 object-cover rounded-lg mb-3" />
              )}
              <div className="font-semibold">{p.nombre}</div>
              <div className="text-sm text-gray-500">{p.color} {p.categoria && `· ${p.categoria}`}</div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold">${p.precio}</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${p.piezas <= 3 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {p.piezas} pzas
                </span>
              </div>
              {p.tallas && (() => {
                try {
                  const t = JSON.parse(p.tallas)
                  return (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {Object.entries(t).filter(([,v]) => (v as number) > 0).map(([talla, cant]) => (
                        <span key={talla} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {talla}: {cant as number}
                        </span>
                      ))}
                    </div>
                  )
                } catch { return null }
              })()}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
