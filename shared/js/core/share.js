/**
 * URL query string serialization / deserialization for sharing calculator states.
 */

export const Share = {
  /**
   * Serialize an input object into URL search params
   */
  serialize(input) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(input)) {
      if (val !== undefined && val !== null && val !== '') {
        params.set(key, String(val));
      }
    }
    return params.toString();
  },

  /**
   * Parse window.location.search or custom query string into key-value map
   */
  deserialize(searchString = window.location.search) {
    const params = new URLSearchParams(searchString);
    const result = {};
    for (const [key, val] of params.entries()) {
      // Try to parse numbers or booleans
      if (val === 'true') result[key] = true;
      else if (val === 'false') result[key] = false;
      else if (!Number.isNaN(Number(val)) && val.trim() !== '') {
        result[key] = Number(val);
      } else {
        result[key] = val;
      }
    }
    return result;
  },

  /**
   * Generate full shareable link
   */
  getShareableLink(input) {
    const base = window.location.origin + window.location.pathname;
    const query = Share.serialize(input);
    return query ? `${base}?${query}` : base;
  }
};
