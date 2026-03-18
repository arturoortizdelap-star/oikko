'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const login = async () => {
    if (!email || !password) { setError('Completa todos los campos'); return }
    setCargando(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error || 'Error al iniciar sesión')
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #f8f8f8 0%, #fff 100%)' }}>

      {/* Logo */}
      <div className="mb-8">
        <img src="/logo.png" alt="OIKKO" className="w-32 h-32 mx-auto rounded-full shadow-lg" />
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl border p-7 shadow-sm">
        <h1 className="text-2xl font-semibold text-center mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Bienvenida
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">Ingresa a tu panel de control</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="tu@correo.com"
              className="w-full border-b border-gray-200 py-2 text-base focus:outline-none mt-1"
              style={{ borderColor: email ? '#00E5D1' : undefined }}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="••••••••"
              className="w-full border-b border-gray-200 py-2 text-base focus:outline-none mt-1"
              style={{ borderColor: password ? '#00E5D1' : undefined }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button onClick={login} disabled={cargando}
            className="w-full py-3 rounded-xl text-white font-bold text-base mt-2"
            style={{ background: 'linear-gradient(135deg, #C8420A, #E8341A)' }}>
            {cargando ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-300 mt-6">OIKKO Studio — Sistema de control</p>
    </div>
  )
}
