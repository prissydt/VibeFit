const SESSION_KEY = "fitfinder_current_looks";

type LookData = {
  prompt: string;
  looks: any[];
  userSizes?: any;
  maxBudget?: number | null;
};

// In-memory image cache — survives navigation within the session but not a full page refresh.
// We keep images out of sessionStorage because 4 × base64 1024px PNGs (~5 MB) exceed the quota.
const imageCache = new Map<string, { modelImageB64: string; hotspots: any[] }>();

export const lookStore = {
  set: (d: LookData) => {
    // Separate images into the memory cache before persisting
    const looksWithoutImages = d.looks.map((look) => {
      if (look.modelImageB64) {
        imageCache.set(look.id, {
          modelImageB64: look.modelImageB64,
          hotspots: look.hotspots || [],
        });
      }
      const { modelImageB64, hotspots, ...rest } = look;
      return rest;
    });

    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ ...d, looks: looksWithoutImages })
      );
    } catch (e) {
      // sessionStorage quota exceeded — store only in memory as fallback
      console.warn("lookStore: sessionStorage quota exceeded, using memory only");
    }

    // Also keep the full (with-images) data in memory for immediate use
    _memoryStore = d;
  },

  get: (): LookData | null => {
    // Prefer memory (fastest, most current)
    if (_memoryStore) {
      return _memoryStore;
    }

    // Fall back to sessionStorage — re-attach cached images if available
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const data: LookData = JSON.parse(raw);
      data.looks = data.looks.map((look) => {
        const cached = imageCache.get(look.id);
        if (cached) {
          return { ...look, ...cached };
        }
        return look;
      });
      _memoryStore = data;
      return data;
    } catch {
      return null;
    }
  },

  clear: () => {
    _memoryStore = null;
    imageCache.clear();
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  },
};

// Module-level memory store — survives React re-renders and HMR
let _memoryStore: LookData | null = null;
