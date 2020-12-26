<template>
  <div class="codeRunner">
    <template v-for="(result, i) in results">
      <pre
        v-if="result.type === 'answer'"
        :key="i"
        class="block"
        v-highlightjs="result.value"
      >
        <code class="javascript"></code>
      </pre>
      <pre
        v-else
        :key="i"
        class="block Error"
      >
        {{ result.value }}
      </pre>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, useContext, watch } from '@nuxtjs/composition-api';
import { useStore } from '@/helpers/typed-store';

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
    const store = useStore();
    const results = ref<any[]>([]);
    const runnerElement = ref<HTMLIFrameElement>();

    const onMessage = (event: MessageEvent) => {
      if (event.data.uid === props.uid) {
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

    watch([() => props.code], () => {
      if (runnerElement.value) {
        document.body.removeChild(runnerElement.value);
      }

      const $iframe = document.createElement('iframe');
      const docs = `
        <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js"><\/script>

        <script>
          window.addEventListener('error', (err) => window.parent.postMessage({ type: 'error', value: err.error.toString(), uid: '${props.uid}' }));
        <\/script>

        <script>
          console.answer = (val) => {
            const value =
              typeof val === 'undefined' ? 'undefined' :
              val === null ? 'null' :
              typeof val === 'string' ? \`"\${val}"\` :
              val.toString();
            window.parent.postMessage({ type: 'answer', value, uid: '${props.uid}' });
            console.log(val);
          };
          alert = (message) => console.log(\`Alert: \${message}\`);
          confirm = (message) => console.log(\`Confirm: \${message}\`);
        <\/script>

        <script>
          ${props.code}
        <\/script>
      `;

      $iframe.srcdoc = docs;
      $iframe.width = '0';
      $iframe.height = '0';
      $iframe.style.display = 'none';
      $iframe.setAttribute('target', '_top');

      results.value = [];

      document.body.appendChild($iframe);
      runnerElement.value = $iframe;
    }, { immediate: true });

    return {
      results,
    };
  },
});
</script>

<style lang="postcss" scoped>
.codeRunner {
  & > .block {
    display: flex;
    font-family: Fira Code, monospace;
  }

  & > .block.Error {
    color: #f00;
    white-space: pre-line;
  }
}
</style>
