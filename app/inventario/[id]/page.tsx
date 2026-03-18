'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

const TALLAS_DEFAULT = ['XS','S','M','L','XL','XXL','Única']

export default function DetalleProducto() {
  const router = useRouter()
  const { id } = useParams()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<any>(null)
  const [tallas, setTallas] = useState<Record<string,number>>({})
  const [tallaPersonal, setTallaPersonal] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    fetch(`/api/productos/${id}`).then(r => r.json()).then(p => {
      setForm(p)
      try { setTallas(JSON.parse(p.tallas || '{}')) } catch { 
        // tallas antiguo formato "S,M,L"
        const arr = (p.tallas || '').split(',').filter(Boolean)
        const obj: Record<string,number> = {}
        arr.forEach((t: string) => obj[t.trim()] = 0)
        setTallas(obj)
      }
    })
  }, [id])

  const totalPiezas = Object.values(tallas).reduce((a: number, b: unknown) => a + (b as number), 0)
  const setTalla = (t: string, v: number) => setTallas(prev => ({ ...prev, [t]: Math.max(0, v) }))
  const agregarTalla = (t: string) => { if (t && !tallas[t]) setTallas(prev => ({ ...prev, [t]: 0 })) }
  const quitarTalla = (t: string) => setTallas(prev => { const n = {...prev}; delete n[t]; return n })

  const onFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((f: any) => ({ ...f, imagen: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const guardar = async () => {
    setGuardando(true)
    await fetch(`/api/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tallas: JSON.stringify(tallas), piezas: totalPiezas })
    })
    router.push('/inventario')
  }

  const eliminar = async () => {
    if (!confirm('¿Eliminar esta prenda?')) return
    setEliminando(true)
    await fetch(`/api/productos/${id}`, { method: 'DELETE' })
    router.push('/inventario')
  }

  if (!form) return <div className="text-center mt-20 text-gray-400">Cargando...</div>

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-5">✏️ Editar producto</h1>

      <div onClick={() => fileRef.current?.click()}
        className="relative w-full rounded-3xl overflow-hidden mb-5 cursor-pointer"
        style={{ minHeight: '200px', background: '#f5f5f5' }}>
        {form.imagen
          ? <img src={form.imagen} className="w-full object-cover rounded-3xl" style={{ maxHeight: '240px' }} />
          : <div className="flex flex-col items-center justify-center h-48"><div className="text-4xl mb-2">📷</div><p className="text-sm text-gray-400">Toca para cambiar foto</p></div>}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">Cambiar foto</div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFoto} />

      <div className="bg-white rounded-2xl border p-5 space-y-3 mb-4">
        {[{k:'nombre',label:'Nombre'},{k:'color',label:'Color'},{k:'categoria',label:'Categoría'},{k:'descripcion',label:'Descripción'}].map(({k,label})=>(
          <div key={k}>
            <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>
            <input value={form[k]||''} onChange={e=>setForm((f:any)=>({...f,[k]:e.target.value}))}
              className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          {[{k:'precio',label:'Precio $'},{k:'costo',label:'Costo $'}].map(({k,label})=>(
            <div key={k}>
              <label className="text-xs text-gray-400 uppercase tracking-wide">{label}</label>
              <input type="number" value={form[k]||0} onChange={e=>setForm((f:any)=>({...f,[k]:Number(e.target.value)}))}
                className="w-full border-b border-gray-200 py-1 text-base focus:outline-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Tallas */}
      <div className="bg-white rounded-2xl border p-5 mb-4">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold">Tallas y piezas</label>
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{background:'#00E5D1',color:'#1A1A1A'}}>Total: {totalPiezas} pzas</span>
        </div>
        {Object.entries(tallas).map(([talla, cant]) => (
          <div key={talla} className="flex items-center gap-3 mb-3">
            <span className="w-10 text-center font-bold text-sm border rounded-lg py-1" style={{borderColor:'#00E5D1'}}>{talla}</span>
            <div className="flex items-center gap-2 flex-1">
              <button onClick={()=>setTalla(talla,(cant as number)-1)} className="w-8 h-8 rounded-full bg-gray-100 font-bold text-lg flex items-center justify-center">−</button>
              <span className="w-8 text-center font-semibold">{cant as number}</span>
              <button onClick={()=>setTalla(talla,(cant as number)+1)} className="w-8 h-8 rounded-full text-white font-bold text-lg flex items-center justify-center" style={{background:'#00E5D1'}}>+</button>
            </div>
            <button onClick={()=>quitarTalla(talla)} className="text-gray-300 hover:text-red-400 text-lg">✕</button>
          </div>
        ))}
        <div className="flex gap-1 flex-wrap mt-2">
          {TALLAS_DEFAULT.filter(t=>!tallas[t]).map(t=>(
            <button key={t} onClick={()=>agregarTalla(t)} className="text-xs px-2 py-1 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-teal-400 hover:text-teal-500">+ {t}</button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input value={tallaPersonal} onChange={e=>setTallaPersonal(e.target.value)} placeholder="Talla personalizada"
            className="flex-1 border rounded-lg px-2 py-1 text-sm focus:outline-none" />
          <button onClick={()=>{agregarTalla(tallaPersonal);setTallaPersonal('')}} className="px-3 py-1 rounded-lg text-white text-sm" style={{background:'#C8420A'}}>+ Agregar</button>
        </div>
      </div>

      <button onClick={guardar} disabled={guardando} className="w-full py-3 rounded-xl text-white font-bold mb-3" style={{background:'linear-gradient(135deg,#00E5D1,#00B8A9)'}}>
        {guardando ? 'Guardando...' : '💾 Guardar cambios'}
      </button>
      <button onClick={eliminar} disabled={eliminando} className="w-full py-3 rounded-xl font-bold border-2 text-red-500 border-red-200 bg-red-50">
        {eliminando ? 'Eliminando...' : '🗑️ Eliminar del inventario'}
      </button>
    </div>
  )
}
