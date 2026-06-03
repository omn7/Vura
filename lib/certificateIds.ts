export function generateCertificateId(): string {
    // Use 16 bytes (128 bits) of cryptographically secure random data.
    // The previous 4-byte (32-bit) implementation produced only ~4.29 billion
    // possible IDs, making the entire namespace enumerable via the public
    // /api/verify endpoint with no rate limiting. 128 bits makes brute-force
    // enumeration computationally infeasible (2^128 possible values).
    // OWASP recommends >= 128 bits of entropy for public authenticity tokens.
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    return "CERT-" + Array.from(buf)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("").toUpperCase();
}

export function generateBatchId(): string {
    // Same fix applied to batch IDs for consistency.
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    return "BATCH-" + Array.from(buf)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("").toUpperCase();
}