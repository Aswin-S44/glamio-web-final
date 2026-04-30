import { and, count, eq } from "drizzle-orm";

import { offers } from "../../db/schemas/offers.js";
import { services } from "../../db/schemas/services.js";
import { category } from "../../db/schemas/category.js";
import { db } from "../../db/index.js";

export class OfferRepository {
  static findByService(shopId, serviceId) {
    return db
      .select()
      .from(offers)
      .where(and(eq(offers.shopId, shopId), eq(offers.serviceId, serviceId)));
  }

  static async findAllByShop(shopId, { page = 1, limit = 8 } = {}) {
    const offset = (page - 1) * limit;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id:           offers.id,
          offerPrice:   offers.offerPrice,
          regularPrice: offers.regularPrice,
          categoryId:   offers.categoryId,
          serviceId:    offers.serviceId,
          createdAt:    offers.createdAt,
          updatedAt:    offers.updatedAt,
          categoryName: category.name,
          serviceName:  services.name,
          service: {
            id:          services.id,
            name:        services.name,
            imageUrl:    services.imageUrl,
            description: services.description,
            duration:    services.duration,
          },
        })
        .from(offers)
        .innerJoin(services, eq(offers.serviceId, services.id))
        .leftJoin(category, eq(offers.categoryId, category.id))
        .where(eq(offers.shopId, shopId))
        .limit(limit)
        .offset(offset),

      db
        .select({ total: count() })
        .from(offers)
        .where(eq(offers.shopId, shopId)),
    ]);

    return {
      offers: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(Number(total) / limit),
        total: Number(total),
        limit,
      },
    };
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
    const { categoryId, offerPrice, regularPrice, serviceId } = data;
    const updateFields = {};
    if (categoryId  !== undefined) updateFields.categoryId  = categoryId;
    if (offerPrice  !== undefined) updateFields.offerPrice  = Number(offerPrice);
    if (regularPrice !== undefined) updateFields.regularPrice = Number(regularPrice);
    if (serviceId   !== undefined) updateFields.serviceId   = serviceId;

    return db
      .update(offers)
      .set(updateFields)
      .where(and(eq(offers.id, offerId), eq(offers.shopId, shopId)));
  }

  static delete(shopId, offerId) {
    return db
      .delete(offers)
      .where(and(eq(offers.id, offerId), eq(offers.shopId, shopId)));
  }
}
