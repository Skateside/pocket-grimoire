import Token from "./Token.js";
import CharacterToken from "./CharacterToken.js";
import InfoToken from "./InfoToken.js";
import BluffsGroups from "./BluffsGroups.js";
import {
    deepClone,
    deepFreeze
} from "../utils/objects.js";
import {
    lookup
} from "../utils/elements.js";

/**
 * Stores data in localStorage so it can be quickly retrieved.
 */
export default class Store {

    /**
     * The default, empty information from localStorage.
     * @type {Object}
     */
    static defaults = {
        lookup: {},
        characters: {},
        bluffs: {},
        tokens: [],
        inputs: {},
        details: {},
        infoTokens: [],
        names: [],
        height: "",
        version: "",
        user: ""
    };

    /**
     * A cache of any instances created.
     * @type {Object}
     */
    static cache = Object.create(null);

    /**
     * Creates an instance of {@link Store} and stores it in {@link Store.cache}
     * so that it can be retrieved later. If an instance already exists for the
     * given key, it's returned intead of beaing created anew.
     *
     * @param  {String} key
     *         Storage key.
     * @return {Store}
     *         Store instance.
     */
    static create(key) {

        const {
            cache
        } = this;

        if (!cache[key]) {
            cache[key] = new this(key);
        }

        return cache[key];

    }

    /**
     * Create an instance of {@link Store}. The key is the key used for
     * localStorage.
     *
     * @param {String} key
     *        Storage key.
     */
    constructor(key) {

        /**
         * Storage key.
         * @type {String}
         */
        this.key = key;

        /**
         * The stored data.
         * @type {Object}
         */
        this.data = this.read();

        /**
         * All the token elements that are being remembered.
         * @type {Array.<Element>}
         */
        this.tokens = [];

        /**
         * The info tokens that have been added.
         * @type {Array.<String>}
         */
        this.infoTokens = [];

    }

    /**
     * Writes {@link Store#data} to localStorage.
     */
    write() {
        window.localStorage.setItem(this.key, JSON.stringify(this.data));
    }

    /**
     * Reads the data from localStorage.
     *
     * @return {Object}
     *         The stored data.
     */
    read() {

        return {
            ...deepClone(this.constructor.defaults),
            ...(JSON.parse(window.localStorage.getItem(this.key)) || {})
        };

    }

    /**
     * Deletes the information for the given key from {@link Store#data},
     * setting that key back to its default value.
     *
     * @param {String} key
     *        Key for the data to remove.
     */
    delete(key) {

        const {
            defaults
        } = this.constructor;

        if (!Object.prototype.hasOwnProperty.call(defaults, key)) {
            return;
        }

        this.data[key] = deepClone(defaults[key]);

        if (key === "tokens") {

            this.tokens.length = 0;
            this.data.bluffs = deepClone(defaults.bluffs);

        }

        if (key === "info_tokens") {
            this.infoTokens.length = 0;
        }

        this.write();

    }

    /**
     * Restores all the data in {@link Store#data} to its default value.
     */
    deleteAll() {

        Object
            .keys(this.constructor.defaults)
            .forEach((key) => this.delete(key));

    }

    /**
     * Gets a copy of {@link Store#data} that can't be modified.
     *
     * @return {Object}
     *         The stored data.
     */
    get() {
        return deepFreeze(deepClone(this.data));
    }

    /**
     * Gets the results from a lookup.
     *
     * @param  {String} url
     *         URL for the lookup.
     * @return {?}
     *         The data from the URL.
     */
    getLookup(url) {
        return this.data.lookup[url];
    }

    /**
     * Saves the given results for the given lookup.
     *
     * @param {String} url
     *        URL that fetches information.
     * @param {?} results
     *        Results from the lookup.
     */
    setLookup(url, results) {

        this.data.lookup[url] = results;
        this.write();

    }

