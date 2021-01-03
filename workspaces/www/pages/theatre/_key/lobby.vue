<template>
  <div class="pageContainer">
    <div class="theatreLobby">
      <div class="illustration">
        <img
          class="logo"
          src="@/assets/images/logo2.svg"
          alt="Live Coding Theatre"
        />
        <img
          class="image"
          src="@/assets/images/illust-coding.svg"
          alt="Coding"
        />
      </div>
      <form class="form" @submit.prevent="onSubmit">
        <div class="name">{{ theatreName }}</div>
        <div class="audiences">
          <template v-if="audienceLength === 0">No one </template>
          <template v-else-if="audienceLength === 1">1 person is </template>
          <template v-else>{{ audienceLength }} people are </template>
          in the theatre
        </div>
        <p class="note">
          入力内容はパブリックにアクセス可能な情報として保存されます。個人情報や機密情報が含まれないようご注意ください。
        </p>
        <label for="displayName" class="label">Display Name</label>
        <input id="displayName" v-model="name" type="text" class="field" />
        <button class="submit" :disabled="!name || !isInitialized">
          Enter
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useContext,
  watch,
} from '@nuxtjs/composition-api';
import { useStore } from '@/helpers/typed-store';

export default defineComponent({
  name: 'TheatreLobbyPage',
  setup() {
    const { app, redirect } = useContext();
    const store = useStore();
    const name = ref('');
    const theatreKey = computed(() => store.state.theatre.key || '');
    const theatreName = computed(() => store.state.theatre.name);
    const anonymousUserId = computed(
      () => store.state.auth.anonymousUserId || ''
    );
    const audiences = computed(() => store.state.theatre.audiences);
    const currentAudience = computed(() =>
      audiences.value.find(({ key }) => key === anonymousUserId.value)
    );
    const audienceLength = computed(
      () =>
        store.state.theatre.audiences.filter(
          ({ enteredAt }) => enteredAt != null
        ).length
    );
    const isInitialized = computed(
      (): boolean => !!(anonymousUserId.value && theatreKey.value)
    );

    const onSubmit = async () => {
      if (!anonymousUserId.value) {
        return;
      }

      if (!name.value) {
        window.alert('空文字は名前として使用できません。');

        return;
      }

      if (/^[\x20\u3000]*$/.test(name.value)) {
        window.alert('スペースのみは名前として使用できません。');

        return;
      }

      if (name.value.length > 20) {
        window.alert('文字数が 20文字 をオーバーしています。');

        return;
      }

      await app.$fire.database
        .ref('theatres')
        .child(theatreKey.value)
        .child('audiences')
        .child(anonymousUserId.value)
        .set({
          name: name.value,
        });
    };

    watch(
      [currentAudience, isInitialized],
      () => {
        if (!isInitialized.value) {
          return;
        }

        if (currentAudience.value) {
          redirect(`/theatre/${theatreKey.value}/seat`);
        }
      },
      { immediate: true }
    );

    return {
      isInitialized,
      name,
      theatreKey,
      theatreName,
      audiences,
      audienceLength,
      onSubmit,
    };
  },
});
</script>

<style lang="postcss" scoped>
.pageContainer {
  box-sizing: border-box;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100vh;
  padding: 32px 0;
  overflow-y: auto;
  background: #ededed;
}

.theatreLobby {
  display: flex;
  overflow: hidden;
  border-radius: 24px;
  box-shadow:
    0 2.8px 2.2px rgba(0, 0, 0, 0.02),
    0 6.7px 5.3px rgba(0, 0, 0, 0.028),
    0 12.5px 10px rgba(0, 0, 0, 0.035),
    0 22.3px 17.9px rgba(0, 0, 0, 0.042),
    0 41.8px 33.4px rgba(0, 0, 0, 0.05),
    0 100px 80px rgba(0, 0, 0, 0.07);

  & > .illustration {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 380px;
    padding: 100px 0;
    background: #f1aa11;
  }

  & > .illustration > .logo {
    width: 160px;
    margin-top: auto;
    margin-bottom: -32px;
  }

  & > .illustration > .image {
    width: 230px;
    margin-bottom: auto;
  }

  & > .form {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 480px;
    padding: 64px 48px;
    background: #fff;
  }

  & > .form > .name {
    margin-bottom: 16px;
    font-size: 32px;
    color: #252521;
  }

  & > .form > .audiences {
    margin-bottom: 32px;
    font-size: 12px;
    font-weight: bold;
    color: #aaa;
  }

  & > .form > .note {
    padding: 0 16px;
    margin-bottom: 40px;
    font-size: 10px;
    line-height: 1.5;
    color: #f12749;
  }

  & > .form > .label {
    width: 100%;
    padding-bottom: 16px;
    font-size: 12px;
    color: #595959;
  }

  & > .form > .field {
    box-sizing: border-box;
    width: 100%;
    padding: 8px 16px;
    margin-bottom: 24px;
    font-size: 16px;
    line-height: 2;
    background: #e9eeec;
    border: none;
    border-radius: 4px;
  }

  & > .form > .submit {
    height: 48px;
    padding: 0 48px;
    font-family: Fira Code, monospace;
    font-size: 14px;
    color: #fff;
    text-indent: -0.2em;
    letter-spacing: 0.2em;
    cursor: pointer;
    background: #f1aa11;
    border: none;
    border-radius: 24px;
    transition: background 0.12s ease;
  }

  & > .form > .submit:disabled {
    background: #aaa;
  }
}
</style>
