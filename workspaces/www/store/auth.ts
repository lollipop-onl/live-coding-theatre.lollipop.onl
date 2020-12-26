import Vue from 'vue';
import firebase from 'firebase';
import { DefineStoreModule } from '@lollipop-onl/vuex-typesafe-helper';

type State = {
  /** サインイン状態 */
  isSignedIn: boolean | null;
  /** サインインユーザー */
  anonymousUserId?: string;
};

export const state = (): State => ({
  isSignedIn: null,
});

export const getters = {};


export const mutations = {
  /** サインインしているユーザーを設定する */
  setSignedInUser(state: State, user: firebase.User | null): void {
    Vue.typedSet(state, 'isSignedIn', !!user);

    if (user) {
      Vue.typedSet(state, 'anonymousUserId', user.uid);
    } else {
      Vue.typedDelete(state, 'anonymousUserId');
    }
  }
};

export const actions = {};

export type AuthStore = DefineStoreModule<'auth', State, typeof getters, typeof mutations, typeof actions>;
