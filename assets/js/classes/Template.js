import {
    lookup,
    identify
} from "../utils/elements.js";

/**
 * A class that helps work with templates.
 */
export default class Template {

    /**
     * A cache of the template IDs to {@link Template} instances.
     * @type {Object}
     */
    static cache = Object.create(null);

    /**
     * A function that creates an instance of {@link Template} but also saves it
     * in {@link Template.cache} so that it can be accessed again. If the
     * instance already exists, it is returned instead of being re-created.
     *
     * @param  {Element} template
     *         Template element that the instance should help work with.
     * @return {Template}
     *         Template instance.
     */
    static create(template) {

        const {
            cache
        } = this;
        const key = identify(template);

        if (!cache[key]) {
            cache[key] = new this(template);
        }

        return cache[key];

    }

    /**
     * A helper function for populating an element by setting its text content
     * to the content.
     *
     * @param {Element} element
     *        Element that should be modified.
     * @param {String} content
     *        Text that should be put into the element.
     */
    static setText(element, content) {
        element.textContent = content;
    }

    /**
     * A helper function for populating an element by setting its src attribute
     * to the content.
     *
     * @param {Element} element
     *        Element that should be modified.
     * @param {String} content
     *        Content for the element's src attribute.
     */
    static setSrc(element, content) {
        element.src = content;
    }

    /**
     * A helper function for populating an element by appending the content.
     *
     * @param {Element} element
     *        Element that should be modified.
     * @param {String|Element|DocumentFragment} content
     *        The content that should be appended to the element.
     */
    static append(element, content) {
        element.append(content);
    }

    /**
     * @param {Element} template
     *        Template element.
     */
    constructor(template) {

        /**
         * Template element.
         * @type {Element}
         */
        this.template = template;

    }

    /**
     * Clones the contents in {@link Template#template} and populates it based
     * on the information given.
     *
     * The population is an array of arrays. Each inner array has 2 or 3 items:
     * 0: A CSS selector identifying the parts of the template to populate.
     * 1: The contents that should be added to anything matching the selector.
     * 2: A function that takes the element and content and describes how to
     *    populate that content. If ommitted, {@link Template.setText} is used.
     *
     * @param  {Array} populates
     *         An array of information for populating the template.
     * @return {DocumentFragment}
     *         The populated template.
     */
    draw(populates) {

        const clone = this.template.content.cloneNode(true);

        populates.forEach(([
            selector,
            content,
            populate
        ]) => this.populate(clone, selector, content, populate));

        return clone;

    }

    /**
     * Handles a single entry in the populates array passed to
     * {@link Template#draw}.
     *
     * @param {DocumentFragment} clone
     *        The template being modified.
     * @param {String} selector
     *        A CSS selector identifying the parts of the template to populate.
     * @param {?} content
     *        The content that should populate the matching components.
     * @param {Function} [populate=Template.setText]
     *        Optional function for describing how to populate the matching
     *        parts. If ommitted, {@link Template.setText} is used.
     */
    populate(
        clone,
        selector,
        content,
        populate = this.constructor.setText
    ) {
        lookup(selector, clone).forEach((element) => populate(element, content));
    }

}
