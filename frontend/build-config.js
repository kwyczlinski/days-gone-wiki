export const env = {
  VITE_API_URL: import.meta.env.VITE_API_URL || '/api',
  VITE_AUTHENTIK_PUBLIC_URL: import.meta.env.VITE_AUTHENTIK_PUBLIC_URL || 'https://auth.local',
  VITE_AUTHENTIK_CLIENT_ID: import.meta.env.VITE_AUTHENTIK_CLIENT_ID || '25e67q4y2zfOtxqQ6mlkGsF1vFjCJmYLPEL8CxnO',
};