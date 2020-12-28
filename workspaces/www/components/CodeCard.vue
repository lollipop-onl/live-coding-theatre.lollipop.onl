<template>
  <div class="codeCard">
    <p>{{ audience.name }}</p>
    <input v-model="isPretty" type="checkbox" />
    <pre v-highlightjs="displayCode" class="highlight">
      <code class="code javascript" />
    </pre>
    <CodeRunner :code="audience.code" :uid="audience.key" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api';
import { formatCode } from '@/helpers/prettier';

export default defineComponent({
  name: 'CodeCard',
  components: {
    CodeRunner: () => import('@/components/CodeRunner.vue'),
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
