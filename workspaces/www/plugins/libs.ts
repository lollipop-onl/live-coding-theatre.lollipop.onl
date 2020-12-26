import Vue from 'vue';
import { defineNuxtPlugin } from '@nuxtjs/composition-api';
import TypedReactive from '@lollipop-onl/vue-typed-reactive';
// @ts-expect-error
import VueHighlightJS from 'vue-highlightjs';

export default defineNuxtPlugin(() => {
  Vue.use(TypedReactive);
  Vue.use(VueHighlightJS);
});
