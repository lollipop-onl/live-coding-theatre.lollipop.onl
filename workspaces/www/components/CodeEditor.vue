<template>
  <div class="codeEditor">
    <label class="codeEditorField field">
      <div class="wrapper" :class="{ Regatures: enableLigature }">
        <textarea
          ref="textareaRef"
          v-model="localValue"
          class="field"
          placeholder="Please fill in"
          :disabled="disabled"
          @keydown="onKeydown"
        />
        <pre v-highlightjs="displayedCode" class="highlight">
          <code class="code javascript" />
        </pre>
        <!-- eslint-disable prettier/prettier -->
        <p class="placeholder">ようこそ、 Live Coding Theatre へ
画面上のスクリーンに問題文／メッセージが表示されます

Information：
  ◇ console.answer(value); で最終的な回答を登録します
  ◇ console 系のメソッドは DevTools へログが出力されます
  ◇ _ で Lodash が利用できます

Note：
  ☆ 入力内容はパブリックな情報として保存されます。個人情報や機密情報が含まれないようご注意ください</p>
        <!-- eslint-enable prettier/prettier -->
      </div>
    </label>
    <CodeRunner class="runner" :code="localValue" />
    <div class="codeEditorFooter footer">
      <button
        v-if="currentAudience"
        class="button"
        type="button"
        @click="changeName"
      >
        <img src="@/assets/images/icon-brain.svg" alt="Person" class="icon" />
        <span class="text">
          {{ currentAudience.name }}
        </span>
      </button>
      <a
        href="https://lodash.com/docs/4.17.20"
        target="_blank"
        rel="noopener noreferer"
        class="button"
      >
        <img
          class="icon Lodash"
          src="@/assets/images/icon-lodash.svg"
          alt="Lodash"
        />
        <span class="text">4.17.20</span>
      </a>
      <button class="button" type="button" @click="formatCode">
        <img
          class="icon"
          src="@/assets/images/icon-pretty.svg"
          alt="Format code"
        />
        <span class="text"> Format </span>
      </button>
      <BaseSelect v-model="tabSize" class="button" :options="tabSizeOptions">
        <template #default> Tab: {{ tabSize }} </template>
      </BaseSelect>
      <BaseCheckbox v-model="enableLigature" class="button">
        <template #default="{ checked }">
          Ligature: {{ checked ? 'ON' : 'OFF' }}
        </template>
      </BaseCheckbox>
      <div class="spacer"></div>
      <button v-if="timerMMSS != null" class="button Timer" type="button">
        <img src="@/assets/images/icon-timer.svg" alt="Timer" class="icon" />
        <span class="text">{{ timerMMSS }}</span>
      </button>
      <div class="counter">
        <div class="length">{{ formatNumber(localValue.length) }}</div>
      </div>
      <button class="button" type="button" @click="clearCode">
        <img
          class="icon"
          src="@/assets/images/icon-delete.svg"
          alt="Clear code"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  ref,
  useContext,
  watch,
} from '@nuxtjs/composition-api';
// @ts-expect-error
import tabOverride from 'taboverride';
import { formatCode as formatCodeWithPrettier } from '@/helpers/prettier';
import { useStore } from '@/helpers/typed-store';
import { useTimerSeconds } from '@/helpers/useTimerSeconds';

const ALLOWED_TAB_SIZES = [2, 4, 8];
const LOCALSTORAGE_TAB_SIZE_KEY = 'editor_tabSize';
const LOCALSTORAGE_LEGATURE_KEY = 'editor_legature';

