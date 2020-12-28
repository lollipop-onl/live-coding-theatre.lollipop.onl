import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from '@nuxtjs/composition-api';
import { useStore } from './typed-store';

export const useTimerSeconds = () => {
  const store = useStore();
  const seconds = ref(0);
  const isDestroyed = ref(false);
  const localStartedAt = ref<number | null>(null);
  const localSeconds = ref<number | null>(null);

  const mmss = computed((): string | null => {
    if (localStartedAt.value == null || localSeconds.value == null) {
      return null;
    }

    const min = Math.floor(seconds.value / 60);
    const sec = `${seconds.value % 60}`.padStart(2, '0');

    return `${min}:${sec}`;
  });

  const set = (startedAt: number, seconds: number): void => {
    localStartedAt.value = startedAt;
    localSeconds.value = seconds;
  };

  const reset = (): void => {
    localStartedAt.value = null;
    localSeconds.value = null;
  };

  const tick = (): void => {
    if (!localStartedAt.value || !localSeconds.value) {
      window.requestAnimationFrame(tick);

      return;
    }

    const nextValue =
      localSeconds.value -
      Math.ceil((Date.now() - localStartedAt.value) / 1000) +
      1;

    seconds.value = nextValue > 0 ? nextValue : 0;

    if (!isDestroyed.value) {
      window.requestAnimationFrame(tick);
    }
  };

  watch(
    [
      () => store.state.theatre.timerStartedAt,
      () => store.state.theatre.timerSeconds,
    ],
    ([timerStartedAt, timerSeconds]) => {
      if (!timerStartedAt || !timerSeconds) {
        reset();

        return;
      }

      set(timerStartedAt, timerSeconds);
    },
    { immediate: true }
  );

  onMounted(() => {
    tick();
  });

  onUnmounted(() => {
    isDestroyed.value = true;
  });

  return {
    seconds,
    mmss,
    set,
    reset,
  };
};
