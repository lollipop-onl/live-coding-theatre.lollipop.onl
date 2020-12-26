import Vue from 'vue';
import { DefineStoreModule } from '@lollipop-onl/vuex-typesafe-helper';

type State = {
  key?: string;
  name?: string;
  message?: string;
  audiences: any[];
};

export const state = (): State => ({
  audiences: [],
});

export const getters = {};

export const mutations = {
  /** シアター情報を設定 */
  setTheatre(state: State, theatre: any): void {
    Vue.typedSet(state, 'key', theatre.key);
    Vue.typedSet(state, 'name', theatre.name);
    Vue.typedSet(state, 'message', theatre.message);
    Vue.typedSet(state, 'audiences', theatre.audiences);
  },
  /** シアター情報を削除 */
  clearTheatre(state: State): void {
    Vue.typedDelete(state, 'key');
    Vue.typedDelete(state, 'name');
    Vue.typedDelete(state, 'message');
    Vue.typedSet(state, 'audiences', []);
  },
};

export const actions = {};

export type TheatreStore = DefineStoreModule<
  'theatre',
  State,
  typeof getters,
  typeof mutations,
  typeof actions
>;
