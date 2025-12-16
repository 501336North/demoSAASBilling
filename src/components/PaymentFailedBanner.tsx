'use client';

import React, { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function PaymentFailedBanner() {
  const { isPastDue } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isPastDue) {
    return null;
  }

  const handleUpdatePayment = async () => {
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
      setError('Unable to update payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Payment failed.</strong> Please update your payment method to continue using the service.
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={handleUpdatePayment}
              disabled={isLoading}
              className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium py-1 px-4 rounded text-sm disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Update Payment'}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600 ml-8">{error}</p>
        )}
      </div>
    </div>
  );
}
