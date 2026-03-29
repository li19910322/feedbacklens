import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify PayPal webhook signature.
 * In production, you MUST verify the signature for security.
 */
async function verifyWebhookSignature(
  headers: Headers,
  _body: string
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
      // Webhook signature verification failed
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const eventType = event.event_type;
    const resource = event.resource;

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Payment was successfully captured
        const customId = resource?.purchase_units?.[0]?.custom_id ?? resource?.custom_id;
        const credits = customId ? parseInt(customId, 10) : 0;

        if (credits > 0) {
          // TODO: Add credits to user account in Supabase
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        // Payment was denied
        // TODO: Notify user, log to database
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        // Payment was refunded
        // TODO: Deduct credits from user account if applicable
        break;
      }

      case 'CHECKOUT.ORDER.APPROVED': {
        // Order approved by buyer, waiting for capture
        break;
      }

      default:
        break;
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (err) {
    // Still return 200 to prevent retries for malformed requests
    return NextResponse.json({ received: false, error: 'Processing error' }, { status: 200 });
  }
}
