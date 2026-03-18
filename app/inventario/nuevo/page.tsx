'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoProducto() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', color: '', tallas: '', piezas: 0, precio: 0, costo: 0, categoria: '' })
  const [imagen, setImagen] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const scanWithAI = async (base64: string) => {
    const modelo = localStorage.getItem('ai_modelo')
    const apiKey = localStorage.getItem('ai_apikey')
    if (!modelo || !apiKey) { alert('Configura el modelo de IA primero en ⚙️ Config'); return }

    setScanning(true)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, modelo, apiKey })
      })
      const data = await res.json()
      if (data.nombre) setForm(f => ({ ...f, ...data }))
    } catch (e) {
      alert('Error al analizar imagen')
    }
    setScanning(false)
  }

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = reader.result as string
      setImagen(b64)
      scanWithAI(b64)
    }
    reader.readAsDataURL(file)
  }

  const guardar = async () => {
    await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, imagen })
    })
    router.push('/inventario')
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">➕ Nuevo producto</h1>

      {/* Scanner */}
      <div className="mb-6 flex flex-col items-center">
        {imagen ? (
          <div onClick={() => fileRef.current?.click()} className="cursor-pointer">
            <img src={imagen} className="w-full max-w-xs h-48 object-cover rounded-2xl" style={{ boxShadow: '0 0 20px rgba(0,229,209,0.4)' }} />
            {scanning && <p className="text-sm text-center mt-2 animate-pulse" style={{ color: '#00E5D1' }}>🔍 Analizando imagen...</p>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-full cursor-pointer transition"
            style={{
              width: '160px',
              height: '160px',
              background: '#00E5D1',
              boxShadow: '0 0 20px rgba(0,229,209,0.4)',
            }}
          >
            <span className="text-5xl">📷</span>
            <span className="text-sm font-medium mt-2" style={{ color: '#1A1A1A' }}>Escanear prenda</span>
          </button>
        )}
        {scanning && !imagen && <p className="text-sm text-center mt-2 animate-pulse" style={{ color: '#00E5D1' }}>🔍 Analizando imagen...</p>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onImage} />

      {/* Formulario */}
      <div className="bg-white rounded-xl border p-5 flex flex-col gap-4">
        {[
          { key: 'nombre', label: 'Nombre', type: 'text' },
          { key: 'color', label: 'Color', type: 'text' },
          { key: 'categoria', label: 'Categoría', type: 'text' },
          { key: 'tallas', label: 'Tallas (ej: S,M,L,XL)', type: 'text' },
          { key: 'descripcion', label: 'Descripción', type: 'text' },
        ].map(({ key, label, type }) => (
          <div key={key}>
            <label className="text-sm font-medium block mb-1">{label}</label>
            <input type={type} value={(form as any)[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        ))}
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'piezas', label: 'Piezas' },
            { key: 'precio', label: 'Precio $' },
            { key: 'costo', label: 'Costo $' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-sm font-medium block mb-1">{label}</label>
              <input type="number" value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
          ))}
        </div>
        <button onClick={guardar}
          className="bg-black text-white rounded-lg py-2 font-medium hover:bg-gray-800 transition">
          Guardar producto
        </button>
      </div>
    </div>
  )
}
