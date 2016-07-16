
/**
 * Creates a very simple non-guaranteed random string to provide some variation in tests
 * @return {String} String of random characters
 */
export function randomString() {
  return Math.random().toString(36).replace(/[^A-z]+/g, '');
}
