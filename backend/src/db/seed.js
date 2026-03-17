import { appointmentStatuses, usersTypes } from "../constants/constants.js";
import { db } from "./index.js";

import { appointmentStatus } from "./schemas/appointment_status.js";
import { userTypes } from "./schemas/users_types.js";

async function seedDatabase() {
  console.log("Seeding datas...");

  // Insert user types
  const values = Object.values(usersTypes);
  await db.insert(userTypes).values(values);

  // Insert appointment statuese
  const appointmentStatueses = Object.values(appointmentStatuses);
  await db.insert(appointmentStatus).values(appointmentStatueses);

  console.log("Seeding completed ....");
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
