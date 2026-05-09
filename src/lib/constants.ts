export const API_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.VERCEL_URL?.replace(/^/, 'https://') ??
  'http://localhost:3000';
