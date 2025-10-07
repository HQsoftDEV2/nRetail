import { useCallback, useEffect, useRef } from 'react';
import { useApi } from './useApi';
import { AxiosRequestConfig } from 'axios';
import { QueryOptions, UseApiOptions } from '@/types/api.types';

export const useQuery = <T = unknown>(
  config: AxiosRequestConfig,
  options: QueryOptions & UseApiOptions = {}
) => {
  const { 
    enabled = true, 
    refetchOnMount = true,
    refetchInterval,
    staleTime,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    onSuccess,
    onError 
  } = options;

  const apiOptions: UseApiOptions = { onSuccess, onError };
  const { data, error, loading, execute, reset } = useApi<T>(apiOptions);
  const hasFetchedRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const shouldFetch = 
      refetchOnMount || 
      !hasFetchedRef.current ||
      (staleTime && Date.now() - lastFetchTimeRef.current > staleTime);

    if (shouldFetch) {
      execute(config);
      hasFetchedRef.current = true;
      lastFetchTimeRef.current = Date.now();
    }
  }, [enabled, refetchOnMount, staleTime, config, execute]);

  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      execute(config);
      lastFetchTimeRef.current = Date.now();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, config, execute]);

  const refetch = useCallback(() => {
    execute(config);
    lastFetchTimeRef.current = Date.now();
  }, [config, execute]);

  const invalidate = useCallback(() => {
    lastFetchTimeRef.current = 0;
    hasFetchedRef.current = false;
  }, []);

  return { 
    data, 
    error, 
    loading, 
    refetch, 
    invalidate,
    reset,
    isError: !!error,
    isSuccess: !loading && !error && data !== null,
    isStale: staleTime ? Date.now() - lastFetchTimeRef.current > staleTime : false,
  };
};
