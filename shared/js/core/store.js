/**
 * Local storage wrapper with error handling for private browsing / blocked storage.
 */

export const Store = {
  get(key, defaultVal = null) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return defaultVal;
      const raw = window.localStorage.getItem(key);
      if (raw === null) return defaultVal;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Store.get failed:', e);
      return defaultVal;
    }
  },

  set(key, val) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.warn('Store.set failed:', e);
      return false;
    }
  },

  remove(key) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn('Store.remove failed:', e);
    }
  }
};
