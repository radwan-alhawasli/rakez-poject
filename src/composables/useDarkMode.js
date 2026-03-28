import { ref, watch, onMounted } from 'vue';

const STORAGE_KEY = 'rakez-dark-mode';

const isDark = ref(false);

function applyTheme(dark) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggle() {
  isDark.value = !isDark.value;
}

export function useDarkMode() {
  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      isDark.value = stored === 'true';
    } else {
      isDark.value = false; // explicitly disable dark mode default behavior
    }
    applyTheme(isDark.value);
  });

  watch(isDark, (val) => {
    localStorage.setItem(STORAGE_KEY, String(val));
    applyTheme(val);
  });

  return { isDark, toggle };
}

