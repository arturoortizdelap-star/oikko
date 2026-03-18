'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [modo, setModo] = useState<'login' | 'registro'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const login = async () => {
    if (!email || !password) { setError('Completa todos los campos'); return }
    setCargando(true); setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) { router.push('/'); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Error al entrar') }
    setCargando(false)
  }

  const registrar = async () => {
    if (!email || !password || !confirmar) { setError('Completa todos los campos'); return }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 6) { setError('Contraseña mínimo 6 caracteres'); return }
    setCargando(true); setError('')
    const res = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) { router.push('/'); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Error al crear cuenta') }
    setCargando(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #f8f8f8, #fff)' }}>

      <img src="/logo.png" alt="OIKKO" className="w-28 h-28 mx-auto rounded-full shadow-lg mb-6" />

      <div className="w-full max-w-sm bg-white rounded-3xl border p-7 shadow-sm">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
          {(['login','registro'] as const).map(m => (
            <button key={m} onClick={() => { setModo(m); setError('') }}
              className="flex-1 py-2 rounded-lg text-sm font-bold transition"
              style={{ background: modo === m ? 'linear-gradient(135deg,#C8420A,#E8341A)' : 'transparent',
                       color: modo === m ? '#fff' : '#888' }}>
              {m === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (modo === 'login' ? login() : registrar())}
              placeholder="tu@correo.com"
              className="w-full border-b border-gray-200 py-2 text-base focus:outline-none mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (modo === 'login' ? login() : registrar())}
              placeholder="••••••••"
              className="w-full border-b border-gray-200 py-2 text-base focus:outline-none mt-1" />
          </div>
          {modo === 'registro' && (
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Confirmar contraseña</label>
              <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && registrar()}
                placeholder="••••••••"
                className="w-full border-b border-gray-200 py-2 text-base focus:outline-none mt-1" />
            </div>
          )}

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button onClick={modo === 'login' ? login : registrar} disabled={cargando}
            className="w-full py-3 rounded-xl text-white font-bold text-base"
            style={{ background: 'linear-gradient(135deg,#C8420A,#E8341A)' }}>
            {cargando ? '...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-300 mt-6">OIKKO Studio</p>
    </div>
  )
}
