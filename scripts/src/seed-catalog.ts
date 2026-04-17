import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env") });

// Dynamic imports so dotenv runs before any module reads process.env
const { db, productsTable, outfitTemplatesTable } = await import("@workspace/db");
import type { InsertProduct, InsertOutfitTemplate } from "@workspace/db";

// ---- Helpers ----

function pid(n: number) {
  return `seed-${String(n).padStart(4, "0")}`;
}

function img(id: string) {
  return `https://placeholder.example.com/images/${id}.jpg`;
}

function url(id: string) {
  return `https://placeholder.example.com/product/${id}`;
}

// ---- Products ----

const products: InsertProduct[] = [
  // === TOPS (15) ===
  { externalId: pid(1),  source: "seed", title: "Linen Relaxed Blouse",           brand: "Seed Heritage",    category: "Top", subcategory: "blouse",   color: "white",    priceAud: 89.95,  imageUrl: img(pid(1)),  affiliateUrl: url(pid(1)),  retailer: "Seed Heritage", inStock: true, tags: ["blouse","white","casual","spring","summer","minimal","work"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(2),  source: "seed", title: "Silk Cami Top",                   brand: "Country Road",     category: "Top", subcategory: "cami",     color: "ivory",    priceAud: 79.00,  imageUrl: img(pid(2)),  affiliateUrl: url(pid(2)),  retailer: "Country Road",  inStock: true, tags: ["cami","ivory","elegant","date-night","evening","feminine","minimal"], sizes: ["XS","S","M","L"] },
  { externalId: pid(3),  source: "seed", title: "Stripe Cotton Tee",               brand: "Cotton On",        category: "Top", subcategory: "t-shirt",  color: "navy",     priceAud: 24.99,  imageUrl: img(pid(3)),  affiliateUrl: url(pid(3)),  retailer: "Cotton On",     inStock: true, tags: ["t-shirt","navy","casual","brunch","everyday","classic","summer"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(4),  source: "seed", title: "Ribbed Knit Tank",                brand: "Glassons",         category: "Top", subcategory: "tank",     color: "black",    priceAud: 34.99,  imageUrl: img(pid(4)),  affiliateUrl: url(pid(4)),  retailer: "Glassons",      inStock: true, tags: ["tank","black","casual","gym","minimal","everyday","versatile"], sizes: ["XS","S","M","L"] },
  { externalId: pid(5),  source: "seed", title: "Broderie Anglaise Top",           brand: "Witchery",         category: "Top", subcategory: "blouse",   color: "white",    priceAud: 109.95, imageUrl: img(pid(5)),  affiliateUrl: url(pid(5)),  retailer: "Witchery",      inStock: true, tags: ["blouse","white","romantic","brunch","spring","feminine","boho"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(6),  source: "seed", title: "Merino Crew Knit Sweater",        brand: "Country Road",     category: "Top", subcategory: "sweater",  color: "camel",    priceAud: 149.95, imageUrl: img(pid(6)),  affiliateUrl: url(pid(6)),  retailer: "Country Road",  inStock: true, tags: ["sweater","camel","classic","winter","autumn","work","preppy"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(7),  source: "seed", title: "Sheer Chiffon Blouse",            brand: "Mango",            category: "Top", subcategory: "blouse",   color: "black",    priceAud: 59.99,  imageUrl: img(pid(7)),  affiliateUrl: url(pid(7)),  retailer: "ASOS AU",       inStock: true, tags: ["blouse","black","elegant","date-night","evening","work","chic"], sizes: ["XS","S","M","L"] },
  { externalId: pid(8),  source: "seed", title: "Cropped Denim Jacket",            brand: "Glassons",         category: "Top", subcategory: "jacket",   color: "light-blue", priceAud: 69.99, imageUrl: img(pid(8)), affiliateUrl: url(pid(8)),  retailer: "Glassons",      inStock: true, tags: ["jacket","denim","casual","brunch","spring","streetwear","classic"], sizes: ["S","M","L","XL"] },
  { externalId: pid(9),  source: "seed", title: "Ruched Off-Shoulder Top",         brand: "ASOS",             category: "Top", subcategory: "top",      color: "burgundy", priceAud: 44.99,  imageUrl: img(pid(9)),  affiliateUrl: url(pid(9)),  retailer: "ASOS AU",       inStock: true, tags: ["top","burgundy","party","going-out","evening","feminine","date-night"], sizes: ["XS","S","M","L"] },
  { externalId: pid(10), source: "seed", title: "Longline Blazer",                 brand: "Witchery",         category: "Top", subcategory: "blazer",   color: "black",    priceAud: 199.95, imageUrl: img(pid(10)), affiliateUrl: url(pid(10)), retailer: "Witchery",      inStock: true, tags: ["blazer","black","work","interview","formal","classic","elegant"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(11), source: "seed", title: "Floral Wrap Blouse",              brand: "Gorman",           category: "Top", subcategory: "blouse",   color: "pink",     priceAud: 129.00, imageUrl: img(pid(11)), affiliateUrl: url(pid(11)), retailer: "Gorman",        inStock: true, tags: ["blouse","pink","romantic","spring","brunch","feminine","boho","floral"], sizes: ["XS","S","M","L"] },
  { externalId: pid(12), source: "seed", title: "Oversized Graphic Tee",           brand: "Cotton On",        category: "Top", subcategory: "t-shirt",  color: "white",    priceAud: 29.99,  imageUrl: img(pid(12)), affiliateUrl: url(pid(12)), retailer: "Cotton On",     inStock: true, tags: ["t-shirt","white","casual","streetwear","everyday","edgy","summer"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(13), source: "seed", title: "Satin Sleeveless Cami",           brand: "Zara",             category: "Top", subcategory: "cami",     color: "champagne",priceAud: 55.00,  imageUrl: img(pid(13)), affiliateUrl: url(pid(13)), retailer: "Zara",          inStock: true, tags: ["cami","champagne","party","going-out","evening","feminine","elegant"], sizes: ["XS","S","M","L"] },
  { externalId: pid(14), source: "seed", title: "Woven Linen Button-Down",         brand: "Seed Heritage",    category: "Top", subcategory: "shirt",    color: "beige",    priceAud: 99.95,  imageUrl: img(pid(14)), affiliateUrl: url(pid(14)), retailer: "Seed Heritage", inStock: true, tags: ["shirt","beige","casual","brunch","summer","minimal","classic","holiday"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(15), source: "seed", title: "Knit Turtleneck",                 brand: "H&M",              category: "Top", subcategory: "sweater",  color: "grey",     priceAud: 39.99,  imageUrl: img(pid(15)), affiliateUrl: url(pid(15)), retailer: "H&M",           inStock: true, tags: ["sweater","grey","casual","winter","autumn","minimal","work","classic"], sizes: ["XS","S","M","L","XL"] },

  // === BOTTOMS (10) ===
  { externalId: pid(16), source: "seed", title: "High-Waist Straight-Leg Jeans",   brand: "Glassons",         category: "Bottom", subcategory: "jeans",   color: "dark-blue", priceAud: 79.99, imageUrl: img(pid(16)), affiliateUrl: url(pid(16)), retailer: "Glassons",   inStock: true, tags: ["jeans","dark-blue","casual","brunch","everyday","classic","weekend"], sizes: ["6","8","10","12","14","16"] },
  { externalId: pid(17), source: "seed", title: "Midi Pleated Skirt",               brand: "Witchery",         category: "Bottom", subcategory: "skirt",   color: "black",     priceAud: 119.95,imageUrl: img(pid(17)), affiliateUrl: url(pid(17)), retailer: "Witchery",   inStock: true, tags: ["skirt","black","elegant","work","date-night","classic","midi"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(18), source: "seed", title: "Wide-Leg Linen Pants",             brand: "Country Road",     category: "Bottom", subcategory: "trousers",color: "white",     priceAud: 129.95,imageUrl: img(pid(18)), affiliateUrl: url(pid(18)), retailer: "Country Road",inStock: true, tags: ["trousers","white","casual","brunch","spring","summer","minimal","holiday"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(19), source: "seed", title: "Mini Denim Skirt",                 brand: "Cotton On",        category: "Bottom", subcategory: "skirt",   color: "light-blue",priceAud: 39.99, imageUrl: img(pid(19)), affiliateUrl: url(pid(19)), retailer: "Cotton On",  inStock: true, tags: ["skirt","denim","casual","streetwear","summer","edgy","brunch"], sizes: ["6","8","10","12","14"] },
  { externalId: pid(20), source: "seed", title: "Tailored Cigarette Pants",         brand: "Witchery",         category: "Bottom", subcategory: "trousers",color: "black",     priceAud: 149.95,imageUrl: img(pid(20)), affiliateUrl: url(pid(20)), retailer: "Witchery",   inStock: true, tags: ["trousers","black","work","interview","formal","classic","elegant"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(21), source: "seed", title: "Floral Midi Skirt",                brand: "Gorman",           category: "Bottom", subcategory: "skirt",   color: "pink",      priceAud: 139.00,imageUrl: img(pid(21)), affiliateUrl: url(pid(21)), retailer: "Gorman",     inStock: true, tags: ["skirt","pink","romantic","spring","brunch","feminine","boho","floral","midi"], sizes: ["XS","S","M","L"] },
  { externalId: pid(22), source: "seed", title: "Utility Cargo Pants",              brand: "Zara",             category: "Bottom", subcategory: "trousers",color: "khaki",     priceAud: 69.99, imageUrl: img(pid(22)), affiliateUrl: url(pid(22)), retailer: "Zara",       inStock: true, tags: ["trousers","khaki","casual","streetwear","edgy","autumn","weekend"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(23), source: "seed", title: "Satin Bias-Cut Skirt",             brand: "Seed Heritage",    category: "Bottom", subcategory: "skirt",   color: "champagne", priceAud: 109.95,imageUrl: img(pid(23)), affiliateUrl: url(pid(23)), retailer: "Seed Heritage",inStock: true, tags: ["skirt","champagne","elegant","party","date-night","evening","feminine"], sizes: ["XS","S","M","L"] },
  { externalId: pid(24), source: "seed", title: "Cotton High-Rise Shorts",          brand: "Cotton On",        category: "Bottom", subcategory: "shorts",  color: "white",     priceAud: 29.99, imageUrl: img(pid(24)), affiliateUrl: url(pid(24)), retailer: "Cotton On",  inStock: true, tags: ["shorts","white","casual","summer","holiday","brunch","minimal"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(25), source: "seed", title: "Pinstripe Trousers",               brand: "Witchery",         category: "Bottom", subcategory: "trousers",color: "navy",      priceAud: 159.95,imageUrl: img(pid(25)), affiliateUrl: url(pid(25)), retailer: "Witchery",   inStock: true, tags: ["trousers","navy","work","formal","classic","preppy","interview"], sizes: ["XS","S","M","L","XL"] },

  // === DRESSES (10) ===
  { externalId: pid(26), source: "seed", title: "Black Midi Wrap Dress",            brand: "Witchery",         category: "Dress", subcategory: "midi dress",  color: "black",    priceAud: 169.95, imageUrl: img(pid(26)), affiliateUrl: url(pid(26)), retailer: "Witchery",      inStock: true, tags: ["dress","midi","black","date-night","dinner","evening","elegant","feminine","classic"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(27), source: "seed", title: "Floral Maxi Sundress",             brand: "Spell",            category: "Dress", subcategory: "maxi dress",  color: "pink",     priceAud: 189.00, imageUrl: img(pid(27)), affiliateUrl: url(pid(27)), retailer: "Spell",         inStock: true, tags: ["dress","maxi","pink","boho","holiday","summer","spring","romantic","feminine","floral"], sizes: ["XS","S","M","L"] },
  { externalId: pid(28), source: "seed", title: "Linen Shirt Dress",                brand: "Country Road",     category: "Dress", subcategory: "shirt dress", color: "white",    priceAud: 149.95, imageUrl: img(pid(28)), affiliateUrl: url(pid(28)), retailer: "Country Road",  inStock: true, tags: ["dress","white","casual","brunch","weekend","minimal","spring","summer","holiday"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(29), source: "seed", title: "Bodycon Bandage Dress",            brand: "ASOS",             category: "Dress", subcategory: "bodycon",     color: "black",    priceAud: 64.99,  imageUrl: img(pid(29)), affiliateUrl: url(pid(29)), retailer: "ASOS AU",       inStock: true, tags: ["dress","black","party","going-out","evening","edgy","club","date-night"], sizes: ["XS","S","M","L"] },
  { externalId: pid(30), source: "seed", title: "Flowy Midi Boho Dress",            brand: "Gorman",           category: "Dress", subcategory: "midi dress",  color: "burgundy", priceAud: 149.00, imageUrl: img(pid(30)), affiliateUrl: url(pid(30)), retailer: "Gorman",        inStock: true, tags: ["dress","midi","burgundy","boho","romantic","autumn","brunch","feminine","evening"], sizes: ["XS","S","M","L"] },
  { externalId: pid(31), source: "seed", title: "Sheath Office Dress",              brand: "Seed Heritage",    category: "Dress", subcategory: "sheath",      color: "navy",     priceAud: 159.95, imageUrl: img(pid(31)), affiliateUrl: url(pid(31)), retailer: "Seed Heritage", inStock: true, tags: ["dress","navy","work","interview","formal","classic","elegant","preppy"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(32), source: "seed", title: "Strappy Satin Slip Dress",         brand: "Glassons",         category: "Dress", subcategory: "slip dress",  color: "champagne",priceAud: 89.99,  imageUrl: img(pid(32)), affiliateUrl: url(pid(32)), retailer: "Glassons",      inStock: true, tags: ["dress","champagne","party","date-night","evening","feminine","elegant","wedding-guest"], sizes: ["XS","S","M","L"] },
  { externalId: pid(33), source: "seed", title: "Zimmermann Linen Mini Dress",      brand: "Zimmermann",       category: "Dress", subcategory: "mini dress",  color: "white",    priceAud: 590.00, imageUrl: img(pid(33)), affiliateUrl: url(pid(33)), retailer: "Zimmermann",    inStock: true, tags: ["dress","mini","white","holiday","summer","boho","romantic","brunch","feminine","wedding-guest"], sizes: ["0","1","2","3","4"] },
  { externalId: pid(34), source: "seed", title: "Polka Dot Tea Dress",              brand: "Witchery",         category: "Dress", subcategory: "tea dress",   color: "black",    priceAud: 139.95, imageUrl: img(pid(34)), affiliateUrl: url(pid(34)), retailer: "Witchery",      inStock: true, tags: ["dress","black","brunch","casual","classic","spring","feminine","weekend"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(35), source: "seed", title: "Sir The Label Midi Dress",         brand: "Sir The Label",    category: "Dress", subcategory: "midi dress",  color: "camel",    priceAud: 380.00, imageUrl: img(pid(35)), affiliateUrl: url(pid(35)), retailer: "The Iconic",    inStock: true, tags: ["dress","midi","camel","elegant","wedding-guest","date-night","feminine","autumn","classic"], sizes: ["6","8","10","12","14"] },

  // === SHOES (10) ===
  { externalId: pid(36), source: "seed", title: "Block-Heel Mule Sandals",         brand: "Witchery",         category: "Shoes", subcategory: "mules",     color: "black",    priceAud: 149.95, imageUrl: img(pid(36)), affiliateUrl: url(pid(36)), retailer: "Witchery",      inStock: true, tags: ["shoes","heels","black","date-night","evening","elegant","classic","dinner"], sizes: ["36","37","38","39","40","41"] },
  { externalId: pid(37), source: "seed", title: "White Leather Sneakers",          brand: "Country Road",     category: "Shoes", subcategory: "sneakers",  color: "white",    priceAud: 189.95, imageUrl: img(pid(37)), affiliateUrl: url(pid(37)), retailer: "Country Road",  inStock: true, tags: ["shoes","sneakers","white","casual","everyday","brunch","minimal","streetwear"], sizes: ["36","37","38","39","40","41"] },
  { externalId: pid(38), source: "seed", title: "Strappy Heeled Sandal",           brand: "Seed Heritage",    category: "Shoes", subcategory: "sandals",   color: "nude",     priceAud: 169.95, imageUrl: img(pid(38)), affiliateUrl: url(pid(38)), retailer: "Seed Heritage", inStock: true, tags: ["shoes","heels","nude","date-night","wedding-guest","evening","feminine","elegant","summer"], sizes: ["36","37","38","39","40","41"] },
  { externalId: pid(39), source: "seed", title: "Leather Ankle Boots",             brand: "Witchery",         category: "Shoes", subcategory: "ankle boots",color: "black",   priceAud: 259.95, imageUrl: img(pid(39)), affiliateUrl: url(pid(39)), retailer: "Witchery",      inStock: true, tags: ["shoes","boots","ankle-boots","black","casual","autumn","winter","edgy","classic","streetwear"], sizes: ["36","37","38","39","40","41"] },
  { externalId: pid(40), source: "seed", title: "Strappy Barely-There Heels",      brand: "Billini",          category: "Shoes", subcategory: "heels",     color: "gold",     priceAud: 89.95,  imageUrl: img(pid(40)), affiliateUrl: url(pid(40)), retailer: "The Iconic",    inStock: true, tags: ["shoes","heels","gold","party","going-out","evening","feminine","wedding-guest","elegant"], sizes: ["36","37","38","39","40","41"] },
  { externalId: pid(41), source: "seed", title: "Flat Leather Loafers",            brand: "Witchery",         category: "Shoes", subcategory: "loafers",   color: "tan",      priceAud: 199.95, imageUrl: img(pid(41)), affiliateUrl: url(pid(41)), retailer: "Witchery",      inStock: true, tags: ["shoes","flats","tan","work","casual","classic","autumn","preppy","brunch"], sizes: ["36","37","38","39","40","41"] },
  { externalId: pid(42), source: "seed", title: "Espadrille Wedge Sandals",        brand: "Zara",             category: "Shoes", subcategory: "wedges",    color: "beige",    priceAud: 65.00,  imageUrl: img(pid(42)), affiliateUrl: url(pid(42)), retailer: "Zara",          inStock: true, tags: ["shoes","wedges","beige","summer","brunch","holiday","boho","casual"], sizes: ["36","37","38","39","40","41"] },
  { externalId: pid(43), source: "seed", title: "Platform Chelsea Boots",          brand: "Glassons",         category: "Shoes", subcategory: "boots",     color: "black",    priceAud: 119.99, imageUrl: img(pid(43)), affiliateUrl: url(pid(43)), retailer: "Glassons",      inStock: true, tags: ["shoes","boots","black","edgy","streetwear","autumn","winter","casual","party"], sizes: ["36","37","38","39","40","41"] },
  { externalId: pid(44), source: "seed", title: "Linen Mule Flats",                brand: "Country Road",     category: "Shoes", subcategory: "mules",     color: "white",    priceAud: 129.95, imageUrl: img(pid(44)), affiliateUrl: url(pid(44)), retailer: "Country Road",  inStock: true, tags: ["shoes","flats","mules","white","casual","spring","summer","minimal","brunch"], sizes: ["36","37","38","39","40","41"] },
  { externalId: pid(45), source: "seed", title: "Point-Toe Kitten Heels",          brand: "Witchery",         category: "Shoes", subcategory: "heels",     color: "black",    priceAud: 179.95, imageUrl: img(pid(45)), affiliateUrl: url(pid(45)), retailer: "Witchery",      inStock: true, tags: ["shoes","heels","black","work","interview","formal","classic","elegant"], sizes: ["36","37","38","39","40","41"] },

  // === BAGS (10) ===
  { externalId: pid(46), source: "seed", title: "Black Satin Evening Clutch",      brand: "Witchery",         category: "Bag", subcategory: "clutch",      color: "black",    priceAud: 89.95,  imageUrl: img(pid(46)), affiliateUrl: url(pid(46)), retailer: "Witchery",      inStock: true, tags: ["bag","clutch","black","evening","date-night","party","elegant","small"], },
  { externalId: pid(47), source: "seed", title: "Structured Leather Tote",         brand: "Seed Heritage",    category: "Bag", subcategory: "tote",        color: "tan",      priceAud: 199.95, imageUrl: img(pid(47)), affiliateUrl: url(pid(47)), retailer: "Seed Heritage", inStock: true, tags: ["bag","tote","tan","work","everyday","classic","casual","leather"], },
  { externalId: pid(48), source: "seed", title: "Woven Rattan Clutch",             brand: "The Iconic",       category: "Bag", subcategory: "clutch",      color: "natural",  priceAud: 59.95,  imageUrl: img(pid(48)), affiliateUrl: url(pid(48)), retailer: "The Iconic",    inStock: true, tags: ["bag","clutch","natural","boho","summer","holiday","brunch","casual"], },
  { externalId: pid(49), source: "seed", title: "Gold Chain Mini Bag",             brand: "Mango",            category: "Bag", subcategory: "crossbody",   color: "gold",     priceAud: 79.99,  imageUrl: img(pid(49)), affiliateUrl: url(pid(49)), retailer: "ASOS AU",       inStock: true, tags: ["bag","crossbody","gold","small","party","date-night","evening","chic","feminine"], },
  { externalId: pid(50), source: "seed", title: "Canvas Tote Bag",                 brand: "Cotton On",        category: "Bag", subcategory: "tote",        color: "beige",    priceAud: 29.99,  imageUrl: img(pid(50)), affiliateUrl: url(pid(50)), retailer: "Cotton On",     inStock: true, tags: ["bag","tote","beige","casual","everyday","brunch","weekend","minimal"], },
  { externalId: pid(51), source: "seed", title: "Black Leather Crossbody",         brand: "Country Road",     category: "Bag", subcategory: "crossbody",   color: "black",    priceAud: 169.95, imageUrl: img(pid(51)), affiliateUrl: url(pid(51)), retailer: "Country Road",  inStock: true, tags: ["bag","crossbody","black","casual","weekend","classic","leather","everyday"], },
  { externalId: pid(52), source: "seed", title: "Pearl-Trim Satin Clutch",         brand: "Witchery",         category: "Bag", subcategory: "clutch",      color: "ivory",    priceAud: 109.95, imageUrl: img(pid(52)), affiliateUrl: url(pid(52)), retailer: "Witchery",      inStock: true, tags: ["bag","clutch","ivory","wedding-guest","elegant","feminine","evening","small"], },
  { externalId: pid(53), source: "seed", title: "Mini Leather Backpack",           brand: "Glassons",         category: "Bag", subcategory: "backpack",    color: "black",    priceAud: 79.99,  imageUrl: img(pid(53)), affiliateUrl: url(pid(53)), retailer: "Glassons",      inStock: true, tags: ["bag","backpack","black","casual","streetwear","edgy","everyday","weekend"], },
  { externalId: pid(54), source: "seed", title: "Straw Beach Bag",                 brand: "The Iconic",       category: "Bag", subcategory: "tote",        color: "natural",  priceAud: 49.95,  imageUrl: img(pid(54)), affiliateUrl: url(pid(54)), retailer: "The Iconic",    inStock: true, tags: ["bag","tote","natural","summer","holiday","beach","boho","casual"], },
  { externalId: pid(55), source: "seed", title: "Oversized Shopper Tote",          brand: "Zara",             category: "Bag", subcategory: "tote",        color: "beige",    priceAud: 69.99,  imageUrl: img(pid(55)), affiliateUrl: url(pid(55)), retailer: "Zara",          inStock: true, tags: ["bag","tote","beige","work","everyday","casual","minimal","classic"], },

  // === JEWELRY (10) ===
  { externalId: pid(56), source: "seed", title: "Gold Hoop Earrings",              brand: "Gorman",           category: "Jewelry", subcategory: "earrings", color: "gold",     priceAud: 59.00,  imageUrl: img(pid(56)), affiliateUrl: url(pid(56)), retailer: "Gorman",        inStock: true, tags: ["jewelry","earrings","gold","statement","date-night","evening","classic","feminine"], },
  { externalId: pid(57), source: "seed", title: "Pearl Drop Earrings",             brand: "Witchery",         category: "Jewelry", subcategory: "earrings", color: "white",    priceAud: 49.95,  imageUrl: img(pid(57)), affiliateUrl: url(pid(57)), retailer: "Witchery",      inStock: true, tags: ["jewelry","earrings","pearl","white","elegant","classic","wedding-guest","feminine","minimal"], },
  { externalId: pid(58), source: "seed", title: "Delicate Gold Chain Necklace",    brand: "Seed Heritage",    category: "Jewelry", subcategory: "necklace", color: "gold",     priceAud: 79.95,  imageUrl: img(pid(58)), affiliateUrl: url(pid(58)), retailer: "Seed Heritage", inStock: true, tags: ["jewelry","necklace","gold","minimal","everyday","classic","layering","delicate"], },
  { externalId: pid(59), source: "seed", title: "Silver Statement Cuff",           brand: "Gorman",           category: "Jewelry", subcategory: "bracelet", color: "silver",   priceAud: 89.00,  imageUrl: img(pid(59)), affiliateUrl: url(pid(59)), retailer: "Gorman",        inStock: true, tags: ["jewelry","bracelet","silver","statement","edgy","party","going-out","bold"], },
  { externalId: pid(60), source: "seed", title: "Crystal Stud Earrings",           brand: "Witchery",         category: "Jewelry", subcategory: "earrings", color: "crystal",  priceAud: 39.95,  imageUrl: img(pid(60)), affiliateUrl: url(pid(60)), retailer: "Witchery",      inStock: true, tags: ["jewelry","earrings","crystal","party","wedding-guest","evening","feminine","sparkle"], },
  { externalId: pid(61), source: "seed", title: "Twisted Gold Ring",               brand: "Country Road",     category: "Jewelry", subcategory: "ring",     color: "gold",     priceAud: 45.00,  imageUrl: img(pid(61)), affiliateUrl: url(pid(61)), retailer: "Country Road",  inStock: true, tags: ["jewelry","ring","gold","minimal","everyday","classic","delicate","stacking"], },
  { externalId: pid(62), source: "seed", title: "Tassel Drop Earrings",            brand: "Gorman",           category: "Jewelry", subcategory: "earrings", color: "gold",     priceAud: 69.00,  imageUrl: img(pid(62)), affiliateUrl: url(pid(62)), retailer: "Gorman",        inStock: true, tags: ["jewelry","earrings","gold","tassel","boho","brunch","spring","statement","feminine"], },
  { externalId: pid(63), source: "seed", title: "Sculptural Acrylic Earrings",     brand: "Gorman",           category: "Jewelry", subcategory: "earrings", color: "multi",    priceAud: 79.00,  imageUrl: img(pid(63)), affiliateUrl: url(pid(63)), retailer: "Gorman",        inStock: true, tags: ["jewelry","earrings","statement","colorful","edgy","party","bold","playful"], },
  { externalId: pid(64), source: "seed", title: "Tennis Bracelet",                 brand: "Witchery",         category: "Jewelry", subcategory: "bracelet", color: "silver",   priceAud: 69.95,  imageUrl: img(pid(64)), affiliateUrl: url(pid(64)), retailer: "Witchery",      inStock: true, tags: ["jewelry","bracelet","silver","elegant","date-night","evening","classic","feminine"], },
  { externalId: pid(65), source: "seed", title: "Layered Beaded Necklace",         brand: "Gorman",           category: "Jewelry", subcategory: "necklace", color: "natural",  priceAud: 55.00,  imageUrl: img(pid(65)), affiliateUrl: url(pid(65)), retailer: "Gorman",        inStock: true, tags: ["jewelry","necklace","beaded","boho","casual","brunch","summer","festival"], },

  // === ACCESSORIES (10) ===
  { externalId: pid(66), source: "seed", title: "Black Leather Belt",              brand: "Country Road",     category: "Accessories", subcategory: "belt",         color: "black",  priceAud: 59.95,  imageUrl: img(pid(66)), affiliateUrl: url(pid(66)), retailer: "Country Road",  inStock: true, tags: ["accessories","belt","black","classic","work","casual","minimal","elegant"], },
  { externalId: pid(67), source: "seed", title: "Silk Printed Scarf",              brand: "Seed Heritage",    category: "Accessories", subcategory: "scarf",        color: "multi",  priceAud: 79.95,  imageUrl: img(pid(67)), affiliateUrl: url(pid(67)), retailer: "Seed Heritage", inStock: true, tags: ["accessories","scarf","multi","elegant","classic","autumn","winter","feminine"], },
  { externalId: pid(68), source: "seed", title: "Oversized Cat-Eye Sunglasses",    brand: "The Iconic",       category: "Accessories", subcategory: "sunglasses",   color: "black",  priceAud: 39.95,  imageUrl: img(pid(68)), affiliateUrl: url(pid(68)), retailer: "The Iconic",    inStock: true, tags: ["accessories","sunglasses","black","summer","holiday","casual","brunch","street"], },
  { externalId: pid(69), source: "seed", title: "Wide-Brim Straw Hat",             brand: "The Iconic",       category: "Accessories", subcategory: "hat",          color: "natural",priceAud: 49.95,  imageUrl: img(pid(69)), affiliateUrl: url(pid(69)), retailer: "The Iconic",    inStock: true, tags: ["accessories","hat","natural","summer","holiday","beach","boho","casual"], },
  { externalId: pid(70), source: "seed", title: "Beanie - Ribbed Wool",            brand: "Country Road",     category: "Accessories", subcategory: "hat",          color: "grey",   priceAud: 45.00,  imageUrl: img(pid(70)), affiliateUrl: url(pid(70)), retailer: "Country Road",  inStock: true, tags: ["accessories","hat","beanie","grey","winter","casual","minimal","cozy"], },
  { externalId: pid(71), source: "seed", title: "Gold Chain Belt",                 brand: "Zara",             category: "Accessories", subcategory: "belt",         color: "gold",   priceAud: 45.00,  imageUrl: img(pid(71)), affiliateUrl: url(pid(71)), retailer: "Zara",          inStock: true, tags: ["accessories","belt","gold","party","evening","chic","statement","feminine"], },
  { externalId: pid(72), source: "seed", title: "Aviator Sunglasses",              brand: "The Iconic",       category: "Accessories", subcategory: "sunglasses",   color: "gold",   priceAud: 34.95,  imageUrl: img(pid(72)), affiliateUrl: url(pid(72)), retailer: "The Iconic",    inStock: true, tags: ["accessories","sunglasses","gold","classic","brunch","summer","casual","holiday"], },
  { externalId: pid(73), source: "seed", title: "Cashmere Blend Scarf",            brand: "Witchery",         category: "Accessories", subcategory: "scarf",        color: "camel",  priceAud: 89.95,  imageUrl: img(pid(73)), affiliateUrl: url(pid(73)), retailer: "Witchery",      inStock: true, tags: ["accessories","scarf","camel","winter","autumn","classic","minimal","cozy"], },
  { externalId: pid(74), source: "seed", title: "Velvet Hair Bow",                 brand: "Glassons",         category: "Accessories", subcategory: "hair accessory",color: "black", priceAud: 19.99,  imageUrl: img(pid(74)), affiliateUrl: url(pid(74)), retailer: "Glassons",      inStock: true, tags: ["accessories","hair","black","feminine","cute","casual","evening","brunch"], },
  { externalId: pid(75), source: "seed", title: "Bucket Hat",                      brand: "Cotton On",        category: "Accessories", subcategory: "hat",          color: "beige",  priceAud: 24.99,  imageUrl: img(pid(75)), affiliateUrl: url(pid(75)), retailer: "Cotton On",     inStock: true, tags: ["accessories","hat","beige","summer","casual","streetwear","festival","holiday"], },

  // === OUTERWEAR (5) ===
  { externalId: pid(76), source: "seed", title: "Classic Trench Coat",             brand: "Country Road",     category: "Outerwear", subcategory: "trench",  color: "camel",  priceAud: 349.95, imageUrl: img(pid(76)), affiliateUrl: url(pid(76)), retailer: "Country Road",  inStock: true, tags: ["outerwear","coat","camel","classic","autumn","winter","work","elegant","timeless"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(77), source: "seed", title: "Oversized Wool Blazer",           brand: "Witchery",         category: "Outerwear", subcategory: "blazer",  color: "black",  priceAud: 249.95, imageUrl: img(pid(77)), affiliateUrl: url(pid(77)), retailer: "Witchery",      inStock: true, tags: ["outerwear","blazer","black","work","autumn","winter","classic","elegant","formal"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(78), source: "seed", title: "Puffer Quilted Vest",             brand: "Cotton On",        category: "Outerwear", subcategory: "vest",    color: "black",  priceAud: 59.99,  imageUrl: img(pid(78)), affiliateUrl: url(pid(78)), retailer: "Cotton On",     inStock: true, tags: ["outerwear","vest","black","casual","winter","autumn","streetwear","weekend"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(79), source: "seed", title: "Linen Summer Blazer",             brand: "Seed Heritage",    category: "Outerwear", subcategory: "blazer",  color: "white",  priceAud: 189.95, imageUrl: img(pid(79)), affiliateUrl: url(pid(79)), retailer: "Seed Heritage", inStock: true, tags: ["outerwear","blazer","white","spring","summer","casual","minimal","brunch","work"], sizes: ["XS","S","M","L","XL"] },
  { externalId: pid(80), source: "seed", title: "Leather Moto Jacket",             brand: "Glassons",         category: "Outerwear", subcategory: "jacket",  color: "black",  priceAud: 149.99, imageUrl: img(pid(80)), affiliateUrl: url(pid(80)), retailer: "Glassons",      inStock: true, tags: ["outerwear","jacket","black","edgy","streetwear","casual","autumn","party","cool"], sizes: ["XS","S","M","L","XL"] },

  // === MAKEUP (10) ===
  { externalId: pid(81), source: "seed", title: "Velvet Matte Lip Colour — Deep Plum",    brand: "Mecca Cosmetica",  category: "Makeup", subcategory: "lip",    color: "plum",    priceAud: 28.00, imageUrl: img(pid(81)), affiliateUrl: url(pid(81)), retailer: "Mecca",         inStock: true, tags: ["makeup","lip","plum","evening","date-night","bold","autumn","winter"], },
  { externalId: pid(82), source: "seed", title: "Glossy Lip Treatment — Rose",            brand: "Lanolips",         category: "Makeup", subcategory: "lip",    color: "rose",    priceAud: 22.95, imageUrl: img(pid(82)), affiliateUrl: url(pid(82)), retailer: "Priceline",     inStock: true, tags: ["makeup","lip","rose","natural","everyday","casual","brunch","feminine","minimal"], },
  { externalId: pid(83), source: "seed", title: "Longwear Matte Foundation — Medium",     brand: "Napoleon Perdis", category: "Makeup", subcategory: "foundation",color: "medium", priceAud: 55.00, imageUrl: img(pid(83)), affiliateUrl: url(pid(83)), retailer: "Mecca",         inStock: true, tags: ["makeup","foundation","medium","everyday","work","natural","coverage"], },
  { externalId: pid(84), source: "seed", title: "Mascara — Black Extreme Volume",         brand: "Australis",        category: "Makeup", subcategory: "mascara",color: "black",   priceAud: 18.99, imageUrl: img(pid(84)), affiliateUrl: url(pid(84)), retailer: "Priceline",     inStock: true, tags: ["makeup","mascara","black","everyday","volume","natural","casual","everyday"], },
  { externalId: pid(85), source: "seed", title: "Nude Matte Lip Kit",                    brand: "Mecca Cosmetica",  category: "Makeup", subcategory: "lip",    color: "nude",    priceAud: 32.00, imageUrl: img(pid(85)), affiliateUrl: url(pid(85)), retailer: "Mecca",         inStock: true, tags: ["makeup","lip","nude","natural","everyday","work","interview","minimal","classic"], },
  { externalId: pid(86), source: "seed", title: "Warm Bronze Eyeshadow Palette",         brand: "Mecca Cosmetica",  category: "Makeup", subcategory: "eyeshadow",color: "bronze", priceAud: 45.00, imageUrl: img(pid(86)), affiliateUrl: url(pid(86)), retailer: "Mecca",         inStock: true, tags: ["makeup","eyeshadow","bronze","warm","date-night","evening","glam","autumn"], },
  { externalId: pid(87), source: "seed", title: "Dewy Setting Spray",                    brand: "Mecca Cosmetica",  category: "Makeup", subcategory: "setting",color: "clear",   priceAud: 35.00, imageUrl: img(pid(87)), affiliateUrl: url(pid(87)), retailer: "Mecca",         inStock: true, tags: ["makeup","setting","dewy","natural","everyday","brunch","fresh","summer"], },
  { externalId: pid(88), source: "seed", title: "Red Matte Lipstick",                    brand: "NYX",              category: "Makeup", subcategory: "lip",    color: "red",     priceAud: 19.99, imageUrl: img(pid(88)), affiliateUrl: url(pid(88)), retailer: "Priceline",     inStock: true, tags: ["makeup","lip","red","bold","classic","date-night","party","evening","statement"], },
  { externalId: pid(89), source: "seed", title: "Luminous Blush — Peachy Pink",          brand: "Mecca Cosmetica",  category: "Makeup", subcategory: "blush",  color: "peach",   priceAud: 38.00, imageUrl: img(pid(89)), affiliateUrl: url(pid(89)), retailer: "Mecca",         inStock: true, tags: ["makeup","blush","peach","natural","brunch","feminine","spring","fresh"], },
  { externalId: pid(90), source: "seed", title: "Smoky Eye Kohl Liner",                  brand: "Australis",        category: "Makeup", subcategory: "liner",  color: "black",   priceAud: 14.99, imageUrl: img(pid(90)), affiliateUrl: url(pid(90)), retailer: "Priceline",     inStock: true, tags: ["makeup","liner","black","smoky","evening","date-night","edgy","party","bold"], },

  // === HAIR (10) ===
  { externalId: pid(91),  source: "seed", title: "Dry Shampoo — Fresh Volume",       brand: "Batiste",          category: "Hair", subcategory: "dry-shampoo", color: null, priceAud: 12.99, imageUrl: img(pid(91)),  affiliateUrl: url(pid(91)),  retailer: "Priceline",    inStock: true, tags: ["hair","dry-shampoo","volume","everyday","casual","quick","refresh"], },
  { externalId: pid(92),  source: "seed", title: "Argan Oil Hair Serum",              brand: "Moroccanoil",      category: "Hair", subcategory: "oil",         color: null, priceAud: 45.00, imageUrl: img(pid(92)),  affiliateUrl: url(pid(92)),  retailer: "Mecca",        inStock: true, tags: ["hair","oil","serum","smooth","frizz","shine","everyday","care"], },
  { externalId: pid(93),  source: "seed", title: "Texturising Salt Spray",            brand: "Kevin Murphy",     category: "Hair", subcategory: "styling",     color: null, priceAud: 38.00, imageUrl: img(pid(93)),  affiliateUrl: url(pid(93)),  retailer: "Mecca",        inStock: true, tags: ["hair","texture","salt-spray","beach","casual","summer","boho","effortless"], },
  { externalId: pid(94),  source: "seed", title: "Strong Hold Hair Spray",            brand: "Redken",           category: "Hair", subcategory: "styling",     color: null, priceAud: 32.00, imageUrl: img(pid(94)),  affiliateUrl: url(pid(94)),  retailer: "Priceline",    inStock: true, tags: ["hair","hairspray","hold","styling","evening","formal","updo","classic"], },
  { externalId: pid(95),  source: "seed", title: "Leave-In Conditioning Cream",       brand: "Shea Moisture",    category: "Hair", subcategory: "conditioner", color: null, priceAud: 22.99, imageUrl: img(pid(95)),  affiliateUrl: url(pid(95)),  retailer: "Priceline",    inStock: true, tags: ["hair","conditioner","moisture","curly","care","natural","everyday"], },
  { externalId: pid(96),  source: "seed", title: "Smoothing Blow-Dry Cream",          brand: "ghd",              category: "Hair", subcategory: "styling",     color: null, priceAud: 49.00, imageUrl: img(pid(96)),  affiliateUrl: url(pid(96)),  retailer: "Mecca",        inStock: true, tags: ["hair","blowdry","smooth","styling","work","classic","sleek","polish"], },
  { externalId: pid(97),  source: "seed", title: "Hair Gloss Treatment",              brand: "Moroccanoil",      category: "Hair", subcategory: "treatment",   color: null, priceAud: 55.00, imageUrl: img(pid(97)),  affiliateUrl: url(pid(97)),  retailer: "Mecca",        inStock: true, tags: ["hair","gloss","shine","treatment","evening","glossy","care","elegant"], },
  { externalId: pid(98),  source: "seed", title: "Beach Waves Spray",                 brand: "Not Your Mother's",category: "Hair", subcategory: "styling",     color: null, priceAud: 15.99, imageUrl: img(pid(98)),  affiliateUrl: url(pid(98)),  retailer: "Chemist Warehouse",inStock: true, tags: ["hair","waves","beach","casual","boho","summer","holiday","effortless"], },
  { externalId: pid(99),  source: "seed", title: "Volumising Mousse",                 brand: "Schwarzkopf",      category: "Hair", subcategory: "styling",     color: null, priceAud: 11.99, imageUrl: img(pid(99)),  affiliateUrl: url(pid(99)),  retailer: "Priceline",    inStock: true, tags: ["hair","mousse","volume","styling","everyday","party","bouncy","casual"], },
  { externalId: pid(100), source: "seed", title: "Keratin Smoothing Serum",           brand: "Kerastase",        category: "Hair", subcategory: "serum",       color: null, priceAud: 65.00, imageUrl: img(pid(100)), affiliateUrl: url(pid(100)), retailer: "Mecca",        inStock: true, tags: ["hair","serum","smooth","frizz","sleek","work","elegant","formal"], },
];

// ---- Outfit Templates (20) ----

const templates: InsertOutfitTemplate[] = [
  // 4 DATE NIGHT
  {
    title: "Romantic Date Night",
    occasions: ["date", "dinner"],
    seasons: ["spring", "autumn"],
    vibeKeywords: ["romantic", "feminine", "elegant"],
    colorPalette: ["black", "burgundy", "gold"],
    budgetTier: "mid-range",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Dress",       tags: ["midi","black","date-night","dinner","elegant"],  required: true  },
      { category: "Shoes",       tags: ["heels","black","evening","date-night"],           required: true  },
      { category: "Bag",         tags: ["clutch","small","evening","date-night"],          required: true  },
      { category: "Jewelry",     tags: ["earrings","gold","statement","evening"],          required: true  },
      { category: "Makeup",      tags: ["lip","evening","date-night","bold"],              required: false },
      { category: "Hair",        tags: ["hair","styling","evening","glossy"],              required: false },
    ],
  },
  {
    title: "Edgy Date Night",
    occasions: ["date", "party"],
    seasons: ["autumn", "winter"],
    vibeKeywords: ["edgy", "bold", "chic"],
    colorPalette: ["black", "silver", "red"],
    budgetTier: "high-street",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Dress",       tags: ["black","party","bodycon","evening","edgy"],       required: true  },
      { category: "Shoes",       tags: ["boots","black","edgy","ankle-boots"],             required: true  },
      { category: "Bag",         tags: ["bag","black","evening","small"],                  required: true  },
      { category: "Jewelry",     tags: ["jewelry","statement","bold","silver"],            required: true  },
      { category: "Makeup",      tags: ["makeup","smoky","evening","bold","liner"],        required: false },
    ],
  },
  {
    title: "Classic Date Night",
    occasions: ["date", "dinner"],
    seasons: ["summer", "spring"],
    vibeKeywords: ["classic", "elegant", "timeless"],
    colorPalette: ["nude", "champagne", "gold"],
    budgetTier: "premium",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Dress",       tags: ["dress","elegant","feminine","slip-dress","champagne"], required: true  },
      { category: "Shoes",       tags: ["shoes","heels","nude","strappy","elegant"],             required: true  },
      { category: "Bag",         tags: ["bag","clutch","ivory","elegant","small"],               required: true  },
      { category: "Jewelry",     tags: ["jewelry","earrings","pearl","elegant","classic"],       required: true  },
      { category: "Makeup",      tags: ["makeup","nude","natural","classic"],                    required: false },
    ],
  },
  {
    title: "Casual Date Night",
    occasions: ["date", "dinner"],
    seasons: ["spring", "summer"],
    vibeKeywords: ["casual", "relaxed", "feminine"],
    colorPalette: ["white", "beige", "gold"],
    budgetTier: "high-street",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Top",         tags: ["cami","ivory","casual","feminine"],               required: false },
      { category: "Dress",       tags: ["dress","casual","white","brunch","feminine"],     required: false },
      { category: "Bottom",      tags: ["skirt","midi","casual","feminine"],               required: false },
      { category: "Shoes",       tags: ["shoes","sandals","strappy","summer","casual"],    required: true  },
      { category: "Bag",         tags: ["bag","crossbody","casual","small"],               required: true  },
      { category: "Jewelry",     tags: ["jewelry","earrings","gold","delicate"],           required: true  },
    ],
  },

  // 3 WORK/OFFICE
  {
    title: "Power Office Look",
    occasions: ["work", "interview"],
    seasons: ["autumn", "winter", "spring"],
    vibeKeywords: ["professional", "polished", "confident"],
    colorPalette: ["black", "navy", "white"],
    budgetTier: "mid-range",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Top",         tags: ["blazer","black","work","formal","elegant"],       required: true  },
      { category: "Bottom",      tags: ["trousers","black","work","classic","tailored"],   required: true  },
      { category: "Shoes",       tags: ["shoes","heels","black","work","classic"],         required: true  },
      { category: "Bag",         tags: ["bag","tote","work","classic","leather"],          required: true  },
      { category: "Jewelry",     tags: ["jewelry","necklace","minimal","classic"],         required: false },
      { category: "Makeup",      tags: ["makeup","nude","natural","work","minimal"],       required: false },
    ],
  },
  {
    title: "Creative Office Chic",
    occasions: ["work", "brunch"],
    seasons: ["spring", "summer"],
    vibeKeywords: ["creative", "minimal", "chic"],
    colorPalette: ["white", "tan", "camel"],
    budgetTier: "mid-range",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Dress",       tags: ["dress","work","classic","elegant","sheath"],      required: false },
      { category: "Top",         tags: ["blouse","white","work","minimal","casual"],       required: false },
      { category: "Bottom",      tags: ["trousers","work","classic","elegant"],            required: false },
      { category: "Shoes",       tags: ["shoes","flats","loafers","work","casual"],        required: true  },
      { category: "Bag",         tags: ["bag","tote","work","everyday"],                   required: true  },
      { category: "Accessories", tags: ["accessories","minimal","classic","scarf"],        required: false },
    ],
  },
  {
    title: "Interview Ready",
    occasions: ["interview", "work", "formal"],
    seasons: ["autumn", "winter", "spring"],
    vibeKeywords: ["confident", "polished", "classic"],
    colorPalette: ["navy", "black", "white"],
    budgetTier: "mid-range",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Dress",       tags: ["dress","work","formal","classic","sheath","navy"],required: false },
      { category: "Top",         tags: ["blazer","work","formal","interview"],             required: false },
      { category: "Bottom",      tags: ["trousers","navy","work","formal","interview"],    required: false },
      { category: "Shoes",       tags: ["shoes","heels","work","classic","formal"],        required: true  },
      { category: "Bag",         tags: ["bag","tote","work","classic"],                    required: true  },
      { category: "Makeup",      tags: ["makeup","nude","natural","minimal","work"],       required: false },
    ],
  },

  // 3 BRUNCH/WEEKEND
  {
    title: "Weekend Brunch",
    occasions: ["brunch", "casual"],
    seasons: ["spring", "summer"],
    vibeKeywords: ["relaxed", "casual", "feminine"],
    colorPalette: ["white", "beige", "pink"],
    budgetTier: "high-street",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Dress",       tags: ["dress","casual","brunch","white","feminine"],     required: false },
      { category: "Top",         tags: ["blouse","white","casual","brunch","spring"],      required: false },
      { category: "Bottom",      tags: ["jeans","skirt","casual","weekend","brunch"],      required: false },
      { category: "Shoes",       tags: ["shoes","sneakers","casual","flats","brunch"],     required: true  },
      { category: "Bag",         tags: ["bag","tote","casual","everyday","brunch"],        required: true  },
      { category: "Accessories", tags: ["accessories","sunglasses","casual","summer"],     required: false },
    ],
  },
  {
    title: "Boho Brunch",
    occasions: ["brunch", "casual"],
    seasons: ["spring", "summer"],
    vibeKeywords: ["boho", "romantic", "feminine"],
    colorPalette: ["white", "natural", "gold"],
    budgetTier: "mid-range",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Dress",       tags: ["dress","boho","feminine","floral","casual"],      required: false },
      { category: "Top",         tags: ["blouse","feminine","boho","spring","romantic"],   required: false },
      { category: "Bottom",      tags: ["skirt","boho","floral","midi","feminine"],        required: false },
      { category: "Shoes",       tags: ["shoes","sandals","boho","summer","espadrilles"],  required: true  },
      { category: "Bag",         tags: ["bag","rattan","boho","natural","casual"],         required: true  },
      { category: "Jewelry",     tags: ["jewelry","earrings","tassel","boho","gold"],      required: true  },
      { category: "Accessories", tags: ["accessories","hat","straw","summer","boho"],      required: false },
    ],
  },
  {
    title: "Elevated Weekend",
    occasions: ["brunch", "casual", "weekend"],
    seasons: ["autumn", "spring"],
    vibeKeywords: ["minimal", "chic", "relaxed"],
    colorPalette: ["beige", "camel", "white"],
    budgetTier: "mid-range",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Top",         tags: ["top","blouse","minimal","casual","classic"],      required: true  },
      { category: "Bottom",      tags: ["trousers","jeans","casual","minimal","weekend"],  required: true  },
      { category: "Shoes",       tags: ["shoes","loafers","sneakers","casual","minimal"],  required: true  },
      { category: "Bag",         tags: ["bag","tote","casual","minimal"],                  required: true  },
      { category: "Accessories", tags: ["accessories","sunglasses","casual"],              required: false },
    ],
  },

  // 2 WEDDING GUEST
  {
    title: "Garden Wedding Guest",
    occasions: ["wedding"],
    seasons: ["spring", "summer"],
    vibeKeywords: ["feminine", "elegant", "romantic"],
    colorPalette: ["champagne", "nude", "gold"],
    budgetTier: "premium",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Dress",       tags: ["dress","wedding-guest","elegant","feminine"],     required: true  },
      { category: "Shoes",       tags: ["shoes","heels","nude","strappy","wedding-guest"], required: true  },
      { category: "Bag",         tags: ["bag","clutch","elegant","small","wedding-guest"], required: true  },
      { category: "Jewelry",     tags: ["jewelry","earrings","pearl","elegant","crystal"], required: true  },
      { category: "Accessories", tags: ["accessories","scarf","elegant","feminine"],       required: false },
      { category: "Makeup",      tags: ["makeup","natural","feminine","fresh","blush"],    required: false },
    ],
  },
  {
    title: "Evening Wedding Guest",
    occasions: ["wedding", "formal"],
    seasons: ["autumn", "winter"],
    vibeKeywords: ["glamorous", "elegant", "chic"],
    colorPalette: ["navy", "gold", "black"],
    budgetTier: "premium",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Dress",       tags: ["dress","wedding-guest","elegant","midi","evening"],required: true  },
      { category: "Shoes",       tags: ["shoes","heels","gold","evening","party"],          required: true  },
      { category: "Bag",         tags: ["bag","clutch","small","evening","elegant"],        required: true  },
      { category: "Jewelry",     tags: ["jewelry","earrings","crystal","sparkle","evening"],required: true  },
      { category: "Makeup",      tags: ["makeup","evening","glam","bold"],                  required: false },
    ],
  },

  // 2 PARTY/GOING OUT
  {
    title: "Girls Night Out",
    occasions: ["party", "going-out"],
    seasons: ["summer", "spring"],
    vibeKeywords: ["fun", "bold", "sexy"],
    colorPalette: ["black", "gold", "red"],
    budgetTier: "high-street",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Dress",       tags: ["dress","party","going-out","evening","bodycon"],  required: true  },
      { category: "Shoes",       tags: ["shoes","heels","gold","party","strappy"],         required: true  },
      { category: "Bag",         tags: ["bag","clutch","chain","small","party"],           required: true  },
      { category: "Jewelry",     tags: ["jewelry","earrings","statement","bold","party"],  required: true  },
      { category: "Accessories", tags: ["accessories","belt","gold","chain","statement"],  required: false },
      { category: "Makeup",      tags: ["makeup","lip","bold","red","evening","party"],    required: false },
    ],
  },
  {
    title: "Festival Vibes",
    occasions: ["party", "casual"],
    seasons: ["summer"],
    vibeKeywords: ["edgy", "fun", "bohemian"],
    colorPalette: ["black", "multi", "gold"],
    budgetTier: "high-street",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Top",         tags: ["top","casual","edgy","streetwear","summer"],      required: true  },
      { category: "Bottom",      tags: ["bottom","casual","streetwear","denim","summer"],  required: true  },
      { category: "Shoes",       tags: ["shoes","boots","sneakers","casual","edgy"],       required: true  },
      { category: "Bag",         tags: ["bag","backpack","casual","festival"],             required: true  },
      { category: "Accessories", tags: ["accessories","hat","bucket","summer","festival"], required: false },
      { category: "Jewelry",     tags: ["jewelry","earrings","statement","colorful","bold"],required: false},
    ],
  },

  // 2 CASUAL EVERYDAY
  {
    title: "Effortless Everyday",
    occasions: ["casual"],
    seasons: ["spring", "summer", "autumn"],
    vibeKeywords: ["casual", "minimal", "comfortable"],
    colorPalette: ["white", "grey", "navy"],
    budgetTier: "budget",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Top",         tags: ["t-shirt","casual","everyday","minimal"],          required: true  },
      { category: "Bottom",      tags: ["jeans","casual","everyday","classic"],            required: true  },
      { category: "Shoes",       tags: ["shoes","sneakers","casual","everyday","white"],   required: true  },
      { category: "Bag",         tags: ["bag","tote","casual","canvas","everyday"],        required: true  },
      { category: "Accessories", tags: ["accessories","sunglasses","casual"],              required: false },
    ],
  },
  {
    title: "Smart Casual",
    occasions: ["casual", "brunch"],
    seasons: ["autumn", "winter"],
    vibeKeywords: ["smart-casual", "classic", "put-together"],
    colorPalette: ["camel", "black", "grey"],
    budgetTier: "mid-range",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Top",         tags: ["sweater","knit","casual","classic","minimal"],    required: true  },
      { category: "Bottom",      tags: ["jeans","trousers","casual","classic"],            required: true  },
      { category: "Shoes",       tags: ["shoes","loafers","ankle-boots","casual","classic"],required: true },
      { category: "Bag",         tags: ["bag","crossbody","leather","casual","classic"],   required: true  },
      { category: "Accessories", tags: ["accessories","scarf","cozy","casual"],            required: false },
    ],
  },

  // 2 SUMMER HOLIDAY
  {
    title: "Summer Holiday",
    occasions: ["casual", "holiday"],
    seasons: ["summer"],
    vibeKeywords: ["relaxed", "boho", "summery"],
    colorPalette: ["white", "natural", "blue"],
    budgetTier: "high-street",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Dress",       tags: ["dress","summer","holiday","casual","boho","maxi"],required: true  },
      { category: "Shoes",       tags: ["shoes","sandals","summer","casual","holiday"],    required: true  },
      { category: "Bag",         tags: ["bag","straw","beach","summer","tote"],            required: true  },
      { category: "Accessories", tags: ["accessories","sunglasses","summer","casual"],     required: true  },
      { category: "Accessories", tags: ["accessories","hat","straw","summer","beach"],     required: false },
    ],
  },
  {
    title: "Tropical Getaway",
    occasions: ["casual", "holiday"],
    seasons: ["summer"],
    vibeKeywords: ["vibrant", "playful", "holiday"],
    colorPalette: ["pink", "white", "gold"],
    budgetTier: "high-street",
    gender: "woman",
    isActive: true,
    slots: [
      { category: "Top",         tags: ["top","cami","summer","holiday","feminine"],       required: false },
      { category: "Dress",       tags: ["dress","floral","summer","boho","holiday"],       required: false },
      { category: "Bottom",      tags: ["bottom","shorts","white","summer","casual"],      required: false },
      { category: "Shoes",       tags: ["shoes","sandals","wedges","summer","boho"],       required: true  },
      { category: "Bag",         tags: ["bag","straw","summer","beach","casual"],          required: true  },
      { category: "Accessories", tags: ["accessories","sunglasses","summer"],              required: true  },
      { category: "Jewelry",     tags: ["jewelry","necklace","beaded","boho","summer"],    required: false },
    ],
  },
];

// ---- Run seed ----

async function seed() {
  console.log("Seeding products...");
  await db.delete(productsTable);
  const insertedProducts = await db.insert(productsTable).values(products).returning({ id: productsTable.id });
  console.log(`Inserted ${insertedProducts.length} products.`);

  console.log("Seeding outfit templates...");
  await db.delete(outfitTemplatesTable);
  const insertedTemplates = await db.insert(outfitTemplatesTable).values(templates).returning({ id: outfitTemplatesTable.id });
  console.log(`Inserted ${insertedTemplates.length} outfit templates.`);

  console.log("Done.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
