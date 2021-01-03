<template>
  <div class="theatreMessage">
    <div class="container">
      <p v-if="message" class="message">{{ message }}</p>
      <img
        v-else
        class="logo"
        src="@/assets/images/logo.svg"
        alt="Live Coding Theatre"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'TheatreMessage',
  props: {
    message: {
      type: String,
      default: null,
    },
  },
  setup() {},
});
</script>

<style lang="postcss" scoped>
@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.theatreMessage {
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

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
    content: '';
    background-image:
      linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.2),
        rgba(0, 0, 0, 0.08),
        rgba(0, 0, 0, 0)
      );
  }

  & > .container {
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

  & > .container::-webkit-scrollbar {
    width: 12px;
    background: #000;
  }

  & > .container::-webkit-scrollbar-track {
    background: transparent;
  }

  & > .container::-webkit-scrollbar-thumb {
    visibility: hidden;
    background: rgba(255, 255, 255, 0.3);
  }

  & > .container:hover::-webkit-scrollbar-thumb {
    visibility: visible;
  }

  & > .container > .text {
    font-size: 18px;
    line-height: 1.5;
    color: #252521;
    white-space: pre-wrap;
  }

  & > .container > .logo {
    display: block;
    height: 32px;
    opacity: 0;
    animation: fade-in 0.4s ease 0.8s forwards;
  }
}
</style>
