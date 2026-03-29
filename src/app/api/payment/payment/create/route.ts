import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_API_BASE = 'https://api-m.paypal.com'; // Production environment

/**
 * Generate a PayPal access token using Client Credentials (OAuth2).
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
 * Create a PayPal order on the server side.
 *
 * POST /api/payment/create
 * Body: { amount: string, credits: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { amount?: string; credits?: number };
    const { amount, credits } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Missing amount' }, { status: 400 });
    }
    if (!credits || credits <= 0) {
      return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
            description: `${credits} Credits – FeedbackLens`,
            custom_id: `${credits}`, // Store credits for reference
          },
        ],
      }),
    });

    if (!orderRes.ok) {
      const text = await orderRes.text();
      console.error('[PayPal create order error]', text);
      return NextResponse.json(
        { error: 'Failed to create order', details: text },
        { status: 500 }
      );
    }

    const orderData = (await orderRes.json()) as {
      id?: string;
      status?: string;
      links?: Array<{ rel?: string; href?: string }>;
    };

    return NextResponse.json({
      id: orderData.id,
      status: orderData.status,
    });
  } catch (err) {
    console.error('[PayPal create route error]', err);
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
