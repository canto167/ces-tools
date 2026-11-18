/**
 * Responsive iframe embed helper
 * Sends document scrollHeight to parent page via postMessage.
 */

export const Embed = {
  init(slug) {
    if (typeof window === 'undefined' || window.self === window.top) {
      // Not in an iframe
      return;
    }

    const sendHeight = () => {
      const height = document.documentElement.scrollHeight || document.body.scrollHeight;
      window.parent.postMessage({
        type: 'ces-tool-resize',
        slug,
        height
      }, '*');
    };

    window.addEventListener('load', sendHeight);
    window.addEventListener('resize', sendHeight);
    
    // Observe DOM mutations for height changes
    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    // Initial ping
    sendHeight();
  }
};
