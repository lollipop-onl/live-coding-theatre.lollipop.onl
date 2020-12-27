import Vue from 'vue';
import { defineNuxtPlugin } from '@nuxtjs/composition-api';
// @ts-expect-error
import hljs from 'highlight.js/lib/core';
// @ts-expect-error
import javascript from 'highlight.js/lib/languages/javascript';

export default defineNuxtPlugin(() => {
  hljs.registerLanguage('javascript', javascript);

  Vue.directive('highlightjs', {
    bind: (el, binding) => {
      const targets = el.querySelectorAll('code');

      targets.forEach((target) => {
        if (typeof binding.value === 'string') {
          target.textContent = binding.value;
        }

        hljs.highlightBlock(target);
      });
    },
    componentUpdated: (el, binding) => {
      const targets = el.querySelectorAll('code');

      targets.forEach((target) => {
        if (typeof binding.value === 'string') {
          target.textContent = binding.value;
        }

        hljs.highlightBlock(target);
      });
    },
  });
});
