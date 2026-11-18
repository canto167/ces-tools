/**
 * Responsive iframe embed helper
 * Sends the height of the page CONTENT to the parent page via postMessage.
 *
 * It measures document.body (content height), not document.documentElement.scrollHeight:
 * inside an iframe the scroll height is never smaller than the iframe itself, so reporting it
 * made the parent grow the iframe on every message (runaway height). Only real changes of
 * more than 2 px are sent.
 */

export const Embed = {
  init(slug) {
    if (typeof window === 'undefined' || window.self === window.top) {
      // Not in an iframe
      return;
    }

    let lastSent = 0;
    let pending = false;

    const measure = () => Math.ceil(document.body.getBoundingClientRect().height);

    const sendHeight = () => {
      pending = false;
      const height = measure();
      if (!height || Math.abs(height - lastSent) <= 2) return;
      lastSent = height;
      window.parent.postMessage({ type: 'ces-tool-resize', slug, height }, '*');
    };

    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(sendHeight);
    };

    window.addEventListener('load', schedule);

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(schedule).observe(document.body);
    } else {
      window.addEventListener('resize', schedule);
      new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    }

    schedule();
  }
};
