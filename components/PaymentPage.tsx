'use client';

import { useState } from 'react';
import { PayPalCheckout, CreditsPackCard } from './PayPalCheckout';

// Pricing packs
const PACKS = [
  { credits: 50, price: 4.99, label: 'Starter' },
  { credits: 150, price: 9.99, label: 'Standard', popular: true },
  { credits: 400, price: 19.99, label: 'Professional' },
  { credits: 1000, price: 39.99, label: 'Enterprise' },
];

export default function PaymentPage() {
  const [selectedPack, setSelectedPack] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Buy Credits
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Purchase credits to analyze customer feedback with AI
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PACKS.map((pack, idx) => (
            <CreditsPackCard
              key={idx}
              credits={pack.credits}
              price={pack.price}
              label={pack.label}
              popular={pack.popular}
            />
          ))}
        </div>

        {/* FAQ Section */}
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
                Credits are used to analyze customer feedback with AI. Each feedback
                submission analyzed costs 1 credit.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Do credits expire?</dt>
              <dd className="mt-1 text-gray-600">
                No, your credits never expire. Use them whenever you need.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">
                What payment methods are accepted?
              </dt>
              <dd className="mt-1 text-gray-600">
                We accept PayPal and all major credit cards (Visa, MasterCard, Amex)
                through PayPal's secure payment system.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">
                Is there a refund policy?
              </dt>
              <dd className="mt-1 text-gray-600">
                Unused credits can be refunded within 14 days of purchase. Contact
                support for assistance.
              </dd>
            </div>
          </dl>
        </div>

        {/* Security Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 00-4.5 4.5V8H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                clipRule="evenodd"
              />
            </svg>
            Secured by PayPal · 256-bit SSL encryption
          </div>
        </div>
      </div>
    </div>
  );
}
