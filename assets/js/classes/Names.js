import Template from "./Template.js";
import {
    LANGUAGE
} from "../constants/language.js";

/**
 * Keeps track of the player names.
 */
export default class Names {

    /**
     * Creates a version of {@link Names}. The instance is cached and stored so
     * that it can be returned each time this function is called instead of
     * creating a new object.
     *
     * @return {Names}
     *         Instance of {@link Names}.
     */
    static create() {

        if (!this.instance) {

            /**
             * An instance of {@link Names} that can be returned each time
             * instead of being re-created.
             * @type {this}
             */
            this.instance = new this();

        }

        return this.instance;

    }

    /**
     * Creates the names.
     */
    constructor() {

        /**
         * A collection of the names that have been saved. The names are always
         * stored in alphabetical order, based on the current locale.
         * @type {Array.<String>}
         */
        this.names = [];

    }

    /**
     * Sets {@link Names#template}. The current instance is returned to allow
     * for chaining.
     *
     * @param {Template} template
     *        The template that will be used to populate datalists.
     */
    setTemplate(template) {

        /**
         * The template that's used to populate datalists.
         * @type {Template}
         */
        this.template = template;

        return this;

    }

    /**
     * Sets {@link Names#observer}. The current instance is returned to allow
     * for chaining.
     *
     * @param {Observer} observer
     *        Observer that will trigger events at key moments.
     */
    setObserver(observer) {

        /**
         * Observer that will trigger events at key moments.
         * @type {Observer}
         */
        this.observer = observer;

        return this;

    }

    /**
     * Adds a name to {@link Names#names} but only if the name isn't already in
     * that list. If the list changes then an event is triggered.
     *
     * @param  {String} name
     *         Name to add.
     */
    add(name) {

        const {
            names,
            observer
        } = this;
        const {
            length
        } = names;

        if (name && !names.includes(name)) {

            names.push(name);
            this.alphabetise();
            observer.trigger("names-added", { name, names: [...names] });

        }

    }

    /**
     * Sorts {@link Names#names} alphabetically based on the current language.
     * @return {[type]} [description]
     */
    alphabetise() {
        this.names.sort((a, b) => a.localeCompare(b, LANGUAGE));
    }

    /**
     * Removes all names from {@link Names#names}.
     */
    clear() {

        this.names.length = 0;
        observer.trigger("names-cleared");

    }

    /**
     * A helper function that sets the value of the given element to the given
     * constant. As a separate function, it doesn't need to be re-created each
     * time that {@link Names#drawList} is called.
     *
     * @param {Element} element
     *        Element whose value should be set.
     * @param {String} content
     *        Content of the value to set.
     */
    // static setValue(element, content) {
    //     element.value = content;
    // }

    /**
     * Draws a list of elements for each entry in {@link Names#names}.
     *
     * @return {Array.<Element>}
     *         Element for each of the names.
     * @throws {Error}
     *         The template {@link Names#template} must be set.
     */
    drawList() {

        const {
            constructor,
            names,
            template
        } = this;

        if (!template) {
            throw new Error("Cannot draw a list because the template is not set");
        }

        return names.map((name) => template.draw({
            ".js--player-name--option"(element) {
                element.value = name;
            }
        }));

    }

    /**
     * Binds a handler to an event that's triggered on {@link Names#observer}.
     *
     * @param {String} eventName
     *        Name of the event to listen for.
     * @param {Function} handler
     *        Handler to execute when the event is heard.
     */
    on(eventName, handler) {
        this.observer.on(eventName, handler);
    }

}
