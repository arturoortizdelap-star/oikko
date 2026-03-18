'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

export default function Scanner() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [imagen, setImagen] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')
  const [scanning, setScanning] = useState(false)
  const [resultados, setResultados] = useState<any[]>([])
  const [error, setError] = useState('')

  const buscar = async (b64?: string) => {
    const modelo = localStorage.getItem('ai_modelo')
    const apiKey = localStorage.getItem('ai_apikey')
    if (!modelo || !apiKey) {
      setError('⚙️ Configura tu modelo de IA primero')
      return
    }
    if (!b64 && !filtro.trim()) return
    setScanning(true)
    setError('')
    setResultados([])

    try {
      const res = await fetch('/api/scanner-buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: b64 || null, filtro, modelo, apiKey })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResultados(data.resultados || [])
    } catch {
      setError('Error al buscar')
    }
    setScanning(false)
  }

  const onImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = reader.result as string
      setImagen(b64)
      setResultados([])
      buscar(b64)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-2">📷 Buscar prenda</h1>
      <p className="text-sm text-gray-400 mb-5">Toma foto o describe la prenda para encontrarla en inventario</p>

      {/* Dos botones: cámara y galería */}
      {!imagen ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment'
            input.onchange = (e: any) => onImagen({ target: { files: e.target.files } } as any)
            input.click()
          }}
            className="flex flex-col items-center justify-center py-5 rounded-2xl text-white font-semibold gap-2"
            style={{ background: 'linear-gradient(135deg,#00E5D1,#00B8A9)', boxShadow: '0 0 20px rgba(0,229,209,0.3)' }}>
            <span className="text-4xl">📷</span>
            <span className="text-sm">Tomar foto</span>
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center py-5 rounded-2xl font-semibold gap-2"
            style={{ background: '#f5f5f5', color: '#555', border: '2px solid #e5e5e5' }}>
            <span className="text-4xl">🖼️</span>
            <span className="text-sm">Subir imagen</span>
          </button>
        </div>
      ) : (
        <div className="relative w-full rounded-3xl overflow-hidden mb-4 cursor-pointer" onClick={() => { setImagen(null); setResultados([]) }}>
          <img src={imagen} className="w-full object-cover rounded-3xl" style={{ maxHeight: '220px' }} />
          {scanning && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-3xl">
              <div className="text-4xl animate-pulse mb-2">🔍</div>
              <p className="text-white font-medium text-sm">Buscando en inventario...</p>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">Cambiar foto</div>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImagen} />

      {/* Filtro texto */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && buscar(imagen || undefined)}
          placeholder='ej: chamarra azul tigres'
          className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
          style={{ outline: 'none' }}
        />
        <button
          onClick={() => buscar(imagen || undefined)}
          disabled={scanning}
          className="px-4 py-3 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #00E5D1, #00B8A9)' }}>
          Buscar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
          {error}
          {error.includes('Configura') && (
            <Link href="/configuracion" className="block mt-1 underline font-medium">Ir a Config →</Link>
          )}
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{resultados.length} resultado(s)</p>
          {resultados.map((p: any) => (
            <Link key={p.id} href={`/inventario/${p.id}`}
              className="block bg-white rounded-2xl border p-4 hover:shadow-md transition"
              style={{ borderColor: '#00E5D1' }}>
              <div className="flex gap-3 items-center">
                {p.imagen && (
                  <img src={p.imagen} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate">{p.nombre}</p>
                  {p.color && <p className="text-sm text-gray-500">{p.color}</p>}
                  {p.categoria && <p className="text-xs text-gray-400">{p.categoria}</p>}
                  <div className="flex gap-3 mt-2">
                    <span className="text-lg font-bold" style={{ color: '#C8420A' }}>${p.precio}</span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${p.piezas <= 3 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {p.piezas} pzas
                    </span>
                  </div>
                  {p.tallas && (
                    <p className="text-xs text-gray-400 mt-1">Tallas: {p.tallas}</p>
                  )}
                </div>
              </div>
              {p.match_razon && (
                <p className="text-xs text-gray-400 mt-2 italic">"{p.match_razon}"</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {resultados.length === 0 && !scanning && (imagen || filtro) && !error && (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">No encontré esa prenda en inventario</p>
          <Link href="/inventario/nuevo" className="text-sm underline mt-1 block" style={{ color: '#00E5D1' }}>
            ¿Quieres agregarla?
          </Link>
        </div>
      )}
    </div>
  )
}
