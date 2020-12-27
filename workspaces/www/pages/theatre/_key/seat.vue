<template>
  <div class="pageContainer">
    <p class="message">
      <span class="container">
        <span class="text" v-if="message">{{ message }}</span>
        <img class="logo" src="@/assets/images/logo.svg" alt="Live Coding Theatre" v-else>
      </span>
    </p>
    <CodeEditor v-model="sourceCode" class="editor" :max-length="20" />
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
  flex-direction: column;
  height: 100vh;

  & > .message {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    overflow: hidden;
    background: #191919;
    background-image:
      linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.6),
        rgba(0, 0, 0, 0)
      );
    border-bottom: 1px solid #0d0d10;
  }

  & > .message::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 100%;
    background-image:
      linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.2),
        rgba(0, 0, 0, 0.08),
        rgba(0, 0, 0, 0)
      );
      pointer-events: none;
  }

  & > .message > .container {
    display: grid;
    place-items: center;
    width: 100%;
    max-width: 760px;
    min-height: 48px;
    max-height: 120px;
    padding: 16px 32px;
    overflow-y: scroll;
    font-family: Sawarabi Mincho, sans-serif;
    background-color: #fff;
    border-top: 16px solid #000;
    border-right: 20px solid #000;
    border-bottom: 16px solid #000;
    border-left: 32px solid #000;
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

  & > .message > .container > .text {
    font-size: 18px;
    line-height: 1.5;
    white-space: pre-wrap;
    color: #252521;
  }

  & > .message > .container > .logo {
    display: block;
    height: 32px;
  }

  & > .editor {
    flex-grow: 1;
  }
}
</style>
