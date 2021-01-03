import Vue from 'vue';
import { defineNuxtPlugin } from '@nuxtjs/composition-api';
import TypedReactive from '@lollipop-onl/vue-typed-reactive';
// @ts-expect-error
import VueMasonry from 'vue-masonry-css';

export default defineNuxtPlugin(() => {
  Vue.use(TypedReactive);
  Vue.use(VueMasonry);
});
