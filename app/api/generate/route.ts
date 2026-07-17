import { NextRequest, NextResponse } from "next/server";
import * as xlsx from "xlsx";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { generateCertificate } from "@/lib/generateCertificate";
import { uploadToS3 } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateBatchId, generateCertificateId } from "@/lib/certificateIds";
import { sendCertificateEmail } from "@/lib/certificateEmail";
import {
  validateTemplateFile,
  validateDatasetFile,
  validateRowCount,
} from "@/lib/file-validation";


export const dynamic = "force-dynamic";

type GeneratedCertificate = {
  certificateId: string;
  name: string;
  course: string;
  issueDate: string;
  templateUrl: string;
  pdfUrl: string;
  userId: string;
  batchId: string;
  recipientEmail: string | null;
  status: string;
  failureReason: string | null;
  sentAt: string | null;
};

type FieldSetting = {
  enabled?: boolean;
  x?: number;
  y?: number;
  fontSize?: number;
};
type Settings = {
  name?: FieldSetting;
  course?: FieldSetting;
  issueDate?: FieldSetting;
  [key: string]: FieldSetting | undefined;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(req: NextRequest) {
  try {
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch (e) {
      console.warn("Session invalid or decryption failed", e);
    }

    const formData = await req.formData();

    const templateFile = formData.get("template") as File | null;
    const datasetFile = formData.get("dataset") as File | null;
    const eventIdString = formData.get("eventId") as string | null;
    const sendEmails = formData.get("sendEmails") === "true";
    const emailTemplate =
      (formData.get("emailTemplate") as "formal" | "friendly" | "short" | null) ??
      "formal";
    const customEmailBody = (formData.get("customEmailBody") as string | null) ?? "";
    const emailHeader = formData.get("emailHeader") as string | null;

    if (!templateFile || !datasetFile) {
      return NextResponse.json(
        { error: "Missing template or dataset file." },
        { status: 400 },
      );
    }

    const templateErr = validateTemplateFile(templateFile);
    if (templateErr) {
      return NextResponse.json(
        { error: templateErr.message },
        { status: templateErr.status },
      );
    }

    const datasetErr = validateDatasetFile(datasetFile);
    if (datasetErr) {
      return NextResponse.json(
        { error: datasetErr.message },
        { status: datasetErr.status },
      );
    }

    // Extract settings payload before parsing to know which columns are required
    const settingsString = formData.get("settings") as string | null;
    let settings: Settings | null = null;
    if (settingsString) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(settingsString);
      } catch {
        return NextResponse.json(
          {
            error:
              "Invalid settings JSON. Please provide valid JSON in the settings field.",
          },
          { status: 400 },
        );
      }
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return NextResponse.json(
          { error: "Invalid settings: must be a JSON object." },
          { status: 400 },
        );
      }
      const s = parsed as Record<string, unknown>;
      const fieldKeys = ["name", "course", "issueDate", "qrCode"] as const;
      for (const key of fieldKeys) {
        if (
          key in s &&
          (typeof s[key] !== "object" ||
            s[key] === null ||
            Array.isArray(s[key]))
        ) {
          return NextResponse.json(
            { error: `Invalid settings: "${key}" must be an object.` },
            { status: 400 },
          );
        }
      }
      settings = parsed as Settings;
    }

    const canvasWidth = 794;
    const canvasHeight = 562;

    const toPercentX = (x?: number) =>
      typeof x === "number" ? (x / canvasWidth) * 100 : 50;

    const toPercentY = (y?: number) =>
      typeof y === "number" ? (y / canvasHeight) * 100 : 50;

    const saveToDb = formData.get("saveToDb") !== "false";
    const batchId = generateBatchId();

    if (saveToDb && (!session || !session.user)) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Please log in to save certificates to the database.",
        },
        { status: 401 },
      );
    }

    // Determine which columns we actually need
    const needsName = settings?.name?.enabled !== false; // Default true if null
    const needsCourse = settings?.course?.enabled !== false;
    const needsIssueDate = settings?.issueDate?.enabled !== false;

    const requiredCols: string[] = [];
    const requiredColsDisplay: string[] = [];
    if (needsName) {
      requiredCols.push("name");
      requiredColsDisplay.push("Name");
    }
    if (needsCourse) {
      requiredCols.push("course");
      requiredColsDisplay.push("Course");
    }
    if (needsIssueDate) {
      requiredCols.push("issuedate");
      requiredColsDisplay.push("Issue Date");
    }

    // 1. Read files into buffers
    const templateBuffer = await templateFile.arrayBuffer();
    const datasetBuffer = await datasetFile.arrayBuffer();

    // 2. Parse dataset (XLSX or CSV)
    const normalizeKey = (key: string) =>
      key.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const datasetName = datasetFile.name.toLowerCase();

    let rows: Record<string, unknown>[] = [];

    if (datasetName.endsWith(".csv")) {
      // Parse CSV using xlsx
      const csvText = Buffer.from(datasetBuffer).toString("utf-8");
      if (!csvText.trim()) {
        return NextResponse.json(
          { error: "The CSV file is empty." },
          { status: 400 },
        );
      }
      const workbook = xlsx.read(csvText, { type: "string" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const csvRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet);
      if (csvRows.length > 0) {
        const normalizedKeys = Object.keys(csvRows[0]).map(normalizeKey);
        const hasAllRequiredCols = requiredCols.every((col) =>
          normalizedKeys.includes(col),
        );
        if (!hasAllRequiredCols) {
          return NextResponse.json(
            {
              error: `CSV is missing required columns: ${requiredColsDisplay.join(", ")}.`,
            },
            { status: 400 },
          );
        }
        rows = csvRows;
      }
    } else {
      // Parse XLSX/XLS
      const workbook = xlsx.read(datasetBuffer, { type: "buffer" });
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const sheetRows =
          xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet);
        if (sheetRows.length > 0) {
          const normalizedKeys = Object.keys(sheetRows[0]).map(normalizeKey);
          if (requiredCols.every((col) => normalizedKeys.includes(col))) {
            rows = sheetRows;
            break;
          }
        }
      }
    }

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: `No data containing the required columns (${requiredColsDisplay.join(", ")}) was found.`,
        },
        { status: 400 },
      );
    }

    const rowCountErr = validateRowCount(rows.length);
    if (rowCountErr) {
      return NextResponse.json(
        { error: rowCountErr.message },
        { status: rowCountErr.status },
      );
    }

    // 4. Process each row

    // Determine base URL dynamically so the QR code works in production
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host"); // e.g. "vuraweb.vercel.app"
    const dynamicBaseUrl = host ? `${protocol}://${host}` : undefined;

    // Prepare S3 URL for the original template (only if saving to DB)
    let templateS3Url = "";
    if (saveToDb) {
      const templateFileName = `templates/template_${Date.now()}.pdf`;
      templateS3Url = await uploadToS3(
        Buffer.from(templateBuffer),
        templateFileName,
      );
    }

    const generatedRecords: GeneratedCertificate[] = [];
    const userId = session?.user?.id || "anonymous";
    let emailsSentCount = 0;

    for (const row of rows) {
      const certificateId = generateCertificateId();

      // Create a normalized version of the row object
      const normalizedRow: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        normalizedRow[normalizeKey(key)] = value;
      }

      let recipientEmailValue = null;
      if (emailHeader) {
        recipientEmailValue = normalizedRow[normalizeKey(emailHeader)];
      }
      if (!recipientEmailValue) {
        recipientEmailValue =
          normalizedRow.email ??
          normalizedRow.recipientemail ??
          normalizedRow.recipientemailaddress ??
          normalizedRow.emailaddress ??
          normalizedRow.mail ??
          null;
      }
      const recipientEmail = recipientEmailValue
        ? String(recipientEmailValue)
        : null;

      const certData = {
        name: String(normalizedRow.name || "Unknown"),
        course: String(normalizedRow.course || (!needsCourse ? "" : "Unknown")),
        issueDate: String(
          normalizedRow.issuedate || (!needsIssueDate ? "" : "Unknown"),
        ),
        certificateId,
      };

      let certificateRecord: { id: string; status: string } | null = null;

      if (saveToDb) {
        certificateRecord = await prisma.certificate.create({
          data: {
            certificateId,
            name: certData.name,
            recipientEmail,
            course: certData.course,
            issueDate: certData.issueDate,
            templateUrl: templateS3Url,
            pdfUrl: "",
            batchId,
            userId,
            status: "pending",
          },
          select: { id: true, status: true },
        });
      }

      try {
        const pdfBuffer = await generateCertificate(
          templateBuffer,
          certData,
          settings,
          dynamicBaseUrl,
        );

        let pdfUrl = "";
        if (saveToDb) {
          const pdfFileName = `certificates/${certificateId}.pdf`;
          pdfUrl = await uploadToS3(pdfBuffer, pdfFileName);

          certificateRecord = await prisma.certificate.update({
            where: { certificateId },
            data: {
              pdfUrl,
              status: "generated",
              failureReason: null,
            },
            select: { id: true, status: true },
          });
        } else {
          pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
        }

        let finalStatus = saveToDb
          ? (certificateRecord?.status ?? "generated")
          : "generated";
        let failureReason: string | null = null;
        let sentAt: string | null = null;

        if (saveToDb && sendEmails && recipientEmail) {
          try {
            await sendCertificateEmail({
              recipientEmail,
              recipientName: certData.name,
              certificateId,
              verifyUrl: `${dynamicBaseUrl ?? `${protocol}://localhost:3000`}/verify/${certificateId}`,
              theme: emailTemplate || undefined,
              body: customEmailBody || undefined,
              course: certData.course,
            });

            emailsSentCount += 1;

            const sentRecord = await prisma.certificate.update({
              where: { certificateId },
              data: {
                status: "sent",
                sentAt: new Date(),
                failureReason: null,
              },
              select: { status: true, sentAt: true },
            });

            finalStatus = sentRecord.status;
            sentAt = sentRecord.sentAt?.toISOString() ?? null;
          } catch (emailError) {
            failureReason = getErrorMessage(emailError);
            await prisma.certificate.update({
              where: { certificateId },
              data: {
                status: "failed",
                failureReason,
              },
            });
            finalStatus = "failed";
          }
        }

        generatedRecords.push({
          certificateId,
          name: certData.name,
          course: certData.course,
          issueDate: certData.issueDate,
          templateUrl: templateS3Url,
          pdfUrl,
          userId,
          batchId,
          recipientEmail,
          status: finalStatus,
          failureReason,
          sentAt,
        });
      } catch (error) {
        const failureReason = getErrorMessage(error);

        if (saveToDb) {
          await prisma.certificate.update({
            where: { certificateId },
            data: {
              status: "failed",
              failureReason,
            },
          });
        }

        generatedRecords.push({
          certificateId,
          name: certData.name,
          course: certData.course,
          issueDate: certData.issueDate,
          templateUrl: templateS3Url,
          pdfUrl: "",
          userId,
          batchId,
          recipientEmail,
          status: "failed",
          failureReason,
          sentAt: null,
        });
      }
    }

    const count = generatedRecords.filter(
      (record) => record.status !== "failed",
    ).length;

    let composeToken = null;
    if (saveToDb && userId !== "anonymous") {
      try {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

        await prisma.composeSession.create({
          data: {
            token,
            batchId,
            userId,
            expiresAt,
          },
        });
        composeToken = token;
      } catch (sessionError) {
        console.error("Failed to create ComposeSession:", sessionError);
      }
    }

    return NextResponse.json(
      {
        count: count,
        success: true,
        batchId,
        emailsSentCount,
        composeToken,
        certificates: generatedRecords,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Certificate Generation Error:", error);
    return NextResponse.json(
      { error: "Generation failed: " + getErrorMessage(error) },
      { status: 500 },
    );
  }
}
