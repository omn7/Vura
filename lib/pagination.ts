/**
 * Pagination utilities for API endpoints
 */

export interface PaginationParams {
    page?: number | string;
    limit?: number | string;
}

export interface PaginationMetadata {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMetadata;
}

// Configuration
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * Validates and parses pagination parameters
 * @param page - The page number (1-based)
 * @param limit - The number of items per page
 * @returns Validated pagination parameters
 */
export function parsePaginationParams(
    page?: number | string,
    limit?: number | string
): { page: number; limit: number } {
    let parsedPage = DEFAULT_PAGE;
    let parsedLimit = DEFAULT_LIMIT;

    if (page !== undefined && page !== null && page !== "") {
        const numPage = typeof page === "string" ? parseInt(page, 10) : page;
        if (Number.isInteger(numPage) && numPage > 0) {
            parsedPage = numPage;
        }
    }

    if (limit !== undefined && limit !== null && limit !== "") {
        const numLimit = typeof limit === "string" ? parseInt(limit, 10) : limit;
        if (Number.isInteger(numLimit) && numLimit > 0) {
            parsedLimit = Math.min(numLimit, MAX_LIMIT);
        }
    }

    return { page: parsedPage, limit: parsedLimit };
}

/**
 * Calculates pagination metadata
 * @param page - The current page (1-based)
 * @param limit - The items per page
 * @param total - The total number of items
 * @returns Pagination metadata
 */
export function getPaginationMetadata(
    page: number,
    limit: number,
    total: number
): PaginationMetadata {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}

/**
 * Calculates the skip value for database queries
 * @param page - The page number (1-based)
 * @param limit - The items per page
 * @returns The skip value for database queries
 */
export function calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
}
