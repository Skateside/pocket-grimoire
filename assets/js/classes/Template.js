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
     * @param  {Object} populates
     *         An object of selectors to the functions that will populate the
     *         matching elements.
     * @return {DocumentFragment}
     *         The populated template.
     */
    draw(populates) {

        const clone = this.template.content.cloneNode(true);

        Object.entries(populates).forEach(([selector, populate]) => {
            lookup(selector, clone).forEach((element) => populate(element));
        });

        return clone;

    }

}
