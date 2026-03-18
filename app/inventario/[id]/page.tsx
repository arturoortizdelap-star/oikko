'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function DetalleProducto() {
  const router = useRouter()
  const { id } = useParams()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<any>(null)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    fetch(`/api/productos/${id}`).then(r => r.json()).then(setForm)
  }, [id])

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const onFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('imagen', reader.result as string)
    reader.readAsDataURL(file)
  }

  const guardar = async () => {
    setGuardando(true)
    await fetch(`/api/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    router.push('/inventario')
  }

  const eliminar = async () => {
    if (!confirm('¿Eliminar esta prenda del inventario?')) return
    setEliminando(true)
    await fetch(`/api/productos/${id}`, { method: 'DELETE' })
    router.push('/inventario')
  }

  if (!form) return <div className="text-center mt-20 text-gray-400">Cargando...</div>

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-5">✏️ Editar producto</h1>

      {/* Foto */}
      <div onClick={() => fileRef.current?.click()}
        className="relative w-full rounded-3xl overflow-hidden mb-5 cursor-pointer"
        style={{ minHeight: '200px', background: '#f5f5f5' }}>
        {form.imagen ? (
          <img src={form.imagen} className="w-full object-cover rounded-3xl" style={{ maxHeight: '240px' }} />
        ) : (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm text-gray-400">Toca para cambiar foto</p>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          Cambiar foto
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFoto} />

      {/* Formulario */}
      <div className="bg-white rounded-2xl border p-5 space-y-4 mb-4">
        {[
          { k: 'nombre', label: 'Nombre' },
          { k: 'color', label: 'Color' },
          { k: 'categoria', label: 'Categoría' },
          { k: 'tallas', label: 'Tallas (ej: S,M,L)' },
          { k: 'descripcion', label: 'Descripción' },
        ].map(({ k, label }) => (
          <div key={k}>
            <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>
            <input value={form[k] || ''} onChange={e => set(k, e.target.value)}
              className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
          </div>
        ))}
        <div className="grid grid-cols-3 gap-3">
          {[{ k: 'piezas', label: 'Piezas' }, { k: 'precio', label: 'Precio $' }, { k: 'costo', label: 'Costo $' }].map(({ k, label }) => (
            <div key={k}>
              <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>
              <input type="number" value={form[k] || 0} onChange={e => set(k, Number(e.target.value))}
                className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
            </div>
          ))}
        </div>
      </div>

      <button onClick={guardar} disabled={guardando}
        className="w-full py-3 rounded-xl text-white font-bold mb-3"
        style={{ background: 'linear-gradient(135deg, #00E5D1, #00B8A9)' }}>
        {guardando ? 'Guardando...' : '💾 Guardar cambios'}
      </button>

      <button onClick={eliminar} disabled={eliminando}
        className="w-full py-3 rounded-xl font-bold border-2 text-red-500 border-red-200 bg-red-50">
        {eliminando ? 'Eliminando...' : '🗑️ Eliminar del inventario'}
      </button>
    </div>
  )
}
