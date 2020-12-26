<template>
  <div>
    <form @submit.prevent="onSubmit">
      <input type="text" v-model="name">
      <button>Open a theatre</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useContext } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'TheatreOpenPage',
  setup() {
    const { app, redirect } = useContext();
    const name = ref('');
    const onSubmit = async () => {
      const snapshot = await app.$fire.database.ref('theatres').push({
        name: name.value,
      });

      redirect(`/theatre/${snapshot.key}/manage`);
    };

    return {
      name,
      onSubmit,
    };
  },
});
</script>
