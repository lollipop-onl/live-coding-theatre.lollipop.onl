<template>
  <div>
    <div>Theatre manage</div>
    <form @submit.prevent="updateMessage">
      <textarea v-model="message" type="text" placeholder="message" />
      <button>update message</button>
    </form>
    <p>{{ timerMMSS }}</p>
    <input v-model="timerSeconds" type="text" />
    <button @click="applyTimer">Apply timer</button>
    <button @click="resetTimer">Rest timer</button>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useContext,
} from '@nuxtjs/composition-api';
import { useTimerSeconds } from '@/helpers/useTimerSeconds';

export default defineComponent({
  name: 'TheatreManagePage',
  setup() {
    const { app, route } = useContext();
    const timer = useTimerSeconds();
    const message = ref('');
    const timerSeconds = ref('');
    const timerMMSS = computed(() => timer.mmss.value);
    const key = computed(() => route.value.params.key);

    const updateMessage = async () => {
      await app.$fire.database.ref('theatres').child(key.value).update({
        message: message.value,
      });
    };

    const applyTimer = async () => {
      const seconds = +timerSeconds.value;

      if (Number.isNaN(seconds)) {
        return;
      }

      await app.$fire.database.ref('theatres').child(key.value).update({
        timerStartedAt: app.$fireModule.database.ServerValue.TIMESTAMP,
        timerSeconds: seconds,
      });
    };

    const resetTimer = async () => {
      await app.$fire.database.ref('theatres').child(key.value).update({
        timerStartedAt: null,
        timerSeconds: null,
      });
    };

    return {
      message,
      timerSeconds,
      timerMMSS,
      updateMessage,
      applyTimer,
      resetTimer,
    };
  },
});
</script>
