import { useState, useCallback } from "react";
import { AxiosRequestConfig, AxiosError } from "axios";
import { axiosInstance } from "@/api/client";
import { logger } from "@/services/logger.service";
import { MutationOptions } from "@/types/api.types";

export const useMutation = <TData = unknown, TVariables = unknown>(
  options?: MutationOptions
) => {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<AxiosError | null>(null);
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    async (
      config:
        | AxiosRequestConfig
        | ((variables: TVariables) => AxiosRequestConfig),
      variables?: TVariables
    ) => {
      try {
        setLoading(true);
        setError(null);

        const requestConfig =
          typeof config === "function"
            ? config(variables as TVariables)
            : config;

        const response = await axiosInstance.request<TData>(requestConfig);
        setData(response.data);

        if (options?.onSuccess) {
          options.onSuccess(response.data);
        }

        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        setError(error);
        logger.error("Mutation failed", {
          config: typeof config === "function" ? "function" : config,
          variables,
          error: error.message,
          status: error.response?.status,
        });

        if (options?.onError) {
          options.onError(error);
        }

        throw error;
      } finally {
        setLoading(false);
        if (options?.onSettled) {
          options.onSettled();
        }
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
    mutate,
    reset,
    isError: !!error,
    isSuccess: !loading && !error && data !== null,
    isIdle: !loading && !error && data === null,
  };
};
