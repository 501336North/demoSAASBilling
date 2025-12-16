'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { PaymentFailedBanner } from '@/components/PaymentFailedBanner';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, subscriptionStatus } = useCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentFailedBanner />

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Link
              href="/app/settings"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-600">
            Your subscription is currently <strong>{subscriptionStatus}</strong>.
          </p>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              This is your protected app content. Only subscribed users can see this.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
