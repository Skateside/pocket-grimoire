/**
 * Clones an object, including any nested objects.
 *
 * @param  {Object|Array|String|Number|Boolean|null} object
 *         Object to clone.
 * @return {Object|Array|String|Number|Boolean|null}
 *         Cloned object.
 */
export function deepClone(object) {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Freezes the given object and any nested objects.
 *
 * @param  {Object} object
 *         Object to freeze.
 * @return {Object}
 *         Frozen object.
 */
export function deepFreeze(object) {

    if (object && typeof object === "object") {
        Object.values(object).forEach((item) => deepFreeze(item));
    }

    return Object.freeze(object);

}

/**
 * Removes all the properties from an object.
 *
 * @param {Object} object
 *        Object to empty.
 */
export function empty(object) {
    Object.keys(object).forEach((key) => delete object[key]);
}
