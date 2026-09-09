/**
 * Pure JS UUID v4 generator (no native crypto module), so entity ids can be
 * created reliably in the app, in Jest, and in scripts alike.
 */
export function generateId(): string {
  let uuid = '';
  for (let i = 0; i < 36; i += 1) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      uuid += '4';
    } else {
      const random = Math.floor(Math.random() * 16);
      const value = i === 19 ? (random & 0x3) | 0x8 : random;
      uuid += value.toString(16);
    }
  }
  return uuid;
}
