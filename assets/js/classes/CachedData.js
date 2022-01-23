import {
    getCached
} from "../utils/fetch.js";

console.warn("CachedData is deprecated. Use fetchFromStore instead");

/**
 * Gets data but caches it so that it can be quickly retrieved again.
 */
export default class CachedData {

    /**
     * Creates a version of the current instance.
     *
     * @return {CachedData}
     *         The current instance with a set URL.
     */
    static create() {
        throw new Error("CachedData.create() is an abstract method.");
    }

    /**
     * Gets the data from the URL.
     *
     * @param {String} url
     *        URL of the data to look up.
     */
    constructor(url) {

        /**
         * A promise that resolves with the looked up data.
         * @type {Promise}
         */
        this.lookup = getCached(url);

    }

    /**
     * Executes the given handler when the data for {@link CachedData#lookup}
     * resolves.
     *
     * @param  {Function} handler
     *         Handler to execute when the data loads.
     * @return {Promise}
     *         The lookup promise.
     */
    then(handler) {
        return this.lookup.then(handler);
    }

}