export default defineComponent({
  name: 'CodeEditor',
  components: {
    BaseSelect: () => import('@/components/BaseSelect.vue'),
    BaseCheckbox: () => import('@/components/BaseCheckbox.vue'),
    CodeRunner: () => import('@/components/CodeRunner.vue'),
  },
  props: {
    value: {
      type: String,
      required: true,
    },
    maxLength: {
      type: Number,
      default: Infinity,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { app, route } = useContext();
    const store = useStore();
    const timer = useTimerSeconds();
    const textareaRef = ref<HTMLTextAreaElement>();
    const tabSize = ref(2);
    const enableLigature = ref(true);
    const timerMMSS = computed(() => timer.mmss.value);
    const anonymousUserId = computed(
      () => store.state.auth.anonymousUserId || ''
    );
    const currentAudience = computed(() =>
      store.state.theatre.audiences.find(
        ({ key }) => key === anonymousUserId.value
      )
    );
    const localValue = computed({
      get(): string {
        return props.value;
      },
      set(value: string): void {
        emit('input', value);
      },
    });
    const displayedCode = computed(() => {
      return localValue.value
        .split(/\r?\n/)
        .map((line) => (line.length === 0 ? ' ' : line))
        .join('\n');
    });

    const tabSizeOptions = [
      { label: 'タブサイズ： 2', value: 2 },
      { label: 'タブサイズ： 4', value: 4 },
      { label: 'タブサイズ： 8', value: 8 },
    ];

    const changeName = async (): Promise<void> => {
      if (!currentAudience.value) {
        return;
      }

      const { key: theatreKey } = route.value.params;
      const {
        name: currentName,
        key: currentAudienceKey,
      } = currentAudience.value;
      const newName = window.prompt(
        '変更したい名前を入力してください。\n（20文字以内）',
        currentName
      );

      if (!newName) {
        window.alert('空文字は名前として使用できません。');

        return;
      }

      if (/^[\x20\u3000]*$/.test(newName)) {
        window.alert('スペースのみは名前として使用できません。');

        return;
      }

      if (newName.length > 20) {
        window.alert('文字数が 20文字 をオーバーしています。');

        return;
      }

      if (newName === currentName) {
        return;
      }

      await app.$fire.database
        .ref('theatres')
        .child(theatreKey)
        .child('audiences')
        .child(currentAudienceKey)
        .update({
          name: newName,
        });
    };

    const onKeydown = (e: InputEvent, ...args: any[]) => {
      tabOverride.handlers.keydown(e, ...args);

      if (!(e.target instanceof HTMLTextAreaElement)) {
        return;
      }

      const { value } = e.target;

      if (value.length > props.maxLength) {
        return;
      }

      localValue.value = value;
    };

    const formatNumber = (value: number): string => {
      return Intl.NumberFormat().format(value);
    };

    const formatCode = async (): Promise<void> => {
      try {
        localValue.value = await formatCodeWithPrettier(localValue.value, {
          tabWidth: tabSize.value,
        });
      } catch (err) {
        // do nothing.
      }
    };

    const clearCode = () => {
      if (
        window.confirm(
          '入力されているコードをクリアします。\n\n※この操作は取り消せません'
        )
      ) {
        localValue.value = '';
      }
    };

    watch(tabSize, () => {
      tabOverride.tabSize(tabSize.value);

      localStorage.setItem(LOCALSTORAGE_TAB_SIZE_KEY, `${tabSize.value}`);
    });

    watch(enableLigature, () => {
      localStorage.setItem(
        LOCALSTORAGE_LEGATURE_KEY,
        `${enableLigature.value}`
      );
    });

    onBeforeMount(() => {
      const savedTabSize = Number(
        localStorage.getItem(LOCALSTORAGE_TAB_SIZE_KEY)
      );

      if (ALLOWED_TAB_SIZES.includes(savedTabSize)) {
        tabSize.value = savedTabSize;
      }

      tabOverride.tabSize(tabSize.value);
    });

    onBeforeMount(() => {
      const savedLegature = localStorage.getItem(LOCALSTORAGE_LEGATURE_KEY);

      if (savedLegature === 'false') {
        enableLigature.value = false;
      }
    });

    return {
      ALLOWED_TAB_SIZES,
      textareaRef,
      tabSize,
      tabSizeOptions,
      enableLigature,
      timerMMSS,
      currentAudience,
      localValue,
      displayedCode,
      onKeydown,
      changeName,
      formatCode,
      clearCode,
      formatNumber,
    };
  },
});
</script>

<style lang="postcss" scoped>
.codeEditor {
  display: flex;
  flex-direction: column;
  background: #1a1b26;

  & > .field {
    flex: 1 0 auto;
    height: 0;
  }

  & > .runner {
    max-height: 130px;
    padding: 8px 0;
    overflow-y: auto;
    border-top: 1px solid #0d0d10;
  }

  & > .runner::-webkit-scrollbar {
    width: 15px;
    background: transparent;
  }

  & > .runner::-webkit-scrollbar-track {
    background: transparent;
    border-left: 1px solid #0d0d10;
  }

  & > .runner::-webkit-scrollbar-thumb {
    background: rgba(134, 139, 196, 0.08);
    opacity: 0;
  }

  & > .runner::-webkit-scrollbar-thumb:hover {
    background: rgba(134, 139, 196, 0.13);
  }
}

.codeEditorField {
  display: block;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 15px;
    background: transparent;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-left: 1px solid #eee;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(25, 25, 25, 0.1);
    opacity: 0;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(25, 25, 25, 0.25);
  }

  & > .wrapper {
    position: relative;
    width: 100%;
    max-width: 1080px;
    min-height: 100%;
    margin: 0 auto;
    overflow: hidden;
  }

  & > .wrapper > .highlight {
    display: flex;
    margin: 0;
  }

  /* stylelint-disable rscss/class-format, rscss/no-descendant-combinator */
  & > .wrapper > .highlight ::v-deep {
    .hljs-comment,
    .hljs-quote {
      color: #969896;
    }

    .hljs-deletion,
    .hljs-name,
    .hljs-regexp,
    .hljs-selector-class,
    .hljs-selector-id,
    .hljs-tag,
    .hljs-template-variable,
    .hljs-variable {
      color: #c66;
    }

    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-link,
    .hljs-literal,
    .hljs-meta,
    .hljs-number,
    .hljs-params,
    .hljs-type {
      color: #de935f;
    }

    .hljs-attribute {
      color: #f0c674;
    }

    .hljs-addition,
    .hljs-bullet,
    .hljs-string,
    .hljs-symbol {
      color: #b5bd68;
    }

    .hljs-section,
    .hljs-title {
      color: #81a2be;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      color: #b294bb;
    }

    .hljs {
      display: block;
      padding: 0.5em;
      overflow-x: auto;
      color: #c5c8c6;
      background: #1a1b26;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: 700;
    }
  }
  /* stylelint-enable rscss/class-format, rscss/no-descendant-combinator */

  & > .wrapper > .field,
  & > .wrapper > .highlight > .code {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    border: none;
  }

  & > .wrapper > .field,
  & > .wrapper > .highlight > .code,
  & > .wrapper > .placeholder {
    padding: 20px;
    font-family: Fira Code, monospace;
    font-variant-ligatures: none;
    font-size: 14px;
    line-height: 1.5;
  }

  & > .wrapper > .field {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    resize: none;
    background: transparent;
    outline: none;
    -webkit-text-fill-color: transparent;
    caret-color: rgba(255, 255, 255, 0.8);
  }

  & > .wrapper > .field::selection {
    background: rgba(255, 255, 255, 0.2);
  }

  & > .wrapper > .highlight > .code {
    z-index: 1;
    box-sizing: border-box;
    width: 100%;
    word-break: break-all;
    white-space: pre-wrap;
  }

  & > .wrapper > .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    color: rgba(181, 181, 181, 0.5);
    word-break: break-all;
    white-space: pre-wrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.1s ease;
  }

  & > .wrapper.Regatures > .field,
  & > .wrapper.Regatures > .highlight > .code,
  & > .wrapper.Regatures > .placeholder {
    font-variant-ligatures: normal;
  }

  & > .wrapper > .field:placeholder-shown ~ .placeholder {
    opacity: 1;
  }
}

.codeEditorFooter {
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  padding: 0 16px;
  font-size: 12px;
  background: #16161e;
  border-top: 1px solid #0d0d10;

  & > .spacer {
    flex-grow: 1;
  }

  & > .button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 8px;
    font-size: 12px;
    color: #787c99;
    text-decoration: none;
    cursor: pointer;
    background: none;
    border: none;
    outline: none;
  }

  & > .button:hover,
  & > .button:active {
    background: rgba(255, 255, 255, 0.2);
  }

  & > .button > .icon {
    height: 14px;
  }

  & > .button > .icon.Lodash {
    height: 12px;
  }

  & > .button > .icon + .text {
    margin-left: 4px;
  }

  & > .button.Timer {
    font-family: Fira Code, monospace;
  }

  & > .button.Timer > .text {
    opacity: 0.8;
  }

  & > .counter {
    display: flex;
    align-items: center;
    padding: 0 8px;
    font-family: Fira Code, monospace;
    color: #787c99;
  }

  & > .counter > .max::before {
    content: '/';
  }
}
</style>
