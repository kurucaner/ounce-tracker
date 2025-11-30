declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      NEXT_PUBLIC_SITE_URL: string;
      SANITY_API_READ_TOKEN: string;
      SANITY_API_TOKEN: string;
      N8N_API_SECRET_KEY: string;
      NEXT_PUBLIC_SITE_URL: string;
      NEXT_PUBLIC_DATADOG_APPLICATION_ID: string;
      NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: string;
      NEXT_PUBLIC_GTM_ID: string;
      NEXT_PUBLIC_SANITY_PROJECT_ID: string;
      NEXT_PUBLIC_SANITY_DATASET: string;
    }
  }
}

export {};
