UNIBUD_BUILD_STATUS

what was created
- Project scaffold: Vite + React + TypeScript
- Netlify Functions folder with mock endpoints for AI provider, search, communities, and messages
- UI shell with four primary navigation areas: Square, Connect (contains Search), Communities, Messages
- Bud UI placeholder available globally
- AI provider abstraction (client-side types) and a deterministic mock provider on the server
- Minimal test harness (vitest) skeleton

architecture
- Frontend: React + React Router, Vite build for Netlify static hosting
- Backend: Netlify Functions (serverless) under netlify/functions — provider functions are server-side only
- AI provider abstraction: src/lib/ai/provider.ts — clients call server provider endpoints, providers can be swapped server-side
- Data: in-memory mocks in Netlify Functions (for development). Persistent DB not yet added.

file structure (top-level)
- src/ (app UI and client helpers)
- netlify/functions/ (server-side functions: ai-provider, search, communities, messages)
- tests/ (vitest tests)

what is actually functional
- Shell navigation between four primary areas
- Connect search calls /.netlify/functions/search (mocked)
- Communities list from /.netlify/functions/communities (mocked)
- Messages list and posting via /.netlify/functions/messages (in-memory)
- Bud UI shows a deterministic mock message via /.netlify/functions/ai-provider when used by client-side code

what is mocked
- AI provider is deterministic and intentionally does not call any external LLM providers
- All data is in-memory on the serverless functions (no database yet)

what remains
- Authentication architecture (placeholder only)
- Persistent database and repositories
- Full provider adapters (OpenAI, Anthropic, Gemini)
- Orbit, agents, Guardian, Spark, and other intelligence orchestration layers (foundations only)
- Community creation/joining workflows, moderation, roles, notifications
- Comprehensive tests and CI

tests run
- No tests executed in this commit. A test skeleton is included.

test results
- n/a

environment variables required
- None for development with mocked providers. When integrating real providers, API keys must be set as server-side environment variables and never exposed to the client.

deployment requirements
- Build using `npm run build`
- Deploy the static output to Netlify and configure Netlify Functions to use `netlify/functions` as the functions directory (netlify.toml recommended but not included yet)

next recommended build step
1. Add authentication (Netlify Identity or third-party OIDC) and secure functions behind authenticated API.
2. Add a database (Postgres or Supabase) and move in-memory data to persistent repositories and implement repositories layer.
3. Implement provider adapters server-side and a provider registry (local mock + real providers behind feature flags).
4. Implement Bud+Orbit skeleton server-side that composes context and routes to agents.
5. Expand Communities with creation, membership, posts, comments, and privacy rules.

