import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Your SaaS Product
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A powerful subscription-based service to help you achieve your goals.
          Start your free trial today.
        </p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
