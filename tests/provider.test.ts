import { describe, it, expect } from 'vitest'

// Simple deterministic test to ensure mock provider returns expected shape
import fetch from 'node-fetch'

describe('ai-provider mock', ()=>{
  it('returns deterministic text', async ()=>{
    // call the local function URL won't work in CI — this test asserts the handler shape when invoked as module
    const handler = (await import('../netlify/functions/ai-provider.js')).handler
    const event = { body: JSON.stringify({ prompt: 'hello' }) }
    const res = await handler(event)
    const body = JSON.parse(res.body)
    expect(body.text).toContain('MockBud')
  })
})
