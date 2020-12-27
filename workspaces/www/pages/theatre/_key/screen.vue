<template>
  <div class="pageContainer">
    <TheatreMessage class="message" :message="message" />
    <div class="seats">
      <template v-for="audience in audiences">
        <template v-if="audience.enteredAt != null">
          <CodeCard :key="audience.key" :audience="audience" />
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api';
import { useStore } from '@/helpers/typed-store';

export default defineComponent({
  name: 'TheatreScreenPage',
  components: {
    TheatreMessage: () => import('@/components/TheatreMessage.vue'),
    CodeCard: () => import('@/components/CodeCard.vue'),
  },
  setup() {
    const store = useStore();
    const message = computed(() => store.state.theatre.message);
    const audiences = computed(() => store.state.theatre.audiences);

    return {
      message,
      audiences,
    };
  },
});
</script>

<style lang="postcss" scoped>
.pageContainer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #191919;

  & > .message {
    flex-shrink: 0;
  }

  & > .seats {
    flex-grow: 1;
    overflow-y: auto;
  }
}
</style>
