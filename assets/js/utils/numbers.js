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
