import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { remoteSpeciesApi } from '@features/species/services/remoteSpeciesApi';

export interface MapCenter {
  latitude: number;
  longitude: number;
}

const COMMUNITY_REPORTS_KEY = ['map', 'community-reports'] as const;

function communityReportsKey(center: MapCenter) {
  // Rounded so small pans while the map is idle don't create new cache
  // entries; a new fetch only happens when the user taps "search this area".
  return [
    ...COMMUNITY_REPORTS_KEY,
    Math.round(center.latitude * 100) / 100,
    Math.round(center.longitude * 100) / 100,
  ] as const;
}

export function useCommunityReports(center: MapCenter | null, radiusMeters = 50_000) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: center ? communityReportsKey(center) : [...COMMUNITY_REPORTS_KEY, 'idle'],
    queryFn: () => remoteSpeciesApi.listNearby(center!.latitude, center!.longitude, radiusMeters),
    enabled: Boolean(center),
  });

  useEffect(() => {
    if (!center) return undefined;

    return remoteSpeciesApi.subscribeToChanges(() => {
      void queryClient.invalidateQueries({ queryKey: COMMUNITY_REPORTS_KEY });
    });
  }, [center, queryClient]);

  return query;
}
