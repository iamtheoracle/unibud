import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 10000);
        const jitter = Math.floor(Math.random() * 500);
        return baseDelay + jitter;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export const ENTITY_QUERY_PREFIX = ['currentUser'];

export function invalidateEntity(entityName) {
  queryClientInstance.invalidateQueries({
    queryKey: [entityName],
  });
}

export function invalidateAll() {
  queryClientInstance.invalidateQueries();
}

export function invalidateUser() {
  queryClientInstance.invalidateQueries({ queryKey: ['currentUser'] });
}

export function setQueryData(entityName, updater) {
  queryClientInstance.setQueriesData(
    { queryKey: [entityName] },
    (old) => (typeof updater === 'function' ? updater(old) : updater)
  );
}