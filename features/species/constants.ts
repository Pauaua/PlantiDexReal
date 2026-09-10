import type { ConservationStatus } from '@db/schema';

export const CONSERVATION_STATUS_LABELS: Record<ConservationStatus, string> = {
  least_concern: 'Preocupación menor',
  near_threatened: 'Casi amenazada',
  vulnerable: 'Vulnerable',
  endangered: 'En peligro',
  critically_endangered: 'En peligro crítico',
  extinct_in_the_wild: 'Extinta en estado salvaje',
  unknown: 'Desconocido',
};

export function getConservationStatusLabel(status: string): string {
  return (CONSERVATION_STATUS_LABELS as Record<string, string>)[status] ?? status;
}
