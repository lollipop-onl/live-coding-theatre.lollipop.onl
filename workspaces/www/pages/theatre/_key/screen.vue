<template>
  <div>
    <p>screen</p>
    <ol class="grid grid-cols-3">
      <template v-for="(audience, index) in audiences">
        <li v-if="audience.enteredAt != null" :key="audience.key">
          <p>{{ audience.name }}</p>
          <input v-model="prettyCodeIndexes" type="checkbox" :value="index" />
          <pre v-highlightjs="prettyCode(index, audience.code)" class="flex">
            <code class="code-block javascript w-full" />
          </pre>
          <CodeRunner :code="audience.code" :uid="audience.key" />
        </li>
      </template>
    </ol>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@nuxtjs/composition-api';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import CodeRunner from '@/components/CodeRunner.vue';
import { useStore } from '@/helpers/typed-store';

export default defineComponent({
  name: 'TheatreScreenPage',
  components: {
    CodeRunner,
  },
  setup() {
    const store = useStore();
    const prettyCodeIndexes = ref<number[]>([]);
    const audiences = computed(() => store.state.theatre.audiences);

    const prettyCode = (index: number, code: string) => {
      if (prettyCodeIndexes.value.some((i) => i === index)) {
        try {
          return prettier.format(code, {
            parser: 'babel',
            plugins: [parserBabel],
          });
        } catch (err) {
          return code;
        }
      }

      return code;
    };

    return {
      prettyCodeIndexes,
      audiences,
      prettyCode,
    };
  },
});
</script>
