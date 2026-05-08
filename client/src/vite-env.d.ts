/// <reference types="vite/client" />

interface ImportMeta {
  env: {
    MODE: string;
    BASE_URL: string;
    PROD: boolean;
    DEV: boolean;
    VITE_API_URL?: string;
    [key: string]: string | boolean | undefined;
  };
}