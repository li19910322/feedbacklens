import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// PayPal webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event_type;

    console.log('PayPal webhook event:', eventType);

    // Handle different webhook events
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
        // Payment failed or refunded
        console.log('Payment issue:', eventType);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        // Subscription cancelled - downgrade user plan
        // const subscription = body.resource;
        // await supabaseAdmin.from('users').update({ subscription_tier: 'free' }).eq('subscription_id', subscription.id);
        console.log('Subscription cancelled');
        break;

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
