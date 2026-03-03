<script setup>
import _objectSpread from 'C:/Users/User/Desktop/rakez-poject/node_modules/@babel/runtime/helpers/esm/objectSpread2.js';
import _slicedToArray from 'C:/Users/User/Desktop/rakez-poject/node_modules/@babel/runtime/helpers/esm/slicedToArray.js';
import 'core-js/modules/es.error.to-string.js';
import 'core-js/modules/es.array.find.js';
import 'core-js/modules/es.array.map.js';
import 'core-js/modules/es.date.to-string.js';
import 'core-js/modules/es.function.name.js';
import 'core-js/modules/es.iterator.constructor.js';
import 'core-js/modules/es.iterator.find.js';
import 'core-js/modules/es.iterator.map.js';
import 'core-js/modules/es.object.entries.js';
import 'core-js/modules/es.object.to-string.js';
import 'core-js/modules/es.regexp.to-string.js';
import 'core-js/modules/es.string.iterator.js';
import 'core-js/modules/es.weak-map.js';
import 'core-js/modules/es.weak-map.get-or-insert.js';
import 'core-js/modules/es.weak-map.get-or-insert-computed.js';
import 'core-js/modules/web.dom-collections.iterator.js';
import { omit } from '@unovis/ts';
import { VisCrosshair, VisTooltip } from '@unovis/vue';
import { createApp } from 'vue';
import { ChartTooltip } from '.';

var props = defineProps({
  colors: { type: Array, required: true, default: () => [] },
  index: { type: String, required: true },
  items: { type: Array, required: true },
  customTooltip: { type: null, required: false },
});

// Use weakmap to store reference to each datapoint for Tooltip
var wm = new WeakMap();
function template(d) {
  if (wm.has(d)) {
    return wm.get(d);
  } else {
    var _props$customTooltip;
    var componentDiv = document.createElement('div');
    var omittedData = Object.entries(omit(d, [props.index])).map(
      function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];
        var legendReference = props.items.find(function (i) {
          return i.name === key;
        });
        return _objectSpread(
          _objectSpread({}, legendReference),
          {},
          { value: value },
        );
      },
    );
    var TooltipComponent =
      (_props$customTooltip = props.customTooltip) !== null &&
      _props$customTooltip !== void 0
        ? _props$customTooltip
        : ChartTooltip;
    createApp(TooltipComponent, {
      title: d[props.index].toString(),
      data: omittedData,
    }).mount(componentDiv);
    wm.set(d, componentDiv.innerHTML);
    return componentDiv.innerHTML;
  }
}

function color(d, i) {
  var _props$colors$i;
  return (_props$colors$i = props.colors[i]) !== null &&
    _props$colors$i !== void 0
    ? _props$colors$i
    : 'transparent';
}
</script>

<template>
  <VisTooltip :horizontal-shift="20" :vertical-shift="20" />
  <VisCrosshair :template="template" :color="color" />
</template>
