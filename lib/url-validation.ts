import { resolve4, resolve6 } from "dns/promises";

const BLOCKED_HOSTNAMES = new Set([
    "localhost",
    "metadata.google.internal",
]);

const BLOCKED_IPV4_RANGES: Array<{ prefix: number; mask: number }> = [
    { prefix: 0x0A000000, mask: 0xFF000000 },   // 10.0.0.0/8
    { prefix: 0xAC100000, mask: 0xFFF00000 },   // 172.16.0.0/12
    { prefix: 0xC0A80000, mask: 0xFFFF0000 },   // 192.168.0.0/16
    { prefix: 0x7F000000, mask: 0xFF000000 },   // 127.0.0.0/8
    { prefix: 0xA9FE0000, mask: 0xFFFF0000 },   // 169.254.0.0/16
    { prefix: 0x00000000, mask: 0xFF000000 },   // 0.0.0.0/8
];

function ipv4ToInt(ip: string): number {
    const parts = ip.split(".");
    if (parts.length !== 4) return -1;
    let result = 0;
    for (const part of parts) {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < 0 || num > 255) return -1;
        result = (result << 8) | num;
    }
    return result >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
    const addr = ipv4ToInt(ip);
    if (addr === -1) return true;
    return BLOCKED_IPV4_RANGES.some(
        (range) => (addr & range.mask) === (range.prefix & range.mask)
    );
}

function isPrivateIPv6(ip: string): boolean {
    const normalized = ip.toLowerCase();
    if (normalized === "::1") return true;
    if (normalized.startsWith("fe80:")) return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (normalized === "::") return true;
    return false;
}

export async function validateTemplateUrl(
    url: string
): Promise<{ valid: boolean; error?: string }> {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return { valid: false, error: "Invalid URL format." };
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return {
            valid: false,
            error: "Only https:// and http:// URLs are allowed.",
        };
    }

    const hostname = parsed.hostname.toLowerCase();

    if (BLOCKED_HOSTNAMES.has(hostname)) {
        return {
            valid: false,
            error: "URLs pointing to localhost or internal services are not allowed.",
        };
    }

    if (hostname === "0.0.0.0" || isPrivateIPv4(hostname)) {
        return {
            valid: false,
            error: "URLs pointing to private or reserved IP addresses are not allowed.",
        };
    }

    if (hostname.startsWith("[") || isPrivateIPv6(hostname)) {
        return {
            valid: false,
            error: "URLs pointing to private or reserved IP addresses are not allowed.",
        };
    }

    try {
        const ipv4Addresses = await resolve4(hostname).catch(() => [] as string[]);
        const ipv6Addresses = await resolve6(hostname).catch(() => [] as string[]);

        for (const ip of ipv4Addresses) {
            if (isPrivateIPv4(ip)) {
                return {
                    valid: false,
                    error: "URL hostname resolves to a private or reserved IP address.",
                };
            }
        }

        for (const ip of ipv6Addresses) {
            if (isPrivateIPv6(ip)) {
                return {
                    valid: false,
                    error: "URL hostname resolves to a private or reserved IP address.",
                };
            }
        }

        if (ipv4Addresses.length === 0 && ipv6Addresses.length === 0) {
            return {
                valid: false,
                error: "URL hostname could not be resolved.",
            };
        }
    } catch {
        return {
            valid: false,
            error: "URL hostname could not be resolved.",
        };
    }

    return { valid: true };
}
