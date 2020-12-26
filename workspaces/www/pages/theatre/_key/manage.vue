<template>
  <div>
    <div>Theatre manage</div>
    <form @submit.prevent="updateMessage">
      <textarea type="text" v-model="message" placeholder="message" />
      <button>update message</button>
    </form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'TheatreManagePage',
  setup() {
    const { app, route } = useContext();
    const message = ref('');
    const key = computed(() => route.value.params.key);
    const updateMessage = async () => {
      await app.$fire.database.ref('theatres').child(key.value).update({
        message: message.value,
      });
    };

    return {
      message,
      updateMessage,
    };
  },
});
</script>
