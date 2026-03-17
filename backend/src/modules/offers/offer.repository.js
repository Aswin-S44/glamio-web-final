import { and, eq } from "drizzle-orm";

import { offers } from "../../db/schemas/offers.js";
import { services } from "../../db/schemas/services.js";
import { db } from "../../db/index.js";

export class OfferRepository {
  static findByCategory(shopId, categoryId) {
    return db
      .select()
      .from(offers)
      .where(and(eq(offers.shopId, shopId), eq(offers.categoryId, categoryId)));
  }

  static findAllByShop(shopId) {
    return db
      .select({
        id: offers.id,
        offerPrice: offers.offerPrice,
        regularPrice: offers.regularPrice,
        createdAt: offers.createdAt,
        updatedAt: offers.updatedAt,
        // Include service details here
        service: {
          id: services.id,
          name: services.name,
          imageUrl: services.imageUrl,
          description: services.description,
          duration: services.duration,
        },
      })
      .from(offers)
      .innerJoin(services, eq(offers.serviceId, services.id))
      .where(eq(offers.shopId, shopId));
  }

  static findById(shopId, offerId) {
    return db
      .select()
      .from(offers)
      .where(and(eq(offers.id, offerId), eq(offers.shopId, shopId)));
  }

  static create(shopId, data) {
    const { categoryId, offerPrice, regularPrice, serviceId } = data;
    return db
      .insert(offers)
      .values({ categoryId, offerPrice, regularPrice, serviceId, shopId });
  }

  static update(shopId, offerId, data) {
    return db
      .update(offers)
      .set(data)
      .where(and(eq(offers.id, offerId), eq(offers.shopId, shopId)));
  }

  static delete(shopId, offerId) {
    return db
      .delete(offers)
      .where(and(eq(offers.id, offerId), eq(offers.shopId, shopId)));
  }
}
