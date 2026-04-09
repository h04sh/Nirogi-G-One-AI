import { Router, type IRouter } from "express";
import { getDb, patientsTable, isDatabaseConfigured, getMockDb } from "@workspace/db";
import { sql, desc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const emptyStats = {
  total_patients: 0,
  active_cases: 0,
  high_risk_alerts: 0,
  resolved_cases: 0,
  avg_confidence: 0,
  emergency_count: 0,
  urgent_count: 0,
  routine_count: 0,
};

const emptyRisk = [
  { level: "emergency" as const, count: 0, percentage: 0 },
  { level: "urgent" as const, count: 0, percentage: 0 },
  { level: "routine" as const, count: 0, percentage: 0 },
];

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  try {
    if (!isDatabaseConfigured()) {
      const mockDb = getMockDb();
      const patients = mockDb.getPatients();
      
      const emergency_count = patients.filter((p: any) => p.triageLevel === "emergency").length;
      const urgent_count = patients.filter((p: any) => p.triageLevel === "urgent").length;
      const routine_count = patients.filter((p: any) => p.triageLevel === "routine").length;
      const avg_confidence = patients.length > 0 
        ? patients.reduce((sum: number, p: any) => sum + (p.confidence || 0), 0) / patients.length 
        : 0;

      res.json({
        total_patients: patients.length,
        active_cases: emergency_count + urgent_count,
        high_risk_alerts: emergency_count,
        resolved_cases: routine_count,
        avg_confidence: Math.round(avg_confidence * 100) / 100,
        emergency_count,
        urgent_count,
        routine_count,
      });
      return;
    }

    const db = getDb();
    const [stats] = await db
      .select({
        total_patients: sql<number>`count(*)::int`,
        emergency_count: sql<number>`count(*) filter (where triage_level = 'emergency')::int`,
        urgent_count: sql<number>`count(*) filter (where triage_level = 'urgent')::int`,
        routine_count: sql<number>`count(*) filter (where triage_level = 'routine')::int`,
        avg_confidence: sql<number>`round(avg(confidence)::numeric, 2)`,
      })
      .from(patientsTable);

    res.json({
      total_patients: stats.total_patients || 0,
      active_cases: (stats.emergency_count || 0) + (stats.urgent_count || 0),
      high_risk_alerts: stats.emergency_count || 0,
      resolved_cases: stats.routine_count || 0,
      avg_confidence: Number(stats.avg_confidence) || 0,
      emergency_count: stats.emergency_count || 0,
      urgent_count: stats.urgent_count || 0,
      routine_count: stats.routine_count || 0,
    });
  } catch (err) {
    logger.error({ err }, "dashboard_stats_failed");
    // Fallback to mock database if real database fails
    const mockDb = getMockDb();
    const patients = mockDb.getPatients();
    
    const emergency_count = patients.filter((p: any) => p.triageLevel === "emergency").length;
    const urgent_count = patients.filter((p: any) => p.triageLevel === "urgent").length;
    const routine_count = patients.filter((p: any) => p.triageLevel === "routine").length;
    const avg_confidence = patients.length > 0 
      ? patients.reduce((sum: number, p: any) => sum + (p.confidence || 0), 0) / patients.length 
      : 0;

    res.json({
      total_patients: patients.length,
      active_cases: emergency_count + urgent_count,
      high_risk_alerts: emergency_count,
      resolved_cases: routine_count,
      avg_confidence: Math.round(avg_confidence * 100) / 100,
      emergency_count,
      urgent_count,
      routine_count,
    });
  }
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  try {
    if (!isDatabaseConfigured()) {
      const mockDb = getMockDb();
      const patients = mockDb.getPatients();

      res.json(
        patients.slice(0, 10).map((p: any) => ({
          id: String(p.id),
          patient_name: p.patientName,
          action:
            p.triageLevel === "emergency"
              ? "Emergency Alert Triggered"
              : p.triageLevel === "urgent"
                ? "Urgent Evaluation Scheduled"
                : "Routine Assessment Completed",
          triage_level: p.triageLevel,
          timestamp: p.createdAt.toISOString(),
          diagnosis: p.diagnosis,
        }))
      );
      return;
    }

    const db = getDb();
    const patients = await db
      .select()
      .from(patientsTable)
      .orderBy(desc(patientsTable.createdAt))
      .limit(10);

    res.json(
      patients.map((p) => ({
        id: String(p.id),
        patient_name: p.patientName,
        action:
          p.triageLevel === "emergency"
            ? "Emergency Alert Triggered"
            : p.triageLevel === "urgent"
              ? "Urgent Evaluation Scheduled"
              : "Routine Assessment Completed",
        triage_level: p.triageLevel,
        timestamp: p.createdAt.toISOString(),
        diagnosis: p.diagnosis,
      }))
    );
  } catch (err) {
    logger.error({ err }, "dashboard_activity_failed");
    // Fallback to mock database if real database fails
    const mockDb = getMockDb();
    const patients = mockDb.getPatients();

    res.json(
      patients.slice(0, 10).map((p: any) => ({
        id: String(p.id),
        patient_name: p.patientName,
        action:
          p.triageLevel === "emergency"
            ? "Emergency Alert Triggered"
            : p.triageLevel === "urgent"
              ? "Urgent Evaluation Scheduled"
              : "Routine Assessment Completed",
        triage_level: p.triageLevel,
        timestamp: p.createdAt.toISOString(),
        diagnosis: p.diagnosis,
      }))
    );
  }
});

