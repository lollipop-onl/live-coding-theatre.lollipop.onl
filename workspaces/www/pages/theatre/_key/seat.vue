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
    position: relative;
    margin: 18px 0;
    background-size: auto auto;
    background-color: #eee;
    background-image: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 165px,
      rgba(0, 0, 0, 1) 166px,
      rgba(0, 0, 0, 1) 175px,
      transparent 176px
    );
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.9));
  }

  & > .message::before,
  & > .message::after {
    position: absolute;
    left: 0;
    display: block;
    width: 100%;
    height: 8px;
    content: '';
    background-size: auto auto;
    background-color: transparent;
    background-image: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 6px,
      rgba(0, 0, 0, 1) 6px,
      rgba(0, 0, 0, 1) 16px
    );
  }

  & > .message::before {
    top: 0;
    border-top: 8px solid #000;
    border-bottom: 6px solid #000;
    transform: translateY(-100%);
  }

  & > .message::after {
    bottom: 0;
    border-top: 4px solid #000;
    border-bottom: 6px solid #000;
    transform: translateY(100%);
  }

  & > .message > .container {
    display: grid;
    place-items: center;
    width: 100%;
    max-height: 120px;
    overflow-y: auto;
  }

  & > .message > .container::-webkit-scrollbar {
    width: 18px;
    background: #eee;
  }

  & > .message > .container::-webkit-scrollbar-track {
    background: transparent;
    border-left: 4px solid #000;
  }

  & > .message > .container::-webkit-scrollbar-thumb {
    opacity: 0;
    background: rgba(0, 0, 0, 0.3);
  }

  & > .message > .container > .text {
    max-width: 640px;
    padding: 18px;
    line-height: 1.5;
    white-space: pre-wrap;
    background: #eee;
    font-size: 18px;
  }

  & > .editor {
    flex-grow: 1;
  }
}
</style>
