'use client';

import { useState } from 'react';
import { PayPalCheckout } from './PayPalCheckout';

// Pricing packs
const PACKS = [
  { credits: 50, price: '4.99', label: 'Starter' },
  { credits: 150, price: '9.99', label: 'Standard', popular: true },
  { credits: 400, price: '19.99', label: 'Professional' },
  { credits: 1000, price: '39.99', label: 'Enterprise' },
];

export default function PaymentPage() {
  const [selectedPackIndex, setSelectedPackIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Buy Credits
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Purchase credits to analyze customer feedback with AI
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PACKS.map((pack, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 ${
                pack.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">{pack.label}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    ${pack.price}
                  </span>
                </p>
                <p className="mt-2 text-sm text-gray-500">{pack.credits} credits</p>
                <button
                  onClick={() => setSelectedPackIndex(idx)}
                  className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedPackIndex !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold mb-2">Complete Purchase</h2>
              <p className="text-gray-600 mb-6">
                {PACKS[selectedPackIndex].credits} credits for ${PACKS[selectedPackIndex].price}
              </p>
              <PayPalCheckout
                amount={PACKS[selectedPackIndex].price}
                onSuccess={() => {
                  alert('Payment successful!');
                  setSelectedPackIndex(null);
                }}
                onError={(err) => {
                  console.error(err);
                  alert('Payment failed. Please try again.');
                }}
              />
              <button
                onClick={() => setSelectedPackIndex(null)}
                className="w-full mt-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="font-medium text-gray-900">
                What can I use credits for?
              </dt>
              <dd className="mt-1 text-gray-600">
                Credits are used to analyze customer feedback with AI.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Do credits expire?</dt>
              <dd className="mt-1 text-gray-600">
                No, your credits never expire.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
