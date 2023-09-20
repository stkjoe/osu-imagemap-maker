/**
 * Convert a percentage to a pixel size.
 */
export function convertPercentageToSize(percentage: number, totalSize: number): number {
    return totalSize / 100 * percentage
}

/**
 * Convert a pixel size top a percentage
 */
export function convertSizeToPercentage(size: number, totalSize: number): number {
    return size / totalSize * 100
}

/**
 * Round numbers to 4 d.p. if required, then return.
 * @param number the number to round to 4dp if required.
 */
export function formatNumberToPrecisionString(number: number): string {
    return (Math.round(number * 10000) / 10000).toString()
}