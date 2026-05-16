import { NextRequest, NextResponse } from "next/server";
import * as xlsx from "xlsx";
import prisma from "@/lib/prisma";
import { generateCertificate } from "@/lib/generateCertificate";
import { uploadToS3 } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function generateCuid() {
    const buf = new Uint8Array(4);
    crypto.getRandomValues(buf);
    return 'CERT-' + Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
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

        if (!templateFile || !datasetFile) {
            return NextResponse.json({ error: "Missing template or dataset file." }, { status: 400 });
        }

        // Extract settings payload before parsing to know which columns are required
        const settingsString = formData.get("settings") as string | null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let settings: any = null;
        if (settingsString) {
            try {
                settings = JSON.parse(settingsString);
            } catch {
                return NextResponse.json({ error: "Invalid settings JSON" }, { status: 400 });
            }
        }
        const saveToDb = formData.get("saveToDb") !== "false";

        if (saveToDb && (!session || !session.user)) {
            return NextResponse.json({ error: "Unauthorized. Please log in to save certificates to the database." }, { status: 401 });
        }

        // Determine which columns we actually need
        const needsName = settings?.name?.enabled !== false; // Default true if null
        const needsCourse = settings?.course?.enabled !== false;
        const needsIssueDate = settings?.issueDate?.enabled !== false;

        const requiredCols: string[] = [];
        const requiredColsDisplay: string[] = [];
        if (needsName) { requiredCols.push('name'); requiredColsDisplay.push('Name'); }
        if (needsCourse) { requiredCols.push('course'); requiredColsDisplay.push('Course'); }
        if (needsIssueDate) { requiredCols.push('issuedate'); requiredColsDisplay.push('Issue Date'); }

        // 1. Read files into buffers
        const templateBuffer = await templateFile.arrayBuffer();
        const datasetBuffer = await datasetFile.arrayBuffer();

        // 2. Parse Excel dataset
        const workbook = xlsx.read(datasetBuffer, { type: "buffer" });
        const normalizeKey = (key: string) => key.trim().toLowerCase();

        // 3. Find the valid sheet
        let rows: any[] = [];
        let firstRow: any = null;

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const sheetRows = xlsx.utils.sheet_to_json<any>(sheet);
            if (sheetRows.length > 0) {
                const potentialFirstRow = sheetRows[0];
                const normalizedKeys = Object.keys(potentialFirstRow).map(normalizeKey);

                const hasAllRequiredCols = requiredCols.every(col => normalizedKeys.includes(col));

                if (hasAllRequiredCols) {
                    rows = sheetRows;
                    firstRow = potentialFirstRow;
                    break;
                }
            }
        }

        if (rows.length === 0) {
            return NextResponse.json({ error: `No sheet containing the required columns (${requiredColsDisplay.join(', ')}) was found.` }, { status: 400 });
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
            templateS3Url = await uploadToS3(Buffer.from(templateBuffer), templateFileName);
        }

        const generatedRecords = [];

        for (const row of rows) {
            const certificateId = generateCuid(); // e.g. CERT-A1B2C3D4

            // Create a normalized version of the row object
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const normalizedRow: Record<string, any> = {};
            for (const [key, value] of Object.entries(row)) {
                normalizedRow[normalizeKey(key)] = value;
            }

            const certData = {
                name: String(normalizedRow.name || "Unknown"),
                course: String(normalizedRow.course || (!needsCourse ? "" : "Unknown")),
                issueDate: String(normalizedRow.issuedate || (!needsIssueDate ? "" : "Unknown")),
                certificateId,
            };

            // Generate the PDF and pass settings down if they exist
            const pdfBuffer = await generateCertificate(templateBuffer, certData, settings, dynamicBaseUrl);

            // Upload generated PDF to S3 or return Data URI directly
            let pdfUrl = "";
            if (saveToDb) {
                const pdfFileName = `certificates/${certificateId}.pdf`;
                pdfUrl = await uploadToS3(pdfBuffer, pdfFileName);
            } else {
                // If not saving, just return base64 so they can download it without hitting any storage!
                pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
            }

            // We collect data for bulk insert
            generatedRecords.push({
                certificateId,
                name: certData.name,
                course: certData.course,
                issueDate: certData.issueDate,
                templateUrl: templateS3Url, // Reference to original
                pdfUrl: pdfUrl,
                userId: session?.user?.id || 'anonymous',
            });
        }

        // 4. Save metadata to Neon Postgres via Prisma (conditionally)
        let count = generatedRecords.length;
        if (saveToDb) {
            const dbResult = await prisma.certificate.createMany({
                data: generatedRecords,
                skipDuplicates: true,
            });
            count = dbResult.count;
        }

        // Fetch back the created objects to return them exactly as recorded (optional based on architecture, but returning the in-memory built array also works perfectly)

        return NextResponse.json({
            count: count,
            success: true,
            certificates: generatedRecords
        }, { status: 200 });
    } catch (error: any) {
        console.error("Certificate Generation Error:", error);
        return NextResponse.json({ error: "Generation failed: " + (error?.message || String(error)) }, { status: 500 });
    }
}
