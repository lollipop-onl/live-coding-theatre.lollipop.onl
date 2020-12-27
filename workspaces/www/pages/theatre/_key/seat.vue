<template>
  <div class="pageContainer">
    <p v-if="message" class="message">
      <span class="container">
        <span class="text">{{ message }}</span>
      </span>
    </p>
    <CodeEditor v-model="sourceCode" class="editor" :max-length="1000" />
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
  useMeta,
  watch,
} from '@nuxtjs/composition-api';
import CodeEditor from '@/components/CodeEditor.vue';
import { useStore } from '@/helpers/typed-store';

export default defineComponent({
  name: 'TheatreSeatPage',
  components: {
    CodeEditor,
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

    watch(sourceCode, async () => {
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
    });

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

      sourceCode.value = currentAudience.value.code;
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
    };
  },
  head: {},
});
</script>

<style lang="postcss" scoped>
.pageContainer {
  display: flex;
  height: 100vh;
  flex-direction: column;

  & > .message {
    background: #191919;
    overflow: hidden;
    display: grid;
    place-items: center;
    width: 100%;
    border-bottom: 1px solid #0d0d10;
  }

  & > .message > .container {
    display: grid;
    place-items: center;
    min-height: 48px;
    max-height: 120px;
    overflow-y: scroll;
    max-width: 760px;
    width: 100%;
    line-height: 1.5;
    white-space: pre-wrap;
    font-size: 18px;
    font-family: Sawarabi Mincho, sans-serif;
    border-top: 16px solid #000;
    border-right: 20px solid #000;
    border-bottom: 16px solid #000;
    border-left: 32px solid #000;
    padding: 16px 32px;
    background-color: #fff;
    background-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.12),
      rgba(0, 0, 0, 0)
    );
  }

  & > .message > .container::-webkit-scrollbar {
    width: 12px;
    background: #000;
  }

  & > .message > .container::-webkit-scrollbar-track {
    background: transparent;
  }

  & > .message > .container::-webkit-scrollbar-thumb {
    visibility: hidden;
    background: rgba(255, 255, 255, 0.3);
  }

  & > .message > .container:hover::-webkit-scrollbar-thumb {
    visibility: visible;
  }

  & > .editor {
    flex-grow: 1;
  }
}
</style>
