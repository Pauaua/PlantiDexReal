import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useSpeciesDetail } from '../hooks/useSpeciesDetail';
import { useSpeciesList } from '../hooks/useSpeciesList';
import { speciesRepository } from '../services/speciesRepository';

jest.mock('../services/speciesRepository', () => ({
  speciesRepository: {
    listAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

const mockedRepository = speciesRepository as jest.Mocked<typeof speciesRepository>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useSpeciesList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the species from the repository', async () => {
    const rows = [{ id: '1', commonName: 'Copihue' }];
    mockedRepository.listAll.mockResolvedValue(rows as never);

    const { result } = await renderHook(() => useSpeciesList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(rows);
  });
});

describe('useSpeciesDetail', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches a species by id', async () => {
    const row = { id: '1', commonName: 'Copihue' };
    mockedRepository.getById.mockResolvedValue(row as never);

    const { result } = await renderHook(() => useSpeciesDetail('1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(row);
    expect(mockedRepository.getById).toHaveBeenCalledWith('1');
  });

  it('does not fetch when id is undefined', async () => {
    await renderHook(() => useSpeciesDetail(undefined), { wrapper: createWrapper() });

    expect(mockedRepository.getById).not.toHaveBeenCalled();
  });
});
