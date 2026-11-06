import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  time,
  date,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["patient", "clinician", "admin"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "booked",
  "completed",
  "cancelled",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: roleEnum("role").notNull().default("patient"),
    specialty: text("specialty"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

export const weeklyAvailability = pgTable(
  "weekly_availability",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicianId: uuid("clinician_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** 0 = Sunday … 6 = Saturday */
    dayOfWeek: integer("day_of_week").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    slotMinutes: integer("slot_minutes").notNull().default(30),
  },
  (t) => [index("weekly_availability_clinician_idx").on(t.clinicianId)]
);

export const blockedSlots = pgTable(
  "blocked_slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicianId: uuid("clinician_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    reason: text("reason"),
  },
  (t) => [index("blocked_slots_clinician_idx").on(t.clinicianId)]
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clinicianId: uuid("clinician_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    status: appointmentStatusEnum("status").notNull().default("booked"),
    notes: text("notes"),
    appointmentDate: date("appointment_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("appointments_patient_idx").on(t.patientId),
    index("appointments_clinician_idx").on(t.clinicianId),
    index("appointments_start_idx").on(t.startAt),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  weeklyAvailability: many(weeklyAvailability),
  blockedSlots: many(blockedSlots),
  patientAppointments: many(appointments, { relationName: "patient" }),
  clinicianAppointments: many(appointments, { relationName: "clinician" }),
}));

export const weeklyAvailabilityRelations = relations(
  weeklyAvailability,
  ({ one }) => ({
    clinician: one(users, {
      fields: [weeklyAvailability.clinicianId],
      references: [users.id],
    }),
  })
);

export const blockedSlotsRelations = relations(blockedSlots, ({ one }) => ({
  clinician: one(users, {
    fields: [blockedSlots.clinicianId],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(users, {
    fields: [appointments.patientId],
    references: [users.id],
    relationName: "patient",
  }),
  clinician: one(users, {
    fields: [appointments.clinicianId],
    references: [users.id],
    relationName: "clinician",
  }),
}));

export type Role = "patient" | "clinician" | "admin";
export type AppointmentStatus = "booked" | "completed" | "cancelled";
export type User = typeof users.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
