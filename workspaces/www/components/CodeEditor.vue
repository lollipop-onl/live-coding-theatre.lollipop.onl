<template>
  <div class="codeEditor">
    <div class="codeEditorNavbar navbar">
      <p>{{ localValue.length }} / {{ maxLength }}</p>
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
    </div>
    <div class="codeEditorField field" :class="{ Regatures: enableRegatures }">
      <textarea
        ref="textareaRef"
        v-model="localValue"
        class="field"
        placeholder="abcd1234"
        @keydown="onKeydown"
      />
      <pre v-highlightjs="localValue" class="highlight">
        <code class="code javascript" />
      </pre>
      <p class="placeholder">Please fill in</p>
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
      onKeydown,
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

.codeEditorNavbar {
  display: flex;
}

.codeEditorField {
  position: relative;

  & > .highlight {
    display: flex;
    margin: 0;
  }

  & > .field,
  & > .highlight > .code {
    box-sizing: border-box;
    width: 100%;
    height: auto;
    margin: 0;
    overflow: visible;
    border: none;
  }

  & > .field,
  & > .highlight > .code,
  & > .placeholder {
    padding: 20px;
    font-family: Fira Code, monospace;
    font-variant-ligatures: none;
    font-size: 14px;
    line-height: 1.5;
  }

  & > .field {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    resize: none;
    background: transparent;
    -webkit-text-fill-color: transparent;
  }

  & > .highlight > .code {
    z-index: 1;
    box-sizing: border-box;
    width: 100%;
    white-space: pre-wrap;
  }

  & > .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    white-space: pre-wrap;
    pointer-events: none;
    visibility: hidden;
  }

  &.Regatures > .field,
  &.Regatures > .highlight > .code,
  &.Regatures > .placeholder {
    font-variant-ligatures: normal;
  }

  & > .field:placeholder-shown ~ .placeholder {
    visibility: visible;
  }
}
</style>
