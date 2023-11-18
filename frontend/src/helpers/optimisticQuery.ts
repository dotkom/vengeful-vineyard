import { QueryKey, useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query"

type QueryFn<T> = (key: QueryKey, optimistic: boolean) => Promise<T>
type OptimisticQueryResult<T> = Omit<UseQueryResult<T, unknown>, "data"> & { data: T | undefined }

export function useOptimisticQuery<T>(
  queryKey: QueryKey,
  queryFn: QueryFn<T>,
  options?: UseQueryOptions<T, unknown, T, [QueryKey, boolean]>
): OptimisticQueryResult<T> {
  const optimisticResult = useQuery<T, unknown, T, [QueryKey, boolean]>(
    [queryKey, true],
    (...args) => queryFn(args, true), // spread the args and pass to queryFn
    {
      ...options,
      retry: 0,
      staleTime: Infinity,
    }
  )

  const standardResult = useQuery<T, unknown, T, [QueryKey, boolean]>(
    [queryKey, false],
    (...args) => queryFn(args, false), // spread the args and pass to queryFn
    {
      ...options,
      enabled: optimisticResult.isFetched,
    }
  )

  const data = standardResult.isSuccess ? standardResult.data : optimisticResult.data

  return {
    ...standardResult,
    data: data,
  }
}
