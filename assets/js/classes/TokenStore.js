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
     * An ID that will only match an empty character.
     * @type {String}
     */
    static get EMPTY() {
        return "";
    }

    /**
     * The promise that resolves when the tokens data is loaded.
     * @type {Promise}
     */
    static promise = defer();

    /**
     * Resolves {@link TokenStore.promise} with an instance of
     * {@link TokenStore} that has the data passed to it.
     *
     * @param  {Array.<Object>} data
     *         Data for the characters.
     * @return {Promise}
     *         The promise that resolves with an instance of {@link TokenStore}.
     */
    static create(data) {
        return this.promise.resolve(new this(data));
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
     * Checks to see if the given ID looks like it's the ID for a character or
     * not.
     *
     * @param  {String} id
     *         ID to check.
     * @return {Boolean}
     *         true if the ID looks like a character id, false if it doesn't.
     */
    static isCharacterId(id) {
        return !this.isReminderId(id);
    }

    /**
     * Checks to see if the given ID looks like it's the ID for a reminder or
     * not.
     *
     * @param  {String} id
     *         ID to check.
     * @return {Boolean}
     *         true if the ID looks like a reminder id, false if it doesn't.
     */
    static isReminderId(id) {
        return (/^\w+:\s/).test(id);
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
     * @param {Object} data
     *        Data to store.
     * @param {Array.<Object>} data.characters
     *        Character data.
     * @param {Array.<Object>} data.jinxes
     *        Jinx data.
     */
    constructor({
        characters,
        jinxes
    }) {

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

        characters.forEach((character) => this.createCharacter(character));
        jinxes.forEach(({ id, jinx }) => {

            jinx.forEach((trick) => this.characters[id].addJinx({
                character: this.characters[trick.id],
                reason: trick.reason,
            }));

        });

        /**
         * A list of all jinxes in the form ID => array of jinxes.
         * @type {Object}
         */
        this.jinxes = jinxes.reduce((jinxMap, jinx) => {

            jinxMap[jinx.id] = jinx.jinx;

            return jinxMap;

        }, Object.create(null));

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
            name,
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
                    name,
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
            name,
            text,
            image
        } = data;
        const reminderId = `${id}: ${text}`;
        const reminder = new ReminderToken({
            text,
            image,
            id: reminderId,
            characterId: id,
            characterName: name
        });

        this.reminders[reminderId] = reminder;

        return reminder;

    }

    /**
     * Gets the character for the given ID.
     *
     * @param  {String} id
     *         ID of the character to get.
     * @return {CharacterToken|undefined}
     *         The matching instance or undefined if the character isn't found.
     */
    getCharacter(id) {
        return this.characters[id];
    }

    /**
     * Gets a clone of the character for the given ID.
     *
     * @param  {String} id
     *         ID of the character to get.
     * @return {CharacterToken}
     *         A clone of the matching instance.
     * @throws {ReferenceError}
     *         The id must match an existing character.
     */
    getCharacterClone(id) {

        const character = this.getCharacter(id);

        if (!character) {
            throw new ReferenceError(`Unable to find "${id}" character`);
        }

        return character.clone();

    }

    /**
     * Gets an array of all characters.
     *
     * @return {Array.<CharacterToken>}
     *         Collection of all characters.
     */
    getAllCharacters() {
        return Object.values(this.characters);
    }

    /**
     * Gets the reminder for the given ID.
     *
     * @param  {String} id
     *         ID of the reminder to get.
     * @return {ReminderToken|undefined}
     *         The matching instance or undefined if the reminder isn't found.
     */
    getReminder(id) {
        return this.reminders[id];
    }

    /**
     * Gets a clone of the reminder for the given ID.
     *
     * @param  {String} id
     *         ID of the reminder to get.
     * @return {ReminderToken}
     *         A clone of the matching instance.
     * @throws {ReferenceError}
     *         The id must match an existing reminder.
     */
    getReminderClone(id) {

        const reminder = this.getReminder(id);

        if (!reminder) {
            throw new ReferenceError(`Unable to find the "${id}" reminder`);
        }

        return reminder.clone();

    }

    /**
     * Gets an array of all reminders.
     *
     * @return {Array.<ReminderToken>}
     *         Collection of all reminders.
     */
    getAllReminders() {
        return Object.values(this.reminders);
    }

    // getJinxes(id) {
    //     return this.jinxes[id];
    // }

}
