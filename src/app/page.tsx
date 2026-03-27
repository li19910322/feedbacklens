import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">FeedbackLens</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Login
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Understand Your Customers Better
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            FeedbackLens uses AI to analyze customer feedback, extract insights,
            and help you make data-driven decisions.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-semibold text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI-Powered Analysis',
                description:
                  'Automatically analyze sentiment, extract themes, and generate summaries',
              },
              {
                title: 'Beautiful Forms',
                description:
                  'Create custom feedback forms with various question types',
              },
              {
                title: 'Real-time Analytics',
                description:
                  'Track feedback trends and visualize insights with interactive charts',
              },
              {
                title: 'CSV Import',
                description:
                  'Bulk import feedback data from spreadsheets',
              },
              {
                title: 'Flexible Pricing',
                description:
                  'Start free, upgrade as you grow with transparent pricing',
              },
              {
                title: 'Secure & Private',
                description:
                  'Enterprise-grade security with SOC 2 compliance',
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: 'Free',
                features: [
                  '1 feedback form',
                  'Up to 100 responses/month',
                  'Basic analytics',
                ],
              },
              {
                name: 'Professional',
                price: '$29/mo',
                features: [
                  'Unlimited forms',
                  'Up to 10,000 responses/month',
                  'AI analysis',
                  'CSV import',
                  'Priority support',
                ],
                highlighted: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                features: [
                  'Everything in Professional',
                  'Unlimited responses',
                  'Custom integrations',
                  'Dedicated support',
                ],
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-lg ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                <p className="text-3xl font-bold mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full py-2 rounded-lg font-semibold text-center ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} FeedbackLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
