# Oracle Arc API

Independent service boundary with its own application authentication, deployment, secrets, provider gateway, agent runtime, and audit trail.

## Local smoke test

From this directory, create a virtual environment, install `requirements.txt`, then run:

```bash
uvicorn app.main:app --reload --port 8100
```

- `GET /health` confirms that the API process responds.
- `GET /ready` reports that inference and durable dependencies are not configured.

A healthy process is not evidence that inference, memory, tools, or production security are operational. No live model provider is configured.
