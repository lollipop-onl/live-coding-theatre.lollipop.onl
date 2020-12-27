<template>
  <div class="codeRunner">
    <template v-if="results.length === 0">
      <pre class="block Empty">
        <span class="message">No results.</span>
      </pre>
    </template>
    <template v-else>
      <template v-for="(result, i) in results">
        <template v-if="result.type === 'answer'">
          <pre :key="i" v-highlightjs="result.value" class="block">
            <code class="code javascript" />
          </pre>
        </template>
        <pre v-else :key="i" class="block Error">
          <span class="message">{{ result.value }}</span>
        </pre>
      </template>
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

        if (event.data.type === 'error') {
          results.value = [event.data];

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
        /* eslint-disable no-useless-escape, prettier/prettier */
        const docs = `
          <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js"><\/script>

          <script>
            var infiniteLoopDetector = (function() {
              var map = {}

              // define an InfiniteLoopError class
              function InfiniteLoopError(msg, type) {
                Error.call(this ,msg)
                this.type = 'InfiniteLoopError'
              }

              function infiniteLoopDetector(id) {
                if (id in map) { // 非首次执行，此处可以优化，性能太低
                  if (Date.now() - map[id] > 10) {
                    delete map[id]

                    const err = new Error('Infinite loop detected', 'InfiniteLoopError');

                    err.name = 'InfiniteLoopError';

                    throw err;
                  }
                } else { // 首次运行，记录循环开始的时间。之所有把非首次运行的判断写在前面的if里是因为上面会执行更多次
                  map[id] = Date.now()
                }
              }

              infiniteLoopDetector.wrap = function(codeStr) {
                if (typeof codeStr !== 'string') {
                  throw new Error('Can only wrap code represented by string, not any other thing at the time! If you want to wrap a function, convert it to string first.')
                }
                // this is not a strong regex, but enough to use at the time
                return codeStr.replace(/for *\\(.*\\{|while *\\(.*\{|do *\\{/g, function(loopHead) {
                  var id = parseInt(Math.random() * Number.MAX_SAFE_INTEGER)
                  return \`infiniteLoopDetector(\${id});\${loopHead}infiniteLoopDetector(\${id});\`
                })
              }

              infiniteLoopDetector.unwrap = function(codeStr) {
                return codeStr.replace(/infiniteLoopDetector\\([0-9]*?\\);/g, '')
              }

              return infiniteLoopDetector
            }())
          <\/script>

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
            alert = () => { throw new Error('window.alert() の呼び出しは禁止されています。代わりに console.log() を使用してください。') };
            confirm = () => { throw new Error('window.confirm() の呼び出しは禁止されています。') };
            prompt = () => { throw new Error('window.prompt() の呼び出しは禁止されています。') };
          <\/script>

          <script>
            window.parent.postMessage({ type: 'ready', token: '${newToken}' });
          <\/script>

          <script>
            eval(infiniteLoopDetector.wrap(\`${props.code.replaceAll('`', '\\\`')}\`));
          <\/script>
        `;
        /* eslint-enable no-useless-escape, prettier/prettier */

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
  background: #1a1b26;

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
      background: #1a1b26;
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

  & > .block > .message {
    padding: 0.5em;
    word-break: break-all;
    white-space: pre-line;
  }

  & > .block.Empty {
    color: #787c99;
  }

  & > .block.Error {
    color: #bb616b;
  }

  & > .block {
    width: 100%;
    max-width: 1080px;
    box-sizing: border-box;
    padding: 0 16px;
    margin: 0 auto;
  }
}
</style>
