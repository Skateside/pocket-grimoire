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

/**
 * Parses a version number, in semver, into an array of numbers.
 *
 * @param  {String} semver
 *         A version number in semver, such as "1.2.3" or "4.5".
 * @return {Array.<Number>}
 *         The version number as an array of numbers.
 */
export function parseVersion(semver) {
    return Object.assign([0, 0, 0], semver.split(".").map(Number));
}

/**
 * Compares two semver versions. The function will return one of three numbers:
 * -1 if version1 is less than version2.
 * 0 if version1 and version2 are the same.
 * 1 if version1 is more than version2.
 * This is consistent with Array#sort()
 *
 * @param  {String} version1
 *         Version number 1.
 * @param  {String} version2
 *         Version number 2.
 * @return {Number}
 *         Comparison number.
 */
export function compareVersions(version1, version2) {

    const parts1 = parseVersion(version1);
    const parts2 = parseVersion(version2);

    const number = parts1.reduce((number, part, i) => {

        if (number === 0) {
            number = part - parts2[i];
        }

        return number;

    }, 0);

    return clamp(-1, number, 1);

}

/**
 * Converts the given number to its positive integer.
 *
 * @param  {Number} number
 *         Number to convert.
 * @return {Number}
 *         Positive integer, or NaN if the number can't be parsed.
 */
export function toPosInt(number) {
    return Math.floor(Math.abs(number));
}

/**
 * Executes a handler a set number of times. The number of times is converted
 * into a positive integer (ses {@link toPosInt}) and returned. The handler is
 * passed the current index and the maximum number of times that the handler
 * will be called.
 *
 * @param  {Number} number
 *         Number of times to execute the given handler.
 * @param  {Function} handler
 *         Handler to execute.
 * @param  {?} [context]
 *         Optional context for the handler.
 * @return {Number}
 *         The number of times that the handler was executed.
 */
export function times(number, handler, context) {

    const max = toPosInt(number) || 0;
    let index = 0;

    while (index < max) {

        handler.call(context, index, max);
        index += 1;

    }

    return max;

}

/**
 * Converts the given degrees into radians
 *
 * @param  {Number} degrees
 *         Degrees to convert.
 * @return {Number}
 *         Equivalent radians.
 */
export function toRadians(degrees) {
    return (Math.PI / 180) * degrees;
}

/**
 * Checks to see if the given value is numeric. This is not necessarily the same
 * as being a number because a numeric string would return true.
 *
 * @param  {?} value
 *         Value to check.
 * @return {Boolean}
 *         true if the given value is a number or numeric string, false
 *         otherwise.
 */
export function isNumeric(value) {

    const parsed = window.parseFloat(value);

    return !Number.isNaN(parsed) && Number.isFinite(parsed);

}
