import {
    empty,
    identify
} from "../utils/elements.js";

/**
 * Manages a single bluff.
 */
export default class Bluff {

    /**
     * @param {Element} button
     *        Button that triggers the bluff.
     */
    constructor(button) {

        /**
         * The button that triggers the bluff.
         * @type {Element}
         */
        this.button = button;

    }

    /**
     * The observer that will trigger an event as the character is changed.
     *
     * @param {Observer} observer
     *        Observer that this bluff will use.
     */
    setObserver(observer) {

        /**
         * Observer that will trigger at key moments.
         * @type {Observer}
         */
        this.observer = observer;

    }

    /**
     * Sets the character. Normally an event will fire but it can be suppressed.
     *
     * @param {CharacterToken} character
     *        Character to set.
     * @param {Boolean} [triggerEvent=true]
     *        true (or ommitted) to trigger an event when the character is
     *        changed, false to suppress the event.
     */
    setCharacter(character, triggerEvent = true) {

        /**
         * The character for this bluff.
         * @type {CharacterToken}
         */
        this.character = character;

        if (triggerEvent) {

            this.observer.trigger("bluff", {
                button: this.getSelector(),
                character: character.getId()
            });

        }

    }

    /**
     * Exposes {@link Bluff#character}.
     *
     * @return {CharacterToken|null}
     *         Either the character or null if there is no character.
     */
    getCharacter() {
        return this.character || null;
    }

    /**
     * Checks whether or not this bluff has a character.
     *
     * @return {Boolean}
     *         true if a character is set, false otherwise.
     */
    hasCharacter() {
        return Boolean(this.character?.getId());
    }

    /**
     * Gets the selector for {@link Bluff#button} - this allows it to be easily
     * stored.
     *
     * @return {String}
     *         A CSS selector identifying {@link Bluff#button}.
     */
    getSelector() {
        return `#${identify(this.button)}`;
    }

    /**
     * Checks to see if the given button matches {@link Bluff#button}.
     *
     * @param  {Element} button
     *         Element to check.
     * @return {Boolean}
     *         true if the given button is a match, false otherwise.
     */
    // isTrigger(button) {
    //     return this.button === button;
    // }

    /**
     * Displays the character's token and saves a reference to it.
     *
     * @param {CharacterToken} character
     *        The character to display.
     * @param {Boolean} [triggerEvent=true]
     *        Whether or not the event should trigger - see
     *        {@link Bluff#setCharacter}.
     */
    display(character, triggerEvent = true) {

        this.setCharacter(character, triggerEvent);
        empty(this.button).append(character.drawToken());

    }

}
