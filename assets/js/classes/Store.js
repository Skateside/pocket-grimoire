import {
    deepClone,
    deepFreeze
} from "../utils/objects.js";

/**
 * Stores data in localStorage so it can be quickly retrieved.
 */
export default class Store {

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

        return JSON.parse(window.localStorage.getItem(this.key)) || {
            lookup: {},
            characters: {}
        };

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

    // setCharacters(characters) {
    //
    //     this.data.characters = characters;
    //     this.write();
    //
    // }
    //
    // updateTokenPosition(token, left, top) {
    //
    //     if (!this.tokens) {
    //         this.tokens = [];
    //     }
    //
    //     const index = this.tokens.indexOf(token) || this.tokens.length;
    //
    //     this.data.tokens[index] = [
    //         {
    //             type: "character|reminder",
    //             content: "?"
    //         },
    //         left,
    //         top
    //     ];
    //
    // }

}
