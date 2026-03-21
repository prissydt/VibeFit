export interface UserProfile {
  profileId: string;
  name?: string;
  gender?: "woman" | "man" | "non-binary" | "prefer-not-to-say";
  age?: number;
  skinTone?: "fair" | "light" | "medium" | "olive" | "tan" | "deep" | "rich";
  location?: string;
  sizes?: { top?: string; bottom?: string; shoes?: string; dress?: string };
  stylePreferences?: string[];
  avoidKeywords?: string[];
  likedLookIds?: string[];
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const STORAGE_KEY = "fitfinder_profile";

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const fresh: UserProfile = { profileId: generateId() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

let _profile: UserProfile = loadProfile();

export const profileStore = {
  get: () => _profile,
  set: (updates: Partial<UserProfile>) => {
    _profile = { ..._profile, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_profile));
    return _profile;
  },
  likeLook: (lookId: string) => {
    const ids = new Set(_profile.likedLookIds ?? []);
    ids.add(lookId);
    return profileStore.set({ likedLookIds: Array.from(ids) });
  },
  hasProfile: () => {
    const p = _profile;
    return !!(p.name || p.gender || p.age || p.skinTone || p.location);
  },
};
