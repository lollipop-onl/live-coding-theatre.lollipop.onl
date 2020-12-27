<template>
  <div class="baseSelect">
    <select
      v-model="localValue"
      class="field"
      v-bind="$attrs"
      @change="onChangeValue"
    >
      <option value="" style="display: none;" selected disabled>
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.label"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <div class="select">
      <slot
        :activeOption="activeOption"
        :activeLabel="activeLabel"
        :empty="!!activeLabel"
        :placeholder="placeholder"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  PropType,
  ref,
  watch,
} from '@nuxtjs/composition-api';

export type SelectOption = {
  label: string | number | boolean;
  value: any;
  disabled?: boolean;
};

export default defineComponent({
  name: 'BaseSelect',
  inheritAttrs: false,
  props: {
    value: {
      type: null,
      default: null,
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const activeLabel = ref<string | number | boolean>('');
    const activeOption = computed(() =>
      props.options.find(({ value }) => value === localValue.value)
    );
    const localValue = computed({
      get(): any {
        return props.value;
      },
      set(value: any): void {
        emit('input', value);
      },
    });

    const onChangeValue = () => {
      const option = activeOption.value;

      activeLabel.value = option == null ? props.placeholder : option.label;
    };

    watch([() => props.options, localValue], onChangeValue, {
      immediate: true,
    });

    onBeforeMount(() => {
      if (activeOption.value) {
        return;
      }

      activeLabel.value = props.placeholder;
    });

    return {
      activeLabel,
      activeOption,
      localValue,
      onChangeValue,
    };
  },
});
</script>

<style lang="postcss" scoped>
.baseSelect {
  position: relative;

  & > .field {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    opacity: 0;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  & > .select {
    position: relative;
    z-index: 1;
    pointer-events: none;
  }
}
</style>
