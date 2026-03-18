'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevaCompostura() {
  const router = useRouter()
  const [form, setForm] = useState({ cliente: '', prenda: '', descripcion: '', entrega: '' })
  const [guardando, setGuardando] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const guardar = async () => {
    if (!form.cliente || !form.prenda || !form.descripcion) { alert('Llena los campos obligatorios'); return }
    setGuardando(true)
    await fetch('/api/composturas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    router.push('/composturas')
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-5">✂️ Nueva compostura</h1>
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        {[
          { k: 'cliente', label: 'Nombre de la clienta', placeholder: 'Ej: María García' },
          { k: 'prenda', label: 'Prenda', placeholder: 'Ej: Vestido azul' },
        ].map(({ k, label, placeholder }) => (
          <div key={k}>
            <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>
            <input value={(form as any)[k]} onChange={e => set(k, e.target.value)}
              placeholder={placeholder}
              className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
          </div>
        ))}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Modificación / descripción</label>
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            placeholder="Ej: Meter cintura 2cm, subir dobladillo"
            rows={3}
            className="w-full border rounded-xl p-2 text-sm focus:outline-none resize-none mt-1" />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Fecha de entrega</label>
          <input type="date" value={form.entrega} onChange={e => set('entrega', e.target.value)}
            className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
        </div>
        <button onClick={guardar} disabled={guardando}
          className="w-full py-3 rounded-xl text-white font-bold"
          style={{ background: 'linear-gradient(135deg,#C8420A,#E8341A)' }}>
          {guardando ? 'Guardando...' : '✅ Guardar compostura'}
        </button>
      </div>
    </div>
  )
}
