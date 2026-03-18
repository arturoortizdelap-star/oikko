'use client'
import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const TALLAS_DEFAULT = ['XS','S','M','L','XL','XXL','Única']

function NuevoProductoInner() {
  const router = useRouter()
  const params = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nombre: params.get('nombre') || '',
    descripcion: params.get('descripcion') || '',
    color: params.get('color') || '',
    categoria: params.get('categoria') || '',
    precio: 0, costo: 0,
  })
  const [tallas, setTallas] = useState<Record<string,number>>({ 'S': 0, 'M': 0, 'L': 0 })
  const [imagen, setImagen] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [tallaPersonal, setTallaPersonal] = useState('')

  const totalPiezas = Object.values(tallas).reduce((a, b) => a + b, 0)

  const setTalla = (t: string, v: number) => setTallas(prev => ({ ...prev, [t]: Math.max(0, v) }))
  const agregarTalla = (t: string) => { if (t && !tallas[t]) setTallas(prev => ({ ...prev, [t]: 0 })) }
  const quitarTalla = (t: string) => setTallas(prev => { const n = {...prev}; delete n[t]; return n })

  const scanWithAI = async (b64: string) => {
    const modelo = localStorage.getItem('ai_modelo')
    const apiKey = localStorage.getItem('ai_apikey')
    if (!modelo || !apiKey) { alert('Configura el modelo de IA en ⚙️ Config'); return }
    setScanning(true)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: b64, modelo, apiKey })
      })
      const data = await res.json()
      if (data.nombre) setForm(f => ({ ...f, ...data }))
    } catch { alert('Error al analizar imagen') }
    setScanning(false)
  }

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { const b64 = reader.result as string; setImagen(b64); scanWithAI(b64) }
    reader.readAsDataURL(file)
  }

  const guardar = async () => {
    await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tallas: JSON.stringify(tallas), piezas: totalPiezas, imagen })
    })
    router.push('/inventario')
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-5">➕ Nuevo producto</h1>

      {/* Scanner */}
      <div onClick={() => fileRef.current?.click()}
        className="relative w-full rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden mb-5"
        style={{ minHeight: imagen ? 'auto' : '160px', background: imagen ? 'transparent' : 'linear-gradient(135deg,#00E5D1,#00B8A9)', boxShadow: '0 0 25px rgba(0,229,209,0.35)', border: '2px solid rgba(0,229,209,0.5)' }}>
        {imagen ? <img src={imagen} className="w-full object-cover rounded-3xl" style={{ maxHeight: '200px' }} />
          : <><div className="text-5xl mb-2">📷</div><p className="text-white font-semibold">Escanear prenda</p></>}
        {scanning && <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-3xl"><span className="text-white animate-pulse text-lg">🔍 Analizando...</span></div>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onImage} />

      {/* Datos */}
      <div className="bg-white rounded-2xl border p-5 space-y-3 mb-4">
        {[
          { k: 'nombre', label: 'Nombre' },
          { k: 'color', label: 'Color' },
          { k: 'categoria', label: 'Categoría' },
          { k: 'descripcion', label: 'Descripción' },
        ].map(({ k, label }) => (
          <div key={k}>
            <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>
            <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          {[{ k: 'precio', label: 'Precio $' }, { k: 'costo', label: 'Costo $' }].map(({ k, label }) => (
            <div key={k}>
              <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>
              <input type="number" value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: Number(e.target.value) }))}
                className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Tallas + cantidades */}
      <div className="bg-white rounded-2xl border p-5 mb-4">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold">Tallas y piezas</label>
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#00E5D1', color: '#1A1A1A' }}>
            Total: {totalPiezas} pzas
          </span>
        </div>

        {Object.entries(tallas).map(([talla, cant]) => (
          <div key={talla} className="flex items-center gap-3 mb-3">
            <span className="w-10 text-center font-bold text-sm border rounded-lg py-1" style={{ borderColor: '#00E5D1' }}>{talla}</span>
            <div className="flex items-center gap-2 flex-1">
              <button onClick={() => setTalla(talla, cant - 1)} className="w-8 h-8 rounded-full bg-gray-100 font-bold text-lg flex items-center justify-center">−</button>
              <span className="w-8 text-center font-semibold">{cant}</span>
              <button onClick={() => setTalla(talla, cant + 1)} className="w-8 h-8 rounded-full text-white font-bold text-lg flex items-center justify-center" style={{ background: '#00E5D1' }}>+</button>
            </div>
            <button onClick={() => quitarTalla(talla)} className="text-gray-300 hover:text-red-400 text-lg">✕</button>
          </div>
        ))}

        {/* Agregar talla */}
        <div className="flex gap-2 mt-3">
          <div className="flex gap-1 flex-wrap flex-1">
            {TALLAS_DEFAULT.filter(t => !tallas[t]).map(t => (
              <button key={t} onClick={() => agregarTalla(t)}
                className="text-xs px-2 py-1 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-teal-400 hover:text-teal-500">
                + {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <input value={tallaPersonal} onChange={e => setTallaPersonal(e.target.value)}
            placeholder="Talla personalizada"
            className="flex-1 border rounded-lg px-2 py-1 text-sm focus:outline-none" />
          <button onClick={() => { agregarTalla(tallaPersonal); setTallaPersonal('') }}
            className="px-3 py-1 rounded-lg text-white text-sm" style={{ background: '#C8420A' }}>
            + Agregar
          </button>
        </div>
      </div>

      <button onClick={guardar}
        className="w-full py-3 rounded-xl text-white font-bold"
        style={{ background: 'linear-gradient(135deg,#C8420A,#E8341A)' }}>
        Guardar producto
      </button>
    </div>
  )
}

export default function NuevoProducto() {
  return <Suspense fallback={<div className="text-center mt-20 text-gray-400">Cargando...</div>}><NuevoProductoInner /></Suspense>
}
