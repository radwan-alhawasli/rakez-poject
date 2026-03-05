<script setup>
import _objectSpread from 'C:/Users/User/Desktop/rakez-poject/node_modules/@babel/runtime/helpers/esm/objectSpread2.js';
import _toConsumableArray from 'C:/Users/User/Desktop/rakez-poject/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js';
import 'core-js/modules/es.array.concat.js';
import 'core-js/modules/es.array.for-each.js';
import 'core-js/modules/es.array.map.js';
import 'core-js/modules/es.array.some.js';
import 'core-js/modules/es.function.name.js';
import 'core-js/modules/es.iterator.constructor.js';
import 'core-js/modules/es.iterator.for-each.js';
import 'core-js/modules/es.iterator.map.js';
import 'core-js/modules/es.iterator.some.js';
import 'core-js/modules/es.object.to-string.js';
import 'core-js/modules/web.dom-collections.for-each.js';
import { buttonVariants } from '@/components/ui/button';
import { BulletLegend } from '@unovis/ts';
import { VisBulletLegend } from '@unovis/vue';
import { nextTick, onMounted, ref } from 'vue';

var props = defineProps({
  items: { type: Array, required: true, default: () => [] },
});

var emits = defineEmits(['legendItemClick', 'update:items']);

var elRef = ref();

onMounted(function () {
  var selector = '.'.concat(BulletLegend.selectors.item);
  nextTick(function () {
    var _elRef$value;
    var elements =
      (_elRef$value = elRef.value) === null || _elRef$value === void 0
        ? void 0
        : _elRef$value.querySelectorAll(selector);
    var classes = buttonVariants({ variant: 'ghost', size: 'xs' }).split(' ');
    elements === null ||
      elements === void 0 ||
      elements.forEach(function (el) {
        var _el$classList;
        return (_el$classList = el.classList).add.apply(
          _el$classList,
          _toConsumableArray(classes).concat(['!inline-flex', '!mr-2']),
        );
      });
  });
});

function onLegendItemClick(d, i) {
  emits('legendItemClick', d, i);
  var isBulletActive = !props.items[i].inactive;
  var isFilterApplied = props.items.some(function (i) {
    return i.inactive;
  });
  if (isFilterApplied && isBulletActive) {
    // reset filter
    emits(
      'update:items',
      props.items.map(function (item) {
        return _objectSpread(_objectSpread({}, item), {}, { inactive: false });
      }),
    );
  } else {
    // apply selection, set other item as inactive
    emits(
      'update:items',
      props.items.map(function (item) {
        return item.name === d.name
          ? _objectSpread(_objectSpread({}, d), {}, { inactive: false })
          : _objectSpread(_objectSpread({}, item), {}, { inactive: true });
      }),
    );
  }
}
</script>

<template>
  <div ref="elRef" class="w-max">
    <VisBulletLegend :items="items" :on-legend-item-click="onLegendItemClick" />
  </div>
</template>
