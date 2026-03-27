import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

// Create order or capture payment
export async function POST(request: NextRequest) {
  try {
    const { action, orderId, plan } = await request.json();
    const accessToken = await getAccessToken();

    // Create PayPal order
    if (action === 'create') {
      const amount = plan === 'professional' ? '29.00' : '29.00'; // Default to $29 for now
      
      const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
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
              description: `FeedbackLens ${plan || 'Professional'} Plan - Monthly Subscription`,
            },
          ],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://feedbacklens20260322.vercel.app'}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://feedbacklens20260322.vercel.app'}/pricing?payment=cancelled`,
            brand_name: 'FeedbackLens',
            user_action: 'PAY_NOW',
          },
        }),
      });

      const order = await response.json();
      
      if (!response.ok) {
        console.error('PayPal create order error:', order);
        return NextResponse.json({ error: order.message || 'Failed to create order' }, { status: 400 });
      }

      return NextResponse.json(order);
    }

    // Capture payment
    if (action === 'capture') {
      const response = await fetch(
        `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        console.error('PayPal capture error:', result);
        return NextResponse.json({ error: result.message || 'Capture failed' }, { status: 400 });
      }

      // TODO: Update user subscription in database
      // You can add database update logic here using supabaseAdmin

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('PayPal error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// Verify webhook
export async function GET() {
  return NextResponse.json({ status: 'PayPal endpoint active' });
}
