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

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized. Please log in to generate certificates." }, { status: 401 });
        }
        const formData = await req.formData();

        const templateFile = formData.get("template") as File | null;
        const datasetFile = formData.get("dataset") as File | null;

        if (!templateFile || !datasetFile) {
            return NextResponse.json({ error: "Missing template or dataset file." }, { status: 400 });
        }

        // 1. Read files into buffers
        const templateBuffer = await templateFile.arrayBuffer();
        const datasetBuffer = await datasetFile.arrayBuffer();

        // 2. Parse Excel dataset
        const workbook = xlsx.read(datasetBuffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Cast to expected type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = xlsx.utils.sheet_to_json<any>(sheet);

        if (rows.length === 0) {
            return NextResponse.json({ error: "The provided Excel file is empty." }, { status: 400 });
        }

        // 3. Process each row
        const normalizeKey = (key: string) => key.trim().toLowerCase();

        // Validate if necessary columns exist in the first row case-insensitively
        const firstRow = rows[0];
        const normalizedKeys = Object.keys(firstRow).map(normalizeKey);

        if (!normalizedKeys.includes('name') || !normalizedKeys.includes('course') || !normalizedKeys.includes('issuedate')) {
            return NextResponse.json({ error: "Excel must contain 'name', 'course', and 'issueDate' columns." }, { status: 400 });
        }

        // Extract settings payload
        const settingsString = formData.get("settings") as string | null;
        const settings = settingsString ? JSON.parse(settingsString) : null;

        // Determine base URL dynamically so the QR code works in production
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("host"); // e.g. "vuraweb.vercel.app"
        const dynamicBaseUrl = host ? `${protocol}://${host}` : undefined;

        // Prepare S3 URL for the original template (just so it's stored once)
        const templateFileName = `templates/template_${Date.now()}.pdf`;
        const templateS3Url = await uploadToS3(Buffer.from(templateBuffer), templateFileName);

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
                course: String(normalizedRow.course || "Unknown"),
                issueDate: String(normalizedRow.issuedate || "Unknown"),
                certificateId,
            };

            // Generate the PDF and pass settings down if they exist
            const pdfBuffer = await generateCertificate(templateBuffer, certData, settings, dynamicBaseUrl);

            // Upload generated PDF to S3
            const pdfFileName = `certificates/${certificateId}.pdf`;
            const pdfS3Url = await uploadToS3(pdfBuffer, pdfFileName);

            // We collect data for bulk insert
            generatedRecords.push({
                certificateId,
                name: certData.name,
                course: certData.course,
                issueDate: certData.issueDate,
                templateUrl: templateS3Url, // Reference to original
                pdfUrl: pdfS3Url,
                userId: session.user.id,
            });
        }

        // 4. Save metadata to Neon Postgres via Prisma
        const dbResult = await prisma.certificate.createMany({
            data: generatedRecords,
            skipDuplicates: true,
        });

        // Fetch back the created objects to return them exactly as recorded (optional based on architecture, but returning the in-memory built array also works perfectly)

        return NextResponse.json({
            count: dbResult.count,
            success: true,
            certificates: generatedRecords
        }, { status: 200 });
    } catch (error: unknown) {
        console.error("Certificate Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate certificates. Check server logs." }, { status: 500 });
    }
}
