'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function SubscribePage() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in to Subscribe
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access our subscription plans.
          </p>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Checkout failed: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Failed to start checkout:', err);
      setError('Unable to start checkout. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Choose Your Plan
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Get full access to all features
        </p>

        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Pro Plan</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            $9.99<span className="text-sm font-normal text-gray-500">/month</span>
          </p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>✓ Full access to all features</li>
            <li>✓ Priority support</li>
            <li>✓ Cancel anytime</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={isSubscribing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubscribing ? 'Processing...' : 'Subscribe Now'}
        </button>
      </div>
    </main>
  );
}
