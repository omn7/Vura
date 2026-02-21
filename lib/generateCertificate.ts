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
    settings?: any
): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(templateBuffer)
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    // Embed font to calculate string widths for perfect centering
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

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
        const fontSize = settings ? settings.name.size : 32;
        const textWidth = font.widthOfTextAtSize(textToDraw, fontSize);
        const startX = settings ? getX(settings.name.x) : centerX;

        firstPage.drawText(textToDraw, {
            x: startX - (textWidth / 2),
            y: settings ? getY(settings.name.y) : height / 2 + 50,
            size: fontSize,
            font: font,
            color: settings ? hexToRgb(settings.name.hex) : rgb(0, 0, 0),
        })
    }

    // Render Course
    if (!settings || settings?.course?.enabled) {
        const textToDraw = data.course;
        const fontSize = settings ? settings.course.size : 20;
        const textWidth = font.widthOfTextAtSize(textToDraw, fontSize);
        const startX = settings ? getX(settings.course.x) : centerX;

        firstPage.drawText(textToDraw, {
            x: startX - (textWidth / 2),
            y: settings ? getY(settings.course.y) : height / 2,
            size: fontSize,
            font: font,
            color: settings ? hexToRgb(settings.course.hex) : rgb(0.2, 0.2, 0.2),
        })
    }

    // Render Issue Date
    if (!settings || settings?.issueDate?.enabled) {
        const textToDraw = settings ? data.issueDate : `Date: ${data.issueDate}`;
        const fontSize = settings ? settings.issueDate.size : 14;
        const textWidth = font.widthOfTextAtSize(textToDraw, fontSize);
        const startX = settings ? getX(settings.issueDate.x) : centerX;

        firstPage.drawText(textToDraw, { // don't prefix with "Date:" if custom configured
            x: startX - (textWidth / 2),
            y: settings ? getY(settings.issueDate.y) : height / 2 - 40,
            size: fontSize,
            font: font,
            color: settings ? hexToRgb(settings.issueDate.hex) : rgb(0, 0, 0),
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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const qrUrl = `${baseUrl}/verify/${data.certificateId}`;

        const qrCodeDataUri = await QRCode.toDataURL(qrUrl, { margin: 1 })
        const qrBuffer = Buffer.from(qrCodeDataUri.split(',')[1], 'base64')

        const qrImage = await pdfDoc.embedPng(qrBuffer)

        const defaultScale = 0.5;
        const scale = settings ? settings.qrCode.scale : defaultScale;
        const qrDims = qrImage.scale(scale);

        // Map the center point of the graphic, offsetting by half its width/height
        const centerXPos = settings ? getX(settings.qrCode.x) : width - qrDims.width - 50;
        const centerYPos = settings ? getY(settings.qrCode.y) : 50;

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
