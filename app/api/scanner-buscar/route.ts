import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { image, filtro, modelo, apiKey } = await req.json()

  if (!modelo || !apiKey) {
    return NextResponse.json({ error: 'Configura modelo y API key en ⚙️ Config' }, { status: 400 })
  }

  const productos = await prisma.producto.findMany()
  if (productos.length === 0) {
    return NextResponse.json({ resultados: [], debug: 'inventario vacío' })
  }

  const catalogo = productos.map(p => ({
    id: p.id,
    nombre: p.nombre,
    color: p.color,
    categoria: p.categoria,
    descripcion: p.descripcion,
    tallas: p.tallas,
  }))

  const promptTexto = `Eres asistente de búsqueda de ropa para una boutique.
${filtro ? `El cliente busca: "${filtro}"` : 'Analiza la imagen de la prenda.'}

Catálogo (JSON):
${JSON.stringify(catalogo)}

Devuelve SOLO este JSON (sin texto extra):
{"matches":[{"id":1,"razon":"razón breve"}]}
Si no hay coincidencias: {"matches":[]}`

  try {
    let matches: { id: number; razon: string }[] = []
    let debugInfo: any = {}

    // ── GEMINI ─────────────────────────────────────────────
    if (modelo.startsWith('google/') || modelo.includes('gemini')) {
      const model = modelo.replace('google/', '')
      const parts: any[] = [{ text: promptTexto }]
      if (image) {
        const b64 = image.includes(',') ? image.split(',')[1] : image
        const mime = image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
        parts.unshift({ inline_data: { mime_type: mime, data: b64 } })
      }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts }] })
        }
      )
      const data = await res.json()
      debugInfo = { status: res.status, gemini: data }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      matches = parsed.matches || []

    // ── ANTHROPIC ──────────────────────────────────────────
    } else if (modelo.startsWith('anthropic/') || modelo.includes('claude')) {
      const model = modelo.replace('anthropic/', '')
      const content: any[] = []
      if (image) {
        const b64 = image.includes(',') ? image.split(',')[1] : image
        const mediaType = image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
        content.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } })
      }
      content.push({ type: 'text', text: promptTexto })
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 500,
          messages: [{ role: 'user', content }]
        })
      })
      const data = await res.json()
      debugInfo = { status: res.status, anthropic: data }
      const text = data.content?.[0]?.text || '{}'
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      matches = parsed.matches || []

    // ── OPENAI ─────────────────────────────────────────────
    } else if (modelo.startsWith('openai/') || modelo.includes('gpt')) {
      const model = modelo.replace('openai/', '')
      const content: any[] = [{ type: 'text', text: promptTexto }]
      if (image) content.unshift({ type: 'image_url', image_url: { url: image } })
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content }] })
      })
      const data = await res.json()
      debugInfo = { status: res.status, openai: data }
      const text = data.choices?.[0]?.message?.content || '{}'
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      matches = parsed.matches || []
    }

    const resultados = matches
      .map((m: any) => {
        const p = productos.find(p => p.id === m.id)
        if (!p) return null
        return { ...p, match_razon: m.razon }
      })
      .filter(Boolean)

    return NextResponse.json({ resultados, debug: debugInfo })

  } catch (e: any) {
    return NextResponse.json({ error: e.message, resultados: [] }, { status: 500 })
  }
}