    /**
     * Stores the character list and the name of the script.
     *
     * @param {String|undefined} name
     *        Name of the script, which may be blank.
     * @param {Array.<String>} characters
     *        Array of all the character IDs that are in this script.
     * @param {String|null} game
     *        The ID of the homebrew game being used. This will be null for any
     *        game that only consists of recognised characters.
     */
    setCharacters(name, characters, game) {

        const data = {
            characters
        };

        if (name) {
            data.name = name;
        }

        if (game) {
            data.game = game;
        }

        this.data.characters = data;
        this.write();

    }

    /**
     * Adds a token to the store so it's existence can be remembered.
     *
     * @param {Token} token
     *        Token to add.
     */
    addToken(token) {

        const {
            data,
            tokens
        } = this;
        const index = tokens.length;

        tokens.push(token);
        data.tokens[index] = {
            id: token.getId()
        };
        this.write();

        return index;

    }

    /**
     * Removes the token so it's no longer remembered.
     *
     * @param {Token} token
     *        Token to stop remembering.
     */
    removeToken(token) {

        const {
            data,
            tokens
        } = this;
        const index = tokens.indexOf(token);

        if (index < 0) {
            return;
        }

        data.tokens.splice(index, 1);
        tokens.splice(index, 1);
        this.write();

    }

    /**
     * Stores the location of the given token.
     *
     * @param {Token} token
     *        Token whose position should be stored.
     * @param {Number} left
     *        The X position of the token.
     * @param {Number} top
     *        The Y position of the token.
     * @param {Number} zIndex
     *        The Z position of the token.
     */
    moveToken(token, left, top, zIndex) {

        const {
            data,
            tokens
        } = this;
        let index = tokens.indexOf(token);

        if (index < 0) {
            index = this.addToken(token);
        }

        Object.assign(data.tokens[index], {
            left,
            top,
            zIndex
        });
        this.write();

    }

    /**
     * Updates the Z position of the given token.
     *
     * @param {Token} token
     *        Token whose Z position should be updated.
     * @param {Number} zIndex
     *        The Z positiong of the token.
     */
    alignToken(token, zIndex) {

        const {
            data,
            tokens
        } = this;
        let index = tokens.indexOf(token);

        if (index < 0) {
            index = this.addToken(token);
        }

        data.tokens[index].zIndex = zIndex;
        this.write();

    }

    /**
     * Toggles the "dead" state of the given character.
     *
     * @param {CharacterToken} token
     *        Character whose dead state should be updated in the store.
     * @param {Boolean} isDead
     *        The dead state to store.
     */
    toggleDead(token, isDead) {

        const {
            data,
            tokens
        } = this;
        let index = tokens.indexOf(token);

        if (index < 0) {
            return;
        }

        data.tokens[index].isDead = isDead;

        if (isDead) {
            this.setGhostVote(token, true);
        } else {
            this.write();
        }

    }

    /**
     * Toggles the "upside-down" state of the given character.
     *
     * @param {CharacterToken} token
     *        Character whose upside-down state should be updated in the store.
     * @param {Boolean} isDead
     *        The upside-down state to store.
     */
    rotate(token, isUpsideDown) {

        const {
            data,
            tokens
        } = this;
        let index = tokens.indexOf(token);

        if (index < 0) {
            return;
        }

        data.tokens[index].isUpsideDown = isUpsideDown;
        this.write();

    }

    /**
     * Sets the player name for the given character.
     *
     * @param {CharacterToken} token
     *        Character whose player name should be updated in the store.
     * @param {String} name
     *        The player name of this character.
     */
    setPlayerName(token, name) {

        const {
            data,
            tokens
        } = this;
        const index = tokens.indexOf(token);

        if (index < 0) {
            return;
        }

        data.tokens[index].playerName = name;

        if (!data.names.includes(name)) {
            data.names.push(name);
        }

        this.write();

    }

    /**
     * Sets whether or not the given character has a ghost vote.
     *
     * @param {CharacterToken} token
     *        Character whose ghost vote should be updated in the store.
     * @param {Boolean} hasGhostVote
     *        The ghost vote state to store.
     */
    setGhostVote(token, hasGhostVote) {

        const {
            data,
            tokens
        } = this;
        const index = tokens.indexOf(token);

        if (index < 0) {
            return;
        }

        data.tokens[index].ghostVote = hasGhostVote;
        this.write();

    }

