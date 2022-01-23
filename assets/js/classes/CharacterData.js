import CachedData from "./CachedData.js";

console.warn("CharacterData is deprecated. Use fetchFromStore instead");

/**
 * A version of {@link CachedData} that gets character role information.
 */
export default class CharacterData extends CachedData {

    /**
     * @inheritDoc
     */
    static create() {
        return new this("./assets/data/characters.json");
    }

    /**
     * Gets the data for the specified edition.
     *
     * @param  {String} edition
     *         Edition to load.
     * @return {Promise}
     *         A promise that resolves with the correct data.
     */
    getEdition(edition) {

        return this.then((characters) => (
            characters.filter((character) => character.edition === edition)
        ));

    }

    /**
     * Gets the data for the specified IDs.
     *
     * @param  {String[]} ids
     *         IDs of the characters to load.
     * @return {Promise}
     *         A promise that resolves with the correct data.
     */
    getIds(ids) {

        const idList = ids.map(({ id }) => id);

        return this.then((characters) => (
            characters.filter((character) => idList.includes(character.id))
        ));

    }

    /**
     * Gets the data for the specified ID.
     *
     * @param  {String} id
     *         IDs of the character to load.
     * @return {Promise}
     *         A promise that resolves with the correct data.
     */
    get(id) {

        return this.then((characters) => (
            characters.find((character) => character.id === id)
        ));

    }

}
