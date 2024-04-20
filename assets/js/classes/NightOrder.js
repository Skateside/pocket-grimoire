import CharacterToken from "./CharacterToken";

/**
 * A class that manages the night order lists.
 */
export default class NightOrder {

    constructor() {

        /**
         * Whether or not to show the dead characters.
         * @type {Boolean}
         */
        this.showDead = false;

        /**
         * Whether or not to show the characters that are current not in play.
         * @type {Boolean}
         */
        this.showNotInPlay = false;

        /**
         * The data that will display the night order lists.
         * @type {Array.<Object>}
         */
        this.data = [];

    }

    /**
     * Resets the lists so that the elements have been removed and the data
     * cleared.
     */
    reset() {

        const {
            data,
        } = this;

        data.forEach(({ first, other }) => {

            if (first) {

                first.placeholder.remove();
                first.element.remove();

            }

            if (other) {

                other.placeholder.remove();
                other.element.remove();

            }

        });

        data.length = 0;

    }

    /**
     * Updates {@link NightOrder#showDead}.
     *
     * @param {Boolean} showDead
     *        true to show the dead characters, false to hide them.
     */
    setShowDead(showDead) {

        this.showDead = showDead;
        this.drawAllCharacters();

    }

    /**
     * Updates {@link NightOrder#showNotInPlay}.
     *
     * @param {Boolean} showNotInPlay
     *        true to show the not-in-play characters, false to hide them.
     */
    setShowNotInPlay(showNotInPlay) {

        this.showNotInPlay = showNotInPlay;
        this.drawAllCharacters();

    }

    /**
     * Sets the characters that are in the lists.
     *
     * @param {Array.<CharacterToken>} characters
     */
    setCharacters(characters) {

        characters.forEach((character) => {

            const data = {
                character,
                alive: 0,
                inPlay: 0,
            };
            const firstNight = character.getFirstNight();
            const otherNight = character.getOtherNight();
            const id = character.getId();

            if (firstNight) {

                data.first = {
                    order: firstNight,
                    placeholder: document.createComment(id),
                    element: character.drawNightOrder(true).firstElementChild,
                };

            }

            if (otherNight) {

                data.other = {
                    order: otherNight,
                    placeholder: document.createComment(id),
                    element: character.drawNightOrder(false).firstElementChild,
                };

            }

            this.data.push(data);

        });

    }

    /**
     * Draws the night order list for either the first night or the other
     * nights.
     *
     * @param  {Boolean} isFirstNight
     *         true to draw the first night, false to draw the other nights.
     * @return {DocumentFragment}
     *         A document fragment with the night order list.
     */
    drawNightOrder(isFirstNight) {

        const {
            data,
        } = this;
        const property = (
            isFirstNight
            ? "first"
            : "other"
        );

        return data
            .filter((data) => data[property])
            .sort((a, b) => a[property].order - b[property].order)
            .reduce((fragment, data) => {

                const {
                    element,
                    placeholder,
                } = data[property];

                fragment.append(
                    this.shouldShow(data)
                    ? element
                    : placeholder
                );

                return fragment;

            }, document.createDocumentFragment());


    }

    /**
     * Helper function for drawing or updating a character's entry in the night
     * order lists based on the character itself.
     *
     * @param {CharacterToken} character
     *        Character whose entry should be drawn or updated.
     */
    drawCharacter(character) {
        this.drawCharacterByData(this.getData(character));
    }

    /**
     * Draws or updates the entry in the night order lists for the character
     * with the given data.
     *
     * @param {Object} data
     *        Data whose character should have their night order lists updated.
     */
    drawCharacterByData(data) {

        const shouldShow = this.shouldShow(data);

        ["first", "other"].forEach((property) => {

            if (!data[property]) {
                return;
            }

            const {
                placeholder,
                element,
            } = data[property];

            element.classList.toggle("is-in-play", this.isInPlay(data));
            element.classList.toggle("is-dead", this.isDead(data));

            if (shouldShow && placeholder.parentElement) {
                placeholder.replaceWith(element);
            } else if (!shouldShow && element.parentElement) {
                element.replaceWith(placeholder);
            }

        });

    }

    /**
     * A helper function for drawing or updating all entries in the night order
     * lists.
     */
    drawAllCharacters() {
        this.data.forEach((data) => this.drawCharacterByData(data));
    }

