import { desc, eq } from "drizzle-orm";
import { appointments } from "../../db/schemas/appointments.js";
import { users } from "../../db/schemas/users.js";
import { experts } from "../../db/schemas/experts.js";
import { slots } from "../../db/schemas/slots.js";
import { appointmentStatus } from "../../db/schemas/appointment_status.js";
import { shopOwners } from "../../db/schemas/shop-owners.js";
import { db } from "../../db/index.js";

export const getAppointmentsBySHopId = (shopId) => {
  return (
    db
      .select({
        appointment: appointments,
        status: appointmentStatus.name,
        customer: {
          id: users.id,
          username: users.username,
          email: users.email,
          phone: users.phone,
          profileImage: users.profileImage,
        },
        expert: experts,
        slot: slots,
      })
      .from(appointments)
      .innerJoin(users, eq(appointments.customerId, users.id))
      .innerJoin(experts, eq(appointments.expertId, experts.id))
      .innerJoin(slots, eq(appointments.slotId, slots.id))
      .innerJoin(appointmentStatus, eq(appointments.statusId, appointmentStatus.id))
      .where(eq(appointments.shopId, shopId))
      .orderBy(desc(appointments.createdAt))
  );
};

export const getAppointmentsByCustomerId = (customerId) => {
  return db
    .select({
      id: appointments.id,
      status: appointmentStatus.name,
      rate: appointments.rate,
      serviceIds: appointments.serviceIds,
      createdAt: appointments.createdAt,
      expert: {
        id: experts.id,
        name: experts.name,
        image: experts.image,
      },
      slot: {
        id: slots.id,
        slotDate: slots.slotDate,
        startTime: slots.startTime,
        endTime: slots.endTime,
      },
      shop: {
        id: shopOwners.id,
        parlourName: shopOwners.parlourName,
        address: shopOwners.address,
        shopImage: shopOwners.shopImage,
      },
    })
    .from(appointments)
    .innerJoin(experts, eq(appointments.expertId, experts.id))
    .innerJoin(slots, eq(appointments.slotId, slots.id))
    .innerJoin(shopOwners, eq(appointments.shopId, shopOwners.id))
    .innerJoin(appointmentStatus, eq(appointments.statusId, appointmentStatus.id))
    .where(eq(appointments.customerId, customerId))
    .orderBy(desc(appointments.createdAt));
};

export const getAppointmentByAppointmentId = (id) => {
  return db
    .select({
      appointment: appointments,
      customer: {
        id: users.id,
        username: users.username,
        email: users.email,
        phone: users.phone,
        profileImage: users.profileImage,
      },
      expert: experts,
      slot: slots,
    })
    .from(appointments)
    .innerJoin(users, eq(appointments.customerId, users.id))
    .innerJoin(experts, eq(appointments.expertId, experts.id))
    .innerJoin(slots, eq(appointments.slotId, slots.id))
    .where(eq(appointments.id, id));
};

export const getAppointmentsById = async (id) => {
  const [appointment] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);
  return appointment;
};

export const getStatusIdByName = async (name) => {
  const [status] = await db
    .select({ id: appointmentStatus.id })
    .from(appointmentStatus)
    .where(eq(appointmentStatus.name, name))
    .limit(1);
  return status?.id;
};

export const updateAppointmentStatus = async (appointmentId, statusId) => {
  return await db
    .update(appointments)
    .set({
      statusId,
      // confirmedAt: new Date(),
    })
    .where(eq(appointments.id, appointmentId));
};
