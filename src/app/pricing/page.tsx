'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PayPalCheckout } from '@/components/PayPalCheckout';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    period: '',
    amount: '0',
    features: [
      '1 feedback form',
      'Up to 100 responses/month',
      'Basic analytics',
      'Email support',
    ],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$29',
    period: '/month',
    amount: '29',
    features: [
      'Unlimited forms',
      'Up to 10,000 responses/month',
      'AI-powered analysis',
      'CSV import & export',
      'Priority support',
      'Custom branding',
    ],
    highlighted: true,
    cta: 'Subscribe Now',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    amount: '0',
    features: [
      'Everything in Professional',
      'Unlimited responses',
      'Custom integrations',
      'API access',
      'Dedicated support',
      'SLA guarantee',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleSelectPlan = (planId: string) => {
    if (planId === 'starter') {
      window.location.href = '/signup';
      return;
    }
    if (planId === 'enterprise') {
      window.location.href = 'mailto:support@feedbacklens.com?subject=Enterprise%20Plan%20Inquiry';
      return;
    }
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    // Redirect to dashboard or show success message
    window.location.href = '/dashboard?payment=success';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">FeedbackLens</Link>
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">Login</Link>
            <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">Sign Up</Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg ${
                plan.highlighted ? 'ring-2 ring-blue-600 scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens if I exceed my response limit?</h3>
              <p className="text-gray-600">We&apos;ll notify you when you&apos;re approaching your limit. You can upgrade or responses will be paused.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial for paid plans?</h3>
              <p className="text-gray-600">Yes! Start with the Professional plan and get 14 days free. No credit card required.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I cancel my subscription?</h3>
              <p className="text-gray-600">You can cancel anytime from your account settings. Your subscription remains active until the billing period ends.</p>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Complete Your Subscription</h3>
                <button
                  onClick={() => setShowPayment(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold capitalize">{selectedPlan}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold">$29.00/month</span>
                </div>
              </div>

              <PayPalCheckout
                amount="29.00"
                planName="Professional Plan"
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPayment(false)}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 FeedbackLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
