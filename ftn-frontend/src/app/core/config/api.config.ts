/**
 * Base API URL. With `ng serve`, requests go through proxy.conf.json → http://localhost:8083/ftn
 */
export const API_BASE_URL = '/api';

export function apiUrl(...segments: string[]): string {
  const path = segments.filter(Boolean).join('/');
  return `${API_BASE_URL.replace(/\/$/, '')}/${path}`;
}
