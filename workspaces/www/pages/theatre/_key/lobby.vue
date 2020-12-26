<template>
  <div>
    <p>enter this theatre</p>
    <form @submit.prevent="onSubmit">
      <input type="text" v-model="name" placeholder="your display name">
      <button>enter theatre</button>
    </form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, watch } from '@nuxtjs/composition-api';
import { useStore } from '@/helpers/typed-store';

export default defineComponent({
  name: 'TheatreLobbyPage',
  setup() {
    const { app, route, redirect } = useContext();
    const store = useStore();
    const name = ref('');
    const key = computed(() => store.state.theatre.key || '');
    const anonymousUserId = computed(() => store.state.auth.anonymousUserId || '');
    const currentAudience = computed(() => store.state.theatre.audiences.find(({ key }) => key === anonymousUserId.value));
    const isInitialized = computed((): boolean => !!(anonymousUserId.value && key.value));

    const onSubmit = async () => {
      if (!anonymousUserId.value) {
        return;
      }

      await app.$fire.database.ref('theatres').child(key.value).child('audiences').child(anonymousUserId.value).set({
        name: name.value,
      });
    };

    watch([currentAudience, isInitialized], async () => {
      if (!isInitialized.value) {
        return;
      }

      if (currentAudience.value) {
        redirect(`/theatre/${key.value}/seat`);
      }
    }, { immediate: true });

    return {
      name,
      onSubmit,
    };
  },
});
</script>
