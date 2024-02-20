import CharacterToken from "./CharacterToken.js";
import ReminderToken from "./ReminderToken.js";
import Jinx from "./Jinx.js";
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
        return (/^\w*:[\w-]+$/).test(id);
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
     * @param {Array.<Object>} data.reminders
     *        Data for reminders that aren't attached to any character.
     * @param {Array.<Object>} data.jinxes
     *        Jinx data.
     */
    constructor({
        characters,
        reminders,
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
        reminders?.forEach((reminder, index) => {
            ReminderToken.addGlobal(this.createReminder(reminder, index));
        });

        /**
         * A collection of all jinxes.
         * @type {Array.<Jinx>}
         */
        this.jinxes = [];

        // Add all jines but leave them theoretical.
        jinxes.forEach(({ id, jinx }) => {

            const character = this.getCharacter(id);

            if (!character) {
                return;
            }

            jinx.forEach((trick) => {

                const trickCharacter = this.getCharacter(trick.id);

                if (!trickCharacter) {
                    return;
                }

                const newJinx = new Jinx(trickCharacter, trick.reason);

                character.addJinx(newJinx);
                this.jinxes.push(newJinx);

            });

        });

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

        reminders
            .concat(remindersGlobal)
            .forEach((text, index) => {

                character.addReminder(
                    this.createReminder({
                        id,
                        name,
                        image,
                        text,
                        isGlobal: remindersGlobal.includes(text)
                    }, index)
                );

            });

        this.characters[id] = character;

        return character;

    }

    /**
     * Creates a {@link CharacterToken} for a custom character by passing the
     * data to {@link TokenStore#createCharacter} but with a flag denoting the
     * fact that it's custom.
     *
     * @param  {Object} data
     *         Character data.
     * @return {CharacterToken}
     *         CharacterToken instance for the data.
     */
    createCustomCharacter(data) {

        return this.createCharacter({
            [CharacterToken.custom]: true,
            ...data
        });

    }

    /**
     * Creates a {@link ReminderToken} instance for the given data and stores
     * it in {@link TokenStore#reminders} before returning it.
     *
     * @param  {Object} data
     *         Reminder data.
     * @param  {Number} index
     *         The index of this reminder - used to identify the reminder while
     *         still allowing for localisation.
     * @return {ReminderToken}
     *         ReminderToken instance for the data.
     */
    createReminder(data, index) {

        const {
            id,
            name,
            text,
            image,
            isGlobal
        } = data;
        const reminderId = `${id}:${index}`.toLowerCase().replace(/\s+/g, "-");
        const reminder = new ReminderToken({
            text,
            image,
            isGlobal,
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
     * Gets the character for the given ID, the same as
     * {@link TokenStore#getCharacter}, but if the character is custom then
     * undefined is returned.
     *
     * @param  {String} id
     *         ID of the character to get.
     * @return {CharacterToken|undefined}
     *         The matching instance or undefined if the character isn't found.
     */
    getOfficialCharacter(id) {

        const character = this.getCharacter(id);

        if (character?.isCustom()) {
            return undefined;
        }

        return character;

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
     * Returns an empty character.
     *
     * @return {CharacterToken}
     *         A clone of an empty character.
     */
    getEmptyCharacter() {
        return this.getCharacterClone(this.constructor.EMPTY);
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

    /**
     * Gets an array of all the jinxes.
     *
     * @return {Array.<Jinx>}
     *         Collection of all jinxes.
     */
    getAllJinxes() {
        return this.jinxes;
    }

    /**
     * Adds a jinx to {@link TokenStore#jinxes}.
     *
     * @param {Jinx} jinx
     *        Jinx to add.
     */
    addJinx(jinx) {
        this.jinxes.push(jinx);
    }

    /**
     * Gets all the homebrew jinxes that have been registered.
     *
     * @return {Array.<Jinx>}
     *         Collection of all homebrew jinxes.
     */
    getAllHomebrewJinxes() {
        return this.jinxes.filter((jinx) => jinx.getIsHomebrew());
    }

    /**
     * Removes all the homebrew jinxes from {@link TokenStore#jinxes}.
     */
    removeAllHomebrewJinxes() {
        this.jinxes = this.jinxes.filter((jinx) => !jinx.getIsHomebrew());
    }

}
