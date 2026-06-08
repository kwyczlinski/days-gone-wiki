export const env = {
  VITE_API_URL: window._env_?.VITE_API_URL || import.meta.env.VITE_API_URL || '/api',
  VITE_AUTHENTIK_PUBLIC_URL: window._env_?.VITE_AUTHENTIK_PUBLIC_URL || import.meta.env.VITE_AUTHENTIK_PUBLIC_URL,
  VITE_AUTHENTIK_CLIENT_ID: window._env_?.VITE_AUTHENTIK_CLIENT_ID || import.meta.env.VITE_AUTHENTIK_CLIENT_ID,
};