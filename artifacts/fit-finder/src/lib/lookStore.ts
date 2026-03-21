const SESSION_KEY = "fitfinder_current_looks";

type LookData = {
  prompt: string;
  looks: any[];
  userSizes?: any;
  maxBudget?: number | null;
};

export const lookStore = {
  set: (d: LookData) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(d));
    } catch {}
  },
  get: (): LookData | null => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  },
};
