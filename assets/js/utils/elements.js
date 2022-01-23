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
 * @return {Element|undefined}
 *         The first matching element or undefined if no element can be found.
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
 * @return {Element|undefined}
 *         The first matching element or undefined if no element can be found.
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

/**
 * Appends all the entries in the given list to the given target.
 *
 * @param  {Element} target
 *         Element that should have all the entries appended to it.
 * @param  {Array} list
 *         Items that should be appended to the target.
 * @return {Element}
 *         The given target.
 */
export function appendMany(target, list) {

    target.append(
        list.reduce((fragment, item) => {

            fragment.append(item);
            return fragment;

        }, document.createDocumentFragment())
    );

    return target;

}

/**
 * Empties the given element before returning it.
 *
 * @param  {Element} element
 *         Element that should be emptied.
 * @return {Element}
 *         Emptied element.
 */
export function empty(element) {
    element.innerHTML = "";
    return element;
}

/**
 * Replaces the contents with all the items that have been given. This is a
 * combination of {@link empty} and {@link appendMany}.
 *
 * @param  {Element} target
 *         Element that should have all the entries appended to it after it's
 *         been emptied.
 * @param  {Array} list
 *         Items that should be appended to the target.
 * @return {Element}
 *         The given target.
 */
export function replaceContentsMany(target, list) {
    return appendMany(empty(target), list);
}
