<template>
  <div>
    <form @submit.prevent="onSubmit">
      <input v-model="name" type="text" />
      <button>Open a theatre</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useContext } from '@nuxtjs/composition-api';
import { nanoid } from 'nanoid';

export default defineComponent({
  name: 'TheatreOpenPage',
  setup() {
    const { app, redirect } = useContext();
    const name = ref('');
    const onSubmit = async () => {
      const key = nanoid();

      await app.$fire.database.ref('theatres').child(key).set({
        name: name.value,
      });

      redirect(`/theatre/${key}/manage`);
    };

    return {
      name,
      onSubmit,
    };
  },
});
</script>
