/**
 * Derives a canonical tag set from product fields.
 * No API calls — pure string matching against known vocabularies.
 * Tags are merged with sourceTags and deduplicated before DB insert.
 */

const CATEGORY_BASE_TAGS: Record<string, string[]> = {
  Top:         ["top"],
  Bottom:      ["bottom"],
  Dress:       ["dress"],
  Shoes:       ["shoes", "footwear"],
  Bag:         ["bag", "accessory"],
  Outerwear:   ["outerwear", "layer"],
  Jewelry:     ["jewelry", "accessory"],
  Accessories: ["accessory"],
  Makeup:      ["makeup", "beauty"],
  Hair:        ["hair", "beauty"],
};

const COLOR_ALIASES: [RegExp, string][] = [
  [/\bblack\b/i,                     "black"],
  [/\bwhite|ivory|cream|ecru\b/i,    "white"],
  [/\bnavy|midnight\b/i,             "navy"],
  [/\bblue\b/i,                      "blue"],
  [/\bred|scarlet|crimson\b/i,       "red"],
  [/\bpink|blush|rose\b/i,           "pink"],
  [/\bgreen|sage|olive|khaki\b/i,    "green"],
  [/\bbeige|sand|nude|camel\b/i,     "beige"],
  [/\bgrey|gray|charcoal\b/i,        "grey"],
  [/\bbrown|chocolate|tan\b/i,       "brown"],
  [/\bburgundy|wine|maroon\b/i,      "burgundy"],
  [/\byellow|mustard|lemon\b/i,      "yellow"],
  [/\bpurple|violet|lavender\b/i,    "purple"],
  [/\borange|rust|terracotta\b/i,    "orange"],
  [/\bneutral|tonal\b/i,             "neutral"],
  [/\bmulti|print|pattern\b/i,       "print"],
];

const STYLE_KEYWORDS: [RegExp, string][] = [
  [/\bminimal|clean|simple\b/i,      "minimal"],
  [/\bboho|bohemian|free.?spirit\b/i,"boho"],
  [/\bedgy|leather|moto|rock\b/i,    "edgy"],
  [/\bromantic|feminine|floral\b/i,  "romantic"],
  [/\bclassic|timeless|tailored\b/i, "classic"],
  [/\bpreppy|collegiate\b/i,         "preppy"],
  [/\bstreet.?wear|urban|hype\b/i,   "streetwear"],
  [/\belegant|luxe|refined\b/i,      "elegant"],
  [/\bcasual|relaxed|everyday\b/i,   "casual"],
  [/\bglam|sparkle|sequin|embellish/i,"glam"],
];

const OCCASION_KEYWORDS: [RegExp, string][] = [
  [/\bwork|office|corporate|business\b/i,  "work"],
  [/\bdate|evening|dinner|night\b/i,       "date-night"],
  [/\bwedding|bridal|formal\b/i,           "wedding"],
  [/\bbrunch|weekend|daytime\b/i,          "brunch"],
  [/\bparty|cocktail|celebration\b/i,      "party"],
  [/\bbeach|resort|holiday|vacation\b/i,   "holiday"],
  [/\bgym|active|sport|athleisure\b/i,     "active"],
];

const SEASON_KEYWORDS: [RegExp, string][] = [
  [/\bsummer|warm|tropical\b/i,    "summer"],
  [/\bwinter|wool|knit|cosy|cozy\b/i,"winter"],
  [/\bspring|fresh|floral\b/i,     "spring"],
  [/\bautumn|fall|rust|earthy\b/i, "autumn"],
];

const FABRIC_KEYWORDS: [RegExp, string][] = [
  [/\blinen\b/i,   "linen"],
  [/\bsilk\b/i,    "silk"],
  [/\bcotton\b/i,  "cotton"],
  [/\bdenim\b/i,   "denim"],
  [/\bleather\b/i, "leather"],
  [/\bknit|knitwear|knitted\b/i, "knit"],
  [/\bsatin\b/i,   "satin"],
  [/\bvelvet\b/i,  "velvet"],
  [/\bsuede\b/i,   "suede"],
  [/\bchiffon\b/i, "chiffon"],
];

/** Exported so other modules can resolve canonical tag names from user-input keywords */
export function resolveColorTag(input: string): string | undefined {
  for (const [re, tag] of COLOR_ALIASES) {
    if (re.test(input)) return tag;
  }
  return undefined;
}

export function resolveStyleTag(input: string): string | undefined {
  for (const [re, tag] of STYLE_KEYWORDS) {
    if (re.test(input)) return tag;
  }
  return undefined;
}

export function resolveOccasionTag(input: string): string | undefined {
  for (const [re, tag] of OCCASION_KEYWORDS) {
    if (re.test(input)) return tag;
  }
  return undefined;
}

interface InferInput {
  category: string;
  subcategory?: string;
  color?: string;
  title: string;
  description?: string;
  sourceTags?: string[];
}

function matchAll(text: string, rules: [RegExp, string][]): string[] {
  return rules.filter(([re]) => re.test(text)).map(([, tag]) => tag);
}

export function inferTags(product: InferInput): string[] {
  const haystack = [
    product.title,
    product.description ?? "",
    product.subcategory ?? "",
    product.color ?? "",
  ].join(" ");

  const tags = new Set<string>();

  // Category base tags
  for (const t of CATEGORY_BASE_TAGS[product.category] ?? []) tags.add(t);

  // Color — prefer explicit field, fall back to text scan
  if (product.color) {
    for (const [re, tag] of COLOR_ALIASES) {
      if (re.test(product.color)) { tags.add(tag); break; }
    }
  }
  for (const t of matchAll(haystack, COLOR_ALIASES))    tags.add(t);
  for (const t of matchAll(haystack, STYLE_KEYWORDS))   tags.add(t);
  for (const t of matchAll(haystack, OCCASION_KEYWORDS)) tags.add(t);
  for (const t of matchAll(haystack, SEASON_KEYWORDS))  tags.add(t);
  for (const t of matchAll(haystack, FABRIC_KEYWORDS))  tags.add(t);

  // Merge source tags (lowercase, no duplicates)
  for (const t of product.sourceTags ?? []) tags.add(t.toLowerCase().trim());

  return [...tags].sort();
}
