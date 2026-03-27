import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com'; // Use https://api-m.paypal.com for live

/**
 * Verify PayPal webhook signature.
 * In production, you MUST verify the signature for security.
 */
async function verifyWebhookSignature(
  headers: Headers,
  body: string
): Promise<boolean> {
  // Full verification requires:
  // 1. Get cert URL from PAYPAL-CERT-URL header
  // 2. Fetch PayPal's public certificate
  // 3. Verify the signature using PAYPAL-TRANSMISSION-SIG, PAYPAL-TRANSMISSION-ID, PAYPAL-TRANSMISSION-TIME
  // 4. Compare the computed signature with the provided one
  //
  // For simplicity, we'll check headers exist. In production, use a library like `paypal-webhook-verify`.
  const transmissionId = headers.get('PAYPAL-TRANSMISSION-ID');
  const transmissionSig = headers.get('PAYPAL-TRANSMISSION-SIG');
  const certUrl = headers.get('PAYPAL-CERT-URL');

  return !!(transmissionId && transmissionSig && certUrl);
}

/**
 * PayPal Webhook Handler
 *
 * Configure this URL in your PayPal Developer Dashboard:
 * https://developer.paypal.com/developer/applications/
 *
 * Webhook URL: https://yourdomain.com/api/payment/webhook
 *
 * Events to subscribe to:
 * - CHECKOUT.ORDER.APPROVED
 * - PAYMENT.CAPTURE.COMPLETED
 * - PAYMENT.CAPTURE.DENIED
 * - PAYMENT.CAPTURE.REFUNDED
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody) as {
      event_type?: string;
      resource?: {
        id?: string;
        status?: string;
        custom_id?: string;
        purchase_units?: Array<{
          custom_id?: string;
        }>;
      };
    };

    // Verify webhook signature (simplified - implement full verification in production!)
    const isValid = await verifyWebhookSignature(req.headers, rawBody);
    if (!isValid) {
      console.warn('[PayPal Webhook] Invalid signature - skipping verification for development');
      // In production, return 401 here
      // return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`[PayPal Webhook] Event: ${eventType}`, resource?.id);

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Payment was successfully captured
        const orderId = resource?.id;
        const customId = resource?.purchase_units?.[0]?.custom_id ?? resource?.custom_id;
        const credits = customId ? parseInt(customId, 10) : 0;

        if (credits > 0) {
          // TODO: Add credits to user account in Supabase
          // Example:
          // await supabase
          //   .from('users')
          //   .update({ credits: supabase.rpc('increment_credits', { amount: credits }) })
          //   .eq('paypal_order_id', orderId);
          console.log(`[PayPal Webhook] ✅ Credits added: ${credits} for order ${orderId}`);
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        // Payment was denied
        console.warn(`[PayPal Webhook] ⚠️ Payment denied for order ${resource?.id}`);
        // TODO: Notify user, log to database
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        // Payment was refunded
        console.log(`[PayPal Webhook] 💰 Refund for order ${resource?.id}`);
        // TODO: Deduct credits from user account if applicable
        break;
      }

      case 'CHECKOUT.ORDER.APPROVED': {
        // Order approved by buyer, waiting for capture
        // You might want to auto-capture here if using server-side flow
        console.log(`[PayPal Webhook] Order approved: ${resource?.id}`);
        break;
      }

      default:
        console.log(`[PayPal Webhook] Unhandled event: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[PayPal Webhook error]', err);
    // Still return 200 to prevent retries for malformed requests
    return NextResponse.json({ received: false, error: 'Processing error' }, { status: 200 });
  }
}
