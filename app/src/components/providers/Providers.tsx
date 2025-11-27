'use client';

/**
 * ZZIK MAP - Global Providers
 * V3: Centralized provider setup
 */

import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { ToastContainer } from '@/components/ui/Toast';

// SWR Global Configuration
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 30000,
  errorRetryCount: 3,
  fetcher: async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      const error = new Error('An error occurred while fetching data');
      throw error;
    }
    return res.json();
  },
};

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
      <ToastContainer />
    </SWRConfig>
  );
}
