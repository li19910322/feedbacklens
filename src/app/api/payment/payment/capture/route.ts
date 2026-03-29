import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_API_BASE = 'https://api-m.paypal.com'; // Production environment

/**
 * Generate a PayPal access token using Client Credentials (OAuth2).
 * The token is cached in-memory for simplicity; production should use a store.
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? '';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured in environment.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get PayPal access token: ${text}`);
  }

  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? '';
}

/**
 * Capture an authorized PayPal order (after buyer approval).
 *
 * POST /api/payment/capture
 * Body: { orderId: string, credits: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { orderId?: string; credits?: number };
    const { orderId, credits } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }
    if (!credits || credits <= 0) {
      return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    // Capture the order
    const captureRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!captureRes.ok) {
      const text = await captureRes.text();
      console.error('[PayPal capture error]', text);
      return NextResponse.json(
        { error: 'Failed to capture payment', details: text },
        { status: 500 }
      );
    }

    const captureData = (await captureRes.json()) as {
      id?: string;
      status?: string;
      purchase_units?: Array<{
        payments?: {
          captures?: Array<{ status?: string }>;
        };
      }>;
    };

    const captureStatus = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.status;
    if (captureStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed', status: captureStatus },
        { status: 400 }
      );
    }

    // ✅ Payment captured successfully
    // TODO: Update user credits in Supabase (implement based on your user system)
    // Example:
    // const supabase = createClient();
    // await supabase
    //   .from('users')
    //   .update({ credits: supabase.rpc('increment_credits', { amount: credits }) })
    //   .eq('id', userId);

    return NextResponse.json({
      success: true,
      orderId: captureData.id,
      credits,
      captureStatus,
    });
  } catch (err) {
    console.error('[PayPal capture route error]', err);
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
