'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevaVenta() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [cliente, setCliente] = useState('')
  const [telefono, setTelefono] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [scanning, setScanning] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [descripcion, setDescripcion] = useState('')
  const [modoTexto, setModoTexto] = useState(false)

  const scanearProducto = async (b64: string) => {
    const modelo = localStorage.getItem('ai_modelo')
    const apiKey = localStorage.getItem('ai_apikey')
    if (!modelo || !apiKey) { alert('Configura tu modelo de IA en ⚙️ Config'); return }

    setScanning(true)
    try {
      const res = await fetch('/api/scanner-buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: b64, filtro: '', modelo, apiKey })
      })
      const data = await res.json()
      if (data.resultados?.length > 0) {
        const p = data.resultados[0]
        // Verificar que no esté ya en la lista
        if (!items.find(i => i.productoId === p.id)) {
          setItems(prev => [...prev, {
            productoId: p.id,
            nombre: p.nombre,
            precio: p.precio,
            cantidad: 1,
            talla: '',
            imagen: p.imagen
          }])
        } else {
          alert(`${p.nombre} ya está en la venta`)
        }
      } else {
        alert('No encontré esa prenda en inventario')
      }
    } catch { alert('Error al escanear') }
    setScanning(false)
  }

  const onFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => scanearProducto(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const buscarPorDescripcion = async () => {
    if (!descripcion.trim()) return
    const modelo = localStorage.getItem('ai_modelo')
    const apiKey = localStorage.getItem('ai_apikey')
    if (!modelo || !apiKey) { alert('Configura tu modelo de IA en ⚙️ Config'); return }
    setScanning(true)
    try {
      const res = await fetch('/api/scanner-buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: null, filtro: descripcion, modelo, apiKey })
      })
      const data = await res.json()
      if (data.resultados?.length > 0) {
        const p = data.resultados[0]
        if (!items.find(i => i.productoId === p.id)) {
          setItems(prev => [...prev, { productoId: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1, talla: '', imagen: p.imagen }])
          setDescripcion('')
          setModoTexto(false)
        } else { alert(`${p.nombre} ya está en la venta`) }
      } else { alert('No encontré esa prenda') }
    } catch { alert('Error al buscar') }
    setScanning(false)
  }

  const quitarItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))
  const cambiarCantidad = (idx: number, v: number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, cantidad: Math.max(1, v) } : item))
  }

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0)

  const registrar = async () => {
    if (!cliente.trim()) { alert('Escribe el nombre del cliente'); return }
    if (items.length === 0) { alert('Agrega al menos una prenda'); return }
    setGuardando(true)
    await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente, telefono, items })
    })
    router.push('/ventas')
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-5">💳 Nueva venta</h1>

      {/* Cliente */}
      <div className="bg-white rounded-2xl border p-4 mb-4 space-y-3">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Cliente</label>
          <input value={cliente} onChange={e => setCliente(e.target.value)}
            placeholder="Nombre del cliente"
            className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">WhatsApp / Teléfono</label>
          <input value={telefono} onChange={e => setTelefono(e.target.value)}
            placeholder="Opcional"
            className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
        </div>
      </div>

      {/* Agregar prenda */}
      {!modoTexto ? (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => fileRef.current?.click()} disabled={scanning}
            className="py-3 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#00E5D1,#00B8A9)', boxShadow: '0 0 15px rgba(0,229,209,0.3)' }}>
            {scanning ? <><span className="animate-pulse">🔍</span> Buscando...</> : <><span>📷</span> Foto</>}
          </button>
          <button onClick={() => setModoTexto(true)} disabled={scanning}
            className="py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: '#f5f5f5', color: '#555', border: '2px solid #e5e5e5' }}>
            <span>✏️</span> Descripción
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mb-4">
          <input value={descripcion} onChange={e => setDescripcion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscarPorDescripcion()}
            placeholder='Ej: vestido rojo floreado'
            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none" />
          <button onClick={buscarPorDescripcion} disabled={scanning}
            className="px-3 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#00E5D1,#00B8A9)' }}>
            {scanning ? '🔍' : 'Buscar'}
          </button>
          <button onClick={() => setModoTexto(false)} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm">✕</button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFoto} />

      {/* Items */}
      {items.length > 0 && (
        <div className="space-y-3 mb-4">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border p-3 flex gap-3 items-center">
              {item.imagen && <img src={item.imagen} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.nombre}</p>
                <p className="text-sm font-bold" style={{ color: '#C8420A' }}>${item.precio}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => cambiarCantidad(idx, item.cantidad - 1)} className="w-6 h-6 rounded-full bg-gray-100 text-sm font-bold flex items-center justify-center">−</button>
                  <span className="text-sm font-medium">{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(idx, item.cantidad + 1)} className="w-6 h-6 rounded-full bg-gray-100 text-sm font-bold flex items-center justify-center">+</button>
                </div>
              </div>
              <button onClick={() => quitarItem(idx)} className="text-gray-300 hover:text-red-400 text-xl">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Total + confirmar */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border-2 p-4" style={{ borderColor: '#C8420A' }}>
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-500">Total</span>
            <span className="text-2xl font-bold" style={{ color: '#C8420A' }}>${total.toLocaleString()}</span>
          </div>
          <button onClick={registrar} disabled={guardando}
            className="w-full py-3 rounded-xl text-white font-bold text-base"
            style={{ background: 'linear-gradient(135deg, #C8420A, #E8341A)' }}>
            {guardando ? 'Registrando...' : '✅ Confirmar venta'}
          </button>
        </div>
      )}
    </div>
  )
}
