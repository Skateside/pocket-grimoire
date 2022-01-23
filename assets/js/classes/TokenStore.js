import CharacterToken from "./CharacterToken.js";
import ReminderToken from "./ReminderToken.js";
import {
    defer
} from "../utils/promises.js";

/**
 * Manages all the data for all the tokens, allowing instances of
 * {@link CharacterToken} and {@link ReminderToken} whenever needed.
 */
export default class TokenStore {

    /**
     * The promise that resolves when the tokens data is loaded.
     * @type {Promise}
     */
    static promise = defer();

    /**
     * Resolves {@link TokenStore.promise} with an instance of
     * {@link TokenStore} that has the data passed to it.
     *
     * @param {Array.<Object>} data
     *        Data for the characters.
     */
    static create(data) {
        this.promise.resolve(new this(data));
    }

    /**
     * Exposes {@link TokenStore.promise}.
     *
     * @return {Promise}
     *         The promise that can be resolved.
     */
    static get() {
        return this.promise;
    }

    /**
     * Executes the given function when {@link TokenStore.promise} has resolved.
     * Be aware that this is always asynchronous.
     *
     * @param  {Function} handler
     *         Function to execute when the promise resolves. It's passed an
     *         instance of {@link TokenStore}.
     * @return {Promise}
     *         The promise that has resolved.
     */
    static ready(handler) {
        return this.get().then(handler);
    }

    /**
     * @param {Array.<Object>} data
     *        Character data.
     */
    constructor(data) {

        /**
         * Character data.
         * @type {Array.<Object>}
         */
        this.data = data;

        /**
         * A list of all the {@link CharacterToken} instances.
         * @type {Object}
         */
        this.characters = Object.create(null);

        /**
        * A list of all the {@link ReminderToken} instances.
        * @type {Object}
         */
        this.reminders = Object.create(null);

        data.forEach((datum) => this.createCharacter(datum));

    }

    /**
     * Creates a {@link CharacterToken} instance for the given data and stores
     * it in {@link TokenStore#characters} before returning it.
     *
     * @param  {Object} data
     *         Character data.
     * @return {CharacterToken}
     *         CharacterToken instance for the data.
     */
    createCharacter(data) {

        const {
            id,
            image,
            reminders = [],
            remindersGlobal = []
        } = data;
        const character = new CharacterToken(data);

        character.setReminders(
            reminders
                .concat(remindersGlobal)
                .map((text) => this.createReminder({
                    id,
                    image,
                    text
                }))
        );

        this.characters[id] = character;

        return character;

    }

    /**
     * Creates a {@link ReminderToken} instance for the given data and stores
     * it in {@link TokenStore#reminders} before returning it.
     *
     * @param  {Object} data
     *         Reminder data.
     * @return {ReminderToken}
     *         ReminderToken instance for the data.
     */
    createReminder(data) {

        const {
            id,
            text,
            image
        } = data;
        const reminderId = `${id}: ${text}`;
        const reminder = new ReminderToken({
            text,
            image,
            id: reminderId,
            characterId: id
        });

        this.reminders[reminderId] = reminder;

        return reminder;

    }

    /**
     * Gets the character for the given ID.
     *
     * @param  {String} id
     *         ID of the character to get.
     * @return {CharacterToken}
     *         A clone of the matching instance.
     * @throws {ReferenceError}
     *         The id must match an existing character.
     */
    getCharacter(id) {

        const character = this.characters[id];

        if (!character) {
            throw new ReferenceError(`Unable to find "${id}" character`);
        }

        return character.clone();

    }

    /**
     * Gets the reminder for the given ID.
     *
     * @param  {String} id
     *         ID of the reminder to get.
     * @return {ReminderToken}
     *         A clone of the matching instance.
     * @throws {ReferenceError}
     *         The id must match an existing reminder.
     */
    getReminder(id) {

        const reminder = this.reminders[id];

        if (!reminder) {
            throw new ReferenceError(`Unable to find the "${id}" reminder`);
        }

        return reminder.clone();

    }

}
