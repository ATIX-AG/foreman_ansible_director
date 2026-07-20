import { useState, useEffect, useCallback } from 'react';
import { APIOptions } from 'foremanReact/common/hooks/API/APIHooks';

export interface UseFetchOptions {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  url: string;
  payload?: string;
  options?: APIOptions;
  enabled?: boolean;
}

export interface UseFetchReturn<T> {
  response: T | null;
  status: 'IDLE' | 'PENDING' | 'RESOLVED' | 'ERROR';
  error: Error | null;
  refetch: () => void;
}

const getcsrfToken = (): string => {
  const token = document.querySelector('meta[name="csrf-token"]');

  // The CSRF token is stored inside this HTML element.
  // There is no proper way to type this.
  // @ts-ignore TS2339
  return token ? token.content : '';
};

/**
 * A custom hook to fetch data using the native Fetch API.
 * This is very similar to useApi, but the hook can be disabled, which is useful
 * for conditionals or dependencies.
 *
 * @param method HTTP method
 * @param url The URL to fetch
 * @param options Optional configuration (method, body, headers)
 * @param enabled Optional flag to enable or disable this hook (enabled === true by default)
 * @returns Object containing data, status, error, and a refetch function
 */
export const useFetch = <T = unknown>({
  method,
  url,
  payload = '',
  enabled = true,
}: UseFetchOptions
): UseFetchReturn<T> => {

  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'RESOLVED' | 'ERROR'>('IDLE');
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    // If the need for AbortController ever arises, it can be put here
    if (!enabled) {
      setData(null);
      setStatus('IDLE');
      setError(null);
      return;
    }

    setStatus('PENDING');
    setError(null);
    setData(null);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getcsrfToken(),
          Accept: 'application/json',
        },
        body: method !== 'get' ? payload : null,
      };

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP error, status: ${response.status}`);
      }

      const result: T = await response.json();
      setData(result);
      setStatus('RESOLVED');
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus('ERROR');
    }
  }, [enabled, method, payload, url]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const refetch = (): void => {
    void fetchData();
  };

  return {
    response: data,
    status,
    error,
    refetch,
  };
};
