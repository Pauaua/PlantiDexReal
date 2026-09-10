import { speciesFormSchema } from '../schemas/speciesSchemas';

describe('speciesFormSchema', () => {
  const validValues = {
    commonName: 'Copihue',
    scientificName: 'Lapageria rosea',
    description: 'Flor nacional de Chile',
    conservationStatus: 'least_concern' as const,
    latitude: -39.8142,
    longitude: -73.2459,
    photoLocalUri: 'file:///tmp/photo.jpg',
  };

  it('accepts a fully filled form', () => {
    expect(speciesFormSchema.safeParse(validValues).success).toBe(true);
  });

  it('rejects a missing common name', () => {
    const result = speciesFormSchema.safeParse({ ...validValues, commonName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid conservation status', () => {
    const result = speciesFormSchema.safeParse({ ...validValues, conservationStatus: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing location', () => {
    const result = speciesFormSchema.safeParse({ ...validValues, latitude: null, longitude: null });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('latitude'))).toBe(true);
    }
  });

  it('rejects a missing photo', () => {
    const result = speciesFormSchema.safeParse({ ...validValues, photoLocalUri: null });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('photoLocalUri'))).toBe(true);
    }
  });

  it('allows an empty description', () => {
    const result = speciesFormSchema.safeParse({ ...validValues, description: undefined });
    expect(result.success).toBe(true);
  });
});
