<template>
  <div class="codeEditor">
    <label class="codeEditorField field">
      <div class="wrapper" :class="{ Regatures: enableRegatures }">
        <textarea
          ref="textareaRef"
          v-model="localValue"
          class="field"
          placeholder="abcd1234"
          @keydown="onKeydown"
        />
        <pre v-highlightjs="displayedCode" class="highlight">
          <code class="code javascript" />
        </pre>
        <p class="placeholder">Please fill in</p>
      </div>
    </label>
    <CodeRunner class="runner" :code="localValue" />
    <div class="codeEditorFooter footer">
      <BaseSelect v-model="tabSize" class="button" :options="tabSizeOptions">
        <template #default> Tab: {{ tabSize }} </template>
      </BaseSelect>
      <BaseCheckbox v-model="enableRegatures" class="button">
        <template #default="{ checked }">
          Regatures: {{ checked ? 'enabled' : 'disabled' }}
        </template>
      </BaseCheckbox>
      <button class="button" type="button" @click="formatCode">
        Format code
      </button>
      <button class="button -clear" type="button" @click="clearCode">🗑</button>
      <div class="counter">
        <div class="length">{{ formatNumber(localValue.length) }}</div>
        <div class="max">{{ formatNumber(maxLength) }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  ref,
  watch,
} from '@nuxtjs/composition-api';
// @ts-expect-error
import tabOverride from 'taboverride';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import BaseSelect from '@/components/BaseSelect.vue';
import BaseCheckbox from '@/components/BaseCheckbox.vue';
import CodeRunner from '@/components/CodeRunner.vue';

const ALLOWED_TAB_SIZES = [2, 4, 8];
const LOCALSTORAGE_TAB_SIZE_KEY = 'editor_tabSize';
const LOCALSTORAGE_REGATURES_KEY = 'editor_regatures';

export default defineComponent({
  name: 'CodeEditor',
  components: {
    BaseSelect,
    BaseCheckbox,
    CodeRunner,
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
  },
  setup(props, { emit }) {
    const textareaRef = ref<HTMLTextAreaElement>();
    const tabSize = ref(2);
    const enableRegatures = ref(true);
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

    const formatCode = () => {
      try {
        localValue.value = prettier.format(localValue.value, {
          tabWidth: tabSize.value,
          parser: 'babel',
          plugins: [parserBabel],
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

    watch(enableRegatures, () => {
      localStorage.setItem(
        LOCALSTORAGE_REGATURES_KEY,
        `${enableRegatures.value}`
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
      const savedRegatures = localStorage.getItem(LOCALSTORAGE_REGATURES_KEY);

      if (savedRegatures === 'false') {
        enableRegatures.value = false;
      }
    });

    return {
      ALLOWED_TAB_SIZES,
      textareaRef,
      tabSize,
      tabSizeOptions,
      enableRegatures,
      localValue,
      displayedCode,
      onKeydown,
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

  & > .field {
    flex: 1 0 auto;
    height: 0;
  }

  & > .runner {
    max-height: 120px;
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
      color: #8e908c;
    }

    .hljs-deletion,
    .hljs-name,
    .hljs-regexp,
    .hljs-selector-class,
    .hljs-selector-id,
    .hljs-tag,
    .hljs-template-variable,
    .hljs-variable {
      color: #c82829;
    }

    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-link,
    .hljs-literal,
    .hljs-meta,
    .hljs-number,
    .hljs-params,
    .hljs-type {
      color: #f5871f;
    }

    .hljs-attribute {
      color: #eab700;
    }

    .hljs-addition,
    .hljs-bullet,
    .hljs-string,
    .hljs-symbol {
      color: #718c00;
    }

    .hljs-section,
    .hljs-title {
      color: #4271ae;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      color: #8959a8;
    }

    .hljs {
      display: block;
      padding: 0.5em;
      overflow-x: auto;
      color: #4d4d4c;
      background: #fff;
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
    color: #b5b5b5;
    word-break: break-all;
    white-space: pre-wrap;
    pointer-events: none;
    visibility: hidden;
  }

  & > .wrapper.Regatures > .field,
  & > .wrapper.Regatures > .highlight > .code,
  & > .wrapper.Regatures > .placeholder {
    font-variant-ligatures: normal;
  }

  & > .wrapper > .field:placeholder-shown ~ .placeholder {
    visibility: visible;
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

  & > .button {
    border: none;
    background: none;
    color: #787c99;
    outline: none;
    padding: 4px 8px;
    text-align: center;
    cursor: pointer;
  }

  & > .button:hover,
  & > .button:active {
    background: rgba(255, 255, 255, 0.2);
  }

  & > .button.-clear {
    margin-left: auto;
  }

  & > .counter {
    display: flex;
    padding: 0 8px;
    align-items: center;
    color: #787c99;
    font-family: Fira Code, monospace;
  }

  & > .counter > .max::before {
    content: '/';
  }
}
</style>
