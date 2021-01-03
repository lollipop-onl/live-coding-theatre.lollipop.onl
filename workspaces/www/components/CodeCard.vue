<template>
  <div class="codeCard">
    <div class="header">
      <div class="name">
        <img class="icon" src="@/assets/images/icon-code.svg" alt="Code" />
        <div class="text">by {{ audience.name }}</div>
      </div>
      <BaseCheckbox
        v-model="isPretty"
        class="format"
        :class="{ Active: isPretty }"
      >
        <template #default="{ checked }">
          <template v-if="checked">Formated</template>
          <template v-else>Original</template>
        </template>
      </BaseCheckbox>
    </div>
    <pre v-highlightjs="displayCode" class="highlight">
      <code class="code javascript" />
    </pre>
    <CodeRunner class="result" :code="audience.code" :uid="audience.key" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api';
import { formatCode } from '@/helpers/prettier';

export default defineComponent({
  name: 'CodeCard',
  components: {
    CodeRunner: () => import('@/components/CodeRunner.vue'),
    BaseCheckbox: () => import('@/components/BaseCheckbox.vue'),
  },
  props: {
    audience: {
      type: Object as any,
      required: true,
    },
  },
  setup(props) {
    const isPretty = ref(false);
    const displayCode = ref('');

    watch(
      [() => props.audience.code, isPretty],
      async ([code, isPretty]) => {
        if (!isPretty) {
          displayCode.value = code;

          return;
        }

        displayCode.value = await formatCode(code);
      },
      { immediate: true }
    );

    return {
      isPretty,
      displayCode,
    };
  },
});
</script>

<style lang="postcss" scoped>
.codeCard {
  background: #1a1b26;
  border: 2px solid #111;
  border-top-left-radius: 12px;
  box-shadow: 6px 6px 0 #111;

  & > .header {
    display: flex;
    align-items: center;
    padding-right: 16px;
  }

  & > .header > .name {
    display: flex;
    align-items: center;
    color: #ccc;
  }

  & > .header > .name > .icon {
    height: 24px;
    margin-right: 8px;
  }

  & > .header > .name > .text {
    font-size: 12px;
    font-weight: bold;
  }

  & > .header > .format {
    margin-left: auto;
    font-size: 12px;
    color: #aaa;
  }

  & > .header > .format.Active {
    color: #eee;
  }

  & > .highlight {
    display: flex;
    padding: 16px 16px 24px;
    font-family: Fira Code, monospace;
    line-height: 1.5;
    word-break: break-all;
    white-space: pre-wrap;
  }

  /* stylelint-disable rscss/class-format, rscss/no-descendant-combinator */
  & > .highlight ::v-deep {
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
}
</style>
