'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIAS_GASTO = [
  { value: 'compras_oficina', label: '🏢 Compras para oficina' },
  { value: 'nomina', label: '👥 Nómina / pagos' },
  { value: 'otros', label: '📋 Otros gastos' },
]

export default function NuevoMovimiento() {
  const router = useRouter()
  const [tipo, setTipo] = useState<'ingreso'|'gasto'>('gasto')
  const [categoria, setCategoria] = useState('otros')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [guardando, setGuardando] = useState(false)

  const guardar = async () => {
    if (!concepto || !monto) { alert('Llena todos los campos'); return }
    setGuardando(true)
    await fetch('/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo,
        categoria: tipo === 'ingreso' ? 'ventas' : categoria,
        concepto,
        monto: Number(monto)
      })
    })
    router.push('/finanzas')
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-5">💰 Registrar movimiento</h1>

      <div className="bg-white rounded-2xl border p-5 space-y-4">
        {/* Tipo */}
        <div className="flex gap-2">
          {(['ingreso','gasto'] as const).map(t => (
            <button key={t} onClick={() => setTipo(t)}
              className="flex-1 py-2 rounded-xl font-bold text-sm transition"
              style={{
                background: tipo === t ? (t === 'ingreso' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#E8341A,#C8420A)') : '#f5f5f5',
                color: tipo === t ? '#fff' : '#888'
              }}>
              {t === 'ingreso' ? '💚 Ingreso' : '🔴 Gasto'}
            </button>
          ))}
        </div>

        {/* Categoría (solo gastos) */}
        {tipo === 'gasto' && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Categoría</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none">
              {CATEGORIAS_GASTO.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Concepto</label>
          <input value={concepto} onChange={e => setConcepto(e.target.value)}
            placeholder="Ej: Pago de nómina semana 12"
            className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Monto $</label>
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)}
            placeholder="0.00"
            className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
        </div>

        <button onClick={guardar} disabled={guardando}
          className="w-full py-3 rounded-xl text-white font-bold"
          style={{ background: 'linear-gradient(135deg,#C8420A,#E8341A)' }}>
          {guardando ? 'Guardando...' : '✅ Guardar'}
        </button>
      </div>
    </div>
  )
}
