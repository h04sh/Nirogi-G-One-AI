import {
  pgTable,
  serial,
  text,
  integer,
  real,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  age: integer("age"),
  gender: text("gender"),
  symptoms: text("symptoms").notNull(),
  diagnosis: text("diagnosis").notNull(),
  triageLevel: varchar("triage_level", { length: 32 }).notNull(),
  confidence: real("confidence").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatLogsTable = pgTable("chat_logs", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: varchar("role", { length: 16 }).notNull(),
  content: text("content").notNull(),
  triageLevel: varchar("triage_level", { length: 32 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
