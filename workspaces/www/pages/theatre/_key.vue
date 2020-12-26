<template>
  <div>
    <nuxt-child />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  useContext,
  computed,
} from '@nuxtjs/composition-api';
import { useStore } from '@/helpers/typed-store';

export default defineComponent({
  name: 'TheatreLayoutPage',
  setup() {
    const { app, route } = useContext();
    const store = useStore();
    const key = computed(() => route.value.params.key);
    const dbRef = app.$fire.database.ref('theatres').child(key.value);

    onMounted(() => {
      dbRef.on('value', (snapshot) => {
        if (!snapshot.exists()) {
          store.commit('theatre/clearTheatre');

          return;
        }

        const theatre = snapshot.val();
        const audiences = theatre.audiences
          ? Object.entries(theatre.audiences)
              .map(([key, value]: any) => ({ key, ...value }))
              .sort((a: any, b: any) =>
                a.enteredAt - b.enteredAt > 0 ? 1 : -1
              )
          : [];

        store.commit('theatre/setTheatre', {
          key: snapshot.key,
          name: theatre.name,
          message: theatre.message,
          audiences,
        });
      });
    });

    onUnmounted(() => {
      dbRef.off('value');
    });
  },
});
</script>
