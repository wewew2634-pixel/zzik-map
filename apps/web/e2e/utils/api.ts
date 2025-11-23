import { APIRequestContext } from '@playwright/test';

/**
 * API test utilities
 */

export type ApiResponse<T = unknown> = {
  status: number;
  body: T;
  headers: Record<string, string>;
};

/**
 * Make an API request and return typed response
 */
export async function apiRequest<T = unknown>(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  options?: {
    headers?: Record<string, string>;
    data?: unknown;
  }
): Promise<ApiResponse<T>> {
  const response = await request.fetch(path, {
    method,
    headers: options?.headers,
    data: options?.data,
  });

  let body: T;
  try {
    body = await response.json();
  } catch {
    body = (await response.text()) as T;
  }

  const headers: Record<string, string> = {};
  const responseHeaders = response.headers();
  for (const [key, value] of Object.entries(responseHeaders)) {
    headers[key] = String(value);
  }

  return {
    status: response.status(),
    body,
    headers,
  };
}

/**
 * Wait for condition with timeout
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  options?: {
    timeout?: number;
    interval?: number;
    timeoutMessage?: string;
  }
): Promise<void> {
  const timeout = options?.timeout || 10000;
  const interval = options?.interval || 500;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(options?.timeoutMessage || 'Timeout waiting for condition');
}

/**
 * Clean up test data
 */
export async function cleanup(
  request: APIRequestContext,
  cleanupFn: () => Promise<void>
): Promise<void> {
  try {
    await cleanupFn();
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}
