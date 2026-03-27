'use client';

import { useState } from 'react';
import { PayPalCheckout } from '@/components/PayPalCheckout';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '0',
    priceDisplay: 'Free',
    description: 'Perfect for getting started',
    features: [
      '1 feedback form',
      'Up to 100 responses/month',
      'Basic analytics',
      'Email support',
    ],
    highlighted: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '29',
    priceDisplay: '$29/mo',
    description: 'For growing businesses',
    features: [
      'Unlimited forms',
      'Up to 10,000 responses/month',
      'AI-powered analysis',
      'CSV import/export',
      'Priority support',
      'Custom branding',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '99',
    priceDisplay: '$99/mo',
    description: 'For large organizations',
    features: [
      'Everything in Professional',
      'Unlimited responses',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handlePlanSelect = (planId: string) => {
    if (planId === 'starter') {
      // For free plan, just redirect to signup
      window.location.href = '/signup';
      return;
    }
    setSelectedPlan(planId);
    setPaymentStatus('idle');
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus('success');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setPaymentStatus('error');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600">FeedbackLens</a>
          <div className="flex gap-4">
            <a href="/login" className="text-gray-600 hover:text-gray-900 font-medium">Login</a>
            <a href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">Sign Up</a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg shadow-lg p-8 ${
                plan.highlighted
                  ? 'bg-blue-600 text-white ring-4 ring-blue-300'
                  : 'bg-white text-gray-900'
              }`}
            >
              {plan.highlighted && (
                <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                  Most Popular
                </div>
              )}
              
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className={`text-sm mb-4 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.priceDisplay}</span>
                {plan.price !== '0' && (
                  <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}>
                    /month
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-green-500'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.highlighted ? 'text-white' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelect(plan.id)}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.price === '0' ? 'Get Started Free' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Modal */}
        {selectedPlan && selectedPlan !== 'starter' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold mb-2">Complete Your Subscription</h2>
              <p className="text-gray-600 mb-6">
                You're subscribing to the{' '}
                <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong> plan
              </p>

              {paymentStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-800 font-semibold">Payment Successful!</p>
                  <p className="text-green-600 text-sm">Redirecting to dashboard...</p>
                </div>
              ) : paymentStatus === 'error' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-4">
                  <p className="text-red-800 font-semibold">Payment Failed</p>
                  <p className="text-red-600 text-sm">Please try again or contact support</p>
                  <button
                    onClick={() => setPaymentStatus('idle')}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <PayPalCheckout
                  plan={selectedPlan as any}
                  amount={plans.find(p => p.id === selectedPlan)?.price || '0'}
                  description={`FeedbackLens ${plans.find(p => p.id === selectedPlan)?.name} Plan`}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}

              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setPaymentStatus('idle');
                }}
                className="w-full mt-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept PayPal and all major credit cards through our secure payment processor.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Our Starter plan is completely free forever with no credit card required. Upgrade anytime.',
              },
              {
                q: 'Can I upgrade or downgrade my plan?',
                a: 'Yes, you can change your plan at any time. Changes take effect immediately with prorated billing.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
