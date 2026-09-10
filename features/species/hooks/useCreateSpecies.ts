import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateSpeciesInput } from '../services/localSpeciesStore';
import { speciesRepository } from '../services/speciesRepository';
import { speciesQueryKeys } from './queryKeys';

export function useCreateSpecies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSpeciesInput) => speciesRepository.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: speciesQueryKeys.list() });
    },
  });
}