router.get("/dashboard/risk-breakdown", async (req, res): Promise<void> => {
  try {
    if (!isDatabaseConfigured()) {
      const mockDb = getMockDb();
      const patients = mockDb.getPatients();
      
      const emergency = patients.filter((p: any) => p.triageLevel === "emergency").length;
      const urgent = patients.filter((p: any) => p.triageLevel === "urgent").length;
      const routine = patients.filter((p: any) => p.triageLevel === "routine").length;
      const total = patients.length;
      
      const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

      res.json([
        {
          level: "emergency" as const,
          count: emergency,
          percentage: pct(emergency),
        },
        {
          level: "urgent" as const,
          count: urgent,
          percentage: pct(urgent),
        },
        {
          level: "routine" as const,
          count: routine,
          percentage: pct(routine),
        },
      ]);
      return;
    }

    const db = getDb();
    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        emergency: sql<number>`count(*) filter (where triage_level = 'emergency')::int`,
        urgent: sql<number>`count(*) filter (where triage_level = 'urgent')::int`,
        routine: sql<number>`count(*) filter (where triage_level = 'routine')::int`,
      })
      .from(patientsTable);

    const total = stats.total || 0;
    const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

    res.json([
      {
        level: "emergency" as const,
        count: stats.emergency || 0,
        percentage: pct(stats.emergency || 0),
      },
      {
        level: "urgent" as const,
        count: stats.urgent || 0,
        percentage: pct(stats.urgent || 0),
      },
      {
        level: "routine" as const,
        count: stats.routine || 0,
        percentage: pct(stats.routine || 0),
      },
    ]);
  } catch (err) {
    logger.error({ err }, "dashboard_risk_failed");
    // Fallback to mock database if real database fails
    const mockDb = getMockDb();
    const patients = mockDb.getPatients();
    
    const emergency = patients.filter((p: any) => p.triageLevel === "emergency").length;
    const urgent = patients.filter((p: any) => p.triageLevel === "urgent").length;
    const routine = patients.filter((p: any) => p.triageLevel === "routine").length;
    const total = patients.length;
    
    const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

    res.json([
      {
        level: "emergency" as const,
        count: emergency,
        percentage: pct(emergency),
      },
      {
        level: "urgent" as const,
        count: urgent,
        percentage: pct(urgent),
      },
      {
        level: "routine" as const,
        count: routine,
        percentage: pct(routine),
      },
    ]);
  }
});

export default router;
