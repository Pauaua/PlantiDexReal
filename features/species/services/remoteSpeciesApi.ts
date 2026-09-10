import { supabase } from '@lib/supabase';

export interface UpsertSpeciesReportInput {
  id: string;
  commonName: string;
  scientificName: string;
  description: string | null;
  conservationStatus: string;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface SpeciesReport {
  id: string;
  commonName: string;
  scientificName: string;
  conservationStatus: string;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  authorId: string;
  createdAt: string;
}

interface NearbySpeciesRow {
  id: string;
  common_name: string;
  scientific_name: string;
  conservation_status: string;
  latitude: number;
  longitude: number;
  photo_url: string | null;
  author_id: string;
  created_at: string;
}

export const remoteSpeciesApi = {
  async uploadPhoto(localUri: string, path: string): Promise<string> {
    const response = await fetch(localUri);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage.from('species-photos').upload(path, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    if (error) throw error;

    const { data } = supabase.storage.from('species-photos').getPublicUrl(path);
    return data.publicUrl;
  },

  async upsert(input: UpsertSpeciesReportInput): Promise<void> {
    const { error } = await supabase.rpc('upsert_species', {
      p_id: input.id,
      p_common_name: input.commonName,
      p_scientific_name: input.scientificName,
      p_description: input.description,
      p_conservation_status: input.conservationStatus,
      p_latitude: input.latitude,
      p_longitude: input.longitude,
      p_photo_url: input.photoUrl,
      p_created_at: new Date(input.createdAt).toISOString(),
      p_updated_at: new Date(input.updatedAt).toISOString(),
    });
    if (error) throw error;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase.rpc('soft_delete_species', { p_id: id });
    if (error) throw error;
  },

  async listNearby(
    latitude: number,
    longitude: number,
    radiusMeters = 50_000,
  ): Promise<SpeciesReport[]> {
    const { data, error } = await supabase.rpc('nearby_species', {
      lat: latitude,
      lng: longitude,
      radius_m: radiusMeters,
    });
    if (error) throw error;

    return ((data ?? []) as NearbySpeciesRow[]).map((row) => ({
      id: row.id,
      commonName: row.common_name,
      scientificName: row.scientific_name,
      conservationStatus: row.conservation_status,
      latitude: row.latitude,
      longitude: row.longitude,
      photoUrl: row.photo_url,
      authorId: row.author_id,
      createdAt: row.created_at,
    }));
  },

  subscribeToChanges(onChange: () => void): () => void {
    const channel = supabase
      .channel('public:species')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'species' }, onChange)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};

export type RemoteSpeciesApi = typeof remoteSpeciesApi;
