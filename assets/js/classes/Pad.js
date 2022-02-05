import Tokens from "./Tokens.js";
import Template from "./Template.js";
import {
    lookupOne,
    lookupOneCached
} from "../utils/elements.js";

/**
 * Handles tokens being added to the main pad section.
 */
export default class Pad {

    /**
     * The offset for the tokens that are automatically added.
     * @type {Number}
     */
    static get OFFSET() {
        return 15;
    }

    /**
     * Returns the actual character token from the given token button.
     *
     * @param  {Element} button
     *         Button whose token should be returned.
     * @return {Element}
     *         Token that was found.
     * @throws {ReferenceError}
     *         The given button must contain a token.
     */
    static getToken(button) {

        const token = lookupOneCached(".js--character", button);

        if (!token) {
            throw new ReferenceError("Unable to find character token");
        }

        return token;

    }

    /**
     * @param {Element} element
     *        The main pad element.
     * @param {Observer} observer
     *        An observer that will trigger events at key times.
     */
    constructor(element, observer) {

        /**
         * The main pad element.
         * @type {Element}
         */
        this.element = element;

        /**
         * An observer that can trigger events at key times.
         * @type {Observer}
         */
        this.observer = observer;

        /**
         * The class that allows the tokens to be dragged around.
         * @type {Tokens}
         */
        this.tokens = new Tokens(element, observer);

        /**
         * The template for adding a token to the pad.
         * @type {Template}
         */
        this.template = Template.create(lookupOne("#token-template"));
        // NOTE: should this be passed to the class instead of being created
        // here?

        /**
         * All characters that have been added.
         * @type {Array.<Object>}
         */
        this.characters = [];

        /**
         * All reminders that have been added.
         * @type {Array.<Object>}
         */
        this.reminders = [];

    }

    /**
     * Adds a character to the {@link Pad#element}.
     *
     * @param  {CharacterToken} character
     *         The character to add.
     * @return {Object}
     *         An object with the token and the character that was added.
     */
    addCharacter(character) {

        const {
            element,
            characters,
            observer,
            template
        } = this;

        element.append(
            template.draw([
                [
                    ".js--token--wrapper",
                    character.drawToken(),
                    (element, content) => {

                        Template.append(element, content);
                        element.dataset.token = "character";

                    }
                ]
            ])
        );

        const token = element.lastElementChild;
        const info = Object.freeze({
            character,
            token
        });

        characters.push(info);
        observer.trigger("character-add", info);

        return info;

    }

    /**
     * Adds a new character to {@link Pad#element} (see
     * {@link Pad#addCharacter}) and moves it to the correct location.
     *
     * @param  {CharacterToken} character
     *         The character to add.
     * @return {Object}
     *         An object with the token and the character that was added.
     */
    addNewCharacter(character) {

        const {
            tokens,
            characters
        } = this;
        const info = this.addCharacter(character);
        const offset = this.constructor.OFFSET;

        tokens.moveTo(
            info.token,
            characters.length * offset,
            offset,
            tokens.advanceZIndex()
        );

        return info;

    }

    /**
     * Exposes the ability to move a token to the correct place.
     *
     * @param {Element} token
     *        Token to move.
     * @param {Number} left
     *        Left position, in pixels.
     * @param {Number} top
     *        Top position, in pixels.
     * @param {Number} [zIndex]
     *        Optional z-index.
     */
    moveToken(token, left, top, zIndex) {
        this.tokens.moveTo(token, left, top, zIndex);
    }

    /**
     * Removes a character from {@link Pad#element}
     *
     * @param {CharacterToken} character
     *        The character to remove.
     */
    removeCharacter(character) {

        const {
            characters,
            observer
        } = this;
        const index = characters
            .findIndex((info) => info.character === character);

        if (index < 0) {
            return;
        }

        const {
            token
        } = characters[index];

        token.remove();

        if (!this.preserveReference) {
            characters.splice(index, 1);
        }

        observer.trigger("character-remove", {
            character,
            token
        });

    }

    /**
     * Gets the {@link CharacterToken} instance associated with the given
     * element. If an instance isn't found, undefined is returned.
     *
     * @param  {Element} token
     *         The token element whose data should be returned.
     * @return {CharacterToken|undefined}
     *         The matching character data, or undefined if there is no match.
     */
    getCharacterByToken(token) {
        return this.characters.find((info) => info.token === token)?.character;
    }

