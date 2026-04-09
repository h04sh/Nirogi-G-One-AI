import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let _pool: pg.Pool | undefined;
let _db: NodePgDatabase<typeof schema> | undefined;

// In-memory mock database for development without PostgreSQL
const mockDatabase: Record<string, any[]> = {
  patients: [
    {
      id: 1,
      patientName: "John Smith",
      age: 45,
      gender: "male",
      symptoms: "Chest pain and shortness of breath",
      diagnosis: "Possible Angina Pectoris or Myocardial Infarction",
      triageLevel: "emergency",
      confidence: 0.91,
      notes: "Patient reports severe chest pain radiating to left arm",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 2,
      patientName: "Sarah Johnson",
      age: 32,
      gender: "female",
      symptoms: "Abdominal pain and nausea",
      diagnosis: "Possible Appendicitis or Gastroenteritis",
      triageLevel: "urgent",
      confidence: 0.80,
      notes: "Pain localized to right lower quadrant",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: 3,
      patientName: "Michael Brown",
      age: 58,
      gender: "male",
      symptoms: "Persistent cough and fever",
      diagnosis: "Possible Pneumonia or Bronchitis",
      triageLevel: "urgent",
      confidence: 0.84,
      notes: "Cough lasting 2 weeks with productive sputum",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: 4,
      patientName: "Emily Davis",
      age: 28,
      gender: "female",
      symptoms: "Headache and fever",
      diagnosis: "Possible Viral Infection or Influenza",
      triageLevel: "routine",
      confidence: 0.87,
      notes: "Mild symptoms, no neurological signs",
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: 5,
      patientName: "Robert Wilson",
      age: 52,
      gender: "male",
      symptoms: "Joint pain and swelling",
      diagnosis: "Possible Osteoarthritis or Rheumatoid Arthritis",
      triageLevel: "routine",
      confidence: 0.78,
      notes: "Chronic condition, pain management recommended",
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      id: 6,
      patientName: "Lisa Anderson",
      age: 35,
      gender: "female",
      symptoms: "Leg swelling and redness",
      diagnosis: "Possible Deep Vein Thrombosis or Cellulitis",
      triageLevel: "urgent",
      confidence: 0.83,
      notes: "Unilateral leg swelling with warmth",
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  ],
};

let mockId = 7;

/**
 * Returns a Drizzle instance. Throws only if DATABASE_URL is missing when first called.
 * Call from API route handlers — the API process can start without a database (e.g. diagnosis-only).
 */
export function getDb(): NodePgDatabase<typeof schema> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!_db) {
    _pool = new Pool({ connectionString: url });
    _db = drizzle(_pool, { schema });
  }
  return _db;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

// Mock database functions for when PostgreSQL is not available
export function getMockDb() {
  return {
    patients: mockDatabase.patients,
    addPatient: (data: any) => {
      const patient = {
        id: mockId++,
        ...data,
        createdAt: new Date(),
      };
      mockDatabase.patients.push(patient);
      return patient;
    },
    getPatients: () => mockDatabase.patients.sort((a, b) => b.createdAt - a.createdAt),
    getPatientById: (id: number) => mockDatabase.patients.find(p => p.id === id),
  };
}

export * from "./schema";
