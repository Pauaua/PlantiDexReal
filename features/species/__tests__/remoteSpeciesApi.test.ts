import { supabase } from '@lib/supabase';

import { remoteSpeciesApi } from '../services/remoteSpeciesApi';

jest.mock('@lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    storage: {
      from: jest.fn(),
    },
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}));

const mockedSupabase = supabase as unknown as {
  rpc: jest.Mock;
  storage: { from: jest.Mock };
  channel: jest.Mock;
  removeChannel: jest.Mock;
};

describe('remoteSpeciesApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('upserts a species report through the RPC', async () => {
    mockedSupabase.rpc.mockResolvedValue({ error: null });

    await remoteSpeciesApi.upsert({
      id: 'sp-1',
      commonName: 'Copihue',
      scientificName: 'Lapageria rosea',
      description: null,
      conservationStatus: 'least_concern',
      latitude: -39.8,
      longitude: -73.2,
      photoUrl: null,
      createdAt: 1000,
      updatedAt: 1000,
    });

    expect(mockedSupabase.rpc).toHaveBeenCalledWith(
      'upsert_species',
      expect.objectContaining({ p_id: 'sp-1', p_common_name: 'Copihue' }),
    );
  });

  it('throws when the upsert RPC fails', async () => {
    mockedSupabase.rpc.mockResolvedValue({ error: new Error('rls violation') });

    await expect(
      remoteSpeciesApi.upsert({
        id: 'sp-1',
        commonName: 'Copihue',
        scientificName: 'Lapageria rosea',
        description: null,
        conservationStatus: 'least_concern',
        latitude: -39.8,
        longitude: -73.2,
        photoUrl: null,
        createdAt: 1000,
        updatedAt: 1000,
      }),
    ).rejects.toThrow('rls violation');
  });

  it('maps nearby species rows', async () => {
    mockedSupabase.rpc.mockResolvedValue({
      error: null,
      data: [
        {
          id: 'sp-1',
          common_name: 'Copihue',
          scientific_name: 'Lapageria rosea',
          conservation_status: 'least_concern',
          latitude: -39.8,
          longitude: -73.2,
          photo_url: null,
          author_id: 'user-1',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    const result = await remoteSpeciesApi.listNearby(-39.8, -73.2, 10_000);

    expect(mockedSupabase.rpc).toHaveBeenCalledWith('nearby_species', {
      lat: -39.8,
      lng: -73.2,
      radius_m: 10_000,
    });
    expect(result).toEqual([
      {
        id: 'sp-1',
        commonName: 'Copihue',
        scientificName: 'Lapageria rosea',
        conservationStatus: 'least_concern',
        latitude: -39.8,
        longitude: -73.2,
        photoUrl: null,
        authorId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('soft-deletes a species through the RPC', async () => {
    mockedSupabase.rpc.mockResolvedValue({ error: null });

    await remoteSpeciesApi.softDelete('sp-1');

    expect(mockedSupabase.rpc).toHaveBeenCalledWith('soft_delete_species', { p_id: 'sp-1' });
  });

  it('uploads a photo and returns its public url', async () => {
    const upload = jest.fn().mockResolvedValue({ error: null });
    const getPublicUrl = jest
      .fn()
      .mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/sp-1.jpg' } });
    mockedSupabase.storage.from.mockReturnValue({ upload, getPublicUrl });

    const originalFetch = global.fetch;
    global.fetch = jest
      .fn()
      .mockResolvedValue({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)) }) as never;

    const url = await remoteSpeciesApi.uploadPhoto('file:///tmp/photo.jpg', 'sp-1.jpg');

    expect(upload).toHaveBeenCalledWith(
      'sp-1.jpg',
      expect.anything(),
      expect.objectContaining({ contentType: 'image/jpeg' }),
    );
    expect(url).toBe('https://cdn.example.com/sp-1.jpg');

    global.fetch = originalFetch;
  });
});
