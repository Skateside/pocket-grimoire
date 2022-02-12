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

// function parseVersion(semver) {
//     return Object.assign([0, 0, 0], semver.split(".").map(Number));
// }
//
// // -1 = version1 < version2
// //  0 = version1 === version2
// //  1 = version1 > version2
// function compareVersions(version1, version2) {
//
//     const parts1 = parseVersion(version1);
//     const parts2 = parseVersion(version2);
//
//     const number = parts1.reduce((number, part, i) => {
//
//         if (number === 0) {
//             number = part - parts2[i];
//         }
//
//         return number;
//
//     }, 0);
//
//     return clamp(-1, number, 1);
//
// }
