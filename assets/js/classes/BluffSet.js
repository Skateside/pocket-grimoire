import CharacterToken from "./CharacterToken";

/**
 * Manages the set of 3 demon bluffs, handling the tokens.
 */
export default class BluffSet {

    /**
     * Sets the {@link CharacterToken} for an empty character - this is used as
     * the default character in the bluffs before one is set.
     *
     * @param {CharacterToken} emptyCharacter
     */
    static setEmptyCharacter(emptyCharacter) {

        /**
         * The empty character token.
         * @type {CharacterToken}
         */
        this.emptyCharacter = emptyCharacter;

    }

    constructor() {

        /**
         * The characters in this set.
         * @type {CharacterToken[]}
         */
        this.characters = [
            this.getEmptyCharacter(),
            this.getEmptyCharacter(),
            this.getEmptyCharacter()
        ];

        /**
         * The index of the current character being set or checked.
         * @type {Number}
         */
        this.index = 0;

    }

    /**
     * Gets the {@link CharacterToken} for the empty character.
     *
     * @return {CharacterToken}
     *         A clone of the "empty character" token.
     * @throws {Error}
     *         {@link BluffSet.emptyCharacter} must be defined.
     */
    getEmptyCharacter() {

        const {
            emptyCharacter
        } = this.constructor;

        if (!emptyCharacter) {
            throw new Error("The \"No character\" character needs to be set.");
        }

        return emptyCharacter.clone();
    }

    /**
     * Validates the given index so that we know it's a number between 0 and
     * the number of characters in {@link BluffSet#characters}.
     *
     * @param  {Number} index
     *         Index to validate.
     * @return {Number}
     *         Validated index.
     * @throws {RangeError}
     *         `index` must be between 0 and the length of
     *         {@link BluffSet#characters}.
     */
    validateIndex(index) {

        index = Number(index);

        if (index < 0 || index >= this.characters.length) {
            throw new RangeError(`BluffSet invalid index ${index}`)
        }

        return index;

    }

    /**
     * Exposes {@link BluffsSet#characters}, but clones the array so that
     * manipulating the response from this method doesn't affect the original
     * data.
     *
     * @return {CharacterToken[]}
     *         Copy of {@link BluffsSet#characters}.
     */
    getCharacters() {
        return [...this.characters];
    }

    /**
     * Gets the character at the requested index. If the index isn't given,
     * {@link BluffsSet#index} is used instead. The index is validated using
     * {@link BluffSet#validateIndex}.
     *
     * @param  {Number} [index]
     *         Optional index. If ommitted, {@link BluffsSet#index} is used.
     * @return {CharacterToken}
     *         The character at the given index.
     */
    getCharacter(index = this.index) {
        return this.characters[this.validateIndex(index)];
    }

    /**
     * Sets the character at the given index. If the index is ommitted,
     * {@link BluffsSet#index} is used instead. The index is validated using
     * {@link BluffSet#validateIndex}.
     *
     * @param {CharacterToken} character
     *        Character to set.
     * @param {Number} [index]
     *        Optional index. If ommitted, {@link BluffsSet#index} is used.
     */
    setCharacter(character, index = this.index) {

        if (!character) {
            character = this.getEmptyCharacter();
        }

        this.characters[this.validateIndex(index)] = character;

    }

    /**
     * Unsets the character. This is done by looking up the index of the
     * character form within {@link BluffSet#characters} and passing it to
     * {@link BluffSet#unsetCharacterByIndex}.
     *
     * @param {CharacterToken} character
     *        The character to unset.
     */
    unsetCharacter(character) {
        this.unsetCharacterByIndex(this.characters.indexOf(character));
    }

    /**
     * Unsets the character at the given index. This is done by setting the
     * character in {@link BluffSet#character} at the given index to a clone of
     * the "empty" character. The given index is validated using
     * {@link BluffSet#validateIndex}.
     *
     * @param {Number} index
     *        Index of the character to unset.
     */
    unsetCharacterByIndex(index) {
        this.characters[this.validateIndex(index)] = this.getEmptyCharacter();
    }

    /**
     * Sets {@link BluffSet#index}. The given index is validated using
     * {@link BluffSet#validateIndex}.
     *
     * @param {Number} index
     *        The index to set.
     */
    setIndex(index) {
        this.index = this.validateIndex(index);
    }

    /**
     * Exposes {@link BluffSet#index}.
     *
     * @return {Number}
     *         The current index.
     */
    getIndex() {
        return this.index;
    }

    /**
     * Returns an array containing the IDs of the characters in
     * {@link BluffSet#characters}.
     *
     * @return {String[]}
     *         The IDs of the characters in this set.
     */
    serialise() {
        return this.characters.map((character) => character.getId());
    }

}
