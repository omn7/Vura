import prisma from "./prisma";

type HeaderBag =
    | Headers
    | Record<string, string | string[] | undefined>
    | undefined;

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const BLOCK_DURATION_MS = 15 * 60 * 1000;
export const AUTH_RATE_LIMIT_MESSAGE =
    "Too many authentication attempts. Please try again later.";

function readHeader(headers: HeaderBag, name: string) {
    if (!headers) {
        return undefined;
    }

    if (typeof (headers as Headers).get === "function") {
        return (headers as Headers).get(name) ?? undefined;
    }

    const headerRecord = headers as Record<
        string,
        string | string[] | undefined
    >;

    const value =
        headerRecord[name] ?? headerRecord[name.toLowerCase()];

    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
}

export function getClientIp(headers: HeaderBag) {
    const forwardedFor = readHeader(headers, "x-forwarded-for");
    const realIp = readHeader(headers, "x-real-ip");

    return (
        forwardedFor?.split(",")[0]?.trim() ||
        realIp?.trim() ||
        "unknown"
    );
}

export function getRateLimitKey(
    scope: string,
    identifier: string,
    headers?: HeaderBag
) {
    const normalizedIdentifier =
        identifier.trim().toLowerCase() || "anonymous";

    return `${scope}:${getClientIp(headers)}:${normalizedIdentifier}`;
}

export async function isBlocked(key: string) {
    const record = await prisma.rateLimit.findUnique({
        where: { key },
    });

    if (!record) {
        return {
            blocked: false,
        };
    }

    const now = new Date();

    if (record.blockedUntil && record.blockedUntil > now) {
        return {
            blocked: true,
            retryAfter: Math.ceil(
                (record.blockedUntil.getTime() - now.getTime()) / 1000
            ),
        };
    }

    if (record.blockedUntil && record.blockedUntil <= now) {
        try {
            await prisma.rateLimit.delete({
                where: { key },
            });
        } catch {
            // Ignore concurrent deletes
        }

        return {
            blocked: false,
        };
    }

    return {
        blocked: false,
    };
}

export async function recordFailedAttempt(key: string) {
    const now = new Date();

    const existingRecord = await prisma.rateLimit.findUnique({
        where: { key },
    });

    if (!existingRecord) {
        await prisma.rateLimit.create({
            data: {
                key,
                count: 1,
                firstAttempt: now,
            },
        });

        return;
    }

    if (now.getTime() - existingRecord.firstAttempt.getTime() > WINDOW_MS) {
        await prisma.rateLimit.update({
            where: { key },
            data: {
                count: 1,
                firstAttempt: now,
                blockedUntil: null,
            },
        });

        return;
    }

    const newCount = existingRecord.count + 1;
    let blockedUntil: Date | null = null;
    if (newCount >= MAX_ATTEMPTS) {
        blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MS);
    }

    await prisma.rateLimit.update({
        where: { key },
        data: {
            count: newCount,
            blockedUntil,
        },
    });
}

export async function clearFailedAttempts(key: string) {
    try {
        await prisma.rateLimit.delete({
            where: { key },
        });
    } catch {
        // Ignore if already deleted
    }
}

export function getRetryAfterHeaders(retryAfter?: number) {
    return retryAfter
        ? {
              "Retry-After": String(retryAfter),
          }
        : undefined;
}
