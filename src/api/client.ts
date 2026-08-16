export async function aiRequest(prompt: string){
  const res = await fetch('/.netlify/functions/ai-provider', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })
  return res.json()
}
