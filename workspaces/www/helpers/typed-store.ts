import { getCurrentInstance } from '@nuxtjs/composition-api';
import { DefineRootStore } from '@lollipop-onl/vuex-typesafe-helper';
import { AuthStore } from '@/store/auth';
import { TheatreStore } from '@/store/theatre';

export type RootStore = DefineRootStore<AuthStore & TheatreStore>;

// export const useStore = defineTypedStore<RootStore>();
export const useStore = (): RootStore => {
  const vm = getCurrentInstance();

  if (!vm) {
    throw new Error('This must be called within a setup function.');
  }

  return vm.$store;
};
