import type { GenerateOutfitsResponse } from "@workspace/api-client-react/src/generated/api.schemas";

let _data: GenerateOutfitsResponse | null = null;

export const lookStore = {
  set: (d: GenerateOutfitsResponse) => { _data = d; },
  get: () => _data,
  clear: () => { _data = null; }
};
