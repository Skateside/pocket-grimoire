// DEPRECATED
import Bluff from "./Bluff.js";
import Observer from "./Observer.js";
import CharacterToken from "./CharacterToken.js";
import {
    identify
} from "../utils/elements.js";

/**
 * Manages the list of bluffs.
 */
export default class Bluffs {

    /**
     * Exposes {@link Bluffs.instance}.
     *
     * @return {Bluffs}
     *         The singleton instance.
     */
    static get() {
        return this.instance;
    }

    /**
     * Helper function for creating a new instance and storing it in
     * {@link Bluffs.instance}.
     *
     * @param  {Bluff[]} bluffs
     *         An array of {@link Bluff} instances that will be managed.
     * @param  {Observer} observer
     *         An observer to pass to all {@link Bluff} instances.
     * @return {Bluffs}
     *         Instance.
     */
    static create(...args) {

        let bluffs = this.instance;

        if (!bluffs) {

            bluffs = new this(...args);

            /**
             * An instance that was created using {@link Bluffs.create} and can
             * be accessed using {@link Bluffs.get}.
             * @type {Bluffs}
             */
            this.instance = bluffs;

        }

        return bluffs;

    }

    /**
     * @param {Bluff[]} bluffs
     *        An array of {@link Bluff} instances that will be managed.
     * @param {Observer} observer
     *        An observer to pass to all {@link Bluff} instances.
     */
    constructor(bluffs, observer) {

        this.bluffs = bluffs;

        bluffs.forEach((bluff) => bluff.setObserver(observer));

    }

    /**
     * Sets the "no character" and passes it to each entry in
     * {@link Bluffs#bluffs}.
     *
     * @param {CharacterToken} noCharacter
     *        The character token for "no character".
     */
    setNoCharacter(noCharacter) {

        /**
         * A reference to the "no character" character.
         * @type {CharacterToken}
         */
        this.noCharacter = noCharacter;

        this.bluffs.forEach((bluff) => {

            if (!bluff.hasCharacter()) {
                bluff.setCharacter(noCharacter);
            }

        });

    }

    /**
     * Resets {@link Bluffs#bluffs}, setting each character to "no character".
     *
     * @param {Boolean} [triggerEvent=true]
     *        Whether or not the event should fire - see
     *        {@link Bluff#setCharacter}.
     */
    reset(triggerEvent = true) {

        this.bluffs.forEach((bluff) => {
            bluff.display(this.noCharacter, triggerEvent);
        });

    }

    /**
     * Displays the character for the bluff with the given selector.
     *
     * @param  {String} selector
     *         A CSS selector that will match a bluff in {@link Bluffs#bluffs}.
     * @param  {CharacterToken} character
     *         The character to display.
     * @throws {ReferenceError}
     *         The given selector must match a bluff.
     */
    display(selector, character) {

        const bluff = this.getBluff(selector);

        if (!bluff) {
            throw new ReferenceError(`No bluff found with selector ${selector}`);
        }

        bluff.display(character);

    }

    /**
     * Gets a bluff from {@link Bluffs#bluffs} that matches the given selector.
     *
     * @param  {String} selector
     *         The CSS selector that should match a bluff.
     * @return {Bluff|undefined}
     *         Either the matching bluff or undefined if there is no match.
     */
    getBluff(selector) {
        return this.bluffs.find((bluff) => bluff.getSelector() === selector);
    }

    /**
     * Gets a bluff from {@link Bluffs#bluffs} that matches the given button.
     *
     * @param  {Element} button
     *         Button that should match a bluff.
     * @return {Bluff|undefined}
     *         Either the matching bluff or undefined if there is no match.
     */
    getBluffByButton(button) {
        return this.getBluff(`#${identify(button)}`);
    }

    /**
     * Gets the character from the bluff within {@link Bluffs#bluffs} that
     * matches the given selector.
     *
     * @param  {String} selector
     *         The CSS selector that should match a bluff.
     * @return {CharacterToken|undefined}
     *         Either the matching character or undefined if there is no match
     *         or no character.
     */
    getCharacter(selector) {
        return this.getBluff(selector)?.getCharacter();
    }

    /**
     * Gets the character from the bluff within {@link Bluffs#bluffs} that
     * matches the given button.
     *
     * @param  {Element} button
     *         Button that should match a bluff.
     * @return {CharacterToken|undefined}
     *         Either the matching character or undefined if there is no match
     *         or no character.
     */
    getCharacterByButton(button) {
        return this.getCharacter(`#${identify(button)}`);
    }

    /**
     * Gets all the character IDs from {@link Bluffs#bluffs}.
     *
     * @return {Array.<String>}
     *         List of all IDs for the characters in the bluffs list.
     */
    getIds() {

        return this.bluffs
            .map((bluff) => bluff.getCharacter()?.getId())
            .filter(Boolean);

    }

}
