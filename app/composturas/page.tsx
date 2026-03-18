export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import EntregarBtn from './EntregarBtn'

function diasRestantes(fecha: Date) {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000*60*60*24))
}

export default async function Composturas() {
  const composturas = await prisma.compostura.findMany({
    where: { estatus: 'pendiente' },
    orderBy: { entrega: 'asc' }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-semibold">✂️ Composturas</h1>
          <p className="text-sm text-gray-400">{composturas.length} pendientes</p>
        </div>
        <Link href="/composturas/nueva"
          className="px-4 py-2 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg,#C8420A,#E8341A)' }}>
          + Nueva
        </Link>
      </div>

      {composturas.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <div className="text-5xl mb-3">✂️</div>
          <p>Sin composturas pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {composturas.map(c => {
            const dias = c.entrega ? diasRestantes(c.entrega) : null
            const urgente = dias !== null && dias <= 2
            return (
              <div key={c.id} className="bg-white rounded-2xl border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{c.cliente}</p>
                    <p className="text-sm text-gray-500">{c.prenda}</p>
                    <p className="text-xs text-gray-400 mt-1">{c.descripcion}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {dias !== null && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${urgente ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {dias <= 0 ? '¡Hoy!' : dias === 1 ? 'Mañana' : `${dias} días`}
                      </span>
                    )}
                    <EntregarBtn id={c.id} />
                  </div>
                </div>
                {c.entrega && (
                  <p className="text-xs text-gray-400">
                    Entrega: {new Date(c.entrega).toLocaleDateString('es-MX', { day:'numeric', month:'short' })}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
