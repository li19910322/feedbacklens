'use client';

import { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PayPalCheckoutProps {
  plan: 'starter' | 'professional' | 'enterprise';
  amount: string;
  description: string;
  onSuccess: () => void;
  onError: (error: any) => void;
}

export function PayPalCheckout({ plan, amount, description, onSuccess, onError }: PayPalCheckoutProps) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const createOrder = async () => {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          details: { amount, description },
        }),
      });

      const order = await response.json();
      setOrderId(order.id);
      return order.id;
    } catch (error) {
      onError(error);
      throw error;
    }
  };

  const onApprove = async (data: any) => {
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
        onError(new Error('Payment not completed'));
      }
    } catch (error) {
      onError(error);
    }
  };

  if (!clientId || clientId === 'placeholder-paypal-id') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800">
          PayPal integration requires configuration. 
          Please add your PayPal Client ID to environment variables.
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId, currency: 'USD' }}>
      <div className="w-full">
        <PayPalButtons
          style={{
            layout: 'vertical',
            shape: 'rect',
            label: 'paypal',
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => onError(err)}
          onCancel={() => {
            console.log('Payment cancelled');
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
