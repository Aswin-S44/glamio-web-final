const WISHLIST_KEY = "glamio_wishlist";
export const WISHLIST_EVENT = "glamio-wishlist-updated";

const readWishlist = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeWishlist = (list) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(WISHLIST_EVENT));
  return list;
};

export const getWishlist = () => readWishlist();

export const isWishlisted = (shopId) =>
  readWishlist().some((item) => item.id === shopId);

const toWishlistEntry = (shop) => ({
  id: shop.id,
  parlourName: shop.parlourName || shop.name || "Salon",
  address: shop.address || shop.location || "",
  shopImage: shop.shopImage || shop.image || "",
  totalRating: shop.totalRating ?? shop.rating ?? null,
});

export const toggleWishlist = (shop) => {
  if (!shop?.id) return getWishlist();
  const list = readWishlist();
  const exists = list.some((item) => item.id === shop.id);
  const next = exists
    ? list.filter((item) => item.id !== shop.id)
    : [toWishlistEntry(shop), ...list];
  return writeWishlist(next);
};

export const removeFromWishlist = (shopId) => {
  const next = readWishlist().filter((item) => item.id !== shopId);
  return writeWishlist(next);
};
