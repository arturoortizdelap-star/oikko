import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { image, filtro, modelo, apiKey } = await req.json()

  if (!modelo || !apiKey) {
    return NextResponse.json({ error: 'Falta modelo o API key' }, { status: 400 })
  }

  // 1. Obtener todos los productos del inventario
  const productos = await prisma.producto.findMany()
  if (productos.length === 0) {
    return NextResponse.json({ resultados: [] })
  }

  // 2. Construir catálogo para la IA
  const catalogo = productos.map(p => ({
    id: p.id,
    nombre: p.nombre,
    color: p.color,
    categoria: p.categoria,
    descripcion: p.descripcion,
    tallas: p.tallas,
  }))

  const prompt = `Eres un asistente de búsqueda de ropa para una boutique.

${image ? 'Se te proporciona una imagen de una prenda.' : ''}
${filtro ? `El cliente busca: "${filtro}"` : ''}

Catálogo disponible (JSON):
${JSON.stringify(catalogo, null, 2)}

Analiza ${image ? 'la imagen y' : ''} la descripción del cliente.
Devuelve los IDs de los productos que coincidan, ordenados por relevancia.
Solo devuelve JSON con este formato exacto:
{
  "matches": [
    { "id": 1, "razon": "coincide por color y tipo de prenda" },
    { "id": 2, "razon": "similar en estampado" }
  ]
}
Si no hay coincidencias devuelve: { "matches": [] }`

  try {
    let matches: { id: number; razon: string }[] = []

    if (modelo.startsWith('google/')) {
      const model = modelo.replace('google/', '')
      const parts: any[] = [{ text: prompt }]
      if (image) {
        parts.unshift({ inline_data: { mime_type: 'image/jpeg', data: image.split(',')[1] } })
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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
      const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
      matches = parsed.matches || []

    } else if (modelo.startsWith('openai/')) {
      const model = modelo.replace('openai/', '')
      const content: any[] = [{ type: 'text', text: prompt }]
      if (image) content.unshift({ type: 'image_url', image_url: { url: image } })
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content }],
          response_format: { type: 'json_object' }
        })
      })
      const data = await res.json()
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}')
      matches = parsed.matches || []
    }

    // 3. Mapear IDs a productos completos
    const resultados = matches
      .map(m => {
        const p = productos.find(p => p.id === m.id)
        if (!p) return null
        return { ...p, match_razon: m.razon }
      })
      .filter(Boolean)

    return NextResponse.json({ resultados })
  } catch (e) {
    return NextResponse.json({ error: 'Error al procesar búsqueda' }, { status: 500 })
  }
}
