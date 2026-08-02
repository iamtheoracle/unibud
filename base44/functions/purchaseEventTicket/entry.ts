import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { event_id } = body;
    if (!event_id) return Response.json({ error: 'Event ID required' }, { status: 400 });

    const event = await base44.entities.CampusEvent.get(event_id);
    if (!event) return Response.json({ error: 'Event not found' }, { status: 404 });
    if (event.is_free || !event.price) return Response.json({ error: 'This is a free event' }, { status: 400 });

    const origin = new URL(req.url).origin;
    const apiKey = secrets.get('STRIPE_SECRET_KEY');

    const params = new URLSearchParams();
    params.append('payment_method_types[]', 'card');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][product_data][name]', event.title);
    if (event.description) {
      params.append('line_items[0][price_data][product_data][description]', event.description.slice(0, 200));
    }
    params.append('line_items[0][price_data][unit_amount]', Math.round(event.price * 100).toString());
    params.append('line_items[0][quantity]', '1');
    params.append('mode', 'payment');
    params.append('success_url', `${origin}/events?purchased=${event_id}`);
    params.append('cancel_url', `${origin}/events?cancelled=${event_id}`);
    params.append('metadata[base44_app_id]', Deno.env.get('BASE44_APP_ID') || '');
    params.append('metadata[event_id]', event_id);
    params.append('metadata[user_id]', user.id);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const session = await response.json();

    if (session.error) {
      console.error('[purchaseEventTicket] Stripe error:', session.error.message);
      return Response.json({ error: session.error.message }, { status: 400 });
    }

    return Response.json({ checkout_url: session.url });
  } catch (error) {
    console.error('[purchaseEventTicket] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}