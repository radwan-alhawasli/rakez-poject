import { inject, ref, computed, onMounted, onUnmounted } from 'vue';

const SIDEBAR_KEY = Symbol('sidebar');

const MOBILE_BREAKPOINT = 992;

export function useSidebar() {
  const context = inject(SIDEBAR_KEY);
  if (!context) {
    return {
      state: ref('expanded'),
      open: ref(true),
      setOpen: () => {},
      openMobile: ref(false),
      setOpenMobile: () => {},
      isMobile: ref(false),
      toggleSidebar: () => {},
      hovered: ref(false),
      setHovered: () => {},
    };
  }
  return context;
}

export function createSidebarContext() {
  const open = ref(true);
  const openMobile = ref(false);
  const hovered = ref(false);
  const isMobile = ref(false);

  const updateMobile = () => {
    isMobile.value = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
  };

  /** @param {boolean} v */
  const setOpen = (v) => {
    open.value = v;
  };

  /** @param {boolean} v */
  const setOpenMobile = (v) => {
    openMobile.value = v;
  };

  /** @param {boolean} v */
  const setHovered = (v) => {
    hovered.value = v;
  };

  const toggleSidebar = () => {
    if (isMobile.value) {
      openMobile.value = !openMobile.value;
    } else {
      open.value = !open.value;
    }
  };

  const state = computed(() => (open.value ? 'expanded' : 'collapsed'));

  return {
    key: SIDEBAR_KEY,
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
    hovered,
    setHovered,
    updateMobile,
  };
}

export { SIDEBAR_KEY };
