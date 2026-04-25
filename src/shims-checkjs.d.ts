/** Ambient shims for checkJs (no `export` — keeps this file global). */
declare module 'arabic-reshaper';

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
