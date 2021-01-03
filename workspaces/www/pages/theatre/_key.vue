<template>
  <div>
    <template v-if="!isInitialized || existsTheatre">
      <nuxt-child />
    </template>
    <template v-else>
      <div class="pageContainer">
        <div class="logo">
          <img
            class="image"
            src="@/assets/images/logo2.svg"
            alt="Live Coding Theatre"
          />
        </div>
        <img
          class="image"
          src="@/assets/images/page-not-found.svg"
          alt="Page Not Found"
        />
        <p class="message">Thie theatre is not found</p>
      </div>
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

    onMounted(async () => {
      dbRef.on('value', (snapshot) => {
        isInitialized.value = true;

        if (!snapshot.exists()) {
          store.commit('theatre/clearTheatre');

          return;
        }

        const { meta = {}, audiences: audiencesData = {} } = snapshot.val();
        const audiences = Object.entries(audiencesData)
          .map(([key, value]: any) => ({ key, ...value }))
          .sort((a: any, b: any) => (a.enteredAt - b.enteredAt > 0 ? 1 : -1));

        store.commit('theatre/setTheatre', {
          key: snapshot.key,
          name: meta.name,
          message: meta.message,
          audiences,
          timerStartedAt: meta.timerStartedAt,
          timerSeconds: meta.timerSeconds,
        });
      });

      try {
        const snapshot = await dbRef.get();

        if (!snapshot.exists()) {
          isInitialized.value = true;
        }
      } catch (err) {
        isInitialized.value = true;
      }
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

<style lang="postcss" scoped>
.pageContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: #ededed;

  & > .logo {
    filter: invert(74%) sepia(34%) saturate(1859%) hue-rotate(352deg)
      brightness(97%) contrast(94%) drop-shadow(-2px 0 1px #886112);
    margin-bottom: 16px;
  }

  & > .logo > img {
    filter: invert(100%);
  }

  & > .image {
    width: 640px;
  }

  & > .message {
    margin-top: 36px;
    color: #f1aa11;
    font-weight: bold;
    font-size: 24px;
    text-shadow: 0 0 2px #eee2cb;
  }
}
</style>
