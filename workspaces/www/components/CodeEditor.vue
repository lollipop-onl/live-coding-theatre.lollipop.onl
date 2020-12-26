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
    <div class="codeEditorFooter footer">
      <BaseSelect v-model="tabSize" :options="tabSizeOptions">
        <template #default>
          <p>Tab: {{ tabSize }}</p>
        </template>
      </BaseSelect>
      <BaseCheckbox v-model="enableRegatures">
        <template #default="{ checked }">
          <p>Regatures: {{ checked ? 'enabled' : 'disabled' }}</p>
        </template>
      </BaseCheckbox>
      <button type="button" @click="formatCode">Format code</button>
      <div class="counter">
        <div class="length">{{ codeLength }}</div>
        <div class="vinculum">/</div>
        <div class="max">{{ maxLength }}</div>
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

const ALLOWED_TAB_SIZES = [2, 4, 8];
const LOCALSTORAGE_TAB_SIZE_KEY = 'editor_tabSize';
const LOCALSTORAGE_REGATURES_KEY = 'editor_regatures';

export default defineComponent({
  name: 'CodeEditor',
  components: {
    BaseSelect,
    BaseCheckbox,
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
    const codeLength = computed(() =>
      Intl.NumberFormat().format(localValue.value.length)
    );

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
      codeLength,
      onKeydown,
      formatCode,
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
  }
}

.codeEditorField {
  display: block;
  max-height: 150px;
  overflow-y: auto;

  &:focus-within {
    outline: -webkit-focus-ring-color auto 1px;
  }

  & > .wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  & > .wrapper > .highlight {
    display: flex;
    margin: 0;
  }

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
  display: flex;
  border-top: 1px solid #ccc;
  background: #eee;

  & > .counter {
    display: flex;
    align-items: flex-end;
    margin-left: auto;
    font-size: 14px;
  }

  & > .counter > .length {
    font-size: 1.2em;
  }

  & > .counter > .vinculum {
  }

  & > .counter > .max {
  }
}
</style>
