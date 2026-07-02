export const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

// Addresses look like "..., Vennala, Ernakulam, Kerala 682028" — the
// second-to-last comma segment is the most reliable city-like token.
export const getShopLocationSlug = (address = "") => {
  const segments = String(address)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const city =
    segments.length >= 2 ? segments[segments.length - 2] : segments[0] || "";

  return slugify(city) || "shop";
};

export const buildShopUrl = (shop) => {
  if (!shop?.id) return "/shops";

  const location = getShopLocationSlug(shop.address || shop.location);
  const name = slugify(shop.parlourName || shop.name || "shop");

  return `/shop/${location}/${name}-${shop.id}`;
};

export const getShopIdFromSlug = (slug = "") => {
  const match = String(slug).match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
};
