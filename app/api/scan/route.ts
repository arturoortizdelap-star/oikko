import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { image, modelo, apiKey } = await req.json()

  const prompt = `Analiza esta imagen de ropa. Extrae en JSON con estos campos exactos:
{
  "nombre": "nombre del producto",
  "descripcion": "descripción breve",
  "color": "color principal",
  "categoria": "tipo de prenda (vestido, blusa, pantalón, etc)"
}
Solo responde el JSON, sin texto extra.`

  try {
    let result: any = {}

    if (modelo.startsWith('google/')) {
      const model = modelo.replace('google/', '')
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/jpeg', data: image.split(',')[1] } }
            ]
          }]
        })
      })
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
      result = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())

    } else if (modelo.startsWith('openai/')) {
      const model = modelo.replace('openai/', '')
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: image } }
            ]
          }],
          response_format: { type: 'json_object' }
        })
      })
      const data = await res.json()
      result = JSON.parse(data.choices?.[0]?.message?.content || '{}')
    }

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: 'Error al analizar' }, { status: 500 })
  }
}