    /**
     * Checks to see if the given data represents a character that's fully dead
     * (i.e. there are no character tokens for this character that are still
     * alive).
     *
     * @param  {Object} data
     *         Data to check.
     * @return {Boolean}
     *         true if the character is fully dead, false otherwise.
     */
    isDead(data) {
        return data.inPlay > 0 && data.alive === 0;
    }

    /**
     * Checks to see if the given data has any characters in play.
     *
     * @param  {Object} data
     *         Data to check.
     * @return {Boolean}
     *         true if any characters are in play, false otherwise.
     */
    isInPlay(data) {
        return data.inPlay > 0;
    }

    /**
     * Checks to see if the given data suggests that the character's entry in
     * the night order lists should be showing.
     *
     * @param  {Object} data
     *         Data to check.
     * @return {Boolean}
     *         true if the entries should be showing, false otherwise.
     */
    shouldShow(data) {

        const {
            showDead,
            showNotInPlay,
        } = this;
        const isDead = this.isDead(data);
        const isInPlay = this.isInPlay(data);

        return (
            (isInPlay && !isDead)
            || (!isInPlay && showNotInPlay)
            || (isDead && showDead)
        );

    }

    /**
     * Gets the index in {@link NightOrder#data} for the data that represents
     * the given character. If the character cannot be found an error is thrown.
     *
     * @param  {CharacterToken} character
     *         Character whose data's index should be returned.
     * @return {Number}
     *         Index of the character within the data.
     * @throws {ReferenceError}
     *         The character must exist within the data.
     */
    getDataIndex(character) {

        const id = character.getId();
        const index = this.data.findIndex((data) => {
            return data.character.getId() === id;
        });

        if (index < 0) {

            throw new ReferenceError(
                `Cannot find character "${character.getId()}"`
            );

        }

        return index;

    }

    /**
     * Helper function for getting the item within {@link NightOrder#data} that
     * represents the given character.
     *
     * @param  {CharacterToken} character
     *         Character whose data should be returned.
     * @return {Object}
     *         Data for the given character.
     */
    getData(character) {
        return this.data[this.getDataIndex(character)];
    }

    /**
     * Updates {@link NightOrder#data} for the given character to register that
     * it has been added in play.
     *
     * @param {CharacterToken} character
     *        Character whose data should be updated.
     */
    addCharacter(character) {

        const data = this.getData(character);

        this.adjustInPlay(data, 1);

        if (!character.getIsDead()) {
            this.adjustAlive(data, 1);
        }

        this.drawCharacterByData(data);

    }

    /**
     * Updates {@link NightOrder#data} for the given character to register that
     * it has been removed from play.
     *
     * @param {CharacterToken} character
     *        Character whose data should be updated.
     */
    removeCharacter(character) {

        const data = this.getData(character);

        if (!character.getIsDead()) {
            this.adjustAlive(data, -1);
        }

        this.adjustInPlay(data, -1);
        this.drawCharacterByData(data);

    }

    /**
     * Updates {@link NightOrder#data} for the given character to register that
     * the character has either died or been revived.
     *
     * @param {CharacterToken} character
     *        Character whose data should be updated.
     * @param {Boolean} isDead
     *        true if the character is dead, false otherwise.
     */
    toggleDead(character, isDead) {

        const data = this.getData(character);

        this.adjustAlive(data, (
            isDead
            ? -1
            : 1
        ));
        this.drawCharacterByData(data);

    }

    /**
     * Adjusts the data's "alive" value based on the quantity given. The final
     * result is limited so that it cannot exceed the "inPlay" value and cannot
     * drop below 0.
     *
     * @param {Object} data
     *        Data to update.
     * @param {Number} quantity
     *        Amount to update the data by. If this value is negative then the
     *        value will be reduced.
     */
    adjustAlive(data, quantity) {
        data.alive = Math.min(data.inPlay, Math.max(data.alive + quantity, 0));
    }

    /**
     * Adjusts the data's "inPlay" value based on the quantity given. The final
     * result is limited so that it cannot drop below 0.
     *
     * @param {Object} data
     *        Data to update.
     * @param {Number} quantity
     *        Amount to update the data by. If this value is negative then the
     *        value will be reduced.
     */
    adjustInPlay(data, quantity) {
        data.inPlay = Math.max(0, data.inPlay + quantity);
    }

}
