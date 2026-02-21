import { PDFDocument, rgb } from 'pdf-lib'
import QRCode from 'qrcode'

export interface CertificateData {
    name: string;
    course: string;
    issueDate: string;
    certificateId: string;
}

export async function generateCertificate(
    templateBuffer: ArrayBuffer,
    data: CertificateData
): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(templateBuffer)
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    // Dimensions of the first page to compute placements
    const { width, height } = firstPage.getSize()

    const centerX = width / 2;

    // Render Name in center
    firstPage.drawText(data.name, {
        x: centerX - 100, // naive centering offset
        y: height / 2 + 50,
        size: 32,
        color: rgb(0, 0, 0),
    })

    // Render Course
    firstPage.drawText(data.course, {
        x: centerX - 80,
        y: height / 2,
        size: 20,
        color: rgb(0.2, 0.2, 0.2),
    })

    // Render Issue Date
    firstPage.drawText(`Date: ${data.issueDate}`, {
        x: centerX - 50,
        y: height / 2 - 40,
        size: 14,
    })

    // Add Certificate ID at corner
    firstPage.drawText(`ID: ${data.certificateId}`, {
        x: 50,
        y: 50,
        size: 10,
        color: rgb(0.4, 0.4, 0.4),
    })

    // Add QR Code at bottom left
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const qrUrl = `${baseUrl}/verify/${data.certificateId}`;

    const qrCodeDataUri = await QRCode.toDataURL(qrUrl, { margin: 1 })
    const qrBuffer = Buffer.from(qrCodeDataUri.split(',')[1], 'base64')

    const qrImage = await pdfDoc.embedPng(qrBuffer)

    const scale = 0.5
    const qrDims = qrImage.scale(scale)
    firstPage.drawImage(qrImage, {
        x: width - qrDims.width - 50,
        y: 50,
        width: qrDims.width,
        height: qrDims.height,
    })

    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
}
