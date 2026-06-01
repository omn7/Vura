import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'
import { z } from 'zod';

export interface CertificateData {
    name: string;
    course: string;
    issueDate: string;
    certificateId: string;
}

// Define a schema for expected settings to ensure type safety and prevent malicious inputs
// This schema assumes settings are provided by an admin or trusted source, not raw user input.
// If any part of `settings` could come from untrusted user input, much stricter validation (e.g., specific regex for hex codes, min/max for sizes/coordinates) is required.
const fontStyleSchema = z.enum(['normal', 'italic', 'bold']); // Assuming these are the only allowed styles
const colorHexSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/); // Basic hex color validation
const coordinateSchema = z.number().min(0).max(100); // Percentage coordinates
const sizeSchema = z.number().min(8).max(100); // Reasonable font sizes
const scaleSchema = z.number().min(0.1).max(2.0); // Reasonable QR code scale

const textElementSchema = z.object({
    enabled: z.boolean().default(true),
    x: coordinateSchema,
    y: coordinateSchema,
    size: sizeSchema,
    fontStyle: fontStyleSchema,
    hex: colorHexSchema,
});

const qrCodeElementSchema = z.object({
    enabled: z.boolean().default(true),
    x: coordinateSchema,
    y: coordinateSchema,
    scale: scaleSchema,
});

const certificateSettingsSchema = z.object({
    name: textElementSchema.partial(), // Allow partial settings for name, course, etc.
    course: textElementSchema.partial(),
    issueDate: textElementSchema.partial(),
    qrCode: qrCodeElementSchema.partial(),
}).partial().default({}); // Allow entire settings object to be partial or missing

type CertificateSettings = z.infer<typeof certificateSettingsSchema>;

export async function generateCertificate(
    templateBuffer: ArrayBuffer,
    data: CertificateData,
    userSettings?: any, // Renamed to userSettings as it might come from an external source
    baseUrlValue?: string // Ensure this is from trusted source, not user input
): Promise<Buffer> {
    // Validate and sanitize certificate data
    // Assuming basic strings here, but for production, consider specific sanitization
    // e.g., for `name` to remove scripts, or validate `issueDate` format.
    const validatedData: CertificateData = {
        name: String(data.name).trim(),
        course: String(data.course).trim(),
        issueDate: String(data.issueDate).trim(),
        certificateId: String(data.certificateId).trim(),
    };

    // Validate and parse settings using Zod
    const settings = certificateSettingsSchema.parse(userSettings);

    const pdfDoc = await PDFDocument.load(templateBuffer)
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    // Embed basic fonts to support varied typography requests
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

    const getFont = (style?: string) => {
        if (style === 'normal') return helvetica;
        if (style === 'italic') return helveticaOblique;
        if (style === 'bold') return helveticaBold;
        return helveticaBold; // default to bold if style is not recognized
    }

    // Dimensions of the first page to compute placements
    const { width, height } = firstPage.getSize()

    const centerX = width / 2;

    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
    };

    // Helper functions to map the 0-100% UI coordinates back to PDF points
    const getX = (percent: number) => (percent / 100) * width;

    // PDF-lib draws from the bottom-left. UI mapping is from top-left.
    // So 0% Y in UI = 100% Height in PDF.
    const getY = (percent: number) => height - ((percent / 100) * height);

    // Render Name
    if (settings.name?.enabled !== false) { // Default is enabled
        const textToDraw = validatedData.name; // Use validated data
        const fontSize = settings.name?.size ?? 32;
        const fontToUse = getFont(settings.name?.fontStyle ?? 'bold');
        const textWidth = fontToUse.widthOfTextAtSize(textToDraw, fontSize);
        const startX = settings.name?.x ? getX(settings.name.x) : centerX;

        firstPage.drawText(textToDraw, {
            x: startX - (textWidth / 2),
            y: settings.name?.y ? getY(settings.name.y) : height / 2 + 50,
            size: fontSize,
            font: fontToUse,
            color: settings.name?.hex ? hexToRgb(settings.name.hex) : rgb(0, 0, 0),
        })
    }

    // Render Course
    if (settings.course?.enabled !== false) { // Default is enabled
        const textToDraw = validatedData.course; // Use validated data
        const fontSize = settings.course?.size ?? 20;
        const fontToUse = getFont(settings.course?.fontStyle ?? 'normal');
        const textWidth = fontToUse.widthOfTextAtSize(textToDraw, fontSize);
        const startX = settings.course?.x ? getX(settings.course.x) : centerX;

        firstPage.drawText(textToDraw, {
            x: startX - (textWidth / 2),
            y: settings.course?.y ? getY(settings.course.y) : height / 2,
            size: fontSize,
            font: fontToUse,
            color: settings.course?.hex ? hexToRgb(settings.course.hex) : rgb(0.2, 0.2, 0.2),
        })
    }

    // Render Issue Date
    if (settings.issueDate?.enabled !== false) { // Default is enabled
        const textToDraw = settings.issueDate ? validatedData.issueDate : `Date: ${validatedData.issueDate}`; // Use validated data
        const fontSize = settings.issueDate?.size ?? 14;
        const fontToUse = getFont(settings.issueDate?.fontStyle ?? 'normal');
        const textWidth = fontToUse.widthOfTextAtSize(textToDraw, fontSize);
        const startX = settings.issueDate?.x ? getX(settings.issueDate.x) : centerX;

        firstPage.drawText(textToDraw, { 
            x: startX - (textWidth / 2),
            y: settings.issueDate?.y ? getY(settings.issueDate.y) : height / 2 - 40,
            size: fontSize,
            font: fontToUse,
            color: settings.issueDate?.hex ? hexToRgb(settings.issueDate.hex) : rgb(0, 0, 0),
        })
    }

    // Add Certificate ID at right bottom corner (always enabled as it's the DB primary key reference)
    firstPage.drawText(`ID: ${validatedData.certificateId}`, { // Use validated data
        x: width - 150,
        y: 20,
        size: 10,
        color: rgb(0.4, 0.4, 0.4),
    })

    // Add QR Code
    if (settings.qrCode?.enabled !== false) { // Default is enabled
        // Ensure baseUrl is from a trusted source, typically an environment variable
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        // The `baseUrlValue` argument could override this, but should be strictly controlled upstream
        const trustedBaseUrl = baseUrlValue || baseUrl;
        
        // Construct qrUrl using validated data and trusted base URL
        const qrUrl = `${trustedBaseUrl}/verify/${encodeURIComponent(validatedData.certificateId)}`;

        const qrCodeDataUri = await QRCode.toDataURL(qrUrl, { margin: 1 })
        const qrBuffer = Buffer.from(qrCodeDataUri.split(',')[1], 'base64')

        const qrImage = await pdfDoc.embedPng(qrBuffer)

        const defaultScale = 0.5;
        const scale = settings.qrCode?.scale ?? defaultScale; // Use validated scale
        const qrDims = qrImage.scale(scale);

        // Map the center point of the graphic, offsetting by half its width/height
        const centerXPos = settings.qrCode?.x ? getX(settings.qrCode.x) : width - qrDims.width - 50;
        const centerYPos = settings.qrCode?.y ? getY(settings.qrCode.y) : 50;

        firstPage.drawImage(qrImage, {
            x: centerXPos - (qrDims.width / 2),
            y: centerYPos - (qrDims.height / 2),
            width: qrDims.width,
            height: qrDims.height,
        })
    }

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
}
