import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncEngine } from '@features/sync/syncEngineInstance';

import type { CreateSpeciesInput } from '../services/localSpeciesStore';
import { speciesRepository } from '../services/speciesRepository';
import { speciesQueryKeys } from './queryKeys';

export function useCreateSpecies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSpeciesInput) => speciesRepository.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: speciesQueryKeys.list() });
      // Best-effort: try to push it right away so it shows up on the
      // community map sooner. useAutoSync still retries later if this fails.
      void syncEngine.processPending();
    },
  });
}
