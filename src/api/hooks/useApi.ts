import { useState, useCallback } from 'react';
import { AxiosRequestConfig, AxiosError } from 'axios';
import { axiosInstance } from '@/api/client';
import { logger } from '@/services/logger.service';
import { UseApiOptions } from '@/types/api.types';

export const useApi = <T = unknown>(options?: UseApiOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AxiosError | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (config: AxiosRequestConfig) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.request<T>(config);
        setData(response.data);

        if (options?.onSuccess) {
          options.onSuccess(response.data);
        }

        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        setError(error);
        logger.error('API call failed', { 
          config, 
          error: error.message,
          status: error.response?.status,
        });

        if (options?.onError) {
          options.onError(error);
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { 
    data, 
    error, 
    loading, 
    execute, 
    reset,
    isError: !!error,
    isSuccess: !loading && !error && data !== null,
  };
};
