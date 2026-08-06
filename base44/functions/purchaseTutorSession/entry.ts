import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { tutor_profile_id, session_date, session_time, duration_minutes } = body;
    if (!tutor_profile_id) return Response.json({ error: 'Tutor profile ID required' }, { status: 400 });

    const tutor = await base44.entities.TutorProfile.get(tutor_profile_id);
    if (!tutor) return Response.json({ error: 'Tutor not found' }, { status: 404 });
    if (tutor.is_free || !tutor.hourly_rate) return Response.json({ error: 'This tutor offers free sessions' }, { status: 400 });

    const duration = duration_minutes || 60;
    const unitAmount = Math.round((tutor.hourly_rate * duration / 60) * 100);

    const origin = new URL(req.url).origin;
    const providerUrl = secrets.get('PAYMENT_PROVIDER_URL');
    const providerKey = secrets.get('PAYMENT_PROVIDER_SECRET_KEY');
    if (!providerUrl || !providerKey) return Response.json({ error: 'Payment provider not configured.' }, { status: 503 });

    const params = new URLSearchParams();
    params.append('payment_method_types[]', 'card');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][product_data][name]', `Tutoring: ${tutor.tutor_name}`);
    params.append('line_items[0][price_data][product_data][description]', `${duration} min session on ${session_date} at ${session_time}`);
    params.append('line_items[0][price_data][unit_amount]', unitAmount.toString());
    params.append('line_items[0][quantity]', '1');
    params.append('mode', 'payment');
    params.append('success_url', `${origin}/tutor-hub?paid=${tutor_profile_id}&date=${session_date}&time=${session_time}&duration=${duration}`);
    params.append('cancel_url', `${origin}/tutor-hub?cancelled=1`);
    params.append('metadata[tutor_profile_id]', tutor_profile_id);
    params.append('metadata[user_id]', user.id);
    params.append('metadata[session_date]', session_date || '');
    params.append('metadata[session_time]', session_time || '');
    params.append('metadata[duration_minutes]', duration.toString());

    const response = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + providerKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const session = await response.json();

    if (session.error) {
      console.error('[purchaseTutorSession] Payment error:', session.error.message);
      return Response.json({ error: session.error.message }, { status: 400 });
    }

    return Response.json({ checkout_url: session.url });
  } catch (error) {
    console.error('[purchaseTutorSession] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
