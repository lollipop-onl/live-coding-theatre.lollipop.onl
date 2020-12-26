<template>
  <div>
    <nuxt />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  useContext,
  computed,
  onMounted,
} from '@nuxtjs/composition-api';
import { useStore } from '@/helpers/typed-store';

export default defineComponent({
  name: 'DefaultLayout',
  setup() {
    const { app } = useContext();
    const store = useStore();
    const isSignedIn = computed(() => store.state.auth.isSignedIn);

    onMounted(async () => {
      await app.$fire.auth.signInAnonymously();

      app.$fire.auth.onAuthStateChanged((user) => {
        store.commit('auth/setSignedInUser', user);
      });
    });

    return {
      isSignedIn,
    };
  },
  head: {
    link: [
      {
        rel: 'stylesheet',
        href:
          'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.5.0/styles/tomorrow.min.css',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fira+Code&display=swap',
      },
    ],
    script: [
      {
        src:
          'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js',
      },
    ],
  },
});
</script>
