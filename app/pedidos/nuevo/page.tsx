'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoPedido() {
  const router = useRouter()
  const [form, setForm] = useState({
    origen: 'asia',
    proveedor: '',
    notas: '',
    linkRastreo: '',
    fechaEstimada: '',
  })
  const [guardando, setGuardando] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const guardar = async () => {
    if (!form.proveedor.trim()) { alert('Escribe el nombre del proveedor'); return }
    setGuardando(true)
    await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    router.push('/pedidos')
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-5">🚢 Nuevo pedido</h1>

      <div className="bg-white rounded-2xl border p-5 space-y-4">
        {/* Origen */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Origen</label>
          <div className="flex gap-2">
            {[{ v: 'asia', label: '🌏 Asia' }, { v: 'local', label: '🏠 Local' }].map(o => (
              <button key={o.v} onClick={() => set('origen', o.v)}
                className="flex-1 py-2 rounded-xl font-medium text-sm transition"
                style={{
                  background: form.origen === o.v ? 'linear-gradient(135deg, #C8420A, #E8341A)' : '#f5f5f5',
                  color: form.origen === o.v ? '#fff' : '#555'
                }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Proveedor */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Proveedor</label>
          <input value={form.proveedor} onChange={e => set('proveedor', e.target.value)}
            placeholder="Nombre del proveedor"
            className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
        </div>

        {/* Link de rastreo */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Link de rastreo</label>
          <input value={form.linkRastreo} onChange={e => set('linkRastreo', e.target.value)}
            placeholder="https://track.example.com/..."
            className="w-full border-b border-gray-200 py-1 text-sm focus:outline-none" />
        </div>

        {/* Fecha estimada */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Fecha estimada de llegada</label>
          <input type="date" value={form.fechaEstimada} onChange={e => set('fechaEstimada', e.target.value)}
            className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
        </div>

        {/* Notas */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Notas</label>
          <textarea value={form.notas} onChange={e => set('notas', e.target.value)}
            placeholder="Detalles del pedido..."
            rows={3}
            className="w-full border rounded-xl p-2 text-sm focus:outline-none resize-none mt-1" />
        </div>

        <button onClick={guardar} disabled={guardando}
          className="w-full py-3 rounded-xl text-white font-bold"
          style={{ background: 'linear-gradient(135deg, #00E5D1, #00B8A9)' }}>
          {guardando ? 'Guardando...' : '✅ Guardar pedido'}
        </button>
      </div>
    </div>
  )
}
