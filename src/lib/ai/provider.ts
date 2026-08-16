// AI provider abstraction types and a minimal client-side helper that calls server provider endpoint.
export type AIResponse = { text: string }

export interface AIProvider {
  generateText(prompt: string): Promise<AIResponse>
}

export class ServerAIProvider implements AIProvider{
  async generateText(prompt: string){
    // Use the /api/* path so client and Netlify Functions mapping are consistent.
    const res = await fetch('/api/ai-provider', { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({prompt}) })
    if(!res.ok) throw new Error('AI provider error')
    return res.json()
  }
}
