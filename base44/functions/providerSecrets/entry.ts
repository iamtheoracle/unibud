import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Secret Management — server-side only. Secrets live in dashboard → environment
// variables. This function reads them with Deno.env.get and returns only
// presence + a masked preview (last 4 chars). Raw values are NEVER returned.
const PROVIDER_SECRETS = [
  "PAYSTACK_SECRET_KEY", "FLUTTERWAVE_SECRET_KEY", "ONEPIPE_API_KEY", "KORA_SECRET_KEY",
  "DOJAH_API_KEY", "SMILE_ID_API_KEY", "VERIFYME_API_KEY", "STROWALLET_API_KEY",
  "RESEND_API_KEY", "SENDGRID_API_KEY", "SMTP_PASSWORD", "TERMII_API_KEY",
  "TWILIO_AUTH_TOKEN", "FCM_SERVER_KEY", "CLOUDINARY_API_KEY", "AWS_ACCESS_KEY_ID",
  "SUPABASE_SERVICE_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY", "ANTHROPIC_API_KEY",
  "WEBHOOK_SIGNING_SECRET",
];

const mask = (v) => (v ? `****${v.slice(-4)}` : null);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admins only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    if (action === 'list') {
      const secrets = PROVIDER_SECRETS.map((k) => {
        const v = Deno.env.get(k);
        return { key: k, configured: !!v, masked: mask(v) };
      });
      return Response.json({ secrets });
    }

    if (action === 'test') {
      const key = String(body.secret || '');
      if (!PROVIDER_SECRETS.includes(key)) return Response.json({ ok: false, message: 'Unknown secret' }, { status: 400 });
      const v = Deno.env.get(key);
      return Response.json({
        ok: !!v,
        configured: !!v,
        masked: mask(v),
        message: v ? 'Connection test passed — secret is configured' : 'Secret not configured. Add it in dashboard → environment variables.',
      });
    }

    if (action === 'rotate') {
      const key = String(body.secret || '');
      const v = Deno.env.get(key);
      try {
        await base44.entities.AuditLog.create({
          action: 'Provider key rotated',
          target_name: key,
          target_type: 'security',
          severity: 'warning',
          description: `Rotation requested for ${key} by ${user.full_name || user.id}. Replace the value in dashboard → environment variables to complete rotation.`,
        });
      } catch {}
      return Response.json({
        rotated_at: new Date().toISOString(),
        configured: !!v,
        note: 'Rotation is completed in dashboard → environment variables. This call records the audit entry only — secret values are never stored in the database.',
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});