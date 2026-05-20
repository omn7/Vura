type AttemptRecord = {
    count: number;
    firstAttempt: number;
    blockedUntil?: number;
};

type HeaderBag =
    | Headers
    | Record<string, string | string[] | undefined>
    | undefined;

const loginAttempts = new Map<string, AttemptRecord>();

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

export function isBlocked(key: string) {
    const record = loginAttempts.get(key);

    if (!record) {
        return {
            blocked: false,
        };
    }

    const now = Date.now();

    if (record.blockedUntil && record.blockedUntil > now) {
        return {
            blocked: true,
            retryAfter: Math.ceil(
                (record.blockedUntil - now) / 1000
            ),
        };
    }

    if (record.blockedUntil && record.blockedUntil <= now) {
        loginAttempts.delete(key);

        return {
            blocked: false,
        };
    }

    return {
        blocked: false,
    };
}

export function recordFailedAttempt(key: string) {
    const now = Date.now();

    const existingRecord = loginAttempts.get(key);

    if (!existingRecord) {
        loginAttempts.set(key, {
            count: 1,
            firstAttempt: now,
        });

        return;
    }

    if (now - existingRecord.firstAttempt > WINDOW_MS) {
        loginAttempts.set(key, {
            count: 1,
            firstAttempt: now,
        });

        return;
    }

    existingRecord.count += 1;

    if (existingRecord.count >= MAX_ATTEMPTS) {
        existingRecord.blockedUntil =
            now + BLOCK_DURATION_MS;
    }

    loginAttempts.set(key, existingRecord);
}

export function clearFailedAttempts(key: string) {
    loginAttempts.delete(key);
}

export function getRetryAfterHeaders(retryAfter?: number) {
    return retryAfter
        ? {
              "Retry-After": String(retryAfter),
          }
        : undefined;
}
