<template>
  <label
    class="baseCheckbox"
    :class="{ 'Disabled': readonly || disabled }"
  >
    <input
      type="checkbox"
      v-bind="$attrs"
      class="field"
      :checked="isChecked"
      :readonly="readonly"
      :disabled="disabled"
      @change="onChangeValue"
      @focus="isFocused = true"
      @blur="isFocused = false"
    >
    <slot
      :checked="isChecked"
      :focused="isFocused"
    />
  </label>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'BaseCheckbox',
  inheritAttrs: false,
  props: {
    model: {
      type: [Array, Boolean] as PropType<any[] | boolean>,
      required: true,
    },
    value: {},
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  model: {
    prop: 'model',
  },
  setup(props, { emit }) {
    const isFocused = ref(false);
    const isChecked = computed((): boolean => {
      return Array.isArray(props.model)
        ? props.model.includes(props.value)
        : props.model;
    });

    const onChangeValue = (): void => {
      if (props.readonly || props.disabled) {
        return;
      }

      if (!Array.isArray(props.model)) {
        emit('input', !props.model);

        return;
      }

      const nextModel = isChecked.value
        ? props.model.filter((value) => props.value !== value)
        : [...props.model, props.value];

      emit('input', nextModel);
    };

    return {
      isFocused,
      isChecked,
      onChangeValue,
    }
  },
});
</script>

<style lang="postcss" scoped>
.baseCheckbox {
  position: relative;

  &:not(.Disabled) {
    cursor: pointer;
  }

  & > .field {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 0;
    height: 0;
    margin: 0;
    opacity: 0;
    appearance: none;
  }
}
</style>
