/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SOCKET_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
