import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// PayPal webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event_type;

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment was successful
        const capture = body.resource;
        const customId = capture.custom_id;
        
        if (customId) {
          // Update user subscription
          await supabaseAdmin
            .from('profiles')
            .upsert({
              id: customId,
              plan: 'professional',
              subscription_status: 'active',
              subscription_id: capture.id,
              updated_at: new Date(),
            });
        }
        break;

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED':
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Webhook processing failed';
    return NextResponse.json(
      { error: msg || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