    /**
     * A helper function for removing a character by the token rather than the
     * {@link CharacterToken} instance.
     *
     * @param {Element} token
     *        The token whose character should be removed.
     */
    removeCharacterByToken(token) {
        this.removeCharacter(this.getCharacterByToken(token));
    }

    /**
     * Toggles the dead state for the character that's been given.
     *
     * @param {CharacterToken} character
     *        The character whose dead state should be toggled.
     * @param {Boolean} [deadState]
     *        Optional dead state to set.
     */
    toggleDead(character, deadState) {

        const {
            characters,
            observer
        } = this;
        const info = characters.find((info) => info.character === character);

        if (!info) {
            return;
        }

        const {
            token
        } = info;

        const isDead = character.toggleDead(deadState);
        this.constructor
            .getToken(token)
            .classList
            .toggle("is-dead", isDead);
        observer.trigger("shroud-toggle", {
            isDead,
            token,
            character
        });

    }

    /**
     * A helper function for toggling the dead state of a character by their
     * element rather than the {@link CharacterToken} instance.
     *
     * @param {Element} token
     *        Element whose associated character should have their dead state
     *        toggled.
     * @param {Boolean} [deadState]
     *        Optional dead state to set.
     */
    toggleDeadByToken(token, deadState) {
        this.toggleDead(this.getCharacterByToken(token), deadState);
    }

    /**
     * Adds a reminder to {@link Pad#element}.
     *
     * @param  {ReminderToken} reminder
     *         The reminder to add.
     * @return {Object}
     *         An object with the token and the reminder that was added.
     */
    addReminder(reminder) {

        const {
            element,
            reminders,
            observer,
            template
        } = this;

        element.append(
            template.draw([
                [
                    ".js--token--wrapper",
                    reminder.drawToken(),
                    (element, content) => {

                        Template.append(element, content);
                        element.dataset.token = "reminder";

                    }
                ]
            ])
        );

        const token = element.lastElementChild;
        const info = Object.freeze({
            reminder,
            token
        });

        reminders.push(info);
        observer.trigger("reminder-add", info);

        return info;

    }

    /**
     * Removes the reminder from {@link Pad#element}.
     *
     * @param {ReminderToken} reminder
     *        The reminder to remove.
     */
    removeReminder(reminder) {

        const {
            reminders,
            observer
        } = this;
        const index = reminders.findIndex((info) => info.reminder === reminder);

        if (index < 0) {
            return;
        }

        const {
            token
        } = reminders[index];

        token.remove();

        if (!this.preserveReference) {
            reminders.splice(index, 1);
        }

        observer.trigger("reminder-remove", {
            reminder,
            token
        });

    }

    /**
     * Gets the {@link ReminderToken} that's associated with the given element.
     * If no match can be found, undefined is returned.
     *
     * @param  {Element} token
     *         The token element whose associated reminder data should be
     *         returned.
     * @return {ReminderToken|undefined}
     *         The matching data or undefined if no match can be found.
     */
    getReminderByToken(token) {
        return this.reminders.find((info) => info.token === token)?.reminder;
    }

    /**
     * A helper function for removing a reminder by the token element rather
     * than the {@link ReminderToken} instance.
     *
     * @param {Element} token
     *        The reminder element.
     */
    removeReminderByToken(token) {
        this.removeReminder(this.getReminderByToken(token));
    }

    /**
     * Removes all characters and tokens from {@link Pad#element} and calls
     * {@link Tokens#reset}.
     */
    reset() {

        const {
            characters,
            reminders
        } = this;

        /**
         * A flag that prevents the arrays {@link Pad#characters} and
         * {@link Pad#reminders} being modified through
         * {@link Pad#removeCharacter} and {@link Pad#removeReminder}.
         * Preserving the reference allows the characters and reminders to be
         * removed with a loop and without entries being skipped.
         * @type {Boolean}
         */
        this.preserveReference = true;

        characters.forEach(({ character }) => {
            this.removeCharacter(character);
        });
        characters.length = 0;

        reminders.forEach(({ reminder }) => {
            this.removeReminder(reminder);
        });
        reminders.length = 0;

        this.preserveReference = false;

        this.tokens.reset();

    }

    updateDimensions() {
        this.tokens.updatePadDimensions();
    }

    setZIndex(zIndex) {
        this.tokens.setZIndex(zIndex);
    }

}
