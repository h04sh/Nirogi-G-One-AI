import { Router, type IRouter } from "express";
import { getDb, patientsTable, isDatabaseConfigured, getMockDb } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { SaveCaseBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { jsPDF } from "jspdf";

const router: IRouter = Router();

router.get("/reports", async (req, res): Promise<void> => {
  try {
    if (!isDatabaseConfigured()) {
      const mockDb = getMockDb();
      res.json(
        mockDb.getPatients().map((p: any) => ({
          id: String(p.id),
          patient_name: p.patientName,
          age: p.age,
          gender: p.gender,
          symptoms: p.symptoms,
          diagnosis: p.diagnosis,
          triage_level: p.triageLevel,
          confidence: p.confidence,
          created_at: p.createdAt.toISOString(),
          notes: p.notes,
        }))
      );
      return;
    }
    const db = getDb();
    const patients = await db
      .select()
      .from(patientsTable)
      .orderBy(desc(patientsTable.createdAt))
      .limit(50);

    res.json(
      patients.map((p) => ({
        id: String(p.id),
        patient_name: p.patientName,
        age: p.age,
        gender: p.gender,
        symptoms: p.symptoms,
        diagnosis: p.diagnosis,
        triage_level: p.triageLevel,
        confidence: p.confidence,
        created_at: p.createdAt.toISOString(),
        notes: p.notes,
      }))
    );
  } catch (err) {
    logger.error({ err }, "reports_list_failed");
    // Fallback to mock database if real database fails
    const mockDb = getMockDb();
    res.json(
      mockDb.getPatients().map((p: any) => ({
        id: String(p.id),
        patient_name: p.patientName,
        age: p.age,
        gender: p.gender,
        symptoms: p.symptoms,
        diagnosis: p.diagnosis,
        triage_level: p.triageLevel,
        confidence: p.confidence,
        created_at: p.createdAt.toISOString(),
        notes: p.notes,
      }))
    );
  }
});

router.get("/reports/:id/pdf", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid report ID" });
    return;
  }

  let patient: any;
  try {
    if (!isDatabaseConfigured()) {
      const mockDb = getMockDb();
      patient = mockDb.getPatientById(id);
      if (!patient) {
        res.status(404).json({ error: "Report not found" });
        return;
      }
    } else {
      const db = getDb();
      [patient] = await db
        .select()
        .from(patientsTable)
        .where(eq(patientsTable.id, id));
    }
  } catch (err) {
    logger.error({ err }, "report_pdf_failed");
    // Fallback to mock database if real database fails
    const mockDb = getMockDb();
    patient = mockDb.getPatientById(id);
    if (!patient) {
      res.status(404).json({ error: "Report not found" });
      return;
    }
  }

  if (!patient) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  try {
    const triageColor = {
      emergency: "#DC2626",
      urgent: "#D97706",
      routine: "#16A34A",
    }[patient.triageLevel] || "#6B7280";

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(45, 106, 79);
    doc.text("Nirogi G-One AI", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(113, 128, 150);
    doc.text("AI-Powered Healthcare Report", margin, yPosition);
    yPosition += 8;

    // Line
    doc.setDrawColor(232, 227, 218);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Patient name
    doc.setFontSize(16);
    doc.setTextColor(45, 55, 72);
    doc.text(patient.patientName, margin, yPosition);
    yPosition += 7;

    // Date and case ID
    doc.setFontSize(9);
    doc.setTextColor(160, 174, 192);
    doc.text(
      `Report generated: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })} | Case ID: #${patient.id.toString().padStart(5, "0")}`,
      margin,
      yPosition
    );
    yPosition += 10;

    // Patient Information
    doc.setFontSize(10);
    doc.setTextColor(160, 174, 192);
    doc.setFont(undefined, "bold");
    doc.text("PATIENT INFORMATION", margin, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setTextColor(45, 55, 72);
    doc.setFont(undefined, "normal");
    doc.text(`Full Name: ${patient.patientName}`, margin, yPosition);
    yPosition += 5;
    doc.text(
      `Age / Gender: ${patient.age ? patient.age + " years" : "N/A"} / ${patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : "N/A"}`,
      margin,
      yPosition
    );
    yPosition += 8;

    // Presented Symptoms
    doc.setFontSize(10);
    doc.setTextColor(160, 174, 192);
    doc.setFont(undefined, "bold");
    doc.text("PRESENTED SYMPTOMS", margin, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setTextColor(45, 55, 72);
    doc.setFont(undefined, "normal");
    const symptomLines = doc.splitTextToSize(patient.symptoms, maxWidth);
    doc.text(symptomLines, margin, yPosition);
    yPosition += symptomLines.length * 5 + 3;

    // AI Diagnosis
    doc.setFontSize(10);
    doc.setTextColor(160, 174, 192);
    doc.setFont(undefined, "bold");
    doc.text("AI DIAGNOSIS", margin, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setTextColor(45, 55, 72);
    doc.setFont(undefined, "normal");
    const diagnosisLines = doc.splitTextToSize(patient.diagnosis, maxWidth);
    doc.text(diagnosisLines, margin, yPosition);
    yPosition += diagnosisLines.length * 5 + 3;

    // Triage Assessment
    doc.setFontSize(10);
    doc.setTextColor(160, 174, 192);
    doc.setFont(undefined, "bold");
    doc.text("TRIAGE ASSESSMENT", margin, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setTextColor(triageColor);
    doc.setFont(undefined, "bold");
    doc.text(patient.triageLevel.toUpperCase(), margin, yPosition);
    yPosition += 8;

    // Confidence Level
    doc.setFontSize(10);
    doc.setTextColor(160, 174, 192);
    doc.setFont(undefined, "bold");
    doc.text("AI CONFIDENCE LEVEL", margin, yPosition);
    yPosition += 6;

    const confidencePercent = Math.round((patient.confidence || 0) * 100);
    doc.setFontSize(12);
    doc.setTextColor(45, 106, 79);
    doc.setFont(undefined, "bold");
    doc.text(`${confidencePercent}%`, margin, yPosition);
    yPosition += 8;

    // Clinical Notes if present
    if (patient.notes) {
      doc.setFontSize(10);
      doc.setTextColor(160, 174, 192);
      doc.setFont(undefined, "bold");
      doc.text("CLINICAL NOTES", margin, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setTextColor(45, 55, 72);
      doc.setFont(undefined, "normal");
      const notesLines = doc.splitTextToSize(patient.notes, maxWidth);
      doc.text(notesLines, margin, yPosition);
      yPosition += notesLines.length * 5 + 3;
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(160, 174, 192);
    doc.setFont(undefined, "normal");
    const disclaimerLines = doc.splitTextToSize(
      "Important Disclaimer: This report is generated by Nirogi G-One AI and is intended for informational purposes only. It does not constitute professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.",
      maxWidth
    );
    doc.text(disclaimerLines, margin, pageHeight - 20);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Nirogi-G-One-AI-Report-${patient.patientName.replace(/\s+/g, "-")}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    logger.error({ err }, "pdf_generation_failed");
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

router.post("/save-case", async (req, res): Promise<void> => {
  const parsed = SaveCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { patient_name, age, gender, symptoms, diagnosis, triage_level, confidence, notes } = parsed.data;

  let patient: any;
  try {
    if (!isDatabaseConfigured()) {
      const mockDb = getMockDb();
      patient = mockDb.addPatient({
        patientName: patient_name,
        age: age ?? null,
        gender: gender ?? null,
        symptoms,
        diagnosis,
        triageLevel: triage_level,
        confidence,
        notes: notes ?? null,
      });
    } else {
      const db = getDb();
      [patient] = await db
        .insert(patientsTable)
        .values({
          patientName: patient_name,
          age: age ?? null,
          gender: gender ?? null,
          symptoms,
          diagnosis,
          triageLevel: triage_level,
          confidence,
          notes: notes ?? null,
        })
        .returning();
    }
  } catch (err) {
    logger.error({ err }, "save_case_failed");
    // Fallback to mock database if real database fails
    const mockDb = getMockDb();
    patient = mockDb.addPatient({
      patientName: patient_name,
      age: age ?? null,
      gender: gender ?? null,
      symptoms,
      diagnosis,
      triageLevel: triage_level,
      confidence,
      notes: notes ?? null,
    });
  }

  res.status(201).json({
    id: String(patient.id),
    patient_name: patient.patientName,
    age: patient.age,
    gender: patient.gender,
    symptoms: patient.symptoms,
    diagnosis: patient.diagnosis,
    triage_level: patient.triageLevel,
    confidence: patient.confidence,
    created_at: patient.createdAt.toISOString(),
    notes: patient.notes,
  });
});

export default router;
