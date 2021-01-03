<template>
  <div class="pageContainer">
    <TheatreMessage class="message" :message="message" />
    <div class="container">
      <div class="seats">
        <masonry :cols="3" :gutter="30">
          <template v-for="audience in audiences">
            <template v-if="audience.enteredAt != null">
              <CodeCard
                :key="audience.key"
                v-masonry-tile
                class="seatItem"
                :audience="audience"
              />
            </template>
          </template>
        </masonry>
      </div>
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
  align-items: flex-start;
  flex-direction: column;
  height: 100vh;
  background: #191919;

  & > .message {
    flex-shrink: 0;
  }

  & > .container {
    position: relative;
    padding-top: 8px;
    flex-grow: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  & > .container::before {
    position: absolute;
    top: 8px;
    left: 0;
    width: 100%;
    height: 32px;
    content: '';
    background-image: linear-gradient(
      to bottom,
      rgba(25, 25, 25, 1),
      ease,
      rgba(25, 25, 25, 0)
    );
  }

  & > .container > .seats {
    width: 100%;
    height: 100%;
    padding: 0 32px;
    box-sizing: border-box;
    overflow-y: auto;
    padding-bottom: 96px;
  }

  & > .container > .seats::-webkit-scrollbar {
    width: 15px;
    background: transparent;
  }

  & > .container > .seats::-webkit-scrollbar-track {
    margin-top: 32px;
    background: transparent;
    border-left: 1px solid #0d0d10;
  }

  & > .container > .seats::-webkit-scrollbar-thumb {
    background: rgba(134, 139, 196, 0.08);
    opacity: 0;
  }

  & > .container > .seats::-webkit-scrollbar-thumb:hover {
    background: rgba(134, 139, 196, 0.13);
  }
}

.seatItem {
  margin: 32px 0 64px;
}
</style>
