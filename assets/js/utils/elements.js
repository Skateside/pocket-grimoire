/**
 * A helper function for looking up elements, optionally from with a specified
 * context element.
 *
 * @param  {String} selector
 *         CSS selector to identify the elements.
 * @param  {Element} [context=document]
 *         Optional context, defaults to the document.
 * @return {Element[]}
 *         An array of elements matching the selector and within the given
 *         context. If there are no matches, an empty array is returned.
 */
export function lookup(selector, context = document) {
    return [...context.querySelectorAll(selector)];
}

/**
* A helper function for looking up a single element, optionally from with a
* specified context element.
*
* @param  {String} selector
*         CSS selector to identify the elements.
* @param  {Element} [context=document]
*         Optional context, defaults to the document.
* @return {Element[]}
*         An array of elements matching the selector and within the given
*         context. If there are no matches, an empty array is returned.
 */
export function lookupOne(selector, context = document) {
    return lookup(selector, context)[0];
}

/**
 * A cache for the lookups. The context element is used as the key.
 * @type {WeakMap}
 * @private
 */
const lookupCache = new WeakMap();

/**
 * Returns an array of elements matching the given CSS selector and within the
 * given context element. The results are cached before being returned.
 *
 * @param  {String} selector
 *         CSS selector to identify the elements.
 * @param  {Element} [context=document]
 *         Optional context, defaults to the document.
 * @return {Element[]}
 *         An array of elements matching the selector and within the given
 *         context. If there are no matches, an empty array is returned.
 */
export function lookupCached(selector, context = document) {

    let cache = lookupCache.get(context);

    if (!cache) {

        cache = Object.create(null);
        lookupCache.set(context, cache);

    }

    if (!cache[selector]) {
        cache[selector] = lookup(selector, context);
    }

    return cache[selector];

}

/**
 * Returns the first element matching the given CSS selector and within the
 * given context element. The result is cached before being returned.
 *
 * @param  {String} selector
 *         CSS selector to identify the elements.
 * @param  {Element} [context=document]
 *         Optional context, defaults to the document.
 * @return {Element[]}
 *         An array of elements matching the selector and within the given
 *         context. If there are no matches, an empty array is returned.
 */
export function lookupOneCached(selector, context = document) {
    return lookupCached(selector, context)[0];
}

/**
 * A counter that increases to create a unique number.
 * @type {Number}
 * @private
 */
let identifyCounter = 0;

/**
 * Returns the ID of the given element. If the element has no ID, a unique one
 * is generated and assigned to the element before being returned.
 *
 * @param  {Element} element
 *         Element to identify.
 * @param  {String} [prefix="anonymous-element-"]
 *         Optional generated ID prefix.
 * @return {String}
 *         ID of the given element.
 */
export function identify(element, prefix = "anonymous-element-") {

    let {
        id
    } = element;

    if (!id) {

        do {

            id = `${prefix}${identifyCounter}`;
            identifyCounter += 1;

        } while (document.getElementById(id));

        element.id = id;

    }

    return id;

}
