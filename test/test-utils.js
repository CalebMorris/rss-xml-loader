import path from 'path';
import { readFileSync } from 'fs';

/**
 * Creates a very simple non-guaranteed random string to provide some variation in tests
 * @return {String} String of random characters
 */
export function randomString() {
  return Math.random().toString(36).replace(/[^A-z]+/g, '');
}

/**
 * Load file to string
 * @param  {String} filename Path to file to load
 * @return {String} file Contents loaded to string using utf8
 */
export function loadFileToSTring(filename: string) {
  return readFileSync(path.resolve(__dirname, filename), 'utf8');
}
