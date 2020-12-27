import Vue from 'vue';
import { defineNuxtPlugin } from '@nuxtjs/composition-api';
import TypedReactive from '@lollipop-onl/vue-typed-reactive';

export default defineNuxtPlugin(() => {
  Vue.use(TypedReactive);
});
