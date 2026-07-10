import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { invalidateEntity, invalidateUser } from '@/lib/query-client';

/**
 * Reusable mutation hook for entity CRUD operations.
 * Supports optimistic updates + automatic cache invalidation so the UI
 * reflects changes instantly without manual refresh.
 *
 * Usage:
 *   const create = useEntityMutation('Todo', 'create');
 *   await create.mutateAsync({ title: 'Buy milk' });
 *
 *   const update = useEntityMutation('Todo', 'update', {
 *     optimistic: (vars) => (old) => old && { ...old, ...vars.data }
 *   });
 *
 * operation: 'create' | 'update' | 'delete' | 'custom'
 */
export function useEntityMutation(entityName, operation, options = {}) {
  const queryClient = useQueryClient();
  const { optimistic, onMutate, onSuccess, onError, invalidate = [entityName], invalidateUser: refreshUser = false } = options;

  const buildMutator = () => {
    const entity = base44.entities[entityName];
    if (!entity) throw new Error(`Entity ${entityName} not found`);
    switch (operation) {
      case 'create':
        return (vars) => entity.create(vars);
      case 'update':
        return (vars) => entity.update(vars.id, vars.data);
      case 'delete':
        return (vars) => entity.delete(vars.id);
      case 'custom':
        return options.mutator;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  };

  const mutator = buildMutator();

  return useMutation({
    mutationFn: mutator,
    onMutate: async (vars) => {
      if (onMutate) onMutate(vars);
      if (!optimistic) return;
      const queryKey = [entityName];
      await queryClient.cancelQueries(queryKey);
      const snapshot = queryClient.getQueriesData(queryKey);
      queryClient.setQueriesData(queryKey, (old) => optimistic(vars)(old));
      return { snapshot };
    },
    onError: (err, vars, context) => {
      if (context?.snapshot) {
        const queryKey = [entityName];
        queryClient.setQueriesData(queryKey, () => context.snapshot);
      }
      if (onError) onError(err, vars, context);
    },
    onSuccess: (data, vars, context) => {
      if (refreshUser) invalidateUser();
      invalidate.forEach((e) => invalidateEntity(e));
      if (onSuccess) onSuccess(data, vars, context);
    },
  });
}