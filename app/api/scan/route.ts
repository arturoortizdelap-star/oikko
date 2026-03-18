import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { image, modelo, apiKey } = await req.json()

  const prompt = `Analiza esta imagen de ropa. Responde SOLO con este JSON (sin texto extra):
{"nombre":"nombre del producto","descripcion":"descripción breve","color":"color principal","categoria":"tipo de prenda (vestido, blusa, pantalón, etc)"}`

  try {
    let result: any = {}
    const b64 = image.includes(',') ? image.split(',')[1] : image
    const mime = image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'

    if (modelo.startsWith('google/') || modelo.includes('gemini')) {
      const model = modelo.replace('google/', '')
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [
            { inline_data: { mime_type: mime, data: b64 } },
            { text: prompt }
          ]}]})
        }
      )
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
      result = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())

    } else if (modelo.startsWith('anthropic/') || modelo.includes('claude')) {
      const model = modelo.replace('anthropic/', '')
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: model.includes('claude') ? model : `claude-${model}`,
          max_tokens: 300,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: mime, data: b64 } },
            { type: 'text', text: prompt }
          ]}]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || '{}'
      result = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())

    } else if (modelo.startsWith('openai/') || modelo.includes('gpt')) {
      const model = modelo.replace('openai/', '')
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: image } }
          ]}]
        })
      })
      const data = await res.json()
      result = JSON.parse(data.choices?.[0]?.message?.content || '{}')
    }

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
