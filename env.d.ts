declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_KEY: string | undefined;
    }
  }
}

export {};
