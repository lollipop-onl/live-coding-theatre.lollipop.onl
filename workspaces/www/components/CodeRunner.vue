<template>
  <div class="codeRunner">
    <template v-for="(result, i) in results">
      <template v-if="result.type === 'answer'">
        <pre :key="i" v-highlightjs="result.value" class="block">
          <code class="code javascript" />
        </pre>
      </template>
      <pre v-else :key="i" class="block Error">
        {{ result.value }}
      </pre>
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'CodeRunner',
  props: {
    uid: {
      type: String,
      default: 'random',
    },
    code: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const token = ref('');
    const results = ref<any[]>([]);
    const runnerElement = ref<HTMLIFrameElement>();

    const onMessage = (event: MessageEvent) => {
      if (event.data.token === token.value) {
        if (event.data.type === 'ready') {
          results.value = [];

          return;
        }

        results.value.push(event.data);
      }
    };

    const removeRunnerElement = () => {
      if (!runnerElement.value) {
        return;
      }

      document.body.removeChild(runnerElement.value);

      window.removeEventListener('message', onMessage);
    };

    onMounted(() => {
      window.addEventListener('message', onMessage);
    });

    onUnmounted(() => {
      removeRunnerElement();
    });

    watch(
      [() => props.code],
      () => {
        if (runnerElement.value) {
          document.body.removeChild(runnerElement.value);
        }

        const newToken = `${props.uid}-${Math.random().toString(36).slice(2)}`;

        const $iframe = document.createElement('iframe');
        /* eslint-disable no-useless-escape */
        const docs = `
          <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js"><\/script>

          <script>
            window.addEventListener('error', (err) => window.parent.postMessage({ type: 'error', value: err.error.toString(), token: '${newToken}' }));
          <\/script>

          <script>
            console.answer = (val) => {
              const value =
                typeof val === 'undefined' ? 'undefined' :
                val === null ? 'null' :
                typeof val === 'string' ? \`"\${val}"\` :
                val.toString();
              window.parent.postMessage({ type: 'answer', value, token: '${newToken}' });
              console.log(val);
            };
            alert = (message) => console.log(\`Alert: \${message}\`);
            confirm = (message) => console.log(\`Confirm: \${message}\`);
          <\/script>

          <script>
            window.parent.postMessage({ type: 'ready', token: '${newToken}' });
          <\/script>

          <script>
            ${props.code}
          <\/script>
        `;
        /* eslint-enable no-useless-escape */

        $iframe.srcdoc = docs;
        $iframe.width = '0';
        $iframe.height = '0';
        $iframe.style.display = 'none';
        $iframe.setAttribute('target', '_top');

        document.body.appendChild($iframe);
        runnerElement.value = $iframe;
        token.value = newToken;
      },
      { immediate: true }
    );

    return {
      results,
    };
  },
});
</script>

<style lang="postcss" scoped>
.codeRunner {
  padding: 8px 0;
  background: #1d1f21;

  & > .block {
    position: relative;
    display: flex;
    font-family: Fira Code, monospace;
    line-height: 1.5;
  }

  & > .block:not(:first-child) {
    border-top: 1px solid #454545;
  }

  /* stylelint-disable rscss/class-format, rscss/no-descendant-combinator */
  & > .block ::v-deep {
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
      overflow-x: auto;
      background: #1d1f21;
      color: #c5c8c6;
      padding: 0.5em;
    }
    .hljs-emphasis {
      font-style: italic;
    }
    .hljs-strong {
      font-weight: 700;
    }
  }
  /* stylelint-enable rscss/class-format, rscss/no-descendant-combinator */

  & > .block.Error {
    color: #f00;
    white-space: pre-line;
  }

  & > .block > .code {
    margin: 0 auto;
    max-width: 640px;
  }
}
</style>
