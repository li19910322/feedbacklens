'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PayPalCheckoutProps {
  amount: string;
  planName?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

export function PayPalCheckout({ amount, planName, onSuccess, onCancel, onError }: PayPalCheckoutProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const createOrder = async () => {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          details: { amount, description: planName || 'FeedbackLens Subscription' },
        }),
      });

      const order = await response.json();
      
      if (!response.ok) {
        throw new Error(order.message || 'Failed to create order');
      }
      
      return order.id;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capture',
          orderId: data.orderID,
        }),
      });

      const result = await response.json();
      
      if (result.status === 'COMPLETED') {
        onSuccess();
      } else {
        onError?.(new Error('Payment not completed'));
      }
    } catch (error) {
      onError?.(error);
    }
  };

  // Check if PayPal is configured
  if (!clientId || clientId === 'placeholder-paypal-id') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800 mb-3">
          PayPal integration requires configuration.
        </p>
        <p className="text-sm text-yellow-700 mb-4">
          Please add your PayPal Client ID to environment variables:
          <code className="bg-yellow-100 px-2 py-1 rounded ml-1">
            NEXT_PUBLIC_PAYPAL_CLIENT_ID
          </code>
        </p>
        <button
          onClick={onSuccess}
          className="text-blue-600 hover:text-blue-700 font-medium underline"
        >
          Skip for now (Demo Mode)
        </button>
      </div>
    );
  }

  return (
    <PayPalScriptProvider 
      options={{ 
        'client-id': clientId,
        currency: 'USD',
        intent: 'capture'
      }}
    >
      <div className="w-full">
        <PayPalButtons
          style={{
            layout: 'vertical',
            shape: 'rect',
            label: 'paypal',
            height: 50,
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onCancel={() => onCancel?.()}
          onError={(err) => {
            console.error('PayPal error:', err);
            onError?.(err);
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
