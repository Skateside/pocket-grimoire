/**
 * Clamps the given value so that it will be between the given min and max
 * values.
 *
 * @param  {Number} min
 *         Minimum possible value.
 * @param  {Number} value
 *         Value to clamp.
 * @param  {Number} max
 *         Maximum possible value.
 * @return {Number}
 *         Clamped value.
 */
export function clamp(min, value, max) {
    return Math.max(min, Math.min(value, max));
}
