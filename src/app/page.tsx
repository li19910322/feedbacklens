import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 导航栏 - 添加Logo和动画效果 */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🔍</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FeedbackLens
            </h1>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/login"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 英雄区 - 更有冲击力 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            ✨ AI-Powered Feedback Analysis
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Customer Feedback
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Into Actionable Insights
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            FeedbackLens uses AI to automatically analyze customer feedback, 
            extract key themes, and help you make data-driven decisions in minutes.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold text-lg"
            >
              🚀 Start Free Trial
            </Link>
            <Link
              href="#features"
              className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all font-semibold text-lg"
            >
              👀 See How It Works
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">No credit card required • Free forever plan available</p>
        </div>
      </section>

      {/* 功能区 - 添加图标和动效 */}
      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h3>
            <p className="text-xl text-gray-600">Everything you need to understand your customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered Analysis',
                description: 'Automatically analyze sentiment, extract themes, and generate summaries with GPT-4',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: '📝',
                title: 'Beautiful Forms',
                description: 'Create custom feedback forms with various question types in seconds',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: '📊',
                title: 'Real-time Analytics',
                description: 'Track feedback trends and visualize insights with interactive charts',
                color: 'from-green-500 to-teal-500',
              },
              {
                icon: '📁',
                title: 'CSV Import',
                description: 'Bulk import feedback data from spreadsheets with one click',
                color: 'from-orange-500 to-yellow-500',
              },
              {
                icon: '💳',
                title: 'Flexible Pricing',
                description: 'Start free, upgrade as you grow with transparent pricing',
                color: 'from-indigo-500 to-purple-500',
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'Enterprise-grade security with SOC 2 compliance',
                color: 'from-red-500 to-orange-500',
              },
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group p-6 border border-gray-100 rounded-2xl hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h4>
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
                ctaLink: '/signup',
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
                ctaLink: '/pricing',
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
                ctaLink: '/pricing',
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
                  href={plan.ctaLink}
                  className={`block text-center py-2 rounded-lg font-semibold cursor-pointer ${
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

      {/* Footer - 更完整 */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🔍</span>
                </div>
                <span className="text-xl font-bold">FeedbackLens</span>
              </div>
              <p className="text-gray-400">AI-powered customer feedback analysis platform</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Resources</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition">API</Link></li>
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition">About</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} FeedbackLens. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
