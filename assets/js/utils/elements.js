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

            id = prefix + identifyCounter;
            identifyCounter += 1;

        // document.getElementById() is faster than our lookupOne().
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

/**
 * Gets the label for the given input element.
 *
 * @param  {Element} input
 *         Input element whose label should be returned.
 * @return {Element|undefined}
 *         Either the input's label or undefined if the label cannot be found.
 */
export function getLabel(input) {

    const aria = input.getAttribute("aria-labelledby");

    if (typeof aria === "string") {
        return lookupOne(`#${aria}`);
    }

    const id = input.getAttribute("id");

    if (typeof id === "string") {
        return lookupOne(`label[for="${id}"]`);
    }

    const closest = input.closest("label");

    if (closest) {
        return closest;
    }

}

/**
 * Gets the trimmed text of the label for the given input.
 *
 * @param  {Element} input
 *         Input whose label text should be returned.
 * @return {String}
 *         The input's label text. If the label cannot be found, an empty string
 *         is returned.
 */
export function getLabelText(input) {

    const aria = input.getAttribute("aria-label");

    if (typeof aria === "string") {
        return aria.trim();
    }

    return getLabel(input)?.textContent.trim() || "";

}

/**
 * Triggers the appropriate events for an input having changed, in the correct
 * (or, at least, a consistent) order. If the given input does not exist or is
 * not an input then nothing happens.
 *
 * @param {Element} input
 *        Input element.
 */
export function announceInput(input) {

    const expectedNodeNames = ["input", "select", "textarea"];

    if (!input || !expectedNodeNames.includes(input.nodeName?.toLowerCase())) {
        return;
    }

    input.dispatchEvent(new Event("input", {
        bubbles: true
    }));
    input.dispatchEvent(new Event("change", {
        bubbles: true
    }));

}

/**
 * Gets the element's index.
 *
 * @param  {Element} element
 *         The element whose index should be returned.
 * @return {Number}
 *         The element's index, or -1 if it can't be worked out.
 */
export function getIndex(element) {

    return Array.prototype.findIndex.call(
        element.parentNode.children,
        (item) => item === element
    );

}
