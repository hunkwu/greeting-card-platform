/**
 * Express parameter type-safe utilities
 * Handles both req.query and req.params type extraction
 */

/**
 * Extract string from Express request parameter (query or params)
 * Safely handles string | string[] | ParsedQs | ParsedQs[] | undefined
 */
export function getParamString(
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
 * Get string with guaranteed non-undefined result
 * Use when parameter is required
 */
export function getRequiredParamString(
    value: any,
    defaultValue: string = ''
): string {
    return getParamString(value) || defaultValue;
}

/**
 * Extract number from parameter
 */
export function getParamNumber(
    value: any,
    defaultValue?: number
): number {
    const str = getParamString(value);
    if (!str) {
        return defaultValue ?? 0;
    }
    const num = parseInt(str, 10);
    return isNaN(num) ? (defaultValue ?? 0) : num;
}

/**
 * Extract boolean from parameter
 * Accepts: "true", "1", "yes" as truthy
 */
export function getParamBoolean(
    value: any
): boolean {
    const str = getParamString(value)?.toLowerCase();
    return str === 'true' || str === '1' || str === 'yes';
}

/**
 * Extract array from parameter
 * Always returns array (empty if undefined)
 */
export function getParamArray(
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

// Legacy exports for backwards compatibility
export const getQueryString = getParamString;
export const getQueryNumber = getParamNumber;
export const getQueryBoolean = getParamBoolean;
export const getQueryArray = getParamArray;
