import { NuxtConfig } from '@nuxt/types';

require('dotenv').config();

const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} = process.env;

const config: NuxtConfig = {
  ssr: false,
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/composition-api'],
  modules: ['@nuxtjs/firebase'],
  build: {
    postcss: {
      plugins: {
        'postcss-nested': {},
        'postcss-easing-gradients': {},
      },
    },
  },
  plugins: ['@/plugins/libs', '@/plugins/highlightjs'],
  css: ['reset-css', '@/assets/styles/main.css'],
  typescript: {
    typeCheck: false,
  },
  firebase: {
    config: {
      apiKey: FIREBASE_API_KEY,
      authDomain: FIREBASE_AUTH_DOMAIN,
      databaseURL: FIREBASE_DATABASE_URL,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
      messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
      appId: FIREBASE_APP_ID,
      measurementId: FIREBASE_MEASUREMENT_ID,
    },
    services: {
      auth: true,
      database: true,
    },
  },
};

export default config;
