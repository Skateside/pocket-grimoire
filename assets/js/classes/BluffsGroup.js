import BluffSet from "./BluffSet.js";
import CharacterToken from "./CharacterToken";
import Template from "./Template";
import SettableTitle from "./SettableTitle";
import {
    empty,
    lookupOne
} from "../utils/elements.js";

/**
 * Manages the DOM elements that manage the group of 3 demon bluffs.
 */
export default class BluffsGroup {

    /**
     * The name of an event that's triggered when the group has been created.
     */
    static get READY() {
        return "bluff-group-ready";
    }

    /**
     * Sets the Template that will draw the Demon Bluff group.
     *
     * @param {Template} template
     */
    static setTemplate(template) {

        /**
         * The Template that will draw the Demon Bluff group.
         * @type {Template}
         */
        this.template = template;

    }

    /**
     * @param {BluffSet} bluffSet
     *        The set of Demon Bluffs for this group.
     */
    constructor(bluffSet) {

        /**
         * The index of this group of Demon Bluffs - mainly controlled by the
         * parent {@link BluffsGroups} class.
         * @type {Number}
         */
        this.index = 0;

        /**
         * The set of Demon Bluffs for this group.
         * @type {BluffSet}
         */
        this.bluffSet = bluffSet;

    }

    /**
     * Sets the element that contains this group of Demon Bluffs.
     *
     * @param {HTMLElement} element
     */
    setElement(element) {

        /**
         * The element that contains this group of Demon Bluffs.
         * @type {HTMLElement}
         */
        this.element = element;

    }

    /**
     * Exposes {@link BluffsGroup#element}.
     *
     * @return {HTMLElement}
     *         The element that contains this group of Demon Bluffs.
     */
    getElement() {
        return this.element;
    }

    /**
     * Sets {@link BluffsGroup#index}.
     *
     * @param {Number} index
     *        Index to set.
     */
    setIndex(index) {

        this.index = index;

        if (this.element) {
            this.element.dataset.groupId = this.index;
        }

    }

    /**
     * Returns an object that reflects the current state of this group of
     * Demon Bluffs. It does this by calling {@link BluffSet#serialise} on
     * {@link BluffsGroup#bluffSet} and {@link SettableTitle#getTitle} on
     * {@link BluffsGroup#settableTitle}.
     *
     * @return {Object}
     */
    serialise() {

        const {
            bluffSet,
            settableTitle
        } = this;

        return {
            name: settableTitle?.getTitle() || "",
            set: bluffSet.serialise()
        };

    }

    /**
     * Draws the HTML elements for this group of Demon Bluffs.
     *
     * @return {DocumentFragment}
     *         The fragment of the drawn elements.
     */
    draw() {

        return this.constructor.template.draw({
            ".js--demon-bluffs--group": (element) => {
                element.dataset.groupId = this.index;
            }
        })

    }

    /**
     * Gets a CSS selector that identifies {@link BluffsGroup#element}.
     *
     * @return {String}
     *         CSS selector that identifies {@link BluffsGroup#element}.
     */
    getSelector() {
        return `.js--demon-bluffs--group[data-group-id="${this.index}"]`;
    }

    /**
     * The set index is the current index in {@link BluffsGroup#bluffSet}. This
     * function accesses it.
     *
     * @return {Number}
     *         The set index.
     */
    getSetIndex() {
        return this.bluffSet.getIndex();
    }

    /**
     * The set index is the current index in {@link BluffsGroup#bluffSet}. This
     * function sets it.
     *
     * @param {Number}
     *        The set index to set.
     */
    setSetIndex(index) {
        return this.bluffSet.setIndex(index);
    }

    /**
     * Sets the character in {@link BluffsGroup#bluffSet}. Optionally, the index
     * of the character can be defined, rather than using
     * {@link BluffsGroup#setSetIndex} first.
     *
     * @param {CharacterToken} character
     *        Character to set.
     * @param {Number} [index]
     *        Optional index for the character.
     */
    setCharacter(character, index) {
        this.bluffSet.setCharacter(character, index);
    }

    /**
     * Gets the character from {@link BluffsGroup#bluffSet}, either at the index
     * requested or its own internal index if `index` is ommitted.
     *
     * @param  {Number} [index]
     *         Optional index for the character to return.
     * @return {CharacterToken}
     *         The character token requested.
     */
    getCharacter(index) {
        return this.bluffSet.getCharacter(index);
    }

    /**
     * Makes {@link BluffsGroup#element} visible by scrolling it into view.
     *
     * @throws {Error}
     *         {@link BluffsGroup#element} must be set.
     */
    display() {

        const {
            element
        } = this;

        if (!element) {
            throw new Error("Cannot display group because there is no element");
        }

        element.scrollIntoView({
            block: "nearest"
        });

    }

    /**
     * Finishes the seting pu of this group of Demon Bluffs and dispatches an
     * event to announce that it's ready.
     */
    ready() {

        const {
            element,
            bluffSet,
            constructor: {
                READY
            }
        } = this;

        if (!element) {
            return;
        }

        this.display();

        bluffSet.getCharacters().forEach((character, index) => {

            const button = lookupOne(
                `.js--demon-bluffs--bluff[data-index="${index}"]`,
                element
            );

            empty(button).append(character.drawToken());

        });

        element.dispatchEvent(new CustomEvent(READY, {
            bubbles: true,
            cancelable: false,
            detail: {
                bluffGroup: this
            }
        }));

    }

    /**
     * Removes {@link BluffsGroup#element} from the DOM, if it exists.
     */
    remove() {
        this.element?.remove();
    }

    /**
     * Redraws the button for the character that was most recently updated in
     * {@link BluffsGroup#bluffSet}.
     */
    redrawButton() {

        const {
            element,
            bluffSet
        } = this;

        const setIndex = bluffSet.getIndex();
        const character = bluffSet.getCharacter(setIndex);

        empty(lookupOne(
            `.js--demon-bluffs--bluff[data-index="${setIndex}"]`,
            element
        )).append(character.drawToken());

    }

    /**
     * Sets the {@link SettableTitle} instance that will allow the name of this
     * group of Demon Bluffs to be set. If there's a value in
     * {@link BluffsGroup#settableTitleTitle} then it's passed to the instance
     * before that property is deleted.
     *
     * @param {SettableTitle} settableTitle
     *        SettableTitle instance for this group of Demon Bluffs.
     */
    setSettableTitle(settableTitle) {

        this.settableTitle = settableTitle;

        if (this.settableTitleTitle) {

            settableTitle.setTitle(this.settableTitleTitle);
            delete this.settableTitleTitle;

        }

    }

    /**
     * Sets the title of this group of Demon Bluffs. The title is passed to
     * {@link BluffsGroup#settableTitle} if it's set, or stored in
     * {@link BluffsGroup#settableTitleTitle} if it isn't.
     *
     * @param {String} title
     *        Title to set.
     */
    setTitle(title) {

        const {
            settableTitle
        } = this;

        if (settableTitle) {
            settableTitle.setTitle(title);
        } else {

            /**
             * The title that should be set when
             * {@link BluffsGroup#settableTitle} is created. This property only
             * exists if {@link BluffsGroup#setTitle} is called before
             * {@link BluffsGroup#settableTitle} is created and it's removed as
             * soon as it can be.
             * @type {String}
             */
            this.settableTitleTitle = title;

        }

    }

}
