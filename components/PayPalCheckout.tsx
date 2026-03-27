'use client';

import { useState } from 'react';
import {
  PayPalScriptProvider,
  PayPalButtons,
  FUNDING,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { useRouter } from 'next/navigation';

// --- Inner component: uses the reducer inside provider ---
function PayPalButtonInner({
  amount,
  credits,
  onSuccess,
  onError,
}: {
  amount: string;
  credits: number;
  onSuccess?: (orderId: string) => void;
  onError?: (err: unknown) => void;
}) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApprove = async (orderId: string) => {
    try {
      const res = await fetch('/api/payment/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, credits }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Capture failed');
      }

      onSuccess?.(orderId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment capture failed';
      setErrorMessage(msg);
      onError?.(err);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="ml-3 text-sm text-gray-500">Loading PayPal…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PayPalButtons
        fundingSource={FUNDING.PAYPAL}
        style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: 'USD',
                  value: amount,
                },
                description: `${credits} Credits – FeedbackLens`,
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          const details = await actions.order?.capture();
          if (details?.id) {
            handleApprove(details.id);
          }
        }}
        onError={(err) => {
          const msg = err instanceof Error ? err.message : 'Payment error';
          setErrorMessage(msg);
          onError?.(err);
        }}
        onCancel={() => setErrorMessage(null)}
      />

      {/* Pay with Card button */}
      <PayPalButtons
        fundingSource={FUNDING.CARD}
        style={{ layout: 'vertical', color: 'black', shape: 'rect', label: 'pay' }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: 'USD',
                  value: amount,
                },
                description: `${credits} Credits – FeedbackLens`,
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          const details = await actions.order?.capture();
          if (details?.id) {
            handleApprove(details.id);
          }
        }}
        onError={(err) => {
          const msg = err instanceof Error ? err.message : 'Payment error';
          setErrorMessage(msg);
          onError?.(err);
        }}
      />

      {errorMessage && (
        <p className="text-sm text-red-500 text-center">{errorMessage}</p>
      )}
    </div>
  );
}

// --- Top-level: provides the script context ---
export default function PayPalCheckout({
  amount,
  credits,
  onSuccess,
  onError,
}: {
  amount: string;        // e.g. "9.99"
  credits: number;      // e.g. 100
  onSuccess?: (orderId: string) => void;
  onError?: (err: unknown) => void;
}) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';

  if (!clientId || clientId === 'placeholder-paypal-id') {
    return (
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
        ⚠️ PayPal not configured. Set{' '}
        <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>{' '}
        in <code className="bg-yellow-100 px-1 rounded">.env.local</code> to enable payments.
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
      }}
    >
      <PayPalButtonInner
        amount={amount}
        credits={credits}
        onSuccess={onSuccess}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
}

// --- Pre-built pricing card for easy import ---
export function CreditsPackCard({
  credits,
  price,
  label,
  popular = false,
}: {
  credits: number;
  price: number;
  label: string;
  popular?: boolean;
}) {
  const [purchased, setPurchased] = useState(false);

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        popular
          ? 'border-blue-500 shadow-lg shadow-blue-100 ring-2 ring-blue-500/20'
          : 'border-gray-200 shadow-sm'
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow">
          Most Popular
        </span>
      )}

      <div className="mb-1 text-sm font-medium text-gray-500">{label}</div>
      <div className="mb-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-900">${price}</span>
        <span className="text-gray-400">/ {credits} credits</span>
      </div>

      <p className="mb-6 text-sm text-gray-500">
        ${(price / credits).toFixed(3)} per credit
      </p>

      {purchased ? (
        <div className="mt-auto rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
          ✅ Credits added!
        </div>
      ) : (
        <PayPalCheckout
          amount={price.toFixed(2)}
          credits={credits}
          onSuccess={() => setPurchased(true)}
        />
      )}
    </div>
  );
}
