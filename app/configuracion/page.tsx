'use client'
import { useState, useEffect } from 'react'

export default function Configuracion() {
  const [modelo, setModelo] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const m = localStorage.getItem('ai_modelo') || ''
    const k = localStorage.getItem('ai_apikey') || ''
    setModelo(m)
    setApiKey(k)
  }, [])

  const guardar = () => {
    localStorage.setItem('ai_modelo', modelo)
    localStorage.setItem('ai_apikey', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const modelos = [
    { value: 'google/gemini-1.5-flash', label: 'Gemini Flash (recomendado — casi gratis)' },
    { value: 'google/gemini-1.5-pro', label: 'Gemini Pro' },
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'openai/gpt-4o', label: 'GPT-4o' },
    { value: 'anthropic/claude-haiku', label: 'Claude Haiku' },
  ]

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">⚙️ Configuración IA</h1>
      <div className="bg-white rounded-xl border p-6 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium mb-2">Modelo de IA para escáner</label>
          <select value={modelo} onChange={e => setModelo(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
            <option value="">— Selecciona un modelo —</option>
            {modelos.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
            placeholder="Pega tu API key aquí"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          <p className="text-xs text-gray-400 mt-1">Se guarda solo en tu navegador, nunca se sube a ningún servidor.</p>
        </div>
        <button onClick={guardar}
          className="bg-black text-white rounded-lg py-2 font-medium hover:bg-gray-800 transition">
          {saved ? '✅ Guardado' : 'Guardar'}
        </button>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
        <p className="font-medium mb-1">💡 ¿Dónde consigo una API key gratis?</p>
        <ul className="text-gray-600 space-y-1">
          <li>• <a href="https://aistudio.google.com" target="_blank" className="underline">aistudio.google.com</a> → Gemini Flash (1,500 fotos/día gratis)</li>
          <li>• <a href="https://platform.openai.com" target="_blank" className="underline">platform.openai.com</a> → GPT-4o Mini</li>
        </ul>
      </div>
    </div>
  )
}
