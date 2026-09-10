export const speciesQueryKeys = {
  all: ['species'] as const,
  list: () => [...speciesQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...speciesQueryKeys.all, 'detail', id] as const,
};
