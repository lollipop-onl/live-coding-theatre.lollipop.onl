<template>
  <div>
    <template v-if="!isInitialized || existsTheatre">
      <nuxt-child />
    </template>
    <template v-else>
      <p>404 page not found</p>
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  useContext,
  computed,
  useMeta,
  watch,
  ref,
} from '@nuxtjs/composition-api';
import { useStore } from '@/helpers/typed-store';

export default defineComponent({
  name: 'TheatreLayoutPage',
  setup() {
    const { app, route } = useContext();
    const store = useStore();
    const meta = useMeta();
    const isInitialized = ref(false);
    const key = computed(() => route.value.params.key);
    const theatreName = computed(() => store.state.theatre.name);
    const existsTheatre = computed(() => !!store.state.theatre.key);
    const dbRef = app.$fire.database.ref('theatres').child(key.value);

    watch(
      theatreName,
      () => {
        meta.title.value = theatreName.value;
      },
      { immediate: true }
    );

    onMounted(() => {
      dbRef.on('value', (snapshot) => {
        isInitialized.value = true;

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

    return {
      isInitialized,
      existsTheatre,
    };
  },
  head: {},
});
</script>
