import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator for secure file naming
import path from 'path'; // Import path for file extension handling

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
})

// Basic sanitization for file names: remove path separators and control characters
function sanitizeFileName(fileName: string): string {
    // Remove any directory traversal characters (e.g., '..', '/', '\')
    let sanitized = fileName.replace(/\.\./g, '').replace(/\//g, '-').replace(/\\/g, '-');
    // Remove control characters and other potentially problematic characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]+/g, '').trim();
    return sanitized;
}

export async function uploadToS3(buffer: Buffer, originalFileName: string, contentType: string = 'application/pdf') {
    const bucketName = process.env.AWS_BUCKET_NAME;
    if (!bucketName) {
        throw new Error("AWS_BUCKET_NAME is not set");
    }

    // It's crucial that `fileName` is not directly user-controlled to prevent arbitrary file overwrites
    // or path traversal. A UUID is a good way to ensure uniqueness and security.
    // Combine with a sanitized version of the original file name or just use a UUID.
    const fileExtension = path.extname(originalFileName);
    const baseFileName = sanitizeFileName(path.basename(originalFileName, fileExtension));
    
    // Generate a unique ID for the file to prevent overwrites and ensure unique keys
    const uniqueId = uuidv4();
    const fileName = `certificates/${uniqueId}-${baseFileName}${fileExtension}`; // Store in a 'certificates' folder for organization

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
        // Add security headers for publicly accessible files if needed, e.g., Cache-Control, Content-Disposition
        // ACL: 'public-read' might be needed if the PDF should be publicly accessible directly via S3 URL
        // However, using pre-signed URLs or CloudFront is often more secure for public access.
    })

    try {
        await s3Client.send(command);
        // Construct the full URL to the uploaded object
        return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error(`Failed to upload file to S3: ${fileName}`, error);
        throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
