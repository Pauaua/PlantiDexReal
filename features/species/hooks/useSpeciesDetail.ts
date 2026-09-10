import { useQuery } from '@tanstack/react-query';

import { speciesRepository } from '../services/speciesRepository';
import { speciesQueryKeys } from './queryKeys';

export function useSpeciesDetail(id: string | undefined) {
  return useQuery({
    queryKey: speciesQueryKeys.detail(id ?? ''),
    queryFn: async () => (await speciesRepository.getById(id as string)) ?? null,
    enabled: Boolean(id),
  });
}
