import Tokens from "./Tokens.js";
import Template from "./Template.js";
import Observer from "./Observer.js";
import CharacterToken from "./CharacterToken.js";
import ReminderToken from "./ReminderToken.js";
import Positioner from "./Positioner.js";
import TokenStore from "./TokenStore.js";
import {
    lookupOne,
    lookupOneCached
} from "../utils/elements.js";
import {
    isNumeric
} from "../utils/numbers.js";

/**
 * Handles tokens being added to the main pad section.
 */
export default class Pad {

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

        /**
         * The positioner that will lay out the tokens automatically.
         * @type {Positioner}
         */
        this.positioner = null;

        /**
         * The co-ordinates for each of the tokens.
         * @type {Array.<Array>}
         */
        this.coords = [];

        /**
         * The TokenStore that wil be used for working out the dimensions of the
         * tokens, so that co-ordinates can be correctly calculated.
         * @type {TokenStore}
         */
        this.tokenStore = null;

    }

    /**
     * Adds a character to the {@link Pad#element}. This method is for internal
     * use only because it doesn't trigger any events - use
     * {@link Pad#addCharacter} instead.
     *
     * @param  {CharacterToken} character
     *         The character to add.
     * @return {Object}
     *         An object with the token and the character that was added.
     */
    drawCharacter(character) {

        const {
            element,
            characters,
            template
        } = this;

        element.append(
            template.draw({
                ".js--token--wrapper"(element) {

                    element.append(character.drawToken());
                    element.dataset.token = "character";

                }
            })
        );

        const token = element.lastElementChild;
        const info = Object.freeze({
            character,
            token
        });

        characters.push(info);

        return info;

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

        const info = this.drawCharacter(character);
        this.observer.trigger("character-add", info);

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
            characters,
            coords,
            constructor: {
                OFFSET
            }
        } = this;

        if (!coords) {
            throw new Error("Co-ordinates have not been generated");
        }

        const info = this.addCharacter(character);

        const index = characters.length - 1;
        const [
            left,
            top
        ] = (coords?.[index] || [OFFSET * index, OFFSET, index]);

        tokens.moveTo(
            info.token,
            left,
            top,
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
     * Exposes the given token's position. See {@link Tokens#getPosition}.
     *
     * @param  {Element} token
     *         Token whose position should be returned.
     * @return {Object}
     *         Co-ordinates for the token.
     */
    getTokenPosition(token) {
        return this.tokens.getPosition(token);
    }

    /**
     * Removes a character from {@link Pad#element}. This method is for internal
     * use only because it doesn't trigger the events - use
     * {@link Pad#removeCharacter} instead.
     *
     * @param {CharacterToken} character
     *        The character to remove.
     */
    undrawCharacter(character) {

        const {
            characters,
            preserveReference
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

        if (!preserveReference) {
            characters.splice(index, 1);
        }

        return token;

    }

    /**
     * Removes a character from {@link Pad#element}.
     *
     * @param {CharacterToken} character
     *        The character to remove.
     */
    removeCharacter(character) {

        const token = this.undrawCharacter(character);

        if (token) {

            this.observer.trigger("character-remove", {
                character,
                token
            });

        }

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
     * Gets the information about the character from the character itself.
     *
     * @param  {CharacterToken} character
     *         The character whose information should be returned.
     * @return {Object}
     *         Information about the character.
     */
    getInfoByCharacter(character) {
        return this.characters.find((info) => info.character === character);
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
            token
        } = this.getInfoByCharacter(character) || {};

        if (!token) {
            return;
        }

        const isDead = character.toggleDead(deadState);
        this.constructor
            .getToken(token)
            .classList
            .toggle("is-dead", isDead);
        this.observer.trigger("shroud-toggle", {
            isDead,
            token,
            character
        });

        // Revived players get their ghost vote back.
        // https://discord.com/channels/569683781800296501/719898820942626817/1056935809263079535
        if (!isDead) {
            this.setGhostVote(character, true);
        }

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
     * Toggles the rotated state for the character that's been given.
     *
     * @param {CharacterToken} character
     *        The character whose rotated state should be toggled.
     * @param {Boolean} [rotateState]
     *        Optional rotated state to set.
     */
    rotate(character, rotateState) {

        const {
            token
        } = this.getInfoByCharacter(character) || {};

        if (!token) {
            return;
        }

        const isUpsideDown = character.rotate(rotateState);
        this.constructor
            .getToken(token)
            .classList
            .toggle("is-upside-down", isUpsideDown);
        this.observer.trigger("rotate-toggle", {
            isUpsideDown,
            token,
            character
        });

    }

    /**
     * A helper function for toggling the rotated state of a character by their
     * element rather than the {@link CharacterToken} instance.
     *
     * @param {Element} token
     *        Element whose associated character should have their rotated state
     *        toggled.
     * @param {Boolean} [rotateState]
     *        Optional rotated state to set.
     */
    rotateByToken(token, rotateState) {
        this.rotate(this.getCharacterByToken(token), rotateState);
    }

    /**
     * Gets the player name for the character that's been given.
     *
     * @param  {CharacterToken} character
     *         The character whose name should be returned.
     * @return {String}
     *         The name of the player, or an empty string if there is no name or
     *         the character token can't be found.
     */
    getPlayerName(character) {

        const info = this.characters.find((info) => info.character === character);

        if (!info) {
            return "";
        }

        const nameTag = lookupOneCached(
            ".js--character--player-name",
            this.constructor.getToken(info.token)
        );

        return nameTag?.textContent || "";

    }

    /**
     * A helper function for getting the name of the player by the element
     * rather than the {@link CharacterToken} instance.
     *
     * @param  {Element} token
     *         The token element.
     * @return {String}
     *         The player name or an empty string.
     */
    getPlayerNameForToken(token) {
        return this.getPlayerName(this.getCharacterByToken(token));
    }

    /**
     * Sets the player name for the character that's been given.
     *
     * @param {CharacterToken} character
     *        The character to set the player name for.
     * @param {String} name
     *        The player name to display with the character token.
     */
    setPlayerName(character, name) {

        const {
            token
        } = this.getInfoByCharacter(character) || {};

        if (!token) {
            return;
        }

        const nameTag = lookupOneCached(
            ".js--character--player-name",
            this.constructor.getToken(token)
        );

        if (!nameTag) {
            return;
        }

        name = (name || "").trim();
        nameTag.textContent = name;
        this.observer.trigger("set-player-name", {
            name,
            token,
            character
        });

    }

    /**
     * A helper function for setting the player name of a character by their
     * element rather than the {@link CharacterToken} instance.
     *
     * @param {Element} token
     *        The token element.
     * @param {String} name
     *        The player name to display with the character token.
     */
    setPlayerNameForToken(token, name) {
        this.setPlayerName(this.getCharacterByToken(token), name);
    }

    /**
     * Toggles the ghost vote state for the character that's been given.
     *
     * @param {CharacterToken} character
     *        The character whose ghost vote state should be toggled.
     * @param {Boolean} [ghostVoteState]
     *        Optional ghost vote state to set.
     */
    setGhostVote(character, ghostVoteState) {

        // Prevent the value in the store breaking the ghost vote visibility if
        // the character token is not dead.
        if (!ghostVoteState && !character.getIsDead()) {
            return;
        }

        const {
            token
        } = this.getInfoByCharacter(character) || {};

        if (!token) {
            return;
        }

        const hasGhostVote = character.toggleGhostVote(ghostVoteState);
        this.constructor
            .getToken(token)
            .classList
            .toggle("is-voteless", !hasGhostVote);
        this.observer.trigger("ghost-vote-toggle", {
            hasGhostVote,
            token,
            character
        });

    }

    /**
     * A helper function for toggling the ghost vote state of a character by
     * their element rather than the {@link CharacterToken} instance.
     *
     * @param {Element} token
     *        Element whose associated character should have their ghost vote
     *        state toggled.
     * @param {Boolean} [ghostVoteState]
     *        Optional ghost vote state to set.
     */
    setGhostVoteForToken(token, ghostVoteState) {
        this.setGhostVote(this.getCharacterByToken(token), ghostVoteState);
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
            template.draw({
                ".js--token--wrapper"(element) {

                    element.append(reminder.drawToken());
                    element.dataset.token = "reminder";
                    element.dataset.reminder = reminder.getId();

                }
            })
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

    /**
     * Helper function for executing {@link Tokens#updatePadDimensions} on
     * {@link Pad#tokens}.
     */
    updateDimensions() {
        this.tokens.updatePadDimensions();
    }

    /**
     * Helper function for executing {@link Tokens#zetZIndex} on
     * {@link Pad#tokens}.
     *
     * @param {Number} zIndex
     *        Z-index to set.
     */
    setZIndex(zIndex) {
        this.tokens.setZIndex(zIndex);
    }

    /**
     * Sets the positioner that will place the tokens correctly.
     *
     * @param {Positioner} positioner
     *        Positioner that will correctly place the tokens.
     */
    setPositioner(positioner) {
        this.positioner = positioner;
    }

    /**
     * Generates the co-ordinates for each of the tokens and stores them in
     * {@link Pad#coords}
     */
    generateCoords() {
        this.coords = this.positioner.generateCoords();
    }

    /**
     * Works out the dimensions of {@link Par#element} in pixels.
     *
     * @return {Object}
     *         An object with width and height properties.
     */
    getPadDimensions() {

        const {
            width,
            height
        } = this.element.getBoundingClientRect();

        return {
            width,
            height
        };

    }

    /**
     * Sets {@link Pad#tokenStore}.
     *
     * @param {TokenStore}
     *        The token store.
     */
    setTokenStore(tokenStore) {
        this.tokenStore = tokenStore;
    }

    /**
     * Gets the dimensions of a token, including its drop shadow.
     *
     * @return {Object}
     *         An object with width and height properties.
     */
    getTokenDimensions() {

        const dimensions = {
            width: 0,
            height: 0
        };

        if (!this.tokenStore) {

            console.warn("Cannot test dimensions because tokenStore is not set");
            return dimensions;

        }

        const noCharacter = this.tokenStore.getEmptyCharacter();
        const {
            token
        } = this.drawCharacter(noCharacter);
        const {
            width: tokenWidth,
            height: tokenHeight
        } = token.getBoundingClientRect();

        // Add the shadow.

        const scale = Number(
            window.getComputedStyle(token, null).getPropertyValue("--token-size")
            || 1
        );
        const tokenCharacter = token.querySelector(".js--character");
        const styles = window.getComputedStyle(tokenCharacter, null);

        const shadowOffset = styles.getPropertyValue("--shadow-offset");
        let shadowAmount = parseFloat(shadowOffset) * scale;

        if (shadowOffset.trim().replace(/[\d\.]/g, "") === "em") {
            shadowAmount *= parseFloat(styles.getPropertyValue("font-size"));
        }

        dimensions.width = tokenWidth + shadowAmount;
        dimensions.height = tokenHeight + shadowAmount;

        this.undrawCharacter(noCharacter);

        return dimensions;

    }

    /**
     * Updates {@link Pad#positioner} with the details that have been passed in
     * before re-generating the co-ordinates.
     *
     * @param  {Object} settings
     *         Settings to use to update the positioner.
     * @param  {Boolean} [settings.container]
     *         true if the container size should be sent to the positioner.
     * @param  {Boolean} [settings.tokens]
     *         true if the token size should be sent to the positioner.
     * @param  {Number|String} [settings.total]
     *         The total number of tokens expected.
     * @param  {String} [settings.layout]
     *         The layout that should be used to position the tokens.
     * @param  {Boolean} [settings.generate = true]
     *         Whether or not to re-generate the co-ordinates.
     * @throws {ReferenceError}
     *         {@link Pad#positioner} must be set before this function is used.
     */
    updatePositioner({ container, tokens, total, layout, generate = true }) {

        const {
            positioner
        } = this;

        if (!positioner) {
            throw new ReferenceError("The positioner has not been set");
        }

        if (container) {
            positioner.setContainerSize(this.getPadDimensions());
        }

        if (tokens) {
            positioner.setTokenSize(this.getTokenDimensions());
        }

        if (layout) {
            positioner.setLayout(layout);
        }

        if (total && isNumeric(total)) {
            positioner.setTotal(total);
        }

        if (generate) {
            this.generateCoords();
        }

    }

}
