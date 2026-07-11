const fallbackServerUrl = 'http://localhost:8000';

export const serverUrl = import.meta.env.VITE_SERVER_URL || fallbackServerUrl;