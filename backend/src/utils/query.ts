/**
 * Query parameter type-safe utilities
 * Express req.query uses complex ParsedQs type
 * These utilities safely extract simple values
 */

/**
 * Extract string from query parameter
 * If array, returns first element
 */
export function getQueryString(
    value: any
): string | undefined {
    // Handle undefined/null
    if (value === undefined || value === null) {
        return undefined;
    }

    // Handle string (most common case)
    if (typeof value === 'string') {
        return value;
    }

    // Handle array - take first element
    if (Array.isArray(value) && value.length > 0) {
        const first = value[0];
        if (typeof first === 'string') {
            return first;
        }
    }

    // For any other type, return undefined
    return undefined;
}

/**
 * Extract number from query parameter
 * If array, returns first element as number
 */
export function getQueryNumber(
    value: any,
    defaultValue?: number
): number {
    const str = getQueryString(value);
    if (!str) {
        return defaultValue ?? 0;
    }
    const num = parseInt(str, 10);
    return isNaN(num) ? (defaultValue ?? 0) : num;
}

/**
 * Extract boolean from query parameter
 * Accepts: "true", "1", "yes" as truthy
 */
export function getQueryBoolean(
    value: any
): boolean {
    const str = getQueryString(value)?.toLowerCase();
    return str === 'true' || str === '1' || str === 'yes';
}

/**
 * Extract array from query parameter
 * Always returns array (empty if undefined)
 */
export function getQueryArray(
    value: any
): string[] {
    if (value === undefined || value === null) {
        return [];
    }

    if (typeof value === 'string') {
        return [value];
    }

    if (Array.isArray(value)) {
        return value.filter(v => typeof v === 'string');
    }

    // For any other type, return empty array
    return [];
}
