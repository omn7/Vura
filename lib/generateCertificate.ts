import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'

export interface CertificateData {
    name: string;
    course: string;
    issueDate: string;
    certificateId: string;
}

export async function generateCertificate(
    templateBuffer: ArrayBuffer,
    data: CertificateData,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    settings?: any,
    baseUrlValue?: string
): Promise<Buffer> {
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
        return helveticaBold; // default to bold for backward compatibility
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
    if (!settings || settings?.name?.enabled) {
        const textToDraw = data.name;
        const nameCfg = settings?.name;
        const fontSize = nameCfg?.size ?? 32;
        const fontToUse = nameCfg ? getFont(nameCfg.fontStyle) : helveticaBold;
        const textWidth = fontToUse.widthOfTextAtSize(textToDraw, fontSize);
        const startX = nameCfg?.x != null ? getX(nameCfg.x) : centerX;

        firstPage.drawText(textToDraw, {
            x: startX - (textWidth / 2),
            y: nameCfg?.y != null ? getY(nameCfg.y) : height / 2 + 50,
            size: fontSize,
            font: fontToUse,
            color: nameCfg?.hex ? hexToRgb(nameCfg.hex) : rgb(0, 0, 0),
        })
    }

    // Render Course
    if (!settings || settings?.course?.enabled) {
        const textToDraw = data.course;
        const courseCfg = settings?.course;
        const fontSize = courseCfg?.size ?? 20;
        const fontToUse = courseCfg ? getFont(courseCfg.fontStyle) : helvetica;
        const textWidth = fontToUse.widthOfTextAtSize(textToDraw, fontSize);
        const startX = courseCfg?.x != null ? getX(courseCfg.x) : centerX;

        firstPage.drawText(textToDraw, {
            x: startX - (textWidth / 2),
            y: courseCfg?.y != null ? getY(courseCfg.y) : height / 2,
            size: fontSize,
            font: fontToUse,
            color: courseCfg?.hex ? hexToRgb(courseCfg.hex) : rgb(0.2, 0.2, 0.2),
        })
    }

    // Render Issue Date
    if (!settings || settings?.issueDate?.enabled) {
        const issueCfg = settings?.issueDate;
        const textToDraw = issueCfg ? data.issueDate : `Date: ${data.issueDate}`;
        const fontSize = issueCfg?.size ?? 14;
        const fontToUse = issueCfg ? getFont(issueCfg.fontStyle) : helvetica;
        const textWidth = fontToUse.widthOfTextAtSize(textToDraw, fontSize);
        const startX = issueCfg?.x != null ? getX(issueCfg.x) : centerX;

        firstPage.drawText(textToDraw, { // don't prefix with "Date:" if custom configured
            x: startX - (textWidth / 2),
            y: issueCfg?.y != null ? getY(issueCfg.y) : height / 2 - 40,
            size: fontSize,
            font: fontToUse,
            color: issueCfg?.hex ? hexToRgb(issueCfg.hex) : rgb(0, 0, 0),
        })
    }

    // Add Certificate ID at right bottom corner (always enabled as it's the DB primary key reference)
    firstPage.drawText(`ID: ${data.certificateId}`, {
        x: width - 150,
        y: 20,
        size: 10,
        color: rgb(0.4, 0.4, 0.4),
    })

    // Add QR Code
    if (!settings || settings?.qrCode?.enabled) {
        const baseUrl = baseUrlValue || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const qrUrl = `${baseUrl}/verify/${data.certificateId}`;

        const qrCodeDataUri = await QRCode.toDataURL(qrUrl, { margin: 1 })
        const qrBuffer = Buffer.from(qrCodeDataUri.split(',')[1], 'base64')

        const qrImage = await pdfDoc.embedPng(qrBuffer)

        const qrCfg = settings?.qrCode;
        const scale = qrCfg?.scale ?? 0.5;
        const qrDims = qrImage.scale(scale);

        // Map the center point of the graphic, offsetting by half its width/height
        const centerXPos = qrCfg?.x != null ? getX(qrCfg.x) : width - qrDims.width - 50;
        const centerYPos = qrCfg?.y != null ? getY(qrCfg.y) : 50;

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
