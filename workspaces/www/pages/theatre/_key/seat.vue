<template>
  <div class="pageContainer">
    <TheatreMessage class="message" :message="message" />
    <CodeEditor
      v-model="sourceCode"
      class="editor"
      :max-length="20"
      :disabled="!isInitialized"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  useContext,
  watch,
} from '@nuxtjs/composition-api';
import { throttle } from 'throttle-debounce';
import { useStore } from '@/helpers/typed-store';

export default defineComponent({
  name: 'TheatreSeatPage',
  components: {
    TheatreMessage: () => import('@/components/TheatreMessage.vue'),
    CodeEditor: () => import('@/components/CodeEditor.vue'),
  },
  setup() {
    const { app, redirect } = useContext();
    const store = useStore();
    const sourceCode = ref('');
    const isMounted = ref(false);
    const key = computed(() => store.state.theatre.key || '');
    const anonymousUserId = computed(
      () => store.state.auth.anonymousUserId || ''
    );
    const currentAudience = computed(() =>
      store.state.theatre.audiences.find(
        ({ key }) => key === anonymousUserId.value
      )
    );
    const message = computed(() => store.state.theatre.message);
    const isInitialized = computed(
      (): boolean => !!(anonymousUserId.value && key.value)
    );

    watch(
      sourceCode,
      throttle(1000, async () => {
        if (!anonymousUserId.value) {
          return;
        }

        await app.$fire.database
          .ref('theatres')
          .child(key.value)
          .child('audiences')
          .child(anonymousUserId.value)
          .update({
            code: sourceCode.value,
          });
      })
    );

    watch(
      [currentAudience, isInitialized],
      () => {
        if (!isInitialized.value) {
          return;
        }

        if (!currentAudience.value) {
          redirect(`/theatre/${key.value}/lobby`);
        }
      },
      { immediate: true }
    );

    const unwatch = watch([currentAudience, isMounted], async () => {
      if (!currentAudience.value) {
        return;
      }

      unwatch();

      const dbRef = app.$fire.database
        .ref('theatres')
        .child(key.value)
        .child('audiences')
        .child(currentAudience.value.key);

      await dbRef.update({
        enteredAt: app.$fireModule.database.ServerValue.TIMESTAMP,
      });

      dbRef.onDisconnect().update({
        enteredAt: null,
      });

      sourceCode.value = currentAudience.value.code || '';
    });

    onMounted(() => {
      isMounted.value = true;
    });

    onUnmounted(() => {
      if (!currentAudience.value) {
        return;
      }

      app.$fire.database
        .ref('theatres')
        .child(key.value)
        .child('audiences')
        .child(currentAudience.value.key)
        .update({
          enteredAt: null,
        });
    });

    return {
      sourceCode,
      anonymousUserId,
      message,
      isInitialized,
    };
  },
  head: {},
});
</script>

<style lang="postcss" scoped>
.pageContainer {
  display: flex;
  flex-direction: column;
  height: 100vh;

  & > .message {
    border-bottom: 1px solid #0d0d10;
  }

  & > .editor {
    width: 100%;
    flex-grow: 1;
  }
}
</style>
