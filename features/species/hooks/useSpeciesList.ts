import { useQuery } from '@tanstack/react-query';

import { speciesRepository } from '../services/speciesRepository';
import { speciesQueryKeys } from './queryKeys';

export function useSpeciesList() {
  return useQuery({
    queryKey: speciesQueryKeys.list(),
    queryFn: () => speciesRepository.listAll(),
  });
}