    /**
     * Saves the state of the given input.
     *
     * @param {Element} input
     *        Input element whose value or checked state should be saved.
     */
    saveInput(input) {

        const {
            name,
            form,
            type,
            value,
            checked,
            nodeName
        } = (input || {});

        if (!name || type === "file") {
            return;
        }

        let selector = `${nodeName.toLowerCase()}[name="${name}"]`;
        const isCheckbox = type === "checkbox";

        if (isCheckbox && input.hasAttribute("value")) {
            selector += `[value="${value}"]`;
        }

        const formId = form?.id;
        if (formId) {
            selector = `#${formId} ${selector}`;
        }

        this.data.inputs[selector] = (
            isCheckbox
            ? checked
            : value
        );
        this.write();

    }

    /**
     * Removes all inputs from the data that don't exist. This can be useful for
     * times when a lot of inputs have been removed, such as when the list of
     * characters has changed.
     */
    removeStaleInputs() {

        const {
            data
        } = this;

        data.inputs = Object.fromEntries(
            Object
                .entries(data.inputs)
                .filter(([selector]) => lookup(selector).length)
        );
        this.write();

    }

    /**
     * Saves information about the open/closed state of the given details
     * element.
     *
     * @param {Element} details
     *        The details element whose open/closed state should be saved.
     */
    saveDetails(details) {

        const {
            id,
            open
        } = details || {};

        if (!id) {
            return;
        }

        this.data.details[`#${id}`] = open;
        this.write();

    }

    /**
     * Adds a custom info token to the data.
     *
     * @param {InfoToken} infoToken
     *        The custom info token to save.
     */
    saveInfoToken(infoToken, index) {

        const {
            infoTokens,
            data
        } = this;

        if (infoTokens.includes(infoToken)) {
            return;
        }

        if (typeof index === "number") {
            infoTokens[index] = infoToken;
        } else {
            infoTokens.push(infoToken);
            data.infoTokens.push(infoToken.getRaw());
        }

        this.write();

    }

    /**
     * Updates the stored data for the given info token. If the info token is
     * not recognised, no action is taken.
     *
     * @param {InfoToken} infoToken
     *        Info token whose data should be updated.
     */
    updateInfoToken(infoToken) {

        const index = this.infoTokens.indexOf(infoToken);

        if (index > -1) {

            this.data.infoTokens[index] = infoToken.getRaw();
            this.write();

        }

    }

    /**
     * Removes the given info token from the stored data. If the info token is
     * not recognised then no action is taken.
     *
     * @param {InfoToken} infoToken
     *        Info token to be removed.
     */
    removeInfoToken(infoToken) {

        const {
            infoTokens,
            data
        } = this;
        const index = infoTokens.indexOf(infoToken);

        if (index > -1) {

            infoTokens.splice(index, 1);
            data.infoTokens.splice(index, 1);
            this.write();

        }

    }

    /**
     * Saves the height of the pad.
     *
     * @param {String} height
     *        Height of the pad, in pixels.
     */
    setHeight(height) {

        this.data.height = height;
        this.write();

    }

    /**
     * Saves information about the bluffs
     *
     * @param {Object} bluffs
     *        The serialised data about the bluffs. See
     *        {@link BluffsGroup#serialise}.
     */
    setBluffs(bluffs) {

        this.data.bluffs = bluffs;
        this.write();

    }

    /**
     * Saves the current version.
     *
     * @param {String} version
     *        The version number, in semver.
     */
    setVersion(version) {

        this.data.version = version;
        this.write();

    }

    /**
     * Exposes the currently saved version.
     *
     * @return {String}
     *         The saved version number, in semver.
     */
    getVersion() {
        return this.data.version;
    }

    /**
     * Sets the user ID. I use this to watch sessions and debug any errors. It
     * should be unique and contain no identifiable information.
     *
     * @param {String} user
     *        A string identifying the user.
     */
    setUser(user) {

        this.data.user = user;
        this.write();

    }

    /**
     * Gets the user ID.
     *
     * @return {String}
     *         A string identifying the user.
     */
    getUser() {
        return this.data.user;
    }

}
