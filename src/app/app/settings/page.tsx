'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
  const { user, subscriptionStatus } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageBilling = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Failed to open portal: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      console.error('Failed to open billing portal:', err);
      setError('Unable to open billing portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <Link
            href="/app"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow divide-y">
          {/* Account Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                <span className="font-medium">Status:</span>{' '}
                <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                  subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  subscriptionStatus === 'PAST_DUE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {subscriptionStatus}
                </span>
              </p>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleManageBilling}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Manage Billing'}
              </button>
            </div>
          </div>

          {/* Sign Out Section */}
          <div className="p-6">
            <button
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
