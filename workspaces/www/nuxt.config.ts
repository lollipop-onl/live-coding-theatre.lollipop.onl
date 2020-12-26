import { NuxtConfig } from '@nuxt/types';

const config: NuxtConfig = {
  ssr: false,
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/composition-api'],
  modules: ['@nuxtjs/firebase'],
  build: {
    postcss: {
      plugins: {
        'postcss-nested': {},
      },
    },
  },
  plugins: [
    '@/plugins/libs',
  ],
  css: ['reset-css'],
  typescript: {
    typeCheck: false,
  },
  firebase: {
    config: {
      apiKey: 'AIzaSyCnFjcRfuBW_XkBHK7wi9prKC566yF2KpU',
      authDomain: 'live-coding-theatre.firebaseapp.com',
      databaseURL: 'https://live-coding-theatre-default-rtdb.firebaseio.com',
      projectId: 'live-coding-theatre',
      storageBucket: 'live-coding-theatre.appspot.com',
      messagingSenderId: '1084838308223',
      appId: '1:1084838308223:web:b1bd399ed44fff6d73d24a',
      measurementId: 'G-L851X9BMBB',
    },
    services: {
      auth: true,
      database: true,
    },
  },
};

export default config;
