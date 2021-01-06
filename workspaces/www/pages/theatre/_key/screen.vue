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
                class="seatItem"
                :audience="audience"
              />
            </template>
          </template>
        </masonry>
      </div>
    </div>
    <div class="footer">
      <template v-if="timerMMSS">
        <img src="@/assets/images/icon-timer.svg" alt="timer" class="icon" />
        <p class="timer">{{ timerMMSS }}</p>
      </template>
      <img
        src="@/assets/images/logo.svg"
        alt="Live Coding Theatre"
        class="logo"
      />
      <p class="name">{{ theatreName }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api';
import { useStore } from '@/helpers/typed-store';
import { useTimerSeconds } from '@/helpers/useTimerSeconds';

export default defineComponent({
  name: 'TheatreScreenPage',
  components: {
    TheatreMessage: () => import('@/components/TheatreMessage.vue'),
    CodeCard: () => import('@/components/CodeCard.vue'),
  },
  setup() {
    const store = useStore();
    const timer = useTimerSeconds();
    const message = computed(() => store.state.theatre.message);
    const theatreName = computed(() => store.state.theatre.name);
    const audiences = computed(() => store.state.theatre.audiences);
    const timerMMSS = computed(() => timer.mmss.value);

    return {
      message,
      theatreName,
      audiences,
      timerMMSS,
    };
  },
});
</script>

<style lang="postcss" scoped>
.pageContainer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100vh;
  background: #191919;

  & > .message {
    flex-shrink: 0;
  }

  & > .container {
    position: relative;
    flex-grow: 1;
    width: 100%;
    height: 100%;
    padding-top: 8px;
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
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0 32px;
    padding-bottom: 96px;
    overflow-y: auto;
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

  & > .footer {
    position: absolute;
    bottom: 0;
    z-index: 1;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    padding: 8px 16px;
    pointer-events: none;
  }

  & > .footer > .icon {
    height: 16px;
  }

  & > .footer > .timer {
    margin-right: auto;
    margin-left: 4px;
    font-size: 14px;
    font-weight: bold;
    color: #4b4b4b;
  }

  & > .footer > .logo {
    flex-shrink: 0;
    height: 24px;
    opacity: 0.6;
  }

  & > .footer > .name {
    margin-left: 8px;
    overflow: hidden;
    font-size: 14px;
    font-weight: bold;
    color: #606d80;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.6;
  }
}

.seatItem {
  margin: 32px 0 64px;
}
</style>
